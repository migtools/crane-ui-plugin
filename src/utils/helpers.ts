import { ObjectReference } from '@openshift-console/dynamic-plugin-sdk';

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
