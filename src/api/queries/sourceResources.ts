import { useQuery } from 'react-query';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CoreNamespacedResource } from '@konveyor/lib-ui';
import { namespaceResource, useProxyK8sClient } from '../proxyHelpers';
import { OAuthSecret } from '../types/Secret';
import { Pod } from '../types/Pod';
import { PersistentVolumeClaim } from '../types/PersistentVolume';
import { Service } from '../types/Service';

export const useSourceNamespacesQuery = (sourceApiSecret?: OAuthSecret, isEnabled = true) => {
  const client = useProxyK8sClient(sourceApiSecret);
  return useQuery(['namespaces', sourceApiSecret?.metadata.name], {
    queryFn: () => client.list(namespaceResource),
    enabled: !!sourceApiSecret && isEnabled,
  });
};

interface UseSourceNamespacedQueryArgs {
  sourceApiSecret?: OAuthSecret;
  namespace: string;
}

const useSourceNamespacedListQuery = <T extends K8sResourceCommon>(
  { sourceApiSecret, namespace }: UseSourceNamespacedQueryArgs,
  kindPlural: string,
) => {
  const client = useProxyK8sClient(sourceApiSecret);
  const resource = new CoreNamespacedResource(kindPlural, namespace);
  return useQuery([kindPlural, sourceApiSecret?.metadata.name, namespace], {
    queryFn: () => client.list<T>(resource),
    enabled: !!sourceApiSecret,
    refetchInterval: 15_000,
  });
};

export const useSourcePodsQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<Pod>(args, 'pods');

export const useSourcePVCsQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<PersistentVolumeClaim>(args, 'persistentvolumeclaims');

export const useSourceServicesQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<Service>(args, 'services');
