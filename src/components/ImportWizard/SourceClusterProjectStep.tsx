import * as React from 'react';
import { isWebUri } from 'valid-url';
import { TextContent, Popover, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { ResolvedQueries, ValidatedTextInput } from '@konveyor/lib-ui';
import { ImportWizardFormContext } from './ImportWizardFormContext';
import { useConfigureSourceSecretMutation } from 'src/api/queries/secrets';
import { OAuthSecret } from 'src/api/types/Secret';
import {
  useSourceApiRootQuery,
  useValidateSourceNamespaceQuery,
} from 'src/api/queries/sourceResources';
import { areSourceCredentialsValid } from 'src/api/proxyHelpers';
import { HostTokenAlert } from 'src/common/components/HostTokenAlert';
import { SourceTokenInput } from 'src/common/components/SourceTokenInput';
import { getAsyncValidationFieldProps } from 'src/common/helpers';

export const SourceClusterProjectStep: React.FunctionComponent = () => {
  const formContext = React.useContext(ImportWizardFormContext);
  const form = formContext.sourceClusterProject;

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
    if ((apiUrl.isDirty || token.isDirty) && apiUrl.value && token.value && isApiUrlValidFormat) {
      configureSourceSecretMutation.mutate({ apiUrl: apiUrl.value, token: token.value });
    }
  };

  const sourceApiRootQuery = useSourceApiRootQuery(
    form.values.sourceApiSecret,
    !configureSourceSecretMutation.isLoading,
  );

  const isApiUrlValidFormat = !!isWebUri(form.fields.apiUrl.value);
  const credentialsValidating =
    isApiUrlValidFormat &&
    (configureSourceSecretMutation.isLoading || sourceApiRootQuery.isLoading);

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

  const apiUrlFieldProps = getAsyncValidationFieldProps({
    validating: credentialsValidating,
    valid: credentialsAreValid,
    labelIcon: (
      <Popover
        headerContent={`API URL of the source cluster`}
        bodyContent={
          <span>
            e.g. <code>https://api.example.cluster:6443</code>
          </span>
        }
      >
        <button
          type="button"
          aria-label="More info for api url field"
          onClick={(e) => e.preventDefault()}
          aria-describedby="api-url"
          className="pf-c-form__group-label-help"
        >
          <HelpIcon noVerticalAlign />
        </button>
      </Popover>
    ),
    helperText: <>&nbsp;</>,
  });

  const sourceNamespaceFieldProps = getAsyncValidationFieldProps({
    validating: validateSourceNamespaceQuery.isLoading,
    valid: form.fields.sourceNamespace.isValid,
    labelIcon: (
      <Popover
        headerContent={`Name of the project to be imported`}
        bodyContent={
          <span>
            Can be found via <code>oc project</code>
          </span>
        }
      >
        <button
          type="button"
          aria-label="More info for project name field"
          onClick={(e) => e.preventDefault()}
          aria-describedby="project-name"
          className="pf-c-form__group-label-help"
        >
          <HelpIcon noVerticalAlign />
        </button>
      </Popover>
    ),
  });

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
        <SourceTokenInput
          field={form.fields.token}
          credentialsValidating={credentialsValidating}
          credentialsAreValid={credentialsAreValid}
          configureSourceSecret={configureSourceSecret}
        />
        <ValidatedTextInput
          field={form.fields.sourceNamespace}
          isRequired
          fieldId="project-name"
          onChange={() => form.fields.sourceNamespace.setIsTouched(false)} // So we can use isTouched to enable/disable the validation query
          // isTouched is already automatically set to true on blur
          {...sourceNamespaceFieldProps}
        />
        {isApiUrlValidFormat ? (
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
        ) : null}
      </Form>
      {form.isValid ? <HostTokenAlert className={spacing.mtXl} /> : null}
    </>
  );
};
