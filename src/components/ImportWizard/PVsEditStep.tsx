import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const PVsEditStep: React.FunctionComponent = () => (
  <>
    <TextContent className={spacing.mbMd}>
      <Text component="h2">Edit PVs</Text>
    </TextContent>
    <Form>TODO: form fields for edit PVs</Form>
  </>
);
