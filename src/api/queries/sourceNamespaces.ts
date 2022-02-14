import { useQuery } from 'react-query';
import { namespaceResource, useProxyK8sClient } from '../proxyHelpers';
import { OAuthSecret } from '../types/Secret';

export const useSourceNamespacesQuery = (sourceApiSecret?: OAuthSecret, isEnabled = true) => {
  const client = useProxyK8sClient(sourceApiSecret);
  return useQuery('source-namespaces', {
    queryFn: () => client.list(namespaceResource),
    enabled: !!sourceApiSecret && isEnabled,
  });
};
