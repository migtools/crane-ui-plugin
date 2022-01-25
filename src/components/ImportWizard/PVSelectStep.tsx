import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const PVSelectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).pvSelect;
  console.log('pvs select form', form);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Select PVs</Text>
      </TextContent>
      <Form>TODO: form fields for select PVs</Form>
    </>
  );
};
