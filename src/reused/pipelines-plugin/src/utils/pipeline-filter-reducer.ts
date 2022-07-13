// import i18next from 'i18next';
import * as _ from 'lodash';
import { Condition, PipelineRunKind } from '../types';

// NOTE: This is only a partial snippet of the original file, all we needed was the `pipelineRunStatus` function.
// NOTE: i18next usage has been temporarily removed here as we cannot inherit the strings from the console itself.

export enum SucceedConditionReason {
  PipelineRunCancelled = 'PipelineRunCancelled',
  TaskRunCancelled = 'TaskRunCancelled',
  Cancelled = 'Cancelled',
  PipelineRunStopping = 'PipelineRunStopping',
  PipelineRunPending = 'PipelineRunPending',
  TaskRunStopping = 'TaskRunStopping',
  CreateContainerConfigError = 'CreateContainerConfigError',
  ExceededNodeResources = 'ExceededNodeResources',
  ExceededResourceQuota = 'ExceededResourceQuota',
  ConditionCheckFailed = 'ConditionCheckFailed',
}

// Converts the PipelineRun (and TaskRun) condition status into a human readable string.
// See also tkn cli implementation at https://github.com/tektoncd/cli/blob/release-v0.15.0/pkg/formatted/k8s.go#L54-L83
export const pipelineRunStatus = (pipelineRun: PipelineRunKind): string | null => {
  const conditions: Condition[] = _.get(pipelineRun, ['status', 'conditions'], []);
  if (conditions.length === 0) return null;

  const succeedCondition = conditions.find((c) => c.type === 'Succeeded');
  if (!succeedCondition || !succeedCondition.status) {
    return null;
  }
  const status =
    succeedCondition.status === 'True'
      ? 'Succeeded'
      : succeedCondition.status === 'False'
      ? 'Failed'
      : 'Running';

  if (succeedCondition.reason && succeedCondition.reason !== status) {
    switch (succeedCondition.reason) {
      case SucceedConditionReason.PipelineRunCancelled:
      case SucceedConditionReason.TaskRunCancelled:
      case SucceedConditionReason.Cancelled:
        return 'Cancelled';
      case SucceedConditionReason.PipelineRunStopping:
      case SucceedConditionReason.TaskRunStopping:
        return 'Failed';
      case SucceedConditionReason.CreateContainerConfigError:
      case SucceedConditionReason.ExceededNodeResources:
      case SucceedConditionReason.ExceededResourceQuota:
      case SucceedConditionReason.PipelineRunPending:
        return 'Pending';
      case SucceedConditionReason.ConditionCheckFailed:
        return 'Skipped';
      default:
        return status;
    }
  }
  return status;
};
