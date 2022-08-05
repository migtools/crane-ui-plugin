import * as React from 'react';
import * as yup from 'yup';
import { Form, Checkbox } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { HostTokenAlert } from 'src/common/components/HostTokenAlert';
import { SourceTokenInput } from 'src/common/components/SourceTokenInput';

interface UseUpdateCredentialsFormStateParams {
  defaultExpanded: boolean;
}

export const useUpdateCredentialsFormState = ({
  defaultExpanded,
}: UseUpdateCredentialsFormStateParams) => {
  const isUpdatingSourceTokenField = useFormField(defaultExpanded, yup.boolean());
  const sourceTokenSchema = yup.string().label('Source cluster OAuth token'); // TODO look at original schema and validation from wizard
  const isUpdatingTargetTokenField = useFormField(defaultExpanded, yup.boolean());
  const form = useFormState({
    isUpdatingSourceToken: isUpdatingSourceTokenField,
    newSourceToken: useFormField(
      '',
      isUpdatingSourceTokenField.value ? sourceTokenSchema.required() : sourceTokenSchema,
    ),
    isUpdatingTargetToken: isUpdatingTargetTokenField,
  });

  return {
    form,
  };
};

interface UpdateCredentialsFormProps {
  form: ReturnType<typeof useUpdateCredentialsFormState>['form'];
}

export const UpdateCredentialsForm: React.FunctionComponent<UpdateCredentialsFormProps> = ({
  form,
}) => {
  return (
    <Form isWidthLimited className={spacing.mtMd}>
      <Checkbox
        id="update-source-token-checkbox"
        label="Update OAuth token for source cluster"
        isChecked={form.values.isUpdatingSourceToken}
        onChange={form.fields.isUpdatingSourceToken.setValue}
        body={
          form.values.isUpdatingSourceToken ? (
            <SourceTokenInput
              field={form.fields.newSourceToken}
              credentialsValidating={false}
              credentialsAreValid={false}
              configureSourceSecret={() => {
                // TODO
              }}
            />
          ) : null
        }
      />
      <Checkbox
        id="update-target-token-checkbox"
        label="Update OAuth token for target cluster"
        isChecked={form.values.isUpdatingTargetToken}
        onChange={form.fields.isUpdatingTargetToken.setValue}
        body={form.values.isUpdatingTargetToken ? <HostTokenAlert /> : null}
      />
    </Form>
  );
};
