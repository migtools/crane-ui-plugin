TODO:

- make a full copy of the repo as-is
- wholesale replacement of everything in here with console-plugin-template stuff (copy readme contents below, delete all other files except CI
- repeat changes to oc-manifest using the mtk-operator namespace (it's template.yaml in the new one? figure out what the real name should be)
- bring over tsconfig/eslint/prettier stuff? it's already pretty good!
- bring over other configs like CODEOWNERS
- review dependencies, update PF and anything else notable
- do a test install/run
- change console-extensions.json to use the Add flow
- Wizard boilerplate
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
- Profit

# Crane UI - OpenShift Dynamic Plugin

The Crane UI plugin provides a UI for container migration within the OpenShift console.

**NOTE: This repo is brand new and under active prerelease development.**

## Deployment on cluster

Console dynamic plugins are supposed to be deployed via [OLM operators](https://github.com/operator-framework).
In case of this plugin, we just apply a minimal OpenShift manifest which adds the necessary resources.

```sh
oc apply -f oc-manifest.yaml
```

Note that the `Service` exposing the HTTP server is annotated to have a signed
[service serving certificate](https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/security_and_compliance/configuring-certificates#add-service-serving)
generated and mounted into the image. This allows us to run the server with HTTP/TLS enabled, using
a trusted CA certificate.

## Enabling the plugin

Once deployed on the cluster, the plugin must be enabled before it can be loaded by Console.

To enable the plugin manually, edit [Console operator](https://github.com/openshift/console-operator)
config and make sure the plugin's name is listed in the `spec.plugins` sequence (add one if missing):

```sh
oc edit console.operator.openshift.io cluster
```

```yaml
# ...
spec:
  plugins:
    - crane-ui-plugin
# ...
```

## Local development

### Setup

To run the plugin, you'll need an OpenShift cluster and a local clone of the [openshift/console](https://github.com/openshift/console) repository.

1. `oc login` to your OpenShift cluster
2. Create plugin resources in the cluster (from the crane-ui-plugin directory, `oc apply -f oc-manifest.yaml`)
3. Enable the plugin in the cluster (see "Enabling the plugin" above).

### Run

1. From the `crane-ui-plugin` directory, build and run the plugin:
   ```
   yarn              # Install dependencies
   yarn build        # Build the plugin, generating output to `dist` directory
   yarn http-server  # Start an HTTP server hosting the generated assets on port 9001
   ```
   The server runs on port 9001 with caching disabled and CORS enabled. Additional
   [server options](https://github.com/http-party/http-server#available-options) can be passed to
   the script, for example:
   ```sh
   yarn http-server -a 127.0.0.1
   ```
2. In a separate shell, from the `console` directory:
   - `oc login` to your OpenShift cluster
   - `source ./contrib/oc-environment.sh && ./bin/bridge -plugins crane-ui-plugin=http://127.0.0.1:9001/`
3. Open the Console in your browser at http://localhost:9000/

## Docker image

Following commands should be executed in Console repository root.

1. Build the image:
   ```sh
   docker build -f Dockerfile.plugins.demo -t quay.io/konveyor/crane-ui-plugin .
   ```
2. Run the image:
   ```sh
   docker run -it -p 9001:9001 quay.io/konveyor/crane-ui-plugin
   ```
3. Push the image to image registry:
   ```sh
   docker push quay.io/konveyor/crane-ui-plugin
   ```

Update and apply `oc-manifest.yaml` to use a custom plugin image.

## More info

The configuration of this repository is based on [dynamic-demo-plugin](https://github.com/openshift/console/tree/master/dynamic-demo-plugin). See that project's README for more information.

Details on dynamic plugins can also be found in the [OpenShift Console Dynamic Plugin SDK documentation](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk) and on the [OpenShift Console Dynamic Plugins feature page](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md).
