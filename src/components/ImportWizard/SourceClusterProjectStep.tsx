import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureProxyMutation } from 'src/api/queries/secrets';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;

  const configureProxyMutation = useConfigureProxyMutation(); // TODO pass onSuccess to set the sourceApiSecret form field

  // TODO call this onBlur in relevant fields
  const configureProxy = () => {
    const { apiUrl, token, sourceApiSecret } = form.values;
    if (apiUrl && token && !sourceApiSecret) {
      configureProxyMutation.mutate({ apiUrl, token });
    }
  };

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
