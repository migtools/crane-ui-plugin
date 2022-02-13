import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/configuration/configmap/

export interface ConfigMap extends K8sResourceCommon {
  apiVersion: 'v1';
  kind: 'ConfigMap';
  data: Record<string, string>;
}

export interface ProxyConfigMap extends ConfigMap {
  data: {
    clusters: string; // JSON like { namespace: string; name: string; }[]
  };
}

export interface ProxyConfigMapCluster {
  namespace: string;
  name: string;
}
