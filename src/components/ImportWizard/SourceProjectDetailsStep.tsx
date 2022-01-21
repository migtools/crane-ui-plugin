import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const SourceProjectDetailsStep: React.FunctionComponent = () => (
  <>
    <TextContent className={spacing.mbMd}>
      <Text component="h2">Project details</Text>
    </TextContent>
    <Form>TODO: form fields for project details</Form>
  </>
);
