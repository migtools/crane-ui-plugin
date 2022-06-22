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

mkdir -p ./dev/tmp
if [ ! -f "./dev/tmp/console-client-name" ]; then
    oc process -f ./dev/dev-oauth-client.yaml | oc apply -f - -o jsonpath='{.metadata.name}' > ./dev/tmp/console-client-name
    oc get oauthclient "$(cat ./dev/tmp/console-client-name)" -o jsonpath='{.secret}' > ./dev/tmp/console-client-secret
    echo "Configured new OAuthClient $(cat ./dev/tmp/console-client-name)"
else
    echo "Reusing existing OAuthClient $(cat ./dev/tmp/console-client-name)"
fi

if [ ! -f "./dev/tmp/ca.crt" ]; then
    oc get secrets -n default --field-selector type=kubernetes.io/service-account-token -o json | \
        jq '.items[0].data."ca.crt"' -r | python3 -m base64 -d > ./dev/tmp/ca.crt
    echo "Stored CA certificate in ./dev/tmp/ca.crt"
else
    echo "Reusing existing CA certificate from ./dev/tmp/ca.crt"
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
    --ca-file="$WD/dev/tmp/ca.crt" \
    --k8s-auth=openshift \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint="$(oc whoami --show-server)" \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --listen=http://127.0.0.1:9000 \
    --public-dir=./frontend/public/dist \
    --user-auth=openshift \
    --user-auth-oidc-client-id="$(cat $WD/dev/tmp/console-client-name)" \
    --user-auth-oidc-client-secret-file="$WD/dev/tmp/console-client-secret" \
    --user-auth-oidc-ca-file="$WD/dev/tmp/ca.crt" \
    --k8s-mode-off-cluster-alertmanager="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')" \
    --k8s-mode-off-cluster-thanos="$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')"

cd $WD
