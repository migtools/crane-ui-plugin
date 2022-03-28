import {
  K8sGroupVersionKind,
  useK8sModel,
  k8sList,
  k8sCreate,
  k8sDelete,
  consoleFetch,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { useMutation } from 'react-query';
import { SECRET_SERVICE_URL } from 'src/common/constants';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { OAuthSecret, Secret } from '../types/Secret';

export const secretGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'Secret' };

interface UseConfigureSecretMutationArgs {
  existingSecretFromState: OAuthSecret | null;
  onSuccess: (newSecret: OAuthSecret) => void;
}
interface ConfigureSourceSecretMutationParams {
  apiUrl: string;
  token: string;
}

export const useConfigureSourceSecretMutation = ({
  existingSecretFromState,
  onSuccess,
}: UseConfigureSecretMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const namespace = useNamespaceContext();
  return useMutation<OAuthSecret, Error, ConfigureSourceSecretMutationParams>(
    async ({ apiUrl, token }) => {
      // If we already have a secret in state, use that instead of looking for one to replace.
      let existingSecret = existingSecretFromState;
      if (!existingSecret) {
        // See if we have an existing secret for this cluster URL that isn't associated with a pipeline.
        existingSecret =
          (await findExistingSecret(secretModel, namespace, apiUrl, 'source')) || null;
      }

      // If we have an existing secret that matches our credentials, we can just use it as-is.
      if (existingSecret) {
        if (secretMatchesCredentials(existingSecret, apiUrl, token)) {
          return existingSecret;
        }
        // If it doesn't match our credentials we delete it so we can replace it.
        await k8sDelete({ model: secretModel, resource: existingSecret });
      }

      return await k8sCreate<OAuthSecret>({
        model: secretModel,
        data: getNewSecretWithData('source', namespace, apiUrl, token),
      });
    },
    { onSuccess },
  );
};

export const useConfigureDestinationSecretMutation = ({
  existingSecretFromState,
  onSuccess,
}: UseConfigureSecretMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const namespace = useNamespaceContext();
  const apiUrl = 'https://kubernetes.default.svc';
  return useMutation<OAuthSecret, Error>(
    async () => {
      // If we have a secret in state, use that instead of looking for another one to reuse.
      let existingSecret = existingSecretFromState;
      if (!existingSecret) {
        // See if we have an existing secret for this cluster URL that isn't associated with a pipeline.
        existingSecret =
          (await findExistingSecret(secretModel, namespace, apiUrl, 'destination')) || null;
      }
      // Refresh the token on an existing secret or create a new one.
      const newSecretResponse = existingSecret
        ? await consoleFetch(
            `${SECRET_SERVICE_URL}/api/v1/namespaces/${namespace}/secrets/${existingSecret.metadata.name}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/strategic-merge-patch+json' },
              body: JSON.stringify({ ...existingSecret, data: undefined }),
            },
          )
        : await consoleFetch(`${SECRET_SERVICE_URL}/api/v1/namespaces/${namespace}/secrets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getNewPartialSecret('destination', namespace)),
          });
      const newSecret: OAuthSecret = await newSecretResponse.json();
      return newSecret;
    },
    { onSuccess },
  );
};

const findExistingSecret = async (
  secretModel: K8sModel,
  namespace: string,
  apiUrl: string,
  sourceOrDestination: 'source' | 'destination',
) => {
  const nsSecrets = await k8sList<Secret>({
    model: secretModel,
    queryParams: { ns: namespace },
  });
  return nsSecrets.find(
    (secret) =>
      secret.metadata?.annotations?.['konveyor.io/crane-ui-plugin'] ===
        `${sourceOrDestination}-cluster-oauth` &&
      (secret.metadata.ownerReferences || []).length === 0 &&
      secret.data.url === btoa(apiUrl),
  ) as OAuthSecret | undefined;
};

const getNewPartialSecret = (
  sourceOrDestination: 'source' | 'destination',
  namespace: string,
): Omit<OAuthSecret, 'data'> => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    generateName: `${sourceOrDestination}-cluster-`,
    namespace,
    annotations: {
      'konveyor.io/crane-ui-plugin': `${sourceOrDestination}-cluster-oauth`,
    },
  },
  type: 'Opaque',
});

const getNewSecretWithData = (
  sourceOrDestination: 'source' | 'destination',
  namespace: string,
  apiUrl: string,
  token: string,
): OAuthSecret => ({
  ...getNewPartialSecret(sourceOrDestination, namespace),
  data: {
    url: btoa(apiUrl),
    token: btoa(token),
  },
});

export const secretMatchesCredentials = (secret: OAuthSecret, apiUrl: string, token: string) =>
  secret.data.url === btoa(apiUrl) && secret.data.token === btoa(token);
