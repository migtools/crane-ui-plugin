import {
  k8sCreate,
  K8sGroupVersionKind,
  k8sPatch,
  useK8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { useMutation } from 'react-query';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { getObjectRef } from 'src/utils/helpers';
import { WizardTektonResources } from '../pipelineHelpers';
import { PipelineKind } from '../types/pipelines-plugin';
import { OAuthSecret } from '../types/Secret';
import { secretGVK } from './secrets';

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
  const [data, loaded, error] = useK8sWatchResource<PipelineKind[]>({
    groupVersionKind: pipelineGVK,
    isList: true,
    namespaced: true,
    namespace,
  });
  return { data, loaded, error };
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
      const pipeline = await k8sCreate({
        model: pipelineModel,
        data: resources.pipeline,
      });
      const pipelineRun = await k8sCreate({
        model: pipelineRunModel,
        data: resources.pipelineRun,
      });
      const pipelineRef = getObjectRef(pipeline);
      await Promise.all(
        secrets.map((secret) => {
          if (!secret) return Promise.resolve();
          return k8sPatch({
            model: secretModel,
            resource: secret,
            data: [
              !secret.metadata.ownerReferences
                ? { op: 'add', path: '/metadata/ownerReferences', value: [pipelineRef] }
                : { op: 'add', path: '/metadata/ownerReferences/-', value: pipelineRef },
            ],
          });
        }),
      );
      return { pipeline, pipelineRun };
    },
    { onSuccess },
  );
};
