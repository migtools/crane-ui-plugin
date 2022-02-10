import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClientFactory,
  CoreClusterResource,
  CoreClusterResourceKind,
  KubeResource,
} from '@konveyor/lib-ui';

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
  expiry_time?: number; // TODO is expiry_time optional?
}

export const useProxyK8sClient = (
  clusterSecretRef: { name: string; namespace: string },
  user: OAuthUser,
) => {
  const proxyRootUrl = `/api/proxy/plugin/crane-ui-plugin/remote-cluster`;
  const clusterApiUrl = `${proxyRootUrl}/${clusterSecretRef.namespace}/${clusterSecretRef.name}`;
  const { access_token, expiry_time = 0 } = user;
  const client = ClientFactory.cluster({ access_token, expiry_time }, clusterApiUrl);
  // TODO we could just return `client` if we added generics support to kube-client in lib-ui
  return {
    get: <T = K8sResourceCommon>(resource: KubeResource, name: string, params?: object) =>
      client.get(resource, name, params) as Promise<IProxyK8sResponse<T>>,
    list: <T = K8sResourceCommon>(resource: KubeResource, params?: object) =>
      client.list(resource, params) as Promise<IProxyK8sResponse<T>>,
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

export const namespaceResource = new CoreClusterResource(CoreClusterResourceKind.Namespace); // TODO this should take arbitrary strings for kind
