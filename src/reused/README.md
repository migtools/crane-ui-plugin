# Components and Types Copied from OpenShift Console UI repository

## NOTE: The code in this directory was copied and pasted from the https://github.com/openshift/console repository.

In order to reuse some components and types developed for the OpenShift UI that are not exposed via the dynamic plugin SDK, we have copied their code here.

## We should avoid changing these files whenever possible.

We don't want to maintain our own forked versions of these files. They are only copied here because there is currently no other way to reuse them. Any changes here will make it more difficult to update these later from the original source if we want to.

## We should remove these some day.

Eventually it would be great to find a way to deduplicate this code and import these components from the console directly somehow. Until then we'll need to make sure this remains up to date if there are important changes.

# Directory mappings and history

- Our `src/reused/pipelines-plugin/*` directory is a subset of the `frontend/packages/pipelines-plugin/*` directory from the console repo, with the same subdirectory structure.
  - Originally, only the `./src/types/*` directory under here was copied to `src/api/types/pipelines-plugin/*`. When we realized we needed additional code from the pipelines-plugin we relocated those types here to retain the original structure, so relative imports between these copied files stay intact.
