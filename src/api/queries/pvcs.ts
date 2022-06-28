import { K8sGroupVersionKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { PersistentVolumeClaim } from '../types/PersistentVolume';

export const pvcGVK: K8sGroupVersionKind = {
  group: '',
  version: 'v1',
  kind: 'PersistentVolumeClaim',
};

export const useWatchPVCs = () => {
  const [namespace] = useActiveNamespace();
  const [data, loaded, error] = useK8sWatchResource<PersistentVolumeClaim[]>({
    groupVersionKind: pvcGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return { data, loaded, error };
};
