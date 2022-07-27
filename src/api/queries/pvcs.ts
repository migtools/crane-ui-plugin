import { K8sGroupVersionKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useValidatedNamespace } from 'src/common/hooks/useValidatedNamespace';
import { PersistentVolumeClaim } from '../types/PersistentVolume';

export const pvcGVK: K8sGroupVersionKind = {
  group: '',
  version: 'v1',
  kind: 'PersistentVolumeClaim',
};

export const useWatchPVCs = () => {
  const { namespace } = useValidatedNamespace();
  const [data, loaded, error] = useK8sWatchResource<PersistentVolumeClaim[]>({
    groupVersionKind: pvcGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return { data, loaded, error };
};
