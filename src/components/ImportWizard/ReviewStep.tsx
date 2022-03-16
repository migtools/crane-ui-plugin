import * as React from 'react';
import useSize from '@react-hook/size';
import { TextContent, Text, MenuContent, MenuItem, MenuList, Alert } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { ImportWizardFormContext, ImportWizardFormState } from './ImportWizardFormContext';
import { yamlToTektonResources } from 'src/api/pipelineHelpers';
import { PipelineVisualizationWrapper } from 'src/common/components/PipelineVisualizationWrapper';

type YamlFieldKey = keyof Pick<
  ImportWizardFormState['review']['fields'],
  'stagePipelineYaml' | 'stagePipelineRunYaml' | 'cutoverPipelineYaml' | 'cutoverPipelineRunYaml'
>;

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const { pipelineName } = forms.pipelineSettings.values;

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

  const errorContainerRef = React.useRef<HTMLDivElement>(null);
  const errorContainerHeight = useSize(errorContainerRef)[1];

  const scrollToEditor = () =>
    requestAnimationFrame(() => errorContainerRef.current?.scrollIntoView());
  const [hasTouchedEditor, setHasTouchedEditor] = React.useState(false);
  const onVisualizationUpdate = (hasError: boolean) => {
    if (hasTouchedEditor && !hasError) scrollToEditor();
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">
          Review the OpenShift{' '}
          {isStatefulMigration ? 'Pipelines and PipelineRuns' : 'Pipeline and PipelineRun'} that
          will be created.
        </Text>
      </TextContent>
      {isStatefulMigration ? (
        <>
          <TextContent className={spacing.mbMd}>
            <Text component="h3">{`${pipelineName}-stage`}</Text>
          </TextContent>
          <PipelineVisualizationWrapper pipeline={stagePipeline} onUpdate={onVisualizationUpdate} />
        </>
      ) : null}
      <TextContent className={spacing.mbMd}>
        <Text component="h3">{isStatefulMigration ? `${pipelineName}-cutover` : pipelineName}</Text>
      </TextContent>
      <PipelineVisualizationWrapper pipeline={cutoverPipeline} onUpdate={onVisualizationUpdate} />
      TODO: put below under an Advanced toggle
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
      <div className={spacing.pbMd}>
        <CodeEditor
          key={selectedEditorKey}
          isDarkTheme
          isLineNumbersVisible
          isLanguageLabelVisible
          isMinimapVisible
          code={selectedEditorFormField.value}
          onChange={(value) => {
            selectedEditorFormField.setValue(value);
            selectedEditorFormField.setIsTouched(true);
            setHasTouchedEditor(true);
          }}
          language={Language.yaml}
          height={`${500 - errorContainerHeight}px`}
        />
      </div>
      <div ref={errorContainerRef} className={yamlErrors.length > 0 ? spacing.pbMd : ''}>
        {yamlErrors.length > 0 ? (
          <Alert isInline variant="danger" title="Invalid YAML">
            {yamlErrors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </Alert>
        ) : null}
      </div>
    </>
  );
};
