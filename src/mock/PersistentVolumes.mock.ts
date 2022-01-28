import { PersistentVolume } from '../types/PersistentVolume'; // TODO try tsconfig-paths?

export const MOCK_PERSISTENT_VOLUMES: PersistentVolume[] = [
  {
    kind: 'PersistentVolume',
    metadata: {
      name: 'pv_123456789 1',
      // TODO
    },
    spec: {
      // TODO
    },
    status: {
      phase: 'Bound',
    },
  },
];
