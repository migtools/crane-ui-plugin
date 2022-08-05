import { TextInputProps, FormGroupProps } from '@patternfly/react-core';

// Override validation styles based on async validation happening outside useFormState (e.g. the crane-reverse-proxy connection check).
// Can't use greenWhenValid prop of ValidatedTextInput because fields can be valid before connection test passes.
// This way we don't show the connection failed message when you just haven't finished entering credentials.
export const getAsyncValidationFieldProps = ({
  valid,
  validating,
  helperText,
  labelIcon,
}: {
  validating: boolean;
  valid: boolean;
  helperText?: React.ReactNode;
  labelIcon?: React.ReactElement;
}) => {
  const inputProps: Pick<TextInputProps, 'validated'> = {
    ...(validating ? { validated: 'default' } : {}),
    ...(valid ? { validated: 'success' } : {}),
  };
  const formGroupProps: Pick<FormGroupProps, 'validated' | 'helperText' | 'labelIcon'> = {
    ...inputProps,
    helperText: validating ? 'Validating...' : helperText,
    labelIcon,
  };
  return { inputProps, formGroupProps };
};
