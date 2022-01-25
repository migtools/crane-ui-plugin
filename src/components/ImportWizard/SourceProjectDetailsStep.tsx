import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const SourceProjectDetailsStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceProjectDetails;
  console.log('source project details form', form);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Project details</Text>
      </TextContent>
      <Form>TODO: form fields for project details</Form>
    </>
  );
};
