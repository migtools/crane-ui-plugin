/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { observer, Node, NodeModel, Point } from '@patternfly/react-topology';
import { PipelineVisualizationTask } from '../detail-page-tabs/pipeline-details/PipelineVisualizationTask';
import {
  NODE_WIDTH,
  NODE_HEIGHT,
  FINALLY_NODE_PADDING,
  FINALLY_NODE_VERTICAL_SPACING,
  WHEN_EXPRESSION_SPACING,
} from './const';
import { integralShapePath, straightPath } from './draw-utils';
import { FinallyNodeModel } from './types';
import { TektonTaskSpec, PipelineTaskRef, WhenExpression } from '../../../types';
import { TaskStatus } from '../detail-page-tabs/pipeline-details/pipeline-step-utils';

import './FinallyNode.scss';

type FinallyNodeProps = {
  element: Node<NodeModel, FinallyNodeModel>;
};

const FinallyNode: React.FC<FinallyNodeProps> = ({ element }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { task, pipeline, pipelineRun } = element.getData() as any;
  const { width, height } = element.getBounds();
  const nodeCenter = NODE_HEIGHT + NODE_HEIGHT / 2;
  const leftPadding = FINALLY_NODE_PADDING + WHEN_EXPRESSION_SPACING;
  const verticalHeight = NODE_HEIGHT + FINALLY_NODE_VERTICAL_SPACING;

  const { finallyTasks = [] } = task;
  return (
    <g transform="translate(0.5, 0.5)" data-test="finally-node">
      <rect
        className="opp-finally-node"
        strokeWidth={1}
        width={width}
        height={height}
        rx="20"
        ry="20"
      />

      {finallyTasks.map(
        (
          ft: {
            name: any;
            selected?: any;
            taskSpec?: TektonTaskSpec | undefined;
            taskRef?: PipelineTaskRef | undefined;
            runAfter?: string[] | undefined;
            when?: WhenExpression[] | undefined;
            status?: TaskStatus | undefined;
          },
          i: number,
        ) => {
          return (
            <g key={ft.name} data-test={`finally-task-node ${ft.name}`}>
              <path
                className="opp-finally-node__connector"
                d={
                  nodeCenter + i * verticalHeight === height / 2
                    ? straightPath(new Point(leftPadding, height / 2), new Point(0, height / 2))
                    : integralShapePath(
                        new Point(0, height / 2),
                        new Point(leftPadding, nodeCenter + i * verticalHeight),
                      )
                }
              />
              <g
                transform={`translate(${leftPadding}, ${
                  NODE_HEIGHT * i + FINALLY_NODE_VERTICAL_SPACING * i + FINALLY_NODE_PADDING
                })`}
              >
                <PipelineVisualizationTask
                  pipelineRunName={pipelineRun?.metadata?.name}
                  task={ft}
                  namespace={pipeline?.metadata?.namespace}
                  selected={ft.selected}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  isFinallyTask
                  isSkipped={pipelineRun?.status?.skippedTasks?.some(
                    (t: { name: string }) => t.name === ft.name,
                  )}
                />
              </g>
            </g>
          );
        },
      )}
    </g>
  );
};

export default observer(FinallyNode);
