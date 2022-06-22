#!/bin/sh

PREREQS_MET=1
echo
oc whoami > /dev/null 2>&1
if [ $? -eq 1 ]; then
    echo "You must be logged into a cluster via oc as a cluster admin."
    PREREQS_MET=0
fi
which python3 > /dev/null 2>&1
if [ $? -eq 1 ]; then
    echo "You must have python3 installed and on your path to run this script."
    PREREQS_MET=0
fi
which jq > /dev/null 2>&1
if [ $? -eq 1 ]; then
    echo "You must have jq installed and on your path to run this script."
    PREREQS_MET=0
fi
if [ ! -f "./dev/dev-oauth-client.yaml" ]; then
    echo "You must run this script from the root of your crane-ui-plugin directory."
    PREREQS_MET=0
fi
if [ $# -eq 0 ]; then
    echo "You must provide the path to your local clone of the openshift console repository as an argument."
    PREREQS_MET=0
elif [ ! -f "$1/bin/bridge" ]; then
    echo "bin/bridge not found. Did you pass the right path to your local clone of the openshift console repository?"
    PREREQS_MET=0
fi
echo
[[ $PREREQS_MET -eq 0 ]] && exit 1


# OAuth setup for running bridge with auth enabled (see https://github.com/openshift/console#openshift-with-authentication)

CONSOLE_ROUTE=$(oc get route -n openshift-console console -o go-template='{{ .spec.host }}')
TMP_DIR="dev/tmp/$CONSOLE_ROUTE"

mkdir -p "./$TMP_DIR"
if [ ! -f "./$TMP_DIR/console-client-name" ]; then
    oc process -f ./dev/dev-oauth-client.yaml | oc apply -f - -o jsonpath='{.metadata.name}' > "./$TMP_DIR/console-client-name"
    oc get oauthclient "$(cat ./$TMP_DIR/console-client-name)" -o jsonpath='{.secret}' > "./$TMP_DIR/console-client-secret"
    echo "Configured new OAuthClient $(cat ./$TMP_DIR/console-client-name)"
else
    echo "Reusing existing OAuthClient $(cat ./$TMP_DIR/console-client-name)"
fi

if [ ! -f "./$TMP_DIR/ca.crt" ]; then
    oc get secrets -n default --field-selector type=kubernetes.io/service-account-token -o json | \
        jq '.items[0].data."ca.crt"' -r | python3 -m base64 -d > "./$TMP_DIR/ca.crt"
    echo "Stored CA certificate in ./$TMP_DIR/ca.crt"
else
    echo "Reusing existing CA certificate from ./$TMP_DIR/ca.crt"
fi

# Wrangle the JSON for the --plugin-proxy argument

PLUGIN_PROXY_JSON=$(
  jq -n -c \
    --arg crane_proxy_api_path "/api/proxy/plugin/crane-ui-plugin/remote-cluster/" \
    --arg crane_proxy_endpoint "https://$(oc get route -n openshift-migration-toolkit proxy -o go-template='{{ .spec.host }}')" \
    --arg secret_service_api_path "/api/proxy/plugin/crane-ui-plugin/secret-service/" \
    --arg secret_service_endpoint "https://$(oc get route -n openshift-migration-toolkit secret-service -o go-template='{{ .spec.host }}')" \
    '{
        "services": [
            { "consoleAPIPath": $crane_proxy_api_path, "endpoint": $crane_proxy_endpoint, "authorize": false },
            { "consoleAPIPath": $secret_service_api_path, "endpoint": $secret_service_endpoint, "authorize": true }
        ]
     }'
)

echo "\nUsing --plugin-proxy:"
echo "$PLUGIN_PROXY_JSON" | jq


# Run!

WD=$(pwd)
cd $1 # console repo path

source ./contrib/oc-environment.sh
./bin/bridge \
    -plugins crane-ui-plugin=http://localhost:9001/ \
    --plugin-proxy="$PLUGIN_PROXY_JSON" \
    --base-address=http://localhost:9000 \
    --ca-file="$WD/$TMP_DIR/ca.crt" \
    --k8s-auth=openshift \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint="$(oc whoami --show-server)" \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --listen=http://127.0.0.1:9000 \
    --public-dir=./frontend/public/dist \
    --user-auth=openshift \
    --user-auth-oidc-client-id="$(cat $WD/$TMP_DIR/console-client-name)" \
    --user-auth-oidc-client-secret-file="$WD/$TMP_DIR/console-client-secret" \
    --user-auth-oidc-ca-file="$WD/$TMP_DIR/ca.crt" \
    --k8s-mode-off-cluster-alertmanager="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')" \
    --k8s-mode-off-cluster-thanos="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')"

cd $WD
