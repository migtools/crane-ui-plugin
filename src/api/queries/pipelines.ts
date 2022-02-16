import { K8sGroupVersionKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { PipelineKind } from '../types/pipelines-plugin';

const pipelineGVK: K8sGroupVersionKind = {
  group: 'tekton.dev',
  version: 'v1beta1',
  kind: 'Pipeline',
};

export const useWatchPipelines = () => {
  const namespace = useNamespaceContext();
  const [data, loaded, error] = useK8sWatchResource<PipelineKind[]>({
    groupVersionKind: pipelineGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return { data, loaded, error };
};
