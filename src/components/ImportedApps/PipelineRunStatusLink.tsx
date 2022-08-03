import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@patternfly/react-core';
import { StatusComponent } from '@openshift-console/dynamic-plugin-sdk';
import { pipelineRunStatus } from 'src/reused/pipelines-plugin/src/utils/pipeline-filter-reducer';
import { CranePipelineRun } from 'src/api/types/CranePipeline';
import { resourceActionToString } from 'src/api/pipelineHelpers';
import { pipelineRunUrl } from 'src/utils/paths';
import { useValidatedNamespace } from 'src/common/hooks/useValidatedNamespace';

interface PipelineRunStatusLinkProps {
  pipelineRun: CranePipelineRun;
  showAction?: boolean;
}

export const PipelineRunStatusLink: React.FunctionComponent<PipelineRunStatusLinkProps> = ({
  pipelineRun,
  showAction = false,
}) => {
  const { namespace } = useValidatedNamespace();
  const action = resourceActionToString(pipelineRun, true);
  return (
    <Tooltip content="Detailed import status is found under Pipelines in the navigation">
      <Link to={pipelineRunUrl(namespace, pipelineRun)}>
        <StatusComponent
          className="crane-plr-status"
          status={pipelineRunStatus(pipelineRun) || ''}
          title={`${pipelineRunStatus(pipelineRun) || ''}${showAction ? ` ${action}` : ''}`}
        />
      </Link>
    </Tooltip>
  );
};
