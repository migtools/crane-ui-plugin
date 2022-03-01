import * as React from 'react';
import {
  TextContent,
  Text,
  Form,
  TextInputProps,
  FormGroupProps,
  Popover,
  Button,
} from '@patternfly/react-core';
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
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

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

  // TODO show helperText on all 3 fields all the time, to prevent page jumping around

  // Override validation styles based on connection check.
  // Can't use greenWhenValid prop of ValidatedTextInput because fields can be valid before connection test passes.
  // This way we don't show the connection failed message when you just haven't finished entering credentials.
  const getAsyncValidationFieldProps = (validating: boolean, valid: boolean) => {
    const inputProps: Pick<TextInputProps, 'validated'> = {
      ...(validating ? { validated: 'default' } : {}),
      ...(valid ? { validated: 'success' } : {}),
    };
    const formGroupProps: Pick<FormGroupProps, 'validated' | 'helperText'> = {
      ...inputProps,
      helperText: validating ? 'Validating...' : null,
    };
    return { inputProps, formGroupProps };
  };

  const credentialsFieldValidationProps = getAsyncValidationFieldProps(
    credentialsValidating,
    credentialsAreValid,
  );

  const validateSourceNamespaceQuery = useValidateSourceNamespaceQuery(
    form.values.sourceApiSecret,
    form.values.sourceNamespace,
    form.fields.sourceNamespace.isTouched,
  );

  console.log({ validateSourceNamespaceQuery });

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
          {...credentialsFieldValidationProps}
        />
        <ValidatedPasswordInput
          field={form.fields.token}
          isRequired
          fieldId="token"
          onBlur={configureProxy}
          {...credentialsFieldValidationProps}
        />
        <ValidatedTextInput
          field={form.fields.sourceNamespace}
          isRequired
          fieldId="project-name"
          onChange={() => form.fields.sourceNamespace.setIsTouched(false)} // So we can use isTouched to enable/disable the validation query
          // isTouched is already automatically set to true on blur
          {...getAsyncValidationFieldProps(
            validateSourceNamespaceQuery.isLoading,
            validateSourceNamespaceQuery.data?.data.kind === 'Namespace',
          )}
        />
        <ValidatedPasswordInput
          field={form.fields.destinationToken}
          isRequired
          fieldId="destination-token"
          formGroupProps={{
            labelIcon: (
              <Popover
                bodyContent={
                  <>
                    This field is not final and is necessary for the alpha version only (hopefully).
                    <br />
                    It is the OAuth token for the destination cluster (this cluster). You can find
                    it by clicking your username in the top right corner of the screen and choosing
                    &quot;Copy login command&quot;, then &quot;Display token&quot;.
                  </>
                }
                maxWidth="30vw"
              >
                <Button
                  variant="plain"
                  aria-label={`More info for ${
                    form.fields.destinationToken.schema.describe().label
                  } field`}
                  onClick={(e) => e.preventDefault()}
                  aria-describedby="destination-token-info"
                  className="pf-c-form__group-label-help"
                >
                  <HelpIcon noVerticalAlign />
                </Button>
              </Popover>
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
