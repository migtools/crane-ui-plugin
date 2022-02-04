import { PersistentVolume, PersistentVolumeClaim } from 'src/types/PersistentVolume';

export let MOCK_PERSISTENT_VOLUMES: PersistentVolume[] = [];
export let MOCK_PERSISTENT_VOLUME_CLAIMS: PersistentVolumeClaim[] = [];

if (process.env.NODE_ENV === 'development' || process.env.DATA_SOURCE === 'mock') {
  const mockPV = (nameSuffix: string): PersistentVolume => ({
    kind: 'PersistentVolume',
    metadata: {
      name: `pv-${nameSuffix}`,
      namespace: 'openshift-migration',
    },
    spec: {
      capacity: {
        storage: '100Gi',
      },
      volumeMode: 'Filesystem',
      accessModes: ['ReadWriteMany'],
      persistentVolumeReclaimPolicy: 'Retain',
      storageClassName: 'mock-storage-1',
      claimRef: {
        name: `pvc-${nameSuffix}`,
        namespace: 'openshift-migration',
      },
    },
    status: {
      phase: 'Bound',
    },
  });

  const mockPVC = (nameSuffix: string): PersistentVolumeClaim => ({
    kind: 'PersistentVolumeClaim',
    metadata: {
      name: `pvc-${nameSuffix}`,
      namespace: 'openshift-migration',
    },
    spec: {
      volumeMode: 'Filesystem',
      accessModes: ['ReadWriteMany'],
      resources: {
        requests: {
          storage: '100Gi',
        },
      },
      storageClassName: 'mock-storage-1',
    },
    status: {
      accessModes: ['ReadWriteMany'],
      capacity: {
        storage: '100Gi',
      },
      phase: 'Bound',
    },
  });

  const nameSuffixes = ['123456789-1', '123456789-2', '123456789-3', '123456789-4', '123456789-5'];
  MOCK_PERSISTENT_VOLUMES = nameSuffixes.map(mockPV);
  MOCK_PERSISTENT_VOLUME_CLAIMS = nameSuffixes.map(mockPVC);
}
