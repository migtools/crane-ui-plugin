import {
  K8sGroupVersionKind,
  useK8sModel,
  k8sList,
  k8sCreate,
  k8sGet,
  k8sPatch,
} from '@openshift-console/dynamic-plugin-sdk';
import { useMutation } from 'react-query';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { isSameResource } from 'src/utils/helpers';
import { ProxyConfigMap, ProxyConfigMapCluster } from '../types/ConfigMap';
import { OAuthSecret, Secret } from '../types/Secret';

const secretGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'Secret' };
const configMapGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'ConfigMap' };

interface ConfigureProxyMutationParams {
  apiUrl: string;
  token: string;
}

// TODO do we have a derived secret name that depends on the API URL hash, so they are reusable? or do we use generateName and keep it in state?
// We could:
// - use md5 or similar to derive a name for the secret from the URL, so they are 1-to-1
// - list all secrets in the namespace and see if one matches the entire URL already, if not create one with generateName
// - just create a fresh one with generateName every session and let there be garbage

const getNewSecret = (
  sourceOrTarget: 'source' | 'target',
  namespace: string,
  apiUrl: string,
  token: string,
): OAuthSecret => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    generateName: `${sourceOrTarget}-cluster-`,
    namespace,
    annotations: {
      'konveyor.io/crane-ui-plugin': `${sourceOrTarget}-cluster-oauth`,
    },
  },
  data: {
    url: btoa(apiUrl),
    token: btoa(token),
  },
  type: 'Opaque',
});

const parseClustersJSON = (clustersJSON: string): ProxyConfigMapCluster[] => {
  try {
    return JSON.parse(clustersJSON);
  } catch {
    return [];
  }
};

/*
const removeSecretFromClustersJSON = (clustersJSON: string, secret: OAuthSecret): string => {
  let clusters = parseClustersJSON(clustersJSON);
  clusters = clusters.filter((secretRef) => !isSameResource(secretRef, secret.metadata));
  return JSON.stringify(clusters);
};
*/

const addSecretToClustersJSON = (clustersJSON: string, secret: OAuthSecret): string => {
  const clusters = parseClustersJSON(clustersJSON);
  if (!clusters.find((secretRef) => isSameResource(secretRef, secret.metadata))) {
    clusters.push({ name: secret.metadata.name, namespace: secret.metadata.namespace });
  }
  return JSON.stringify(clusters);
};

interface UseConfigureProxyMutationArgs {
  onSuccess: (newSecret: OAuthSecret) => void;
}
export const useConfigureProxyMutation = ({ onSuccess }: UseConfigureProxyMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const [configMapModel] = useK8sModel(configMapGVK);
  const namespace = useNamespaceContext();
  return useMutation<OAuthSecret, Error, ConfigureProxyMutationParams>(
    async ({ apiUrl, token }) => {
      // Reuse an existing secret if one exists for this cluster URL
      const nsSecrets = await k8sList<Secret>({
        model: secretModel,
        queryParams: { ns: namespace },
      });
      let secretForUrl = nsSecrets.find(
        (secret) =>
          secret.metadata.annotations?.['konveyor.io/crane-ui-plugin'] === 'source-cluster-oauth' &&
          secret.data.url === btoa(apiUrl),
      ) as OAuthSecret | undefined;

      // If it exists, update it with the new token, else create one
      secretForUrl = secretForUrl
        ? await k8sPatch<OAuthSecret>({
            model: secretModel,
            resource: secretForUrl,
            data: [{ op: 'replace', path: '/data/token', value: btoa(token) }],
          })
        : await k8sCreate<OAuthSecret>({
            model: secretModel,
            data: getNewSecret('source', namespace, apiUrl, token),
          });

      // Patch the proxy ConfigMap with a reference to the new secret if necessary
      const proxyConfigMap = await k8sGet<ProxyConfigMap>({
        model: configMapModel,
        ns: 'openshift-migration',
        name: 'crane-proxy',
      });
      const newClustersJSON = addSecretToClustersJSON(proxyConfigMap.data.clusters, secretForUrl);
      if (newClustersJSON !== proxyConfigMap.data.clusters) {
        await k8sPatch<ProxyConfigMap>({
          model: configMapModel,
          resource: proxyConfigMap,
          data: [{ op: 'replace', path: '/data/clusters', value: newClustersJSON }],
        });
      }

      // TODO do we have a problem here where we need to worry about the proxy not picking up the updated secret?

      return secretForUrl;
    },
    {
      onSuccess,
    },
  );
};
