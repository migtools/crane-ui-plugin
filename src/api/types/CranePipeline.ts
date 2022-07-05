import { PipelineKind, PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';

export type CraneAnnotations = {
  'crane-ui-plugin.konveyor.io/action': 'stage' | 'cutover';
  'crane-ui-plugin.konveyor.io/associated-cutover-pipeline': string; // TODO should we replace this with group name? just the prefix from the wizard? Maybe replace instances of namePrefix with groupName if we're doing that
};

export type CranePipeline = PipelineKind & {
  metadata: PipelineKind['metadata'] & { annotations?: CraneAnnotations };
};

export type CranePipelineRun = PipelineRunKind & {
  metadata: PipelineRunKind['metadata'] & { annotations?: CraneAnnotations };
};

export interface CranePipelineGroup {
  pipelines: {
    stage: CranePipeline | null;
    cutover: CranePipeline;
  };
  pipelineRuns: {
    stage: CranePipelineRun[];
    cutover: CranePipelineRun[];
    all: CranePipelineRun[];
  };
}
