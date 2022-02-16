// NOTE: This code was copied from the OpenShift console source. See ./README.md for details.
/* eslint-disable @typescript-eslint/ban-types */

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { TektonResource, TektonResultsRun, TektonTaskSpec } from './coreTekton';
import { PipelineTaskParam, PipelineTaskRef } from './pipeline';

import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';

import {
  Condition,
  PLRTaskRunStep,
  VolumeTypeConfigMaps,
  VolumeTypePVC,
  VolumeTypeSecret,
} from './pipelineRun';

export type TaskRunWorkspace = {
  name: string;
  volumeClaimTemplate?: PersistentVolumeClaim;
  persistentVolumeClaim?: VolumeTypePVC;
  configMap?: VolumeTypeConfigMaps;
  emptyDir?: {};
  secret?: VolumeTypeSecret;
  subPath?: string;
};

export type TaskRunStatus = {
  completionTime?: string;
  conditions?: Condition[];
  podName?: string;
  startTime?: string;
  steps?: PLRTaskRunStep[];
  taskResults?: TektonResultsRun[];
};

export type TaskRunKind = K8sResourceCommon & {
  spec: {
    taskRef?: PipelineTaskRef;
    taskSpec?: TektonTaskSpec;
    serviceAccountName?: string;
    params?: PipelineTaskParam[];
    resources?: TektonResource[];
    timeout?: string;
    workspaces?: TaskRunWorkspace[];
  };
  status?: TaskRunStatus;
};
