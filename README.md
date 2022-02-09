# Crane UI - OpenShift Dynamic Plugin

**NOTE: This repository is brand new and under active prerelease development.**

The Crane UI plugin provides a UI for constructing container migration pipelines within the OpenShift console.

It is provided as an OpenShift Console dynamic plugin which requires OpenShift 4.10 or greater.

You can run the plugin using a local development environment or build an image to deploy it to a cluster.

## Local development

You'll need:

- Node.js 16+ and Yarn 1.x installed
- A local clone of the [openshift/console](https://github.com/openshift/console) repository
- An OpenShift cluster (the Console UI will run locally, but it needs a real cluster on the backend)

The cluster does not necessarily need to be running OpenShift 4.10+ since you will be running the latest Console UI locally.

To run the plugin locally:

1. From the `crane-ui-plugin` directory:

   ```sh
   yarn install  # Install dependencies
   yarn build    # Build the plugin, generating output to `dist` directory
   yarn start    # Start an HTTP server hosting the generated assets on port 9001
   ```

   The server runs on port 9001 with CORS enabled.

2. In a separate shell, from a clone of the [openshift/console](https://github.com/openshift/console) repository, `oc login` to your cluster and then:

   ```sh
   source ./contrib/oc-environment.sh && ./bin/bridge -plugins crane-ui-plugin=http://localhost:9001/
   ```

3. Open the Console in your browser at http://localhost:9000/

### TODO: add notes here about how to use the --plugin-proxy flag for Bridge. Need to install proxy service on the cluster before local dev!

## Docker image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

1. Build the image:

   ```sh
   docker build -t quay.io/konveyor/crane-ui-plugin:latest .
   ```

2. Run the image:

   ```sh
   docker run -it --rm -d -p 9001:80 quay.io/konveyor/crane-ui-plugin:latest
   ```

3. Push the image:

   ```sh
   docker push quay.io/konveyor/crane-ui-plugin:latest
   ```

## Deployment on cluster

Console dynamic plugins are supposed to be deployed via [OLM operators](https://github.com/operator-framework).
However, the plugin can also be deployed manually as follows.

After pushing an image with your changes to a registry, you can deploy the
plugin to a cluster by instantiating the provided
[OpenShift template](template.yaml). It will run a light-weight nginx HTTP
server to serve your plugin's assets.

```sh
oc process -f template.yaml \
  -p PLUGIN_NAME=crane-ui-plugin \
  -p NAMESPACE=openshift-migration \
  -p IMAGE=quay.io/konveyor/crane-ui-plugin:latest \
  | oc create -f -
```

Once deployed, patch the
[Console operator](https://github.com/openshift/console-operator)
config to enable the plugin.

```sh
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["crane-ui-plugin"] } }' --type=merge
```

## References

- [Console Dynamic Plugin SDK README](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [Console Dynamic Plugins feature page](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)
- [Customization Plugin Example](https://github.com/spadgett/console-customization-plugin)

The structure of this repository is based on [spadgett/console-plugin-template](https://github.com/spadgett/console-plugin-template).
