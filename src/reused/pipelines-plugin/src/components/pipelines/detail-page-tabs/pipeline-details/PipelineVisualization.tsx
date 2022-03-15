import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PipelineKind, PipelineRunKind } from '../../../../types';
import { PipelineLayout } from '../../pipeline-topology/const';
import PipelineTopologyGraph from '../../pipeline-topology/PipelineTopologyGraph';
import { getTopologyNodesEdges, hasWhenExpression } from '../../pipeline-topology/utils';

import './PipelineVisualization.scss';

interface PipelineTopologyVisualizationProps {
  pipeline: PipelineKind;
  pipelineRun?: PipelineRunKind;
}

// NOTE: error boundary added by crane-ui-plugin to prevent crashing page if visualization throws render-time errors

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert isInline variant="danger" title="Cannot preview pipeline">
          The pipeline object is invalid
        </Alert>
      );
    }
    return this.props.children;
  }
}

const PipelineVisualization: React.FC<PipelineTopologyVisualizationProps> = ({
  pipeline,
  pipelineRun,
}) => {
  const { t } = useTranslation();
  let content: React.ReactElement;

  const { nodes, edges } = getTopologyNodesEdges(pipeline, pipelineRun);

  if (nodes.length === 0 && edges.length === 0) {
    // Nothing to render
    // TODO: Confirm wording with UX; ODC-1860
    content = (
      <Alert
        variant="info"
        isInline
        title={t('pipelines-plugin~This Pipeline has no tasks to visualize.')}
      />
    );
  } else {
    const pipelineJSON = JSON.stringify(pipeline);
    content = (
      <ErrorBoundary key={pipelineJSON}>
        <PipelineTopologyGraph
          id={`${pipelineRun?.metadata?.name || pipeline?.metadata?.name}-graph`}
          data-test="pipeline-visualization"
          nodes={nodes}
          edges={edges}
          layout={
            hasWhenExpression(pipeline)
              ? PipelineLayout.DAGRE_VIEWER_SPACED
              : PipelineLayout.DAGRE_VIEWER
          }
          key={pipelineJSON}
        />
      </ErrorBoundary>
    );
  }

  return <div className="odc-pipeline-visualization">{content}</div>;
};

export default PipelineVisualization;
