import { K8sResourceCommon, ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/storage/storage-classes/

export interface StorageClass extends K8sResourceCommon {
  kind: 'StorageClass';
  metadata: ObjectMetadata & {
    annotations?: {
      'storageclass.kubernetes.io/is-default-class'?: 'true' | 'false';
    };
  };
  provisioner?: string;
  parameters?: {
    type: string;
  };
  reclaimPolicy?: 'Retain' | 'Delete';
}
