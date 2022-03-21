/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { StepStatus } from './pipeline-step-utils';

import './PipelineVisualizationStepList.scss';

export interface PipelineVisualizationStepListProps {
  isSpecOverview: boolean;
  taskName: string;
  steps: StepStatus[];
  isFinallyTask?: boolean;
}

export const PipelineVisualizationStepList: React.FC<PipelineVisualizationStepListProps> = ({
  isSpecOverview,
  taskName,
  steps,
  isFinallyTask,
}) => {
  const { t } = useTranslation();
  return (
    <div className="odc-pipeline-visualization-step-list">
      <div className="odc-pipeline-visualization-step-list__task-name">{taskName}</div>
      {isFinallyTask && (
        <div className="odc-pipeline-visualization-step-list__task-type">
          {t('pipelines-plugin~Finally task')}
        </div>
      )}
      {steps.map(({ duration, name, runStatus: status }) => {
        return (
          <div
            className={classNames('odc-pipeline-visualization-step-list__step', {
              'odc-pipeline-visualization-step-list__step--task-run': !isSpecOverview,
            })}
            key={name}
          >
            {!isSpecOverview ? null : (
              <span className="odc-pipeline-visualization-step-list__bullet">&bull;</span>
            )}
            <div className="odc-pipeline-visualization-step-list__name">{name}</div>
            {!isSpecOverview && (
              <div className="odc-pipeline-visualization-step-list__duration">{duration}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
