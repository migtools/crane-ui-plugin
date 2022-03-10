import * as React from 'react';
import useSize from '@react-hook/size';
import {
  TextContent,
  Text,
  Flex,
  FlexItem,
  MenuContent,
  MenuItem,
  MenuList,
  Alert,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flex from '@patternfly/react-styles/css/layouts/Flex/flex';

import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { ImportWizardFormContext, ImportWizardFormState } from './ImportWizardFormContext';

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

  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const editorContainerHeight = useSize(editorContainerRef)[1];

  const yamlErrors = yamlFieldKeys
    .map((fieldKey) => forms.review.fields[fieldKey].error?.message)
    .filter((err) => !!err);

  // TODO on smaller screen sizes and when errors show, this flex layout turns into columns, we need a better fix for the editor height
  // TODO take a look at onEditorDidMount in the PF examples, what's going on with that, how is it implemented?
  // https://www.patternfly.org/v4/components/code-editor/
  // TODO figure out what's going wrong when we try to set up monaco-editor-webpack-plugin, which we need for syntax highlighting

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">
          Review the YAML for the OpenShift Pipeline and PipelineRun that will be created.
        </Text>
      </TextContent>
      <FlexItem>
        <SimpleSelectMenu<YamlFieldKey>
          selected={selectedEditorKey}
          setSelected={setSelectedEditorKey}
          selectedLabel={selectedEditorFormField.schema.describe().label}
          id="editor-select"
          toggleProps={{ style: { width: '150px' } }}
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
      </FlexItem>
      <div className={flex.modifiers.grow} style={{ overflow: 'hidden' }} ref={editorContainerRef}>
        <CodeEditor
          key={selectedEditorKey}
          isDarkTheme
          isLineNumbersVisible
          isLanguageLabelVisible
          isMinimapVisible
          code={selectedEditorFormField.value}
          onChange={selectedEditorFormField.setValue}
          language={Language.yaml}
          height={`${editorContainerHeight - 60}px`}
        />
      </div>
      {yamlErrors.length > 0 ? (
        <Alert isInline variant="danger" title="Invalid YAML">
          {yamlErrors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </Alert>
      ) : null}
    </Flex>
  );
};
