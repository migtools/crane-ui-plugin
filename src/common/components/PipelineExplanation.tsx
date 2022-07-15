import * as React from 'react';
import { TextContent, TextList, TextListItem, Text } from '@patternfly/react-core';
import { CranePipelineAction } from 'src/api/types/CranePipeline';

interface PipelineExplanationProps {
  action: CranePipelineAction;
  isStatefulMigration: boolean;
}

export const PipelineExplanation: React.FunctionComponent<PipelineExplanationProps> = ({
  action,
  isStatefulMigration,
}) => {
  if (action === 'stage') {
    return (
      <TextContent>
        <Text component="p">During a stage migration:</Text>
        <TextList>
          <TextListItem>PVC data is synchronized into the active project.</TextListItem>
          <TextListItem>
            Workloads are not migrated and remain running in the source cluster.
          </TextListItem>
        </TextList>
        <Text component="p">
          The stage pipeline can be re-run multiple times to lower the downtime of a subsequent
          cutover.
        </Text>
      </TextContent>
    );
  }
  if (action === 'cutover') {
    return (
      <TextContent>
        <Text component="p">During a cutover migration:</Text>
        <TextList>
          <TextListItem>All applications on the source namespace are halted.</TextListItem>
          {isStatefulMigration ? (
            <TextListItem>PVC data is migrated into the active project.</TextListItem>
          ) : null}
          <TextListItem>Workloads are migrated into the active project.</TextListItem>
        </TextList>
        <Text component="p">The cutover pipeline is the final step in an import.</Text>
      </TextContent>
    );
  }
  return null;
};
