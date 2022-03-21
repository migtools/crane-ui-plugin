import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PipelineVisualization from 'src/reused/pipelines-plugin/src/components/pipelines/detail-page-tabs/pipeline-details/PipelineVisualization';
import { PipelineKind } from 'src/reused/pipelines-plugin/src/types';

interface PipelineVisualizationWrapperProps {
  pipeline?: PipelineKind | null;
  onUpdate: (hasError: boolean) => void;
}

export const PipelineVisualizationWrapper: React.FunctionComponent<
  PipelineVisualizationWrapperProps
> = ({ pipeline, onUpdate }) => {
  const pipelineJSON = JSON.stringify(pipeline);
  if (!pipeline) return <InvalidPipelineAlert />;
  return (
    <div className={spacing.mbLg}>
      <ErrorBoundary key={pipelineJSON} onUpdate={onUpdate}>
        <PipelineVisualization pipeline={pipeline} />
      </ErrorBoundary>
    </div>
  );
};

const InvalidPipelineAlert: React.FunctionComponent = () => (
  <Alert isInline variant="danger" title="Cannot preview pipeline" className={spacing.mbMd}>
    The pipeline object is invalid
  </Alert>
);

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
