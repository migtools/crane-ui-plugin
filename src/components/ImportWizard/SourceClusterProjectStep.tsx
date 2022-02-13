import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQuery, ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureProxyMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;

  const configureProxyMutation = useConfigureProxyMutation({
    onSuccess: (newSecret: OAuthSecret) => {
      form.fields.sourceApiSecret.setValue(newSecret);
      form.fields.apiUrl.markSaved();
      form.fields.token.markSaved();
    },
  });

  const configureProxy = () => {
    const { apiUrl, token, sourceApiSecret } = form.fields;
    if (apiUrl.isDirty && apiUrl.value && token.isDirty && token.value && !sourceApiSecret.value) {
      configureProxyMutation.mutate({ apiUrl: apiUrl.value, token: token.value });
    }
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Source cluster and project</Text>
      </TextContent>
      <Form isWidthLimited>
        <ValidatedTextInput
          field={form.fields.apiUrl}
          isRequired
          fieldId="api-url"
          onBlur={configureProxy}
          formGroupProps={{
            helperText: configureProxyMutation.isLoading ? 'Validating...' : null,
          }}
        />
        <ValidatedTextInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureProxy}
          formGroupProps={{
            helperText: configureProxyMutation.isLoading ? 'Validating...' : null,
          }}
        />
        <ValidatedTextInput field={form.fields.namespace} isRequired fieldId="project-name" />
        <ResolvedQuery
          spinnerMode="none"
          result={configureProxyMutation}
          errorTitle="Cannot configure crane-proxy"
        />
      </Form>
    </>
  );
};
