import {
  K8sResourceCommon,
  ObjectMetadata,
  ObjectReference,
} from '@openshift-console/dynamic-plugin-sdk';

// TODO some of these fields may be optional, too narrow, too wide, or missing. Find the CRD

export interface PersistentVolume extends K8sResourceCommon {
  kind: 'PersistentVolume';
  metadata: ObjectMetadata & {
    labels: {
      // TODO are these actually optional?
      CapacityGb?: string;
      Datacenter?: string;
      Iops?: string;
      StorageType?: string;
      Username?: string;
      billingType?: string;
      'failure-domain.beta.kubernetes.io/region'?: string;
      'failure-domain.beta.kubernetes.io/zone'?: string;
      path?: string;
      server?: string;
      volumeId?: string;
      [key: string]: string;
    };
  };
  spec: {
    accessModes: ('ReadWriteMany' | string)[]; // TODO can we narrow this?
    capacity: {
      storage: string; // e.g. '100Gi'
    };
    claimRef: ObjectReference;
    nfs: {
      path: string;
      server: string;
    };
    nodeAffinity: {
      required: {
        nodeSelectorTerms: {
          matchExpressions: {
            key: string;
            operator: string;
            values: string[];
          }[];
        }[];
      };
    };
    persistentVolumeReclaimPolicy: string;
    storageClassName: string;
    volumeMode: 'Filesystem' | string; // TODO can we narrow this?
  };
  status: {
    phase: 'Bound' | string; // TODO can we narrow this?
  };
}
