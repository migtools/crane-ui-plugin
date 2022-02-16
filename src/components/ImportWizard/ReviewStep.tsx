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
import { useConfigureDestinationSecretMutation } from 'src/api/queries/secrets';
import { ResolvedQuery } from '@konveyor/lib-ui';

type ReviewStepFieldKey = keyof ImportWizardFormState['review']['fields'];

interface ReviewStepProps {
  configureDestinationSecretMutation: ReturnType<typeof useConfigureDestinationSecretMutation>;
}
export const ReviewStep: React.FunctionComponent<ReviewStepProps> = ({
  configureDestinationSecretMutation,
}) => {
  const forms = React.useContext(ImportWizardFormContext);

  // TODO warn somehow if the user is going to override their manual edits here when they go to another step (use isTouched)? not sure how to do that if they use canJumpTo

  const [selectedEditorKey, setSelectedEditorKey] =
    React.useState<ReviewStepFieldKey>('pipelineYaml');
  const selectedEditorFormField = forms.review.fields[selectedEditorKey];

  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const editorContainerHeight = useSize(editorContainerRef)[1];

  const yamlErrors = [
    forms.review.fields.pipelineYaml.error?.message,
    forms.review.fields.pipelineRunYaml.error?.message,
  ].filter((err) => !!err);

  // TODO on smaller screen sizes this flex layout turns into columns, we need a better fix for the editor height
  // TODO take a look at onEditorDidMount in the PF examples, what's going on with that, how is it implemented?
  // https://www.patternfly.org/v4/components/code-editor/

  return (
    <ResolvedQuery
      result={configureDestinationSecretMutation}
      errorTitle="Cannot configure destination cluster secret"
    >
      <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
        <TextContent className={spacing.mbMd}>
          <Text component="h2">Review</Text>
          <Text component="p">
            Review the YAML for the OpenShift pipeline that will be created.
          </Text>
        </TextContent>
        <FlexItem>
          <SimpleSelectMenu<ReviewStepFieldKey>
            selected={selectedEditorKey}
            setSelected={setSelectedEditorKey}
            selectedLabel={selectedEditorFormField.schema.describe().label}
            id="editor-select"
            toggleProps={{ style: { width: '150px' } }}
          >
            <MenuContent>
              <MenuList>
                {Object.entries(forms.review.fields).map(([fieldKey, field]) => (
                  <MenuItem key={fieldKey} itemId={fieldKey}>
                    {field.schema.describe().label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuContent>
          </SimpleSelectMenu>
        </FlexItem>
        <div
          className={flex.modifiers.grow}
          style={{ overflow: 'hidden' }}
          ref={editorContainerRef}
        >
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
    </ResolvedQuery>
  );
};
