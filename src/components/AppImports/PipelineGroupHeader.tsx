import * as React from 'react';
import { Title, Level, LevelItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { useDeletePipelineMutation } from 'src/api/queries/pipelines';
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
);
