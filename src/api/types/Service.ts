import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/services-networking/service/

export interface Service extends K8sResourceCommon {
  apiVersion: 'v1';
  kind: 'Service';
  spec: {
    selector: {
      app: string;
    };
    ports: {
      protocol: 'TCP' | 'UDP' | 'SCTP' | 'HTTP' | 'PROXY';
      port: number;
      targetPort: number;
    }[];
  };
}
