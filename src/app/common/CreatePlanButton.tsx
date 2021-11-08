import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';
interface ICreatePlanButtonProps {
  variant?: ButtonProps['variant'];
}

const CreatePlanButton: React.FunctionComponent<ICreatePlanButtonProps> = ({
  variant = 'primary',
}: ICreatePlanButtonProps) => {
  const history = useHistory();
  return (
    <Button
      isSmall
      onClick={() => history.push('/plans/create')}
      isAriaDisabled={true}
      variant={variant}
      id="create-plan-button"
    >
      Create plan
    </Button>
  );
};

export default CreatePlanButton;
