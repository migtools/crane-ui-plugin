# Components copied from the Pipelines UI

## NOTE: The components in this directory were copied and pasted from https://github.com/openshift/console/tree/master/frontend/packages/pipelines-plugin/src/components.

## We should remove these some day.

Eventually it would be great to find a way to deduplicate this code and import these components from the pipelines plugin source directly somehow. Until then we'll need to make sure this remains up to date if there are breaking changes.

TODO:

- Configure webpack for using SCSS, maybe convert the existing custom CSS
- Copy/import utils that we're missing
- Render `<PipelineVisualization pipeline={pipeline} pipelineRun={pipelineRun} />`
