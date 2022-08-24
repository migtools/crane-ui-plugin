import { useQuery } from 'react-query';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CoreNamespacedResource } from '@migtools/lib-ui';
import {
  getSourceClusterApiUrl,
  namespaceResource,
  getSourceClusterK8sClient,
} from '../proxyHelpers';
import { ApiRootQueryResponse } from '../types/APIVersions';
import { OAuthSecret } from '../types/Secret';
import { Pod } from '../types/Pod';
import { PersistentVolumeClaim } from '../types/PersistentVolume';
import { Service } from '../types/Service';

export const useSourceApiRootQuery = (sourceApiSecret: OAuthSecret | null, isEnabled = true) => {
  const apiRootUrl = `${getSourceClusterApiUrl(sourceApiSecret)}/api`;
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
  const client = getSourceClusterK8sClient(sourceApiSecret);
  return useQuery(['namespace', namespace, sourceApiSecret?.metadata.name], {
    queryFn: () => client?.get(namespaceResource, namespace),
    enabled: !!sourceApiSecret && !!namespace && isEnabled,
    retry: false,
  });
};

interface UseSourceNamespacedQueryArgs {
  sourceApiSecret: OAuthSecret | null;
  sourceNamespace?: string;
}

const useSourceNamespacedListQuery = <T extends K8sResourceCommon>(
  { sourceApiSecret, sourceNamespace }: UseSourceNamespacedQueryArgs,
  kindPlural: string,
) => {
  const client = getSourceClusterK8sClient(sourceApiSecret);
  const resource = sourceNamespace ? new CoreNamespacedResource(kindPlural, sourceNamespace) : null;
  return useQuery([kindPlural, sourceApiSecret?.metadata.name, sourceNamespace], {
    queryFn: () => client?.list<T>(resource as CoreNamespacedResource),
    enabled: !!sourceApiSecret && !!sourceNamespace,
    refetchInterval: 15_000,
  });
};

export const useSourcePodsQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<Pod>(args, 'pods');

export const useSourcePVCsQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<PersistentVolumeClaim>(args, 'persistentvolumeclaims');

export const useSourceServicesQuery = (args: UseSourceNamespacedQueryArgs) =>
  useSourceNamespacedListQuery<Service>(args, 'services');
