import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { createSvgIdUrl, useHover } from '@patternfly/react-topology';
import cx from 'classnames';
import * as _ from 'lodash';
import { TektonTaskSpec, PipelineTaskRef, TaskKind, WhenExpression } from '../../../../types';
import { runStatus, getRunStatusColor } from '../../../../utils/pipeline-augment';
import { WHEN_EXPRESSSION_DIAMOND_SIZE } from '../../pipeline-topology/const';
import WhenExpressionDecorator from '../../pipeline-topology/WhenExpressionDecorator';
import { createStepStatus, StepStatus, TaskStatus } from './pipeline-step-utils';
import { PipelineVisualizationStepList } from './PipelineVisualizationStepList';
import { StatusIcon } from './StatusIcon';
import SvgDropShadowFilter from 'src/reused/topology/src/components/svg/SvgDropShadowFilter';
import { truncateMiddle } from 'src/reused/public/components/utils/truncate-middle';

// import './PipelineVisualizationTask.scss';

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
  isSkipped,
  width,
  height,
  isFinallyTask,
}) => {
  const taskStatus = task.status || {
    duration: '',
    reason: runStatus.Idle,
  };
  if (pipelineRunStatus === runStatus.Failed || pipelineRunStatus === runStatus.Cancelled) {
    if (task.status?.reason === runStatus.Idle || task.status?.reason === runStatus.Pending) {
      taskStatus.reason = runStatus.Cancelled;
    }
  }
  if (isSkipped) {
    taskStatus.reason = runStatus.Skipped;
  }

  const taskComponent = (
    <TaskComponent
      pipelineRunName={pipelineRunName}
      name={task.name || ''}
      task={task.taskSpec && { data: { spec: task.taskSpec } }}
      namespace={namespace}
      status={taskStatus}
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
  const taskStatusColor = status
    ? getRunStatusColor(status.reason).pftoken.value
    : getRunStatusColor(runStatus.Cancelled).pftoken.value;

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

      {showStatusState && (
        <>
          <svg
            width={30}
            height={30}
            viewBox="-5 -4 20 20"
            style={{
              color: taskStatusColor,
            }}
          >
            <g
              className={cx({
                'fa-spin odc-pipeline-vis-task--icon-spin': status.reason === runStatus.Running,
                'odc-pipeline-vis-task--icon-stop': status.reason !== runStatus.Running,
              })}
            >
              <StatusIcon status={status.reason} disableSpin />
            </g>
          </svg>
          <SvgTaskStatus steps={stepStatusList} x={30} y={23} width={width / 2 + 15} />
        </>
      )}
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

interface SvgTaskStatusProps {
  steps: StepStatus[];
  x: number;
  y: number;
  width: number;
}

const SvgTaskStatus: React.FC<SvgTaskStatusProps> = ({ steps, x, y, width }) => {
  if (steps.length === 0) {
    return null;
  }
  const stepWidth = width / steps.length;
  const gap = 2;
  return (
    <g>
      {steps.map((step, index) => {
        return (
          <rect
            key={step.name}
            x={x + stepWidth * index}
            y={y}
            width={stepWidth - gap}
            height={2}
            fill={getRunStatusColor(step.runStatus).pftoken.value}
          />
        );
      })}
    </g>
  );
};
