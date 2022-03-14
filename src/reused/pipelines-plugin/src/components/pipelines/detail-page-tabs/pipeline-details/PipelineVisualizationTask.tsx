import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { createSvgIdUrl, useHover } from '@patternfly/react-topology';
import cx from 'classnames';
import * as _ from 'lodash';
import { TektonTaskSpec, PipelineTaskRef, TaskKind, WhenExpression } from '../../../../types';
import { WHEN_EXPRESSSION_DIAMOND_SIZE } from '../../pipeline-topology/const';
import WhenExpressionDecorator from '../../pipeline-topology/WhenExpressionDecorator';
import { createStepStatus, StepStatus, TaskStatus } from './pipeline-step-utils';
import { PipelineVisualizationStepList } from './PipelineVisualizationStepList';
import SvgDropShadowFilter from 'src/reused/topology/src/components/svg/SvgDropShadowFilter';
import { truncateMiddle } from 'src/reused/public/components/utils/truncate-middle';

import './PipelineVisualizationTask.scss';

// crane-ui-plugin NOTE: this component has been changed to remove the dependency on Firehose. The task status tooltip has been disabled.

type PipelineVisualizationTask = {
  name?: string;
  taskSpec?: TektonTaskSpec;
  taskRef?: PipelineTaskRef;
  runAfter?: string[];
  when?: WhenExpression[];
  status?: TaskStatus;
};
interface TaskProps {
  pipelineRunName?: string;
  name: string;
  loaded?: boolean;
  task?: {
    data: TaskKind;
  };
  status: TaskStatus;
  namespace: string;
  isPipelineRun: boolean;
  disableVisualizationTooltip?: boolean;
  selected?: boolean;
  width: number;
  height: number;
  isFinallyTask?: boolean;
  pipelineTask: PipelineVisualizationTask;
}

interface PipelineVisualizationTaskProp {
  pipelineRunName?: string;
  namespace: string;
  task: PipelineVisualizationTask;
  taskRun?: string;
  pipelineRunStatus?: string;
  disableTooltip?: boolean;
  selected?: boolean;
  isSkipped?: boolean;
  width: number;
  height: number;
  isFinallyTask?: boolean;
}

const FILTER_ID = 'SvgTaskDropShadowFilterId';

export const PipelineVisualizationTask: React.FC<PipelineVisualizationTaskProp> = ({
  pipelineRunName,
  task,
  namespace,
  pipelineRunStatus,
  disableTooltip,
  selected,
  width,
  height,
  isFinallyTask,
}) => {
  const taskStatus = task.status; // NOTE status-related code has been removed for crane-ui-plugin

  const taskComponent = (
    <TaskComponent
      pipelineRunName={pipelineRunName}
      name={task.name || ''}
      task={task.taskSpec && { data: { spec: task.taskSpec } }}
      namespace={namespace}
      status={taskStatus as TaskStatus}
      isPipelineRun={!!pipelineRunStatus}
      disableVisualizationTooltip={disableTooltip}
      selected={selected}
      width={width}
      height={height}
      isFinallyTask={isFinallyTask}
      pipelineTask={task}
    />
  );

  return taskComponent; // <- changed from original console code
};
const TaskComponent: React.FC<TaskProps> = ({
  task,
  status,
  name,
  isPipelineRun,
  disableVisualizationTooltip,
  selected,
  width,
  height,
  isFinallyTask,
  pipelineTask,
}) => {
  const stepList = task?.data?.spec?.steps || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stepStatusList: StepStatus[] = stepList.map((step: any) => createStepStatus(step, status));
  const showStatusState: boolean = isPipelineRun && !!status && !!status.reason;
  const visualName = name || _.get(task, ['metadata', 'name'], '');
  const enableLogLink = false; // <- changed from original console code
  const hasWhenExpression = (pipelineTask?.when?.length || 0) > 0;
  const hasRunAfter = (pipelineTask?.runAfter?.length || 0) > 0;

  const [hover, hoverRef] = useHover();
  const truncatedVisualName = React.useMemo(
    () => truncateMiddle(visualName, { length: showStatusState ? 11 : 14, truncateEnd: true }),
    [visualName, showStatusState],
  );

  const renderVisualName = (
    <text
      x={showStatusState ? 30 : width / 2}
      y={height / 2 + 1}
      className={cx('odc-pipeline-vis-task-text', {
        'is-text-center': !isPipelineRun,
        'is-linked': enableLogLink,
      })}
    >
      {truncatedVisualName}
    </text>
  );

  let taskPill = (
    <g ref={hoverRef as React.LegacyRef<SVGGElement>}>
      <SvgDropShadowFilter dy={1} id={FILTER_ID} />
      <rect
        filter={hover ? createSvgIdUrl(FILTER_ID) : ''}
        width={width}
        height={height}
        rx={15}
        className={cx('odc-pipeline-vis-task', {
          'is-selected': selected,
          'is-linked': enableLogLink,
        })}
      />
      {visualName !== truncatedVisualName && disableVisualizationTooltip ? (
        <Tooltip content={visualName}>{renderVisualName}</Tooltip>
      ) : (
        renderVisualName
      )}
      {/* NOTE status related code has been removed for crane-ui-plugin */}
    </g>
  );

  if (!disableVisualizationTooltip) {
    taskPill = (
      <>
        <Tooltip
          position="bottom"
          enableFlip={false}
          content={
            <PipelineVisualizationStepList
              isSpecOverview={!isPipelineRun}
              taskName={visualName}
              steps={stepStatusList}
              isFinallyTask={isFinallyTask}
            />
          }
        >
          {taskPill}
        </Tooltip>
      </>
    );
  }

  const taskNode = (
    <>
      {hasWhenExpression && (
        <WhenExpressionDecorator
          width={WHEN_EXPRESSSION_DIAMOND_SIZE}
          height={WHEN_EXPRESSSION_DIAMOND_SIZE}
          appendLine={!hasRunAfter && !isFinallyTask}
          isPipelineRun={isPipelineRun}
          status={status.reason}
          enableTooltip
          leftOffset={disableVisualizationTooltip && !isFinallyTask ? 3 : 2}
          isFinallyTask={!!isFinallyTask}
        />
      )}
      {taskPill}
    </>
  );
  return taskNode;
};

// NOTE status-related code has been removed for crane-ui-plugin
