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
  Title,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { ImportWizardFormContext } from './ImportWizardFormContext';
import { yamlToTektonResources } from 'src/api/pipelineHelpers';
import { PipelineVisualizationWrapper } from 'src/common/components/PipelineVisualizationWrapper';
import { columnNames as pvcColumnNames } from './PVCEditStep';
import { getYamlFieldKeys, YamlFieldKey } from './helpers';
import { PipelineExplanation } from 'src/common/components/PipelineExplanation';

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const { pipelineGroupName } = forms.pipelineSettings.values;
  const isStatefulMigration = forms.pvcSelect.values.selectedPVCs.length > 0;
  const hasMultiplePipelines = isStatefulMigration;
  const { stagePipeline, cutoverPipeline } = yamlToTektonResources(forms);

  const [isAdvancedMode, setIsAdvancedMode] = React.useState(false);

  const yamlFieldKeys = getYamlFieldKeys(hasMultiplePipelines);

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

  const stagePipelineName = `${pipelineGroupName}-stage`;
  const cutoverPipelineName = hasMultiplePipelines
    ? `${pipelineGroupName}-cutover`
    : pipelineGroupName;

  return (
    <div className={spacing.pbLg}>
      <TextContent className={spacing.mbMd}>
        <Title headingLevel="h2" size="2xl">
          Review
        </Title>
        <Text component="p">
          Review the settings for the OpenShift {hasMultiplePipelines ? 'pipelines' : 'pipeline'}{' '}
          that will be created when you select Finish.
        </Text>
      </TextContent>
      <DescriptionList
        isHorizontal
        horizontalTermWidthModifier={{ default: '30ch' }}
        className={`${spacing.mtLg} ${spacing.mbXl}`}
      >
        <DescriptionListGroup>
          <DescriptionListTerm>
            Pipeline {hasMultiplePipelines ? 'names' : 'name'}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {(hasMultiplePipelines
              ? [stagePipelineName, cutoverPipelineName]
              : [cutoverPipelineName]
            ).join(', ')}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Source cluster API URL</DescriptionListTerm>
          <DescriptionListDescription>
            {forms.sourceClusterProject.values.apiUrl}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Source project name</DescriptionListTerm>
          <DescriptionListDescription>
            {forms.sourceClusterProject.values.sourceNamespace}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Persistent volume claims</DescriptionListTerm>
          <DescriptionListDescription>
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
                <Button
                  aria-label={`${forms.pvcSelect.values.selectedPVCs.length} persistent volume claims`}
                  variant="link"
                  isInline
                >
                  {forms.pvcSelect.values.selectedPVCs.length}
                </Button>
              </Popover>
            ) : (
              0
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      {hasMultiplePipelines ? (
        <>
          <TextContent className={spacing.mbSm}>
            <Title headingLevel="h3" size="lg">
              {stagePipelineName}
              <Popover
                hasAutoWidth
                bodyContent={
                  <PipelineExplanation
                    action="stage"
                    isStatefulMigration={isStatefulMigration}
                    hasVisualization
                  />
                }
              >
                <Button
                  aria-label={`More info for ${stagePipelineName} pipeline visualization`}
                  variant="link"
                  isInline
                  className={`${spacing.mlSm} inline-help-popover-icon`}
                >
                  <HelpIcon />
                </Button>
              </Popover>
            </Title>
          </TextContent>
          <PipelineVisualizationWrapper pipeline={stagePipeline} onUpdate={onVisualizationUpdate} />
        </>
      ) : null}
      <TextContent className={spacing.mbSm}>
        <Title headingLevel="h3" size="lg">
          {cutoverPipelineName}
          <Popover
            hasAutoWidth
            bodyContent={
              <PipelineExplanation
                action="cutover"
                isStatefulMigration={isStatefulMigration}
                hasVisualization
              />
            }
          >
            <Button
              aria-label={`More info for ${cutoverPipelineName} pipeline visualization`}
              variant="link"
              isInline
              className={`${spacing.mlSm} inline-help-popover-icon`}
            >
              <HelpIcon />
            </Button>
          </Popover>
        </Title>
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
            toggleProps={{ style: { width: '350px' } }}
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
