import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PipelineKind, PipelineRunKind } from '../../../../types';
import { PipelineLayout } from '../../pipeline-topology/const';
import PipelineTopologyGraph from '../../pipeline-topology/PipelineTopologyGraph';
import { getTopologyNodesEdges, hasWhenExpression } from '../../pipeline-topology/utils';

import './PipelineVisualization.scss';

const InvalidPipelineAlert: React.FC = () => (
  <Alert isInline variant="danger" title="Cannot preview pipeline">
    The pipeline object is invalid
  </Alert>
);

interface PipelineTopologyVisualizationProps {
  pipeline?: PipelineKind | null;
  pipelineRun?: PipelineRunKind;
  onUpdate: (hasError: boolean) => void;
}

// NOTE: error boundary added by crane-ui-plugin to prevent crashing page if visualization throws render-time errors

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onUpdate: (hasError: boolean) => void;
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

  componentDidMount() {
    this.props.onUpdate(this.state.hasError);
  }

  componentDidUpdate() {
    this.props.onUpdate(this.state.hasError);
  }

  render() {
    if (this.state.hasError) {
      return <InvalidPipelineAlert />;
    }
    return this.props.children;
  }
}

const PipelineVisualization: React.FC<PipelineTopologyVisualizationProps> = ({
  pipeline,
  pipelineRun,
  onUpdate,
}) => {
  const { t } = useTranslation();

  if (!pipeline) return <InvalidPipelineAlert />;

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
      <ErrorBoundary key={pipelineJSON} onUpdate={onUpdate}>
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
