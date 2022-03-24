#!/bin/sh
if [[ $# -eq 0 ]]; then
  echo "\nYou must provide the path to your local clone of the openshift console repository as an argument.\n"
  exit 1
fi

if [ ! -f "$1/bin/bridge" ]; then
  echo "\nbin/bridge not found. Did you pass the right path to your local clone of the openshift console repository?\n"
  exit 1
fi

CONSOLE_PATH=$1
CRANE_PROXY_API_PATH="/api/proxy/plugin/crane-ui-plugin/remote-cluster/"
CRANE_PROXY_ENDPOINT="https://$(oc get route -n openshift-migration proxy -o go-template='{{ .spec.host }}')"
SECRET_SERVICE_API_PATH="/api/proxy/plugin/crane-ui-plugin/secret-service/"
SECRET_SERVICE_ENDPOINT="https://$(oc get route -n openshift-migration secret-service -o go-template='{{ .spec.host }}')"

PLUGIN_PROXY_JSON_FMT='{ "services": [ { "consoleAPIPath": "%s", "endpoint": "%s", "authorize": %s }, { "consoleAPIPath": "%s", "endpoint": "%s", "authorize": %s } ] }'
# PLUGIN_PROXY_JSON=$(printf "$PLUGIN_PROXY_JSON_FMT" "$CRANE_PROXY_API_PATH" "$CRANE_PROXY_ENDPOINT" "false" "$SECRET_SERVICE_API_PATH" "$SECRET_SERVICE_ENDPOINT" "false" )
PLUGIN_PROXY_JSON=$(printf "$PLUGIN_PROXY_JSON_FMT" "$SECRET_SERVICE_API_PATH" "$SECRET_SERVICE_ENDPOINT" "true" "$CRANE_PROXY_API_PATH" "$CRANE_PROXY_ENDPOINT" "false" )

echo "\nUsing --plugin-proxy:\n  $PLUGIN_PROXY_JSON\n"

WD=$(pwd)
cd $CONSOLE_PATH

source ./contrib/oc-environment.sh && ./bin/bridge -plugins crane-ui-plugin=http://localhost:9001/ --plugin-proxy="$PLUGIN_PROXY_JSON"

cd $WD