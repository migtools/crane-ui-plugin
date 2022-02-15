import { K8sResourceCommon, ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

export interface Namespace extends K8sResourceCommon {
  kind: 'Namespace';
  metadata: ObjectMetadata & {
    name: string; // Always defined
  };
}
