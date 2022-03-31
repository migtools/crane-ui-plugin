import { useQuery } from 'react-query';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CoreNamespacedResource } from '@konveyor/lib-ui';
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
import { useTemporaryCORSProxyUrlQuery } from './temporaryCorsWorkaround';

// TODO at top level, mount useTemporaryCORSProxyUrlQuery and handle errors by displaying a modal to ask user to navigate to accept the cert (what URL?)
// or do the errors come from this source api root query???

export const useSourceApiRootQuery = (sourceApiSecret: OAuthSecret | null, isEnabled = true) => {
  const temporaryProxyServiceCORSUrl = useTemporaryCORSProxyUrlQuery().data?.url || '';
  const apiRootUrl = `${getSourceClusterApiUrl(sourceApiSecret, temporaryProxyServiceCORSUrl)}/api`;
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
  const temporaryProxyServiceCORSUrl = useTemporaryCORSProxyUrlQuery().data?.url || '';
  const client = getSourceClusterK8sClient(sourceApiSecret, temporaryProxyServiceCORSUrl);
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
  const temporaryProxyServiceCORSUrl = useTemporaryCORSProxyUrlQuery().data?.url || '';
  const client = getSourceClusterK8sClient(sourceApiSecret, temporaryProxyServiceCORSUrl);
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
