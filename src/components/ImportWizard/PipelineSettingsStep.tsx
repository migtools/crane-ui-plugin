import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const PipelineSettingsStep: React.FunctionComponent = () => (
  <>
    <TextContent className={spacing.mbMd}>
      <Text component="h2">Pipeline settings</Text>
    </TextContent>
    <Form>TODO: form fields for pipeline settings</Form>
  </>
);
