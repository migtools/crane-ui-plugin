import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/configuration/configmap/

export interface ConfigMap extends K8sResourceCommon {
  apiVersion: 'v1';
  kind: 'ConfigMap';
  data: Record<string, string>;
}
