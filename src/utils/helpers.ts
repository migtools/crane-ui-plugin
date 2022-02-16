import { K8sResourceCommon, ObjectReference } from '@openshift-console/dynamic-plugin-sdk';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';

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

export const getObjectRef = (resource: K8sResourceCommon): ObjectReference => ({
  apiVersion: resource.apiVersion,
  kind: resource.kind,
  name: resource.metadata.name,
  namespace: resource.metadata.namespace,
  uid: resource.metadata.uid,
});
