import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/workloads/pods/

export interface Pod extends K8sResourceCommon {
  apiVersion: 'v1';
  kind: 'Pod';
  spec: {
    containers: {
      name: string;
      image: string;
      ports: {
        containerPort: number;
      }[];
    }[];
  };
}
