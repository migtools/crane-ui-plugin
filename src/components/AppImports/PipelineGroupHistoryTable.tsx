import * as React from 'react';
import { Title, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { PipelineGroupHistoryTableRow } from './PipelineGroupHistoryTableRow';

interface PipelineGroupHistoryTableProps {
  pipelineGroup: CranePipelineGroup;
}

export const PipelineGroupHistoryTable: React.FunctionComponent<PipelineGroupHistoryTableProps> = ({
  pipelineGroup,
}) => (
  <>
    <Title headingLevel="h3" className={spacing.mbMd}>
      Import pipeline history
    </Title>
    {pipelineGroup.pipelineRuns.nonPending.length === 0 ? (
      <EmptyState variant="small">
        <Title headingLevel="h4" size="md">
          No import history yet
        </Title>
        <EmptyStateBody>Stage and Cutover PipelineRun history will appear here.</EmptyStateBody>
      </EmptyState>
    ) : (
      <TableComposable aria-label="Pipeline history" variant="compact">
        <Thead>
          <Tr>
            <Th modifier="nowrap" id="pipeline-run-heading">
              Pipeline run
            </Th>
            <Th modifier="nowrap" id="started-heading">
              Started
            </Th>
            <Th modifier="nowrap" id="status-heading">
              Status
            </Th>
            <Th modifier="nowrap" id="delete-heading" />
          </Tr>
        </Thead>
        <Tbody>
          {pipelineGroup.pipelineRuns.all
            .filter((pipelineRun) => pipelineRun.spec.status !== 'PipelineRunPending')
            .map((pipelineRun) => (
              <PipelineGroupHistoryTableRow
                key={pipelineRun.metadata?.name}
                pipelineRun={pipelineRun}
              />
            ))}
        </Tbody>
      </TableComposable>
    )}
  </>
);
