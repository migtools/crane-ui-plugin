import { useQuery } from 'react-query';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CoreNamespacedResource } from '@konveyor/lib-ui';
import { getProxyApiUrl, namespaceResource, useProxyK8sClient } from '../proxyHelpers';
import { ApiRootQueryResponse } from '../types/APIVersions';
import { OAuthSecret } from '../types/Secret';
import { Pod } from '../types/Pod';
import { PersistentVolumeClaim } from '../types/PersistentVolume';
import { Service } from '../types/Service';

export const useSourceApiRootQuery = (sourceApiSecret: OAuthSecret | null, isEnabled = true) => {
  const apiRootUrl = `${getProxyApiUrl(sourceApiSecret)}/api`;
  return useQuery<ApiRootQueryResponse>(['api-root', sourceApiSecret?.metadata.name], {
    queryFn: async () =>
      (
        await fetch(apiRootUrl, {
          headers: { Authorization: `Bearer ${atob(sourceApiSecret?.data.token || '')}` },
        })
      ).json(),
    enabled: !!sourceApiSecret && isEnabled,
  });
};

export const useValidateSourceNamespaceQuery = (
  sourceApiSecret: OAuthSecret | null,
  namespace: string,
  isEnabled = true,
) => {
  const client = useProxyK8sClient(sourceApiSecret);
  return useQuery(['namespace', namespace], {
    queryFn: () => client?.get(namespaceResource, namespace),
    enabled: !!sourceApiSecret && !!namespace && isEnabled,
    retry: false,
  });
};

interface UseSourceNamespacedQueryArgs {
  sourceApiSecret: OAuthSecret | null;
  sourceNamespace: string;
}

const useSourceNamespacedListQuery = <T extends K8sResourceCommon>(
  { sourceApiSecret, sourceNamespace }: UseSourceNamespacedQueryArgs,
  kindPlural: string,
) => {
  const client = useProxyK8sClient(sourceApiSecret);
  const resource = new CoreNamespacedResource(kindPlural, sourceNamespace);
  return useQuery([kindPlural, sourceApiSecret?.metadata.name, sourceNamespace], {
    queryFn: () => client?.list<T>(resource),
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
