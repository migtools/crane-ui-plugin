import * as React from 'react';
import useSize from '@react-hook/size';
import {
  TextContent,
  Text,
  MenuContent,
  MenuItem,
  MenuList,
  Alert,
  Switch,
  Button,
  Popover,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { ImportWizardFormContext, ImportWizardFormState } from './ImportWizardFormContext';
import { yamlToTektonResources } from 'src/api/pipelineHelpers';
import { PipelineVisualizationWrapper } from 'src/common/components/PipelineVisualizationWrapper';
import { columnNames as pvcColumnNames } from './PVCEditStep';

type YamlFieldKey = keyof Pick<
  ImportWizardFormState['review']['fields'],
  'stagePipelineYaml' | 'stagePipelineRunYaml' | 'cutoverPipelineYaml' | 'cutoverPipelineRunYaml'
>;

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const { pipelineName } = forms.pipelineSettings.values;
  const isStatefulMigration = forms.pvcSelect.values.selectedPVCs.length > 0;
  const { stagePipeline, cutoverPipeline } = yamlToTektonResources(forms);

  // TODO warn somehow if the user is going to override their manual edits here when they go to another step (use isTouched)? not sure how to do that if they use canJumpTo

  // TODO take a look at onEditorDidMount in the PF examples, what's going on with that, how is it implemented?
  // https://www.patternfly.org/v4/components/code-editor/
  // TODO figure out what's going wrong when we try to set up monaco-editor-webpack-plugin, which we need for syntax highlighting

  const [isAdvancedMode, setIsAdvancedMode] = React.useState(false);

  const yamlFieldKeys: YamlFieldKey[] = isStatefulMigration
    ? ['stagePipelineYaml', 'stagePipelineRunYaml', 'cutoverPipelineYaml', 'cutoverPipelineRunYaml']
    : ['cutoverPipelineYaml', 'cutoverPipelineRunYaml'];

  const [selectedEditorKey, setSelectedEditorKey] =
    React.useState<YamlFieldKey>('cutoverPipelineYaml');
  const selectedEditorFormField = forms.review.fields[selectedEditorKey];

  const yamlErrors = yamlFieldKeys
    .map((fieldKey) => forms.review.fields[fieldKey].error?.message)
    .filter((err) => !!err);

  const errorContainerRef = React.useRef<HTMLDivElement>(null);
  const errorContainerHeight = useSize(errorContainerRef)[1];

  const scrollToEditor = (smooth = false) =>
    requestAnimationFrame(() =>
      errorContainerRef.current?.scrollIntoView(smooth ? { behavior: 'smooth' } : {}),
    );
  const [hasTouchedEditor, setHasTouchedEditor] = React.useState(false);
  const onVisualizationUpdate = () => {
    if (hasTouchedEditor && isAdvancedMode) scrollToEditor();
  };

  const stagePipelineName = stagePipeline?.metadata?.name || `${pipelineName}-stage`;
  const cutoverPipelineName =
    cutoverPipeline?.metadata?.name ||
    (isStatefulMigration ? `${pipelineName}-cutover` : pipelineName);

  const summaryThPadding = `${spacing.prXl} ${spacing.pl_0}`;

  // TODO put derived pipeline names into form state labels?
  // TODO factor the PV table out into a common table with optional read-only mode?

  return (
    <div className={spacing.pbLg}>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">
          Review the settings for the OpenShift {isStatefulMigration ? 'pipelines' : 'pipeline'}{' '}
          that will be created when you select Finish.
        </Text>
      </TextContent>
      <TableComposable variant="compact" borders={false} className={spacing.mbLg}>
        <Tbody>
          <Tr>
            <Th modifier="fitContent" className={summaryThPadding}>
              <strong>Pipeline names</strong>
            </Th>
            <Td dataLabel="Pipeline names">
              {(isStatefulMigration
                ? [stagePipelineName, cutoverPipelineName]
                : [cutoverPipelineName]
              ).join(', ')}
            </Td>
          </Tr>
          <Tr>
            <Th modifier="fitContent" className={summaryThPadding}>
              <strong>Source cluster API URL</strong>
            </Th>
            <Td>{forms.sourceClusterProject.values.apiUrl}</Td>
          </Tr>
          <Tr>
            <Th modifier="fitContent" className={summaryThPadding}>
              <strong>Source project name</strong>
            </Th>
            <Td>{forms.sourceClusterProject.values.sourceNamespace}</Td>
          </Tr>
          <Tr>
            <Th modifier="fitContent" className={summaryThPadding}>
              <strong>Persistent volume claims</strong>
            </Th>
            <Td>
              {forms.pvcSelect.values.selectedPVCs.length > 0 ? (
                <Popover
                  aria-label="Persistent volume claim details"
                  headerContent="Persistent volume claims"
                  hasAutoWidth
                  bodyContent={
                    <TableComposable variant="compact" borders={false}>
                      <Thead>
                        <Tr>
                          <Th modifier="nowrap">{pvcColumnNames.sourcePvcName}</Th>
                          <Th modifier="nowrap">{pvcColumnNames.targetPvcName}</Th>
                          <Th modifier="nowrap">{pvcColumnNames.storageClass}</Th>
                          <Th modifier="nowrap">{pvcColumnNames.capacity}</Th>
                          <Th modifier="nowrap">{pvcColumnNames.verifyCopy}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {forms.pvcSelect.values.selectedPVCs.map((pvc) => {
                          const { targetPvcName, storageClass, capacity, verifyCopy } =
                            forms.pvcEdit.values.editValuesByPVC[pvc.metadata?.name || ''];
                          return (
                            <Tr key={pvc.metadata?.name}>
                              <Td dataLabel={pvcColumnNames.sourcePvcName}>{pvc.metadata?.name}</Td>
                              <Td dataLabel={pvcColumnNames.targetPvcName}>{targetPvcName}</Td>
                              <Td dataLabel={pvcColumnNames.storageClass}>{storageClass}</Td>
                              <Td dataLabel={pvcColumnNames.capacity}>{capacity}</Td>
                              <Td dataLabel={pvcColumnNames.verifyCopy}>
                                {verifyCopy ? 'Yes' : 'No'}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </TableComposable>
                  }
                >
                  <Button variant="link" isInline>
                    {forms.pvcSelect.values.selectedPVCs.length}
                  </Button>
                </Popover>
              ) : (
                0
              )}
            </Td>
          </Tr>
        </Tbody>
      </TableComposable>
      {isStatefulMigration ? (
        <>
          <TextContent className={spacing.mbSm}>
            <Text component="h3">{stagePipelineName}</Text>
          </TextContent>
          <PipelineVisualizationWrapper pipeline={stagePipeline} onUpdate={onVisualizationUpdate} />
        </>
      ) : null}
      <TextContent className={spacing.mbSm}>
        <Text component="h3">{cutoverPipelineName}</Text>
      </TextContent>
      <PipelineVisualizationWrapper pipeline={cutoverPipeline} onUpdate={onVisualizationUpdate} />
      <Switch
        id="advanced-switch"
        className={`advanced-switch ${spacing.mtMd}`}
        label="View Pipeline and PipelineRun YAML files (advanced)"
        isChecked={isAdvancedMode}
        onChange={(isChecked) => {
          setIsAdvancedMode(isChecked);
          if (isChecked) scrollToEditor(true);
        }}
      />
      {isAdvancedMode ? (
        <div className={spacing.mtMd}>
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
            onChange={(value) => {
              selectedEditorFormField.setValue(value);
              selectedEditorFormField.setIsTouched(true);
              setHasTouchedEditor(true);
            }}
            language={Language.yaml}
            height={`${450 - errorContainerHeight}px`}
          />
        </div>
      ) : null}
      <div ref={errorContainerRef}>
        {yamlErrors.length > 0 ? (
          <Alert isInline variant="danger" title="Invalid YAML" className={spacing.mtMd}>
            {yamlErrors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </Alert>
        ) : null}
      </div>
    </div>
  );
};
