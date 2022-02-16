// NOTE: This code was copied from the OpenShift console source. See ./README.md for details.

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type PipelineResourceKind = K8sResourceCommon & {
  spec: {
    params: { name: string; value: string }[];
    type: string;
  };
};
