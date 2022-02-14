import * as React from 'react';
import { TextContent, Text, Form, TextInputProps, FormGroupProps } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQueries, ValidatedPasswordInput, ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureProxyMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';
import { useSourceNamespacesQuery } from 'src/api/queries/sourceNamespaces';
import { areSourceCredentialsValid } from 'src/api/proxyHelpers';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;

  const configureProxyMutation = useConfigureProxyMutation({
    existingSecretFromState: form.values.sourceApiSecret,
    onSuccess: (newSecret: OAuthSecret) => {
      form.fields.sourceApiSecret.setValue(newSecret);
      form.fields.apiUrl.markSaved();
      form.fields.token.markSaved();
    },
  });

  const configureProxy = () => {
    const { apiUrl, token } = form.fields;
    if ((apiUrl.isDirty || token.isDirty) && apiUrl.value && token.value) {
      configureProxyMutation.mutate({ apiUrl: apiUrl.value, token: token.value });
    }
  };

  const sourceNamespacesQuery = useSourceNamespacesQuery(
    form.values.sourceApiSecret,
    !configureProxyMutation.isLoading,
  );
  const credentialsValidating = configureProxyMutation.isLoading || sourceNamespacesQuery.isLoading;
  const credentialsAreValid = areSourceCredentialsValid(
    form.fields.apiUrl,
    form.fields.token,
    form.fields.sourceApiSecret,
    sourceNamespacesQuery,
  );

  // Override validation styles based on connection check.
  // Can't use greenWhenValid prop of ValidatedTextInput because fields can be valid before connection test passes.
  // This way we don't show the connection failed message when you just haven't finished entering credentials.
  const credentialsInputProps: Pick<TextInputProps, 'validated'> = {
    ...(credentialsValidating ? { validated: 'default' } : {}),
    ...(credentialsAreValid ? { validated: 'success' } : {}),
  };
  const credentialsFormGroupProps: Pick<FormGroupProps, 'validated' | 'helperText'> = {
    ...credentialsInputProps,
    helperText: credentialsValidating ? 'Validating...' : null,
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
          inputProps={credentialsInputProps}
          formGroupProps={credentialsFormGroupProps}
        />
        <ValidatedPasswordInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureProxy}
          inputProps={credentialsInputProps}
          formGroupProps={credentialsFormGroupProps}
        />
        <ValidatedTextInput
          field={form.fields.namespace}
          isRequired
          fieldId="project-name"
          greenWhenValid
        />
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
