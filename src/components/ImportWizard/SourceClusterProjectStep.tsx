import * as React from 'react';
import {
  TextContent,
  Text,
  Form,
  TextInputProps,
  FormGroupProps,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import formStyles from '@patternfly/react-styles/css/components/Form/form';
import { ResolvedQueries, ValidatedPasswordInput, ValidatedTextInput } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureSourceSecretMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';
import {
  useSourceApiRootQuery,
  useValidateSourceNamespaceQuery,
} from 'src/api/queries/sourceResources';
import { areSourceCredentialsValid } from 'src/api/proxyHelpers';
import { useNamespaceContext } from 'src/context/NamespaceContext';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const namespace = useNamespaceContext();
  const form = React.useContext(ImportWizardFormContext).sourceClusterProject;

  const configureSourceSecretMutation = useConfigureSourceSecretMutation({
    existingSecretFromState: form.values.sourceApiSecret,
    onSuccess: (newSecret: OAuthSecret) => {
      form.fields.sourceApiSecret.setValue(newSecret);
      form.fields.apiUrl.markSaved();
      form.fields.token.markSaved();
    },
  });

  const configureSourceSecret = () => {
    const { apiUrl, token } = form.fields;
    if ((apiUrl.isDirty || token.isDirty) && apiUrl.value && token.value) {
      configureSourceSecretMutation.mutate({ apiUrl: apiUrl.value, token: token.value });
    }
  };

  const sourceApiRootQuery = useSourceApiRootQuery(
    form.values.sourceApiSecret,
    !configureSourceSecretMutation.isLoading,
  );

  const credentialsValidating =
    configureSourceSecretMutation.isLoading || sourceApiRootQuery.isLoading;
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
    <div className={formStyles.formHelperText}>
      API URL of the source cluster, e.g. <code>https://api.example.cluster:6443</code>
    </div>,
  );

  const sourceTokenFieldProps = getAsyncValidationFieldProps(
    credentialsValidating,
    credentialsAreValid,
    <div className={formStyles.formHelperText}>
      OAuth token of the source cluster. Can be found via <code>oc whoami -t</code>
    </div>,
  );

  const sourceNamespaceFieldProps = getAsyncValidationFieldProps(
    validateSourceNamespaceQuery.isLoading,
    validateSourceNamespaceQuery.data?.data.kind === 'Namespace',
    <div className={formStyles.formHelperText}>Name of the project to be migrated</div>,
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
          onBlur={configureSourceSecret}
          {...apiUrlFieldProps}
        />
        <ValidatedPasswordInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureSourceSecret}
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
        <ResolvedQueries
          spinnerMode="none"
          resultsWithErrorTitles={[
            {
              result: configureSourceSecretMutation,
              errorTitle: 'Cannot configure crane-reverse-proxy',
            },
            { result: sourceApiRootQuery, errorTitle: 'Cannot load cluster API versions' },
          ]}
        />
      </Form>
      {form.isValid ? (
        <Alert
          className={spacing.mtXl}
          variant="info"
          isInline
          title={`By proceeding, your current session's OAuth token will be stored in a secret in the ${namespace} namespace.`}
        >
          This allows the migration pipeline tasks to be performed with the required permissions.
        </Alert>
      ) : null}
    </>
  );
};
