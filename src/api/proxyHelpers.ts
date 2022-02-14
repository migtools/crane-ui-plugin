import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClientFactory,
  CoreClusterResource,
  CoreClusterResourceKind,
  IFormField,
  KubeResource,
} from '@konveyor/lib-ui';
import { OAuthSecret } from './types/Secret';
import { useSourceNamespacesQuery } from './queries/sourceResources';
import { secretMatchesCredentials } from './queries/secrets';

export interface IProxyK8sResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  config: Record<string, unknown>;
  headers: Record<string, unknown>;
  request: XMLHttpRequest;
  state?: string;
  reason?: string;
}

export interface IProxyK8sList<T> extends K8sResourceCommon {
  items: T[];
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}

export interface IProxyK8sStatus extends K8sResourceCommon {
  status: string;
  details: {
    group: string;
    kind: string;
    name: string;
    uid: string;
  };
}

export interface OAuthUser {
  access_token: string;
  expiry_time?: number;
}

export const useProxyK8sClient = (clusterSecret?: OAuthSecret) => {
  if (!clusterSecret) return null;
  const proxyRootUrl = `/api/proxy/plugin/crane-ui-plugin/remote-cluster`;
  const clusterApiUrl = `${proxyRootUrl}/${clusterSecret.metadata.namespace}/${clusterSecret.metadata.name}`;
  const client = ClientFactory.cluster(
    { access_token: atob(clusterSecret.data.token), expiry_time: 0 },
    clusterApiUrl,
  );
  // TODO we could just return `client` if we added generics support to kube-client in lib-ui
  return {
    get: <T = K8sResourceCommon>(resource: KubeResource, name: string, params?: object) =>
      client.get(resource, name, params) as Promise<IProxyK8sResponse<T>>,
    list: <T = K8sResourceCommon>(resource: KubeResource, params?: object) =>
      client.list(resource, params) as Promise<IProxyK8sResponse<IProxyK8sList<T>>>,
    create: <T = K8sResourceCommon>(resource: KubeResource, newObject: object, params?: object) =>
      client.create(resource, newObject, params) as Promise<IProxyK8sResponse<T>>,
    delete: <T = IProxyK8sStatus>(resource: KubeResource, name: string, params?: object) =>
      client.delete(resource, name, params) as Promise<IProxyK8sResponse<T>>,
    patch: <T = K8sResourceCommon>(
      resource: KubeResource,
      name: string,
      patch: object,
      params?: object,
    ) => client.patch(resource, name, patch, params) as Promise<IProxyK8sResponse<T>>,
    put: <T = K8sResourceCommon>(
      resource: KubeResource,
      name: string,
      object: object,
      params?: object,
    ) => client.put(resource, name, object, params) as Promise<IProxyK8sResponse<T>>,
  };
};

export const areSourceCredentialsValid = (
  apiUrlField: IFormField<string>,
  tokenField: IFormField<string>,
  sourceApiSecretField: IFormField<OAuthSecret>,
  sourceNamespacesQuery: ReturnType<typeof useSourceNamespacesQuery>,
) =>
  !apiUrlField.isDirty &&
  !tokenField.isDirty &&
  sourceApiSecretField.value &&
  secretMatchesCredentials(sourceApiSecretField.value, apiUrlField.value, tokenField.value) &&
  sourceNamespacesQuery.isSuccess &&
  (sourceNamespacesQuery.data?.data.items || []).length > 0;

export const namespaceResource = new CoreClusterResource(CoreClusterResourceKind.Namespace); // TODO this should take arbitrary strings for kind
