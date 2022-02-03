import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;
  // TODO validation -- creating Secret and ConfigMap? Do we drive that from yup async validation?
  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Source cluster and project</Text>
      </TextContent>
      <Form isWidthLimited>
        <ValidatedTextInput field={form.fields.apiUrl} isRequired fieldId="api-url" />
        <ValidatedTextInput field={form.fields.token} isRequired fieldId="token" />
        {/* TODO this should be a typeahead select with values from the source cluster, disabled until ready */}
        <ValidatedTextInput field={form.fields.namespace} isRequired fieldId="project-name" />
      </Form>
    </>
  );
};
