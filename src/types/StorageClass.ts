import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/storage/storage-classes/

export interface StorageClass extends K8sResourceCommon {
  kind: 'StorageClass';
  provisioner?: string;
  parameters?: {
    type: string;
  };
  reclaimPolicy?: 'Retain' | 'Delete' | string; // TODO can we narrow this?
}
