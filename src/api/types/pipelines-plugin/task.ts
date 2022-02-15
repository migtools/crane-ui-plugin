// NOTE: This code was copied from the OpenShift console source. See ./README.md for details.

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { TektonTaskSpec } from './coreTekton';

export type TaskKind = K8sResourceCommon & {
  spec: TektonTaskSpec;
};
