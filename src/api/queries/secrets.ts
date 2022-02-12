import { K8sGroupVersionKind, useK8sModel, k8sList } from '@openshift-console/dynamic-plugin-sdk';
import { useMutation } from 'react-query';
import { OAuthSecret, Secret } from '../types/Secret';

const secretGVK: K8sGroupVersionKind = { group: '', version: 'v1', kind: 'Secret' };

interface ConfigureProxyMutationParams {
  apiUrl: string;
  token: string;
}

// TODO do we have a derived secret name that depends on the API URL hash, so they are reusable? or do we use generateName and keep it in state?
// We could:
// - use md5 or similar to derive a name for the secret from the URL, so they are 1-to-1
// - list all secrets in the namespace and see if one matches the entire URL already, if not create one with generateName
// - just create a fresh one with generateName every session and let there be garbage

export const useConfigureProxyMutation = () => {
  const [secretModel] = useK8sModel(secretGVK);
  return useMutation<OAuthSecret, Error, ConfigureProxyMutationParams>(
    async ({ apiUrl, token }) => {
      console.log('configuring proxy for ', { apiUrl, token });
      const sourceSecrets = await k8sList<Secret>({ model: secretModel, queryParams: {} });
      console.log({ sourceSecrets });

      // TODO useNamespaceContext

      // TODO check if the secret exists

      // TODO if it does, update it with the new data
      // TODO if it doesn't, create it
      // TODO load the configmap for the proxy, check if it has this secret in it
      // TODO if not, add it and update the configmap
      return sourceSecrets[0] as OAuthSecret; // TODO remove me
    },
  );
};
