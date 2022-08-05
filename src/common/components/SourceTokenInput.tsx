import * as React from 'react';
import { Popover } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { IValidatedFormField, ValidatedPasswordInput } from '@konveyor/lib-ui';
import { getAsyncValidationFieldProps } from '../helpers';

interface SourceTokenInputProps {
  field: IValidatedFormField<string>;
  credentialsValidating: boolean;
  credentialsAreValid: boolean;
  configureSourceSecret: () => void;
}

export const SourceTokenInput: React.FunctionComponent<SourceTokenInputProps> = ({
  field,
  credentialsValidating,
  credentialsAreValid,
  configureSourceSecret,
}) => {
  return (
    <ValidatedPasswordInput
      field={field}
      isRequired
      fieldId="source-cluster-token"
      onBlur={configureSourceSecret}
      {...getAsyncValidationFieldProps({
        validating: credentialsValidating,
        valid: credentialsAreValid,
        labelIcon: (
          <Popover
            headerContent={`OAuth token of the source cluster`}
            bodyContent={
              <span>
                Can be found via <code>oc whoami -t</code>
              </span>
            }
          >
            <button
              type="button"
              aria-label="More info for oauth token field"
              onClick={(e) => e.preventDefault()}
              aria-describedby="token"
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        ),
        helperText: <>&nbsp;</>,
      })}
    />
  );
};
