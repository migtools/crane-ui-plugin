import { pipelineRunGVK } from 'src/api/queries/pipelines';
import { PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';

export const appImportWizardAllNamespacesUrl = '/app-imports/new/all-namespaces';

export const appImportWizardUrl = (namespace: string) => `/app-imports/new/ns/${namespace}`;

export const appImportsAllNamespacesUrl = '/app-imports/all-namespaces';

export const appImportsPageUrl = (namespace: string, pipelineGroupName?: string) =>
  `/app-imports/ns/${namespace}${pipelineGroupName ? `/${pipelineGroupName}` : ''}`;

export const pipelineRunUrl = (namespace: string, pipelineRun: PipelineRunKind) => {
  const { group, version, kind } = pipelineRunGVK;
  return `/k8s/ns/${namespace}/${group}~${version}~${kind}/${pipelineRun.metadata?.name}`;
};

export const pipelinesListUrl = (namespace: string, nameFilter?: string) =>
  `/dev-pipelines/ns/${namespace}${nameFilter ? `?name=${nameFilter}` : ''}`;

export const projectDetailsAllNamespacesUrl = '/project-details/all-namespaces';

export const addPageAllNamespacesUrl = '/add/all-namespaces';
