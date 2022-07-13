import * as React from 'react';
import { Link } from 'react-router-dom';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { getPipelineGroupSourceNamespace, getPipelineRunUrl } from 'src/api/pipelineHelpers';
import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { PipelineRunStatus } from './PipelineRunStatus';

interface PipelineGroupSummaryProps {
  pipelineGroup: CranePipelineGroup;
}

export const PipelineGroupSummary: React.FunctionComponent<PipelineGroupSummaryProps> = ({
  pipelineGroup,
}) => {
  const namespace = useNamespaceContext();
  const latestPipelineRun = pipelineGroup.pipelineRuns.latestNonPending;
  return (
    <TableComposable
      aria-label="Pipeline import summary"
      variant="compact"
      borders={false}
      gridBreakPoint="grid"
      className={`summary-table ${spacing.mbLg}`}
    >
      <Thead>
        <Tr>
          <Th modifier="nowrap" id="source-project-heading">
            Source project
          </Th>
          <Th modifier="nowrap" id="pvc-heading">
            Persistent volume claims
          </Th>
          <Th modifier="nowrap" id="status-heading">
            Last run status
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr className={spacing.pl_0}>
          <Td
            className="pf-m-truncate"
            dataLabel="Source project"
            aria-labelledby="source-project-heading"
          >
            {getPipelineGroupSourceNamespace(pipelineGroup)}
          </Td>
          <Td
            className="pf-m-truncate"
            dataLabel="Persistent volume claims"
            aria-labelledby="pvc-heading"
          >
            {pipelineGroup.pipelines.stage?.spec.tasks.filter(
              (task) => task.taskRef?.name === 'crane-transfer-pvc',
            ).length || 0}
          </Td>
          <Td
            className="pf-m-truncate"
            dataLabel="Last run status"
            aria-labelledby="status-heading"
          >
            {latestPipelineRun ? (
              <Link to={getPipelineRunUrl(latestPipelineRun, namespace)}>
                <PipelineRunStatus pipelineRun={latestPipelineRun} showAction />
              </Link>
            ) : (
              'Not started'
            )}
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};
