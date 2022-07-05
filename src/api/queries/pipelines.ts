import {
  k8sCreate,
  K8sGroupVersionKind,
  k8sPatch,
  K8sResourceCommon,
  useK8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { useMutation } from 'react-query';
import { attachOwnerReference, getObjectRef } from 'src/utils/helpers';
import { WizardTektonResources } from '../pipelineHelpers';
import { OAuthSecret } from '../types/Secret';
import { secretGVK } from './secrets';
import { CranePipeline, CranePipelineRun } from '../types/Pipeline';

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
  const [namespace] = useActiveNamespace();
  const [data, loaded, error] = useK8sWatchResource<CranePipeline[]>({
    groupVersionKind: pipelineGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return {
    data: data.filter(
      (pipeline) => !!pipeline.metadata.annotations['crane-ui-plugin.konveyor.io/action'],
    ),
    loaded,
    error,
  };
};

export const useWatchPipelineRuns = () => {
  const [namespace] = useActiveNamespace();
  const [data, loaded, error] = useK8sWatchResource<CranePipelineRun[]>({
    groupVersionKind: pipelineRunGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return {
    data: data.filter(
      (pipelineRun) => !!pipelineRun.metadata.annotations['crane-ui-plugin.konveyor.io/action'],
    ),
    loaded,
    error,
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

interface StartPipelineRunParams {
  pipeline: CranePipeline;
  latestPipelineRun: CranePipelineRun;
}
export const useStartPipelineRunMutation = (onSuccess: () => void) => {
  const [pipelineRunModel] = useK8sModel(pipelineRunGVK);

  return useMutation<unknown, Error, StartPipelineRunParams>(
    async ({ pipeline, latestPipelineRun }) => {
      if (latestPipelineRun.spec.status === 'PipelineRunPending') {
        return k8sPatch({
          model: pipelineRunModel,
          resource: latestPipelineRun,
          data: [{ op: 'remove', path: '/spec/status' }],
        });
      }
      const newPipelineRun: CranePipelineRun = {
        spec: { ...latestPipelineRun.spec },
        metadata: {
          generateName: pipeline.metadata?.name || '',
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
    { onSuccess },
  );
};
