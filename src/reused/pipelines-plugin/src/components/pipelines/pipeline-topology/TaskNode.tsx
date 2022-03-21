import * as React from 'react';
import { observer, Node, NodeModel } from '@patternfly/react-topology';
import { PipelineVisualizationTask } from '../detail-page-tabs/pipeline-details/PipelineVisualizationTask';
import { TaskNodeModelData } from './types';

type TaskNodeProps = {
  element: Node<NodeModel, TaskNodeModelData>;
  disableTooltip?: boolean;
};

const TaskNode: React.FC<TaskNodeProps> = ({ element, disableTooltip }) => {
  const { height, width } = element.getBounds();
  const { pipeline, pipelineRun, task, selected } = element.getData() as TaskNodeModelData;
  const isTaskSkipped = pipelineRun?.status?.skippedTasks?.some(
    (t: { name: string }) => t.name === task.name,
  );

  return (
    <PipelineVisualizationTask
      pipelineRunName={pipelineRun?.metadata?.name}
      task={task}
      namespace={pipeline?.metadata?.namespace as string}
      disableTooltip={disableTooltip}
      selected={selected}
      width={width}
      height={height}
      isSkipped={isTaskSkipped}
    />
  );
};

export default observer(TaskNode);
