# TODO

- Wizard boilerplate
- do a test install/run
- do a test full deployment?
- Talk to Joachim, this is probably a good point for him to start
- Basic form state with a few trivial fields from lib-ui (maybe make that PR for the isDirty stuff first...)
- Do some basic reading of CRs using the SDK
- PREVIEW MODE? do we want to find a way to reuse this webpack? probably not, right? maybe just use CRA for that? how does the SDK CRUD stuff handle it, how do we mock that?
- Get Surge deployments working in CI (maybe use better job names, reference forklift)
- Actually implement the wizard steps presentation layer (available options for form fields can be from temp mocks)
- Talk to backend folks about loading stuff from the proxy service?
- Watch stuff from hackathon about Tekton pipelines? talk to Erik
- Full read implementation, all the stuff we need for form fields, mock data for all of it
- Full write implementation, create the pipelines
- Navigate to the pipeline page on submit
- ???
- Determine final URL path? /smart-import seems too generic?
- Determine if we need accessReview restrictions? see [example here](https://github.com/openshift/console/blob/3fd316564da4937798e11ca2024852cfa817681c/frontend/packages/dev-console/console-extensions.json#L115)
- Replace quay.io/konveyor/crane-ui-plugin:latest with the real image URL if it changes
- Double check final plugin name and description, replace "Konveyor Crane UI Plugin" in various places
- Customize iconClass and tags in template.yaml?

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

## Docker image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

1. Build the image:
   ```sh
   docker build -t quay.io/konveyor/crane-ui-plugin:latest .
   ```

````

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
  -p NAMESPACE=mtk-operator \
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
- [Dynamic Plugin Enhancement Proposal](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)

The structure of this repository is based on [spadgett/console-plugin-template](https://github.com/spadgett/console-plugin-template).
````
