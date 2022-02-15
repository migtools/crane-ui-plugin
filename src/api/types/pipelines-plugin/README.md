# TypeScript types for Tekton resources

## NOTE: This code was copied from [openshift/console](https://github.com/openshift/console/).

This directory has been lifted entirely from the Pipelines plugin source in the OpenShift Console UI repository at [console/frontend/packages/pipelines-plugin/src/types](https://github.com/openshift/console/tree/3348a3bd2fa852a9592ddeb79fd7735b06e875bd/frontend/packages/pipelines-plugin/src/types).

It was copied on Feb 15, 2022 from version `3348a3b`. The last changes in that directory at that time were from Dec 23, 2021.

The only changes here since copying these were in commit `071d562`, to change internal imports to use the `@openshift-console/dynamic-plugin-sdk` package and to disable/satisfy certain eslint rules.

## We should remove these some day.

Eventually it would be great to find a way to deduplicate this code and import these types from the pipelines plugin source directly somehow. Until then we'll need to make sure this remains up to date if there are breaking changes.
