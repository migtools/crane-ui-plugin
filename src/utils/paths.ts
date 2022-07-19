import { pipelineRunGVK } from 'src/api/queries/pipelines';
import { PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';

export type WizardReachedFromParam = 'add' | 'topology' | 'imports' | null;

export const appImportWizardUrl = (namespace: string, from?: WizardReachedFromParam) =>
  `/app-imports/new/ns/${namespace}${from ? `?from=${from}` : ''}`;

export const appImportsPageUrl = (namespace: string, pipelineGroupName?: string) =>
  `/app-imports/ns/${namespace}${pipelineGroupName ? `/${pipelineGroupName}` : ''}`;

export const pipelineRunUrl = (namespace: string, pipelineRun: PipelineRunKind) => {
  const { group, version, kind } = pipelineRunGVK;
  return `/k8s/ns/${namespace}/${group}~${version}~${kind}/${pipelineRun.metadata?.name}`;
};

export const pipelinesListUrl = (namespace: string, nameFilter?: string) =>
  `/dev-pipelines/ns/${namespace}${nameFilter ? `?name=${nameFilter}` : ''}`;

export const addPageUrl = (namespace: string) => `/add/ns/${namespace}`;

export const topologyPageUrl = (namespace: string) => `/topology/ns/${namespace}`;
