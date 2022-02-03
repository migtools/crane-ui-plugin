import * as React from 'react';
import { TextContent, Text, Flex, FlexItem } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ImportWizardFormContext } from './ImportWizardFormContext';

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);

  // TODO dropdown for switching between Pipeline and PipelineRun
  // TODO warn somehow if the user is going to override their manual edits here when they go to another step (use isTouched)? not sure how to do that if they use canJumpTo

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">Review the YAML for the OpenShift pipeline that will be created.</Text>
      </TextContent>
      <FlexItem grow={{ default: 'grow' }}>
        <CodeEditor
          isLineNumbersVisible
          isLanguageLabelVisible
          isMinimapVisible
          code={forms.review.values.pipelineYaml}
          onChange={forms.review.fields.pipelineYaml.setValue}
          language={Language.yaml}
          height="400px"
        />
      </FlexItem>
    </Flex>
  );
};
