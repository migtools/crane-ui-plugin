import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const PVEditStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).pvEdit;
  console.log('pvs edit form', form);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Edit PVs</Text>
      </TextContent>
      <Form>TODO: form fields for edit PVs</Form>
    </>
  );
};
