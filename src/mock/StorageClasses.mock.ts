import { StorageClass } from 'src/types/StorageClass';

export let MOCK_STORAGE_CLASSES: StorageClass[] = [];

if (process.env.NODE_ENV === 'development' || process.env.DATA_SOURCE === 'mock') {
  MOCK_STORAGE_CLASSES = [
    {
      kind: 'StorageClass',
      metadata: {
        name: 'default',
        namespace: 'openshift-migration',
      },
    },
    {
      kind: 'StorageClass',
      metadata: {
        name: 'mock-storage-1',
        namespace: 'openshift-migration',
      },
    },
    {
      kind: 'StorageClass',
      metadata: {
        name: 'mock-storage-2',
        namespace: 'openshift-migration',
      },
    },
    {
      kind: 'StorageClass',
      metadata: {
        name: 'mock-storage-3',
        namespace: 'openshift-migration',
      },
    },
    {
      kind: 'StorageClass',
      metadata: {
        name: 'mock-storage-4',
        namespace: 'openshift-migration',
      },
    },
  ];
}
