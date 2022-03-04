import { K8sGroupVersionKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { StorageClass } from '../types/StorageClass';

export const storageClassGVK: K8sGroupVersionKind = {
  group: 'storage.k8s.io',
  version: 'v1',
  kind: 'StorageClass',
};

export const useWatchStorageClasses = () => {
  const [data, loaded, error] = useK8sWatchResource<StorageClass[]>({
    groupVersionKind: storageClassGVK,
    isList: true,
    namespaced: false,
  });
  return { data, loaded, error };
};

export const isDefaultStorageClass = (sc: StorageClass) =>
  sc.metadata.annotations?.['storageclass.kubernetes.io/is-default-class'] === 'true';
