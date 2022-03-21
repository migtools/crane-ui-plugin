/* eslint-disable @typescript-eslint/no-unused-vars */

import { runStatus } from 'src/reused/pipelines-plugin/src/utils/pipeline-augment';

/* eslint-disable @typescript-eslint/no-explicit-any */
enum TerminatedReasons {
  Completed = 'Completed',
}

export type TaskStatusStep = {
  name: string;
  running?: { startedAt: string };
  terminated?: {
    finishedAt: string;
    reason: TerminatedReasons;
    startedAt: string;
  };
  waiting?: Record<string, unknown>;
};

export type TaskStatus = {
  reason: any;
  duration?: string;
  steps?: TaskStatusStep[];
};

const getMatchingStep = (step: { name: string }, status: TaskStatus): TaskStatusStep => {
  const statusSteps: TaskStatusStep[] = status.steps || [];
  return statusSteps.find((statusStep) => {
    // In rare occasions the status step name is prefixed with `step-`
    // This is likely a bug but this workaround will be temporary as it's investigated separately
    return statusStep.name === step.name || statusStep.name === `step-${step.name}`;
  }) as TaskStatusStep;
};

const getMatchingStepDuration = (matchingStep?: TaskStatusStep) => {
  return '';
};

export type StepStatus = {
  duration: string | null;
  name: string;
  runStatus: runStatus;
};

export const createStepStatus = (step: { name: string }, status: TaskStatus): StepStatus => {
  let stepRunStatus: runStatus = runStatus.PipelineNotStarted;
  let duration: string | null = null;

  if (!status || !status.reason) {
    stepRunStatus = runStatus.Cancelled;
  } else if (status.reason === runStatus['In Progress']) {
    // In progress, try to get granular statuses
    const matchingStep: TaskStatusStep = getMatchingStep(step, status);

    if (!matchingStep) {
      stepRunStatus = runStatus.Pending;
    } else if (matchingStep.terminated) {
      stepRunStatus =
        matchingStep.terminated.reason === TerminatedReasons.Completed
          ? runStatus.Succeeded
          : runStatus.Failed;
      duration = getMatchingStepDuration(matchingStep);
    } else if (matchingStep.running) {
      stepRunStatus = runStatus['In Progress'];
      duration = getMatchingStepDuration(matchingStep);
    } else if (matchingStep.waiting) {
      stepRunStatus = runStatus.Pending;
    }
  } else {
    // Not in progress, just use the run status reason
    stepRunStatus = status.reason;

    duration = getMatchingStepDuration(getMatchingStep(step, status)) || status.duration || null;
  }

  return {
    duration,
    name: step.name,
    runStatus: stepRunStatus,
  };
};
