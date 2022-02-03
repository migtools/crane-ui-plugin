import * as React from 'react';
import useSize from '@react-hook/size';
import { TextContent, Text, Flex } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flex from '@patternfly/react-styles/css/layouts/Flex/flex';
import { ImportWizardFormContext } from './ImportWizardFormContext';

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);

  // TODO dropdown for switching between Pipeline and PipelineRun
  // TODO warn somehow if the user is going to override their manual edits here when they go to another step (use isTouched)? not sure how to do that if they use canJumpTo

  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const editorContainerHeight = useSize(editorContainerRef)[1];

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
        <Text component="p">Review the YAML for the OpenShift pipeline that will be created.</Text>
      </TextContent>
      <div className={flex.modifiers.grow} style={{ overflow: 'hidden' }} ref={editorContainerRef}>
        <CodeEditor
          isLineNumbersVisible
          isLanguageLabelVisible
          isMinimapVisible
          code={forms.review.values.pipelineYaml}
          onChange={forms.review.fields.pipelineYaml.setValue}
          language={Language.yaml}
          height={`${editorContainerHeight - 60}px`}
        />
      </div>
    </Flex>
  );
};
