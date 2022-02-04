import { K8sResourceCommon, ObjectReference } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistent-volumes

export type VolumeMode = 'Filesystem' | 'Block';
export type AccessMode = 'ReadWriteOnce' | 'ReadOnlyMany' | 'ReadWriteMany';
export type ReclaimPolicy = 'Retain' | 'Recycle' | 'Delete';
export type PVPhase = 'Available' | 'Bound' | 'Released' | 'Failed';

export interface PersistentVolume extends K8sResourceCommon {
  kind: 'PersistentVolume';
  spec: {
    capacity: {
      storage: string; // e.g. '100Gi' - Binary SI (Ki, Mi, Gi, Pi, Ti) or Decimal SI (k, M, G, P, T) format
    };
    volumeMode: VolumeMode;
    accessModes: AccessMode[];
    persistentVolumeReclaimPolicy: ReclaimPolicy;
    storageClassName: string;
    mountOptions?: string[];
    nfs?: {
      path: string;
      server: string;
    };
    claimRef?: ObjectReference; // TODO is this always present?
  };
  status?: {
    phase: PVPhase;
  };
}

// https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims

export interface PersistentVolumeClaim extends K8sResourceCommon {
  kind: 'PersistentVolumeClaim';
  spec: {
    volumeMode: VolumeMode;
    accessModes: AccessMode[];
    resources: {
      requests: {
        storage: string; // e.g. '100Gi' - Binary SI (Ki, Mi, Gi, Pi, Ti) or Decimal SI (k, M, G, P, T) format
      };
    };
    storageClassName: string;
    selector?: {
      matchLabels: {
        release: string;
      };
      matchExpressions: {
        key: string;
        operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
        values: string[];
      }[];
    };
  };
  status?: {
    accessModes: AccessMode[];
    capacity: {
      storage: string; // e.g. '100Gi' - Binary SI (Ki, Mi, Gi, Pi, Ti) or Decimal SI (k, M, G, P, T) format
    };
    phase: PVPhase;
  };
}
