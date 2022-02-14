import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQueries, ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureProxyMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';
import { useSourceNamespacesQuery } from 'src/api/queries/sourceNamespaces';

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
    if (
      (apiUrl.isDirty || token.isDirty) &&
      apiUrl.value &&
      token.value &&
      !sourceApiSecret.value
    ) {
      configureProxyMutation.mutate({ apiUrl: apiUrl.value, token: token.value });
    }
  };

  const sourceNamespacesQuery = useSourceNamespacesQuery(form.values.sourceApiSecret);
  const credentialsValidating =
    configureProxyMutation.isLoading || sourceNamespacesQuery.isFetching;
  const credentialsAreValid =
    !form.fields.apiUrl.isDirty &&
    !form.fields.token.isDirty &&
    configureProxyMutation.isSuccess &&
    sourceNamespacesQuery.isSuccess &&
    !sourceNamespacesQuery.isFetching &&
    sourceNamespacesQuery.data?.data.items.length > 0;

  // TODO can we move the extra validation props relating to connection test into yup validation?
  // TODO validate project field using loaded namespaces

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
            helperText: credentialsValidating ? 'Validating...' : null,
            ...(credentialsAreValid ? { validated: 'success' } : {}),
            ...(sourceNamespacesQuery.isError
              ? { validated: 'error', helperTextInvalid: 'Cannot connect using these credentials' }
              : {}),
          }}
          inputProps={{
            ...(credentialsAreValid ? { validated: 'success' } : {}),
            ...(sourceNamespacesQuery.isError
              ? { validated: 'error', helperTextInvalid: 'Cannot connect using these credentials' }
              : {}),
          }}
        />
        <ValidatedTextInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureProxy}
          formGroupProps={{
            helperText: credentialsValidating ? 'Validating...' : null,
            ...(credentialsAreValid ? { validated: 'success' } : {}),
            ...(sourceNamespacesQuery.isError
              ? { validated: 'error', helperTextInvalid: 'Cannot connect using these credentials' }
              : {}),
          }}
          inputProps={{
            ...(credentialsAreValid ? { validated: 'success' } : {}),
            ...(sourceNamespacesQuery.isError
              ? { validated: 'error', helperTextInvalid: 'Cannot connect using these credentials' }
              : {}),
          }}
        />
        <ValidatedTextInput field={form.fields.namespace} isRequired fieldId="project-name" />
        <ResolvedQueries
          spinnerMode="none"
          resultsWithErrorTitles={[
            { result: configureProxyMutation, errorTitle: 'Cannot configure crane-proxy' },
            { result: sourceNamespacesQuery, errorTitle: 'Cannot load source cluster namespaces' },
          ]}
        />
      </Form>
    </>
  );
};
