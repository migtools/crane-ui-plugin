import { k8sGet, K8sGroupVersionKind, useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { useQuery } from 'react-query';

export const namespaceGVK: K8sGroupVersionKind = {
  group: '',
  version: 'v1',
  kind: 'Namespace',
};

export const useHostNamespaceQuery = (namespace?: string) => {
  const [model] = useK8sModel(namespaceGVK);
  return useQuery(['namespace', namespace], {
    queryFn: () => k8sGet({ model, name: namespace }),
    enabled: !!namespace,
    retry: false,
  });
};
