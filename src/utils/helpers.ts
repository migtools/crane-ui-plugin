import { ObjectReference } from '@openshift-console/dynamic-plugin-sdk';
import { PersistentVolumeClaim } from 'src/types/PersistentVolume';

export const isSameResource = (
  refA: ObjectReference | null | undefined,
  refB: ObjectReference | null | undefined,
): boolean =>
  !!refA &&
  !!refB &&
  ((refA.uid && refB.uid && refA.uid === refB.uid) ||
    (refA.name &&
      refB.name &&
      refA.namespace &&
      refB.namespace &&
      refA.name === refB.name &&
      refA.namespace === refB.namespace));

export const getCapacity = (pvc: PersistentVolumeClaim) =>
  pvc.status?.capacity?.storage || pvc.spec.resources.requests.storage;
