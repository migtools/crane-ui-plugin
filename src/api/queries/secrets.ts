import {
  K8sGroupVersionKind,
  useK8sModel,
  k8sList,
  k8sCreate,
  k8sPatch,
  k8sDelete,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { useMutation } from 'react-query';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { OAuthSecret, Secret } from '../types/Secret';

export const secretGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'Secret' };

interface UseConfigureSecretMutationArgs {
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
}: UseConfigureSecretMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const namespace = useNamespaceContext();
  return useMutation<OAuthSecret, Error, ConfigureProxyMutationParams>(
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
        data: getNewSecret('source', namespace, apiUrl, token),
      });
    },
    { onSuccess },
  );
};

// TODO use a backend service to generate this using the session token instead of k8sPatch/k8sCreate
export const useConfigureDestinationSecretMutation = ({
  existingSecretFromState,
  onSuccess,
}: UseConfigureSecretMutationArgs) => {
  const [secretModel] = useK8sModel(secretGVK);
  const namespace = useNamespaceContext();
  const apiUrl = 'https://kubernetes.default.svc';
  return useMutation<OAuthSecret, Error>(
    async () => {
      const token = ''; // TODO remove me
      // If we have a secret in state, use that instead of looking for one to update.
      let existingSecret = existingSecretFromState;
      if (!existingSecret) {
        // See if we have an existing secret for this cluster URL that isn't associated with a pipeline.
        existingSecret =
          (await findExistingSecret(secretModel, namespace, apiUrl, 'destination')) || null;
      }
      const updatedSecret = existingSecret
        ? await k8sPatch({
            model: secretModel,
            resource: existingSecret,
            data: [{ op: 'replace', path: '/data/token', value: btoa(token) }],
          })
        : await k8sCreate({
            model: secretModel,
            data: getNewSecret('destination', namespace, apiUrl, token),
          });
      return updatedSecret;
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

const getNewSecret = (
  sourceOrDestination: 'source' | 'destination',
  namespace: string,
  apiUrl: string,
  token: string,
): OAuthSecret => ({
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    generateName: `${sourceOrDestination}-cluster-`,
    namespace,
    annotations: {
      'konveyor.io/crane-ui-plugin': `${sourceOrDestination}-cluster-oauth`,
    },
  },
  data: {
    url: btoa(apiUrl),
    token: btoa(token),
  },
  type: 'Opaque',
});

export const secretMatchesCredentials = (secret: OAuthSecret, apiUrl: string, token: string) =>
  secret.data.url === btoa(apiUrl) && secret.data.token === btoa(token);
