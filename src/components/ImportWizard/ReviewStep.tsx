import * as React from 'react';
import { TextContent, Text, MenuContent, MenuItem, MenuList, Alert } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { ImportWizardFormContext, ImportWizardFormState } from './ImportWizardFormContext';
import PipelineVisualization from 'src/reused/pipelines-plugin/src/components/pipelines/detail-page-tabs/pipeline-details/PipelineVisualization';
import { yamlToTektonResources } from 'src/api/pipelineHelpers';

type YamlFieldKey = keyof Pick<
  ImportWizardFormState['review']['fields'],
  'stagePipelineYaml' | 'stagePipelineRunYaml' | 'cutoverPipelineYaml' | 'cutoverPipelineRunYaml'
>;

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);

  const isStatefulMigration = forms.pvcSelect.values.selectedPVCs.length > 0;
  const yamlFieldKeys: YamlFieldKey[] = isStatefulMigration
    ? ['stagePipelineYaml', 'stagePipelineRunYaml', 'cutoverPipelineYaml', 'cutoverPipelineRunYaml']
    : ['cutoverPipelineYaml', 'cutoverPipelineRunYaml'];

  // TODO warn somehow if the user is going to override their manual edits here when they go to another step (use isTouched)? not sure how to do that if they use canJumpTo

  const [selectedEditorKey, setSelectedEditorKey] =
    React.useState<YamlFieldKey>('cutoverPipelineYaml');
  const selectedEditorFormField = forms.review.fields[selectedEditorKey];

  const yamlErrors = yamlFieldKeys
    .map((fieldKey) => forms.review.fields[fieldKey].error?.message)
    .filter((err) => !!err);

  // TODO take a look at onEditorDidMount in the PF examples, what's going on with that, how is it implemented?
  // https://www.patternfly.org/v4/components/code-editor/
  // TODO figure out what's going wrong when we try to set up monaco-editor-webpack-plugin, which we need for syntax highlighting

  const { stagePipeline, cutoverPipeline } = yamlToTektonResources(forms);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">
          Review the YAML for the OpenShift{' '}
          {isStatefulMigration ? 'Pipelines and PipelineRuns' : 'Pipeline and PipelineRun'} that
          will be created.
        </Text>
      </TextContent>
      {stagePipeline ? (
        <>
          <TextContent className={spacing.mbSm}>
            <Text component="h3">{stagePipeline.metadata?.name || ''}</Text>
          </TextContent>
          <PipelineVisualization pipeline={stagePipeline} />
        </>
      ) : null}
      {cutoverPipeline ? (
        <>
          <TextContent className={spacing.mbSm}>
            <Text component="h3">{cutoverPipeline.metadata?.name || ''}</Text>
          </TextContent>
          <PipelineVisualization pipeline={cutoverPipeline} />
        </>
      ) : null}
      TODO: put below under an Advanced accordion
      <SimpleSelectMenu<YamlFieldKey>
        selected={selectedEditorKey}
        setSelected={setSelectedEditorKey}
        selectedLabel={selectedEditorFormField.schema.describe().label}
        id="editor-select"
        toggleProps={{ style: { width: '200px' } }}
      >
        <MenuContent>
          <MenuList>
            {yamlFieldKeys.map((fieldKey) => (
              <MenuItem key={fieldKey} itemId={fieldKey}>
                {forms.review.fields[fieldKey].schema.describe().label}
              </MenuItem>
            ))}
          </MenuList>
        </MenuContent>
      </SimpleSelectMenu>
      <CodeEditor
        key={selectedEditorKey}
        isDarkTheme
        isLineNumbersVisible
        isLanguageLabelVisible
        isMinimapVisible
        code={selectedEditorFormField.value}
        onChange={selectedEditorFormField.setValue}
        language={Language.yaml}
        height="400px"
      />
      {yamlErrors.length > 0 ? (
        <Alert isInline variant="danger" title="Invalid YAML">
          {yamlErrors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </Alert>
      ) : null}
    </>
  );
};
