import { PipelineKind, PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';

export const CRANE_PIPELINE_ACTIONS = ['stage', 'cutover'] as const;
export type CranePipelineAction = typeof CRANE_PIPELINE_ACTIONS[number];

export type CraneAnnotations = {
  'crane-ui-plugin.konveyor.io/action': CranePipelineAction;
  'crane-ui-plugin.konveyor.io/group': string;
};

export type CranePipeline = PipelineKind & {
  metadata: PipelineKind['metadata'] & { annotations?: CraneAnnotations };
};

export type CranePipelineRun = PipelineRunKind & {
  metadata: PipelineRunKind['metadata'] & { annotations?: CraneAnnotations };
};

export interface CranePipelineGroup {
  name: string;
  pipelines: {
    stage: CranePipeline | null;
    cutover: CranePipeline;
  };
  pipelineRuns: {
    stage: CranePipelineRun[];
    cutover: CranePipelineRun[];
    all: CranePipelineRun[];
    nonPending: CranePipelineRun[];
    latestNonPending: CranePipelineRun | null;
  };
  isStatefulApp: boolean;
}
