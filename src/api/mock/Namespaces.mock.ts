import { Namespace } from '../types/Namespace';

export let MOCK_NAMESPACES: Namespace[] = [];

if (process.env.NODE_ENV === 'development' || process.env.DATA_SOURCE === 'mock') {
  MOCK_NAMESPACES = [
    {
      kind: 'Namespace',
      metadata: {
        name: 'default',
      },
    },
    {
      kind: 'Namespace',
      metadata: {
        name: 'mock-ns-2',
      },
    },
    {
      kind: 'Namespace',
      metadata: {
        name: 'mock-ns-3',
      },
    },
    {
      kind: 'Namespace',
      metadata: {
        name: 'mock-ns-4',
      },
    },
    {
      kind: 'Namespace',
      metadata: {
        name: 'mock-ns-5',
      },
    },
  ];
}
