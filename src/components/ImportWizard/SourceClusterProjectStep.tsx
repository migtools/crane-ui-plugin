import * as React from 'react';
import { TextContent, Text, Form, TextInputProps, FormGroupProps } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQueries, ValidatedPasswordInput, ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureProxyMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';
import {
  useSourceApiRootQuery,
  useValidateSourceNamespaceQuery,
} from 'src/api/queries/sourceResources';
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

  const sourceApiRootQuery = useSourceApiRootQuery(
    form.values.sourceApiSecret,
    !configureProxyMutation.isLoading,
  );

  const credentialsValidating = configureProxyMutation.isLoading || sourceApiRootQuery.isLoading;
  const credentialsAreValid = areSourceCredentialsValid(
    form.fields.apiUrl,
    form.fields.token,
    form.fields.sourceApiSecret,
    sourceApiRootQuery,
  );

  const validateSourceNamespaceQuery = useValidateSourceNamespaceQuery(
    form.values.sourceApiSecret,
    form.values.sourceNamespace,
    form.fields.sourceNamespace.isTouched,
  );

  // Override validation styles based on connection check.
  // Can't use greenWhenValid prop of ValidatedTextInput because fields can be valid before connection test passes.
  // This way we don't show the connection failed message when you just haven't finished entering credentials.
  const getAsyncValidationFieldProps = (
    validating: boolean,
    valid: boolean,
    helperText: React.ReactNode = null,
  ) => {
    const inputProps: Pick<TextInputProps, 'validated'> = {
      ...(validating ? { validated: 'default' } : {}),
      ...(valid ? { validated: 'success' } : {}),
    };
    const formGroupProps: Pick<FormGroupProps, 'validated' | 'helperText'> = {
      ...inputProps,
      helperText: validating ? 'Validating...' : helperText,
    };
    return { inputProps, formGroupProps };
  };

  const apiUrlFieldProps = getAsyncValidationFieldProps(
    credentialsValidating,
    credentialsAreValid,
    <>
      API URL of the source cluster, e.g. <code>https://api.example.cluster:6443</code>
    </>,
  );

  const sourceTokenFieldProps = getAsyncValidationFieldProps(
    credentialsValidating,
    credentialsAreValid,
    <>
      OAuth token of the source cluster. Can be found via <code>oc whoami -t</code>
    </>,
  );

  const sourceNamespaceFieldProps = getAsyncValidationFieldProps(
    validateSourceNamespaceQuery.isLoading,
    validateSourceNamespaceQuery.data?.data.kind === 'Namespace',
    <>Name of the project to be migrated</>,
  );

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
          {...apiUrlFieldProps}
        />
        <ValidatedPasswordInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureProxy}
          {...sourceTokenFieldProps}
        />
        <ValidatedTextInput
          field={form.fields.sourceNamespace}
          isRequired
          fieldId="project-name"
          onChange={() => form.fields.sourceNamespace.setIsTouched(false)} // So we can use isTouched to enable/disable the validation query
          // isTouched is already automatically set to true on blur
          {...sourceNamespaceFieldProps}
        />
        <ValidatedPasswordInput
          field={form.fields.destinationToken}
          isRequired
          fieldId="destination-token"
          formGroupProps={{
            helperText: (
              <>
                OAuth token of the host cluster (this cluster). Can be found via{' '}
                <code>oc whoami -t</code>
              </>
            ),
          }}
        />
        <ResolvedQueries
          spinnerMode="none"
          resultsWithErrorTitles={[
            { result: configureProxyMutation, errorTitle: 'Cannot configure crane-proxy' },
            { result: sourceApiRootQuery, errorTitle: 'Cannot load cluster API versions' },
          ]}
        />
      </Form>
    </>
  );
};
