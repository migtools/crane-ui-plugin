import {
  K8sResourceCommon,
  ObjectReference,
  OwnerReference,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';

export const isSameResource = (
  refA: ObjectReference | null | undefined,
  refB: ObjectReference | null | undefined,
): boolean =>
  !!refA &&
  !!refB &&
  !!(
    (refA.uid && refB.uid && refA.uid === refB.uid) ||
    (refA.name &&
      refB.name &&
      refA.namespace &&
      refB.namespace &&
      refA.name === refB.name &&
      refA.namespace === refB.namespace)
  );

export const getCapacity = (pvc: PersistentVolumeClaim) =>
  pvc.status?.capacity?.storage || pvc.spec.resources.requests.storage;

export const getObjectRef = (resource: K8sResourceCommon): ObjectReference => ({
  apiVersion: resource.apiVersion,
  kind: resource.kind,
  name: resource.metadata?.name,
  namespace: resource.metadata?.namespace,
  uid: resource.metadata?.uid,
});

export const attachOwnerReference = <T extends K8sResourceCommon>(
  resource: T,
  ownerRef: ObjectReference,
) => ({
  ...resource,
  metadata: {
    ...resource.metadata,
    ownerReferences: [...(resource.metadata?.ownerReferences || []), ownerRef as OwnerReference],
  },
});

export const sortByCreationTimestamp = <T extends K8sResourceCommon>(
  resources: T[],
  direction: 'asc' | 'desc',
) =>
  [...resources].sort((a, b) => {
    const [aTimestamp, bTimestamp] = [a, b].map((plr) => plr.metadata?.creationTimestamp || 0);
    if (aTimestamp < bTimestamp) return direction === 'asc' ? -1 : 1;
    if (aTimestamp > bTimestamp) return direction === 'asc' ? 1 : -1;
    return 0;
  });

export const watchErrorToString = (error: WatchK8sResult<K8sResourceCommon>[2]) => {
  if (!error) return;
  if (error.name && error.message) return `${error.name}: ${error.message}`;
  if (error.message) return error.message;
  if (error.toString) return error.toString();
  return 'Unknown error';
};
