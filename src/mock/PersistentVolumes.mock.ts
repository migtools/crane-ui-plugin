import { PersistentVolume } from '../types/PersistentVolume'; // TODO try tsconfig-paths?

export let MOCK_PERSISTENT_VOLUMES: PersistentVolume[] = [];

if (process.env.NODE_ENV === 'development' || process.env.DATA_SOURCE === 'mock') {
  const mockPV = (nameSuffix: string): PersistentVolume => ({
    kind: 'PersistentVolume',
    metadata: {
      name: `pv_${nameSuffix}`,
      namespace: 'openshift-migration',
    },
    spec: {
      // TODO
      accessModes: ['ReadWriteMany'], // TODO
      capacity: {
        storage: '100Gi',
      },
      claimRef: {
        name: `pvc_${nameSuffix}`,
        namespace: 'openshift-migration',
      },
      persistentVolumeReclaimPolicy: 'foo',
      storageClassName: 'mock-storage-class',
      volumeMode: 'Filesystem', // TODO
    },
    status: {
      phase: 'Bound',
    },
  });

  MOCK_PERSISTENT_VOLUMES = [
    mockPV('123456789 1'),
    mockPV('123456789 2'),
    mockPV('123456789 3'),
    mockPV('123456789 4'),
    mockPV('123456789 5'),
  ];
}
