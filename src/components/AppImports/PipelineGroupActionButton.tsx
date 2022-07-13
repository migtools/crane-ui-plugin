import * as React from 'react';
import { Button } from '@patternfly/react-core';
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
}

export const PipelineGroupActionButton: React.FunctionComponent<PipelineGroupActionButtonProps> = ({
  pipelineGroup,
  action,
}) => {
  const mutation = useStartPipelineRunMutation(pipelineGroup, action);
  const isStarting = isPipelineRunStarting(pipelineGroup, mutation);
  const isGroupBroken = isMissingPipelineRuns(pipelineGroup);
  const isDisabled =
    isStarting || isGroupBroken || (action === 'stage' && !pipelineGroup.pipelines.stage);

  // TODO add tooltip on disabled stage when there are no PVCs
  // TODO add a tooltip on disabled stage when the group is broken
  return (
    <Button
      id={`start-${action}-button`}
      onClick={() => {
        // TODO add a confirm modal here
        mutation.mutate();
      }}
      variant="primary"
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
};
