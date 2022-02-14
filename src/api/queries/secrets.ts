import {
  K8sGroupVersionKind,
  useK8sModel,
  k8sList,
  k8sCreate,
  k8sGet,
  k8sPatch,
  k8sDelete,
} from '@openshift-console/dynamic-plugin-sdk';
import { useMutation } from 'react-query';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { isSameResource } from 'src/utils/helpers';
import { ProxyConfigMap, ProxyConfigMapCluster } from '../types/ConfigMap';
import { OAuthSecret, Secret } from '../types/Secret';

const secretGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'Secret' };
const configMapGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'ConfigMap' };

interface UseConfigureProxyMutationArgs {
  existingSecretFromState: OAuthSecret | null;
  onSuccess: (newSecret: OAuthSecret) => void;
}
interface ConfigureProxyMutationParams {
  apiUrl: string;
  token: string;
}

export const useConfigureProxyMutation = ({
  existingSecretFromState,
  onSuccess,
}: UseConfigureProxyMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const [configMapModel] = useK8sModel(configMapGVK);
  const namespace = useNamespaceContext();
  return useMutation<OAuthSecret, Error, ConfigureProxyMutationParams>(
    async ({ apiUrl, token }) => {
      // If we already have a secret in state, use that instead of looking for one to replace.
      let existingSecret = existingSecretFromState;
      if (!existingSecret) {
        console.log('Finding existing secret from list!');
        // See if we have an existing secret for this cluster URL that isn't associated with a pipeline.
        const nsSecrets = await k8sList<Secret>({
          model: secretModel,
          queryParams: { ns: namespace },
        });
        existingSecret = nsSecrets.find(
          (secret) =>
            secret.metadata.annotations?.['konveyor.io/crane-ui-plugin'] ===
              'source-cluster-oauth' &&
            (secret.metadata.ownerReferences || []).length === 0 &&
            secret.data.url === btoa(apiUrl),
        ) as OAuthSecret | undefined;
      } else {
        console.log('Reusing secret from state!');
      }

      let secretToUse: OAuthSecret | null = null;
      let deletedSecret: OAuthSecret | null = null;

      // If we have an existing secret that doesn't match our credentials, delete it so we can replace it.
      if (existingSecret) {
        console.log('We have an existing secret!');
        if (existingSecret.data.url !== btoa(apiUrl) || existingSecret.data.token !== btoa(token)) {
          console.log('Deleting it!', existingSecret.metadata.name);
          await k8sDelete({ model: secretModel, resource: existingSecret });
          deletedSecret = existingSecret;
        } else {
          // If it already matches, we can just use it as-is.
          console.log('It matches, reusing it!');
          secretToUse = existingSecret;
        }
      }

      if (!secretToUse) {
        console.log('Creating a brand new secret!');
        secretToUse = await k8sCreate<OAuthSecret>({
          model: secretModel,
          data: getNewSecret('source', namespace, apiUrl, token),
        });
      }

      // Patch the proxy ConfigMap to add the new secret and remove the deleted secret if applicable
      const proxyConfigMap = await k8sGet<ProxyConfigMap>({
        model: configMapModel,
        ns: 'openshift-migration',
        name: 'crane-proxy',
      });
      let newClustersJSON = addSecretToClustersJSON(proxyConfigMap.data.clusters, secretToUse);
      if (deletedSecret) {
        newClustersJSON = removeSecretFromClustersJSON(newClustersJSON, deletedSecret);
      }
      await k8sPatch<ProxyConfigMap>({
        model: configMapModel,
        resource: proxyConfigMap,
        data: [{ op: 'replace', path: '/data/clusters', value: newClustersJSON }],
      });

      return secretToUse;
    },
    {
      onSuccess,
    },
  );
};

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

const removeSecretFromClustersJSON = (clustersJSON: string, secret: OAuthSecret): string => {
  let clusters = parseClustersJSON(clustersJSON);
  clusters = clusters.filter((secretRef) => !isSameResource(secretRef, secret.metadata));
  return JSON.stringify(clusters);
};

const addSecretToClustersJSON = (clustersJSON: string, secret: OAuthSecret): string => {
  const clusters = parseClustersJSON(clustersJSON);
  if (!clusters.find((secretRef) => isSameResource(secretRef, secret.metadata))) {
    clusters.push({ name: secret.metadata.name, namespace: secret.metadata.namespace });
  }
  return JSON.stringify(clusters);
};
