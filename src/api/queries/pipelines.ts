import {
  k8sCreate,
  k8sDelete,
  K8sGroupVersionKind,
  k8sPatch,
  K8sResourceCommon,
  useK8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { useMutation, UseMutationOptions } from 'react-query';
import { attachOwnerReference, getObjectRef, sortByCreationTimestamp } from 'src/utils/helpers';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { sortByStartedTime, WizardTektonResources } from '../pipelineHelpers';
import { OAuthSecret } from '../types/Secret';
import { secretGVK } from './secrets';
import {
  CraneAnnotations,
  CranePipeline,
  CranePipelineAction,
  CranePipelineGroup,
  CranePipelineRun,
  CRANE_PIPELINE_ACTIONS,
} from '../types/CranePipeline';
import {
  pipelineRunStatus,
  PipelineRunStatusString,
} from 'src/reused/pipelines-plugin/src/utils/pipeline-filter-reducer';

export const pipelineGVK: K8sGroupVersionKind = {
  group: 'tekton.dev',
  version: 'v1beta1',
  kind: 'Pipeline',
};

export const pipelineRunGVK: K8sGroupVersionKind = {
  group: 'tekton.dev',
  version: 'v1beta1',
  kind: 'PipelineRun',
};

export const useWatchPipelines = () => {
  const namespace = useNamespaceContext();
  return useK8sWatchResource<CranePipeline[]>({
    groupVersionKind: pipelineGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
};

export const useWatchPipelineRuns = () => {
  const namespace = useNamespaceContext();
  return useK8sWatchResource<CranePipelineRun[]>({
    groupVersionKind: pipelineRunGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
};

// TODO memoize these?
export const useWatchCranePipelineGroups = () => {
  const [watchedPipelines, pipelinesLoaded, pipelinesError] = useWatchPipelines();
  const [watchedPipelineRuns, pipelineRunsLoaded, pipelineRunsError] = useWatchPipelineRuns();

  // Pipeline tabs show up in creation order, PipelineRun history shows up latest first
  const allPipelines = sortByCreationTimestamp(watchedPipelines, 'asc');
  const allPipelineRuns = sortByStartedTime(watchedPipelineRuns, 'desc');

  const byAction =
    (action: CraneAnnotations['crane-ui-plugin.konveyor.io/action']) =>
    (resourceBeingFiltered: CranePipeline | CranePipelineRun) =>
      resourceBeingFiltered.metadata.annotations?.['crane-ui-plugin.konveyor.io/action'] === action;
  const bySameGroup =
    (resourceBeingCompared: CranePipeline | CranePipelineRun) =>
    (resourceBeingFiltered: CranePipeline | CranePipelineRun) =>
      resourceBeingFiltered.metadata.annotations?.['crane-ui-plugin.konveyor.io/group'] ===
      resourceBeingCompared.metadata.annotations?.['crane-ui-plugin.konveyor.io/group'];

  const allStagePipelines = allPipelines.filter(byAction('stage'));
  const allStagePipelineRuns = allPipelineRuns.filter(byAction('stage'));
  const allCutoverPipelines = allPipelines.filter(byAction('cutover'));
  const allCutoverPipelineRuns = allPipelineRuns.filter(byAction('cutover'));

  const pipelineGroups: CranePipelineGroup[] = allCutoverPipelines.map((cutoverPipeline) => {
    const stagePipeline = allStagePipelines.find(bySameGroup(cutoverPipeline)) || null;
    const allPipelineRunsInGroup = allPipelineRuns.filter(bySameGroup(cutoverPipeline));
    const nonPendingPipelineRunsInGroup = allPipelineRunsInGroup.filter(
      (pipelineRun) => pipelineRun.spec.status !== 'PipelineRunPending',
    );
    const latestNonPendingPipelineRun: CranePipelineRun | null =
      nonPendingPipelineRunsInGroup[0] || null;
    return {
      name: cutoverPipeline.metadata?.annotations?.['crane-ui-plugin.konveyor.io/group'] || '',
      pipelines: {
        stage: stagePipeline,
        cutover: cutoverPipeline,
      },
      pipelineRuns: {
        stage: allStagePipelineRuns.filter(bySameGroup(cutoverPipeline)),
        cutover: allCutoverPipelineRuns.filter(bySameGroup(cutoverPipeline)),
        all: allPipelineRunsInGroup,
        nonPending: nonPendingPipelineRunsInGroup,
        latestNonPending: latestNonPendingPipelineRun,
      },
      isStatefulMigration: !!stagePipeline,
    };
  });

  return {
    pipelineGroups,
    loaded: pipelinesLoaded && pipelineRunsLoaded,
    error: pipelinesError || pipelineRunsError,
  };
};

interface CreateTektonResourcesParams {
  resources: WizardTektonResources;
  secrets: (OAuthSecret | null)[];
}
export const useCreateTektonResourcesMutation = (
  onSuccess: (resources: WizardTektonResources) => void,
) => {
  const [pipelineModel] = useK8sModel(pipelineGVK);
  const [pipelineRunModel] = useK8sModel(pipelineRunGVK);
  const [secretModel] = useK8sModel(secretGVK);
  return useMutation<WizardTektonResources, Error, CreateTektonResourcesParams>(
    async ({ resources, secrets }) => {
      const cutoverPipeline = await k8sCreate({
        model: pipelineModel,
        data: resources.cutoverPipeline,
      });
      const cutoverPipelineRef = getObjectRef(cutoverPipeline);

      const createOwnedResource = <T extends K8sResourceCommon>(model: K8sModel, data: T) =>
        k8sCreate({ model, data: attachOwnerReference(data, cutoverPipelineRef) });

      const [cutoverPipelineRun, stagePipeline, stagePipelineRun] = await Promise.all([
        createOwnedResource(pipelineRunModel, resources.cutoverPipelineRun),
        resources.stagePipeline
          ? createOwnedResource(pipelineModel, resources.stagePipeline)
          : Promise.resolve(null),
        resources.stagePipelineRun
          ? createOwnedResource(pipelineRunModel, resources.stagePipelineRun)
          : Promise.resolve(null),
      ]);

      await Promise.all(
        secrets.map((secret) => {
          if (!secret) return Promise.resolve();
          return k8sPatch({
            model: secretModel,
            resource: secret,
            data: [
              !secret.metadata.ownerReferences
                ? { op: 'add', path: '/metadata/ownerReferences', value: [cutoverPipelineRef] }
                : { op: 'add', path: '/metadata/ownerReferences/-', value: cutoverPipelineRef },
            ],
          });
        }),
      );
      return { stagePipeline, stagePipelineRun, cutoverPipeline, cutoverPipelineRun };
    },
    { onSuccess },
  );
};

export const useStartPipelineRunMutation = (
  pipelineGroup: CranePipelineGroup,
  action: CranePipelineAction,
  options?: Partial<UseMutationOptions>,
) => {
  const [pipelineRunModel] = useK8sModel(pipelineRunGVK);
  return useMutation(
    [pipelineGroup.name, action],
    () => {
      const pipeline = pipelineGroup.pipelines[action];
      const latestPipelineRun = pipelineGroup.pipelineRuns[action][0];
      if (!pipeline || !latestPipelineRun)
        return Promise.reject('Pipeline or PipelineRun not found');
      if (latestPipelineRun.spec.status === 'PipelineRunPending') {
        return k8sPatch({
          model: pipelineRunModel,
          resource: latestPipelineRun,
          data: [{ op: 'remove', path: '/spec/status' }],
        });
      }
      const newPipelineRun: CranePipelineRun = {
        apiVersion: 'tekton.dev/v1beta1',
        kind: 'PipelineRun',
        spec: { ...latestPipelineRun.spec },
        metadata: {
          generateName: `${pipeline.metadata?.name}-`,
          namespace: pipeline.metadata.namespace,
          ownerReferences: latestPipelineRun.metadata?.ownerReferences,
          annotations: pipeline.metadata.annotations,
        },
      };
      delete newPipelineRun.spec.status;
      return k8sCreate({
        model: pipelineRunModel,
        data: newPipelineRun,
      });
    },
    options || {},
  );
};

const useDeleteMutation = <T extends K8sResourceCommon>(
  gvk: K8sGroupVersionKind,
  options?: Partial<UseMutationOptions<unknown, Error, T>>,
) => {
  const [model] = useK8sModel(gvk);
  return useMutation<unknown, Error, T>(
    ['delete', gvk],
    (resource) => k8sDelete({ model, resource }),
    options || {},
  );
};

export const useDeletePipelineMutation = (
  options?: Partial<UseMutationOptions<unknown, Error, CranePipeline>>,
) => useDeleteMutation<CranePipeline>(pipelineGVK, options);

// Until the new PipelineRun appears in the watched pipelineGroup, we still consider it loading/starting
export const isPipelineRunStarting = (
  pipelineGroup: CranePipelineGroup,
  mutation: ReturnType<typeof useStartPipelineRunMutation>,
) =>
  mutation.isLoading ||
  (mutation.isSuccess &&
    !isMissingPipelineRuns(pipelineGroup) &&
    !pipelineGroup.pipelineRuns.nonPending.find(
      (plr) => plr.metadata?.name === mutation.data?.metadata.name,
    ));

export const isMissingPipelineRuns = (pipelineGroup?: CranePipelineGroup) => {
  if (!pipelineGroup) return false;
  return CRANE_PIPELINE_ACTIONS.some(
    (action) =>
      !!pipelineGroup.pipelines[action] && pipelineGroup.pipelineRuns[action].length === 0,
  );
};

export const hasRunWithStatus = (
  pipelineGroup: CranePipelineGroup,
  action: CranePipelineAction,
  status: PipelineRunStatusString,
) => !!pipelineGroup.pipelineRuns[action].find((plr) => pipelineRunStatus(plr) === status);

export const isSomePipelineRunning = (pipelineGroup: CranePipelineGroup) =>
  CRANE_PIPELINE_ACTIONS.some((a) => hasRunWithStatus(pipelineGroup, a, 'Running'));
