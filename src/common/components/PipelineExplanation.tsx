import * as React from 'react';
import { TextContent, TextList, TextListItem, Text } from '@patternfly/react-core';
import { CranePipelineAction } from 'src/api/types/CranePipeline';

interface PipelineExplanationProps {
  action: CranePipelineAction;
  isStatefulMigration: boolean;
  hasVisualization?: boolean;
}

export const PipelineExplanation: React.FunctionComponent<PipelineExplanationProps> = ({
  action,
  isStatefulMigration,
  hasVisualization = false,
}) => {
  if (action === 'stage') {
    return (
      <TextContent>
        <Text component="p">
          {hasVisualization ? 'This shows the pipeline tasks for a stage import. ' : ''}
          During a stage import:
        </Text>
        <TextList>
          <TextListItem>PVC data is synchronized into the active project.</TextListItem>
          <TextListItem>
            Workloads are not migrated and remain running in the source cluster.
          </TextListItem>
        </TextList>
        <Text component="p">
          The stage pipeline can be re-run multiple times to lower the downtime of a subsequent
          cutover import.
        </Text>
      </TextContent>
    );
  }
  if (action === 'cutover') {
    return (
      <TextContent>
        <Text component="p">
          {hasVisualization ? 'This shows the pipeline tasks for a cutover import. ' : ''}
          During a cutover import:
        </Text>
        <TextList>
          <TextListItem>All applications on the source namespace are halted.</TextListItem>
          {isStatefulMigration ? (
            <TextListItem>PVC data is migrated into the active project.</TextListItem>
          ) : null}
          <TextListItem>Workloads are migrated into the active project.</TextListItem>
        </TextList>
        {isStatefulMigration ? (
          <Text component="p">The cutover pipeline is the final step in a migration project.</Text>
        ) : null}
      </TextContent>
    );
  }
  return null;
};
