import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;
  console.log('source cluster and project form', form);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Cluster and project</Text>
      </TextContent>
      <Form>TODO: form fields for cluster and project</Form>
    </>
  );
};
