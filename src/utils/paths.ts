import { pipelineRunGVK } from 'src/api/queries/pipelines';
import { PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';

export const appImportWizardUrl = (namespace: string) => `/import-application/ns/${namespace}`;

export const appImportsPageUrl = (namespace: string, pipelineGroupName?: string) =>
  `/k8s/ns/${namespace}/app-imports${pipelineGroupName ? `/${pipelineGroupName}` : ''}`;

export const appImportsAllNamespacesUrl = () => '/k8s/all-namespaces/app-imports';

export const pipelineRunUrl = (namespace: string, pipelineRun: PipelineRunKind) => {
  const { group, version, kind } = pipelineRunGVK;
  return `/k8s/ns/${namespace}/${group}~${version}~${kind}/${pipelineRun.metadata?.name}`;
};

export const pipelinesListUrl = (namespace: string, nameFilter?: string) =>
  `/dev-pipelines/ns/${namespace}${nameFilter ? `?name=${nameFilter}` : ''}`;
