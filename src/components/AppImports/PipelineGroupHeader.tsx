import * as React from 'react';
import { Title, Level, LevelItem, Alert, AlertActionLink } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { isMissingPipelineRuns, useDeletePipelineMutation } from 'src/api/queries/pipelines';
import { PipelineGroupActionButton } from './PipelineGroupActionButton';
import { PipelineGroupKebabMenu } from './PipelineGroupKebabMenu';

interface PipelineGroupHeaderProps {
  pipelineGroup: CranePipelineGroup;
  deletePipelineMutation: ReturnType<typeof useDeletePipelineMutation>;
}

export const PipelineGroupHeader: React.FunctionComponent<PipelineGroupHeaderProps> = ({
  pipelineGroup,
  deletePipelineMutation,
}) => (
  <>
    <Level hasGutter className={spacing.mbMd}>
      <Title headingLevel="h3">{pipelineGroup.name}</Title>
      <LevelItem>
        <PipelineGroupActionButton pipelineGroup={pipelineGroup} action="stage" />
        <PipelineGroupActionButton pipelineGroup={pipelineGroup} action="cutover" />
        <PipelineGroupKebabMenu
          pipelineGroup={pipelineGroup}
          deletePipelineMutation={deletePipelineMutation}
        />
      </LevelItem>
    </Level>
    {isMissingPipelineRuns(pipelineGroup) ? (
      <Alert
        variant="warning"
        isInline
        title="Missing PipelineRuns"
        actionLinks={
          <AlertActionLink
            onClick={() => deletePipelineMutation.mutate(pipelineGroup.pipelines.cutover)}
          >
            Delete remaining Pipelines and PipelineRuns for this import
          </AlertActionLink>
        }
      >
        The application import wizard pre-generates PipelineRuns with the necessary parameters for
        the import. Some or all of these pre-generated PipelineRuns have been deleted, so this
        import can no longer be run.
      </Alert>
    ) : null}
  </>
);
