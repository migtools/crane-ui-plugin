import * as React from 'react';
import { Button, ButtonProps, Tooltip } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  isMissingPipelineRuns,
  isPipelineRunStarting,
  useStartPipelineRunMutation,
} from 'src/api/queries/pipelines';
import { CranePipelineAction, CranePipelineGroup } from 'src/api/types/CranePipeline';
import { actionToString } from 'src/api/pipelineHelpers';

interface PipelineGroupActionButtonProps {
  pipelineGroup: CranePipelineGroup;
  action: CranePipelineAction;
  variant?: ButtonProps['variant'];
}

export const PipelineGroupActionButton: React.FunctionComponent<PipelineGroupActionButtonProps> = ({
  pipelineGroup,
  action,
  variant = 'secondary',
}) => {
  const mutation = useStartPipelineRunMutation(pipelineGroup, action);
  const isStarting = isPipelineRunStarting(pipelineGroup, mutation);
  const isGroupBroken = isMissingPipelineRuns(pipelineGroup);
  const isDisabled = isStarting || isGroupBroken;

  React.useEffect(() => {
    // Don't keep old mutation state around in case relevant resources get deleted and mess with isStarting
    if (!isStarting && mutation.isSuccess) mutation.reset();
  }, [isStarting, mutation]);

  const button = (
    <Button
      id={`start-${action}-button`}
      onClick={() => {
        // TODO add a confirm modal here
        mutation.mutate();
      }}
      variant={variant}
      className={spacing.mlSm}
      isAriaDisabled={isDisabled}
      {...(isStarting
        ? {
            spinnerAriaValueText: 'Starting',
            spinnerAriaLabelledBy: `start-${action}-button`,
            isLoading: true,
          }
        : {})}
    >
      {actionToString(action)}
    </Button>
  );

  const disabledReason = isGroupBroken ? (
    <>
      This application cannot be imported because pre-generated PipelineRuns have been deleted.
      Delete the import and start a new one.
    </>
  ) : null;

  if (disabledReason) {
    return <Tooltip content={disabledReason}>{button}</Tooltip>;
  }
  return button;
};
