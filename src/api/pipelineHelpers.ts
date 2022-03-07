import { ImportWizardFormState } from 'src/components/ImportWizard/ImportWizardFormContext';
import { PipelineKind, PipelineRunKind } from './types/pipelines-plugin';
import { OAuthSecret } from './types/Secret';

export interface WizardTektonResources {
  pipeline: PipelineKind;
  pipelineRun: PipelineRunKind;
}

export const formsToTektonResources = (
  forms: ImportWizardFormState,
  destinationApiSecret: OAuthSecret,
  namespace: string,
): WizardTektonResources => {
  const { sourceNamespace, sourceApiSecret } = forms.sourceClusterProject.values;
  // const { selectedPVCs } = forms.pvcSelect.values;
  // const { editValuesByPVC } = forms.pvcEdit.values;
  const { pipelineName, startImmediately } = forms.pipelineSettings.values;

  // TODO these resources are only for stateless applications, dropped in 1-to-1 from that section of User Stories in https://github.com/konveyor/enhancements/pull/59.
  // TODO we'll need to make this more dynamic to support all user stories in there, either via logic in this helper or by breaking the stories into individual helpers.

  const pipeline: PipelineKind = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'Pipeline',
    metadata: {
      name: pipelineName, // <--
      namespace, // <--
    },
    spec: {
      params: [
        {
          name: 'source-cluster-secret',
          type: 'string',
        },
        {
          name: 'source-namespace',
          type: 'string',
        },
        {
          name: 'destination-cluster-secret',
          type: 'string',
        },
      ],
      workspaces: [
        {
          name: 'shared-data',
        },
        {
          name: 'kubeconfig',
        },
      ],
      tasks: [
        {
          name: 'generate-source-kubeconfig',
          params: [
            {
              name: 'cluster-secret',
              value: '$(params.source-cluster-secret)',
            },
            {
              name: 'context-name',
              value: 'source',
            },
          ],
          taskRef: {
            name: 'crane-kubeconfig-generator',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'kubeconfig',
              workspace: 'kubeconfig',
            },
          ],
        },
        {
          name: 'generate-destination-kubeconfig',
          runAfter: ['generate-source-kubeconfig'],
          params: [
            {
              name: 'cluster-secret',
              value: '$(params.destination-cluster-secret)',
            },
            {
              name: 'context-name',
              value: 'destination',
            },
          ],
          taskRef: {
            name: 'crane-kubeconfig-generator',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'kubeconfig',
              workspace: 'kubeconfig',
            },
          ],
        },
        {
          name: 'export',
          runAfter: ['generate-destination-kubeconfig'],
          params: [
            {
              name: 'context',
              value: 'source',
            },
            {
              name: 'namespace',
              value: '$(params.source-namespace)',
            },
          ],
          taskRef: {
            name: 'crane-export',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'export',
              workspace: 'shared-data',
              subPath: 'export',
            },
            {
              name: 'kubeconfig',
              workspace: 'kubeconfig',
            },
          ],
        },
        {
          name: 'transform',
          runAfter: ['export'],
          params: [],
          taskRef: {
            name: 'crane-transform',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'export',
              workspace: 'shared-data',
              subPath: 'export',
            },
            {
              name: 'transform',
              workspace: 'shared-data',
              subPath: 'transform',
            },
          ],
        },
        {
          name: 'apply',
          runAfter: ['transform'],
          taskRef: {
            name: 'crane-apply',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'export',
              workspace: 'shared-data',
              subPath: 'export',
            },
            {
              name: 'transform',
              workspace: 'shared-data',
              subPath: 'transform',
            },
            {
              name: 'apply',
              workspace: 'shared-data',
              subPath: 'apply',
            },
          ],
        },
        {
          name: 'kustomize-init',
          runAfter: ['apply'],
          params: [
            {
              name: 'source-namespace',
              value: '$(params.source-namespace)',
            },
            {
              name: 'namespace',
              value: '$(context.taskRun.namespace)',
            },
          ],
          taskRef: {
            name: 'crane-kustomize-init',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'apply',
              workspace: 'shared-data',
              subPath: 'apply',
            },
            {
              name: 'kustomize',
              workspace: 'shared-data',
            },
          ],
        },
        {
          name: 'kubectl-apply-kustomize',
          runAfter: ['kustomize-init'],
          params: [
            {
              name: 'context',
              value: 'destination',
            },
          ],
          taskRef: {
            name: 'kubectl-apply-kustomize',
            kind: 'ClusterTask',
          },
          workspaces: [
            {
              name: 'kustomize',
              workspace: 'shared-data',
            },
            {
              name: 'kubeconfig',
              workspace: 'kubeconfig',
            },
          ],
        },
      ],
    },
  };

  const pipelineRun: PipelineRunKind = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    metadata: {
      generateName: `${pipelineName}-`, // <--
      namespace, // <--
    },
    spec: {
      ...(!startImmediately ? { status: 'PipelineRunPending' } : {}), // <--
      params: [
        {
          name: 'source-cluster-secret',
          value: sourceApiSecret?.metadata.name || '', // <--
        },
        {
          name: 'destination-cluster-secret',
          value: destinationApiSecret?.metadata.name || '', // <--
        },
        {
          name: 'source-namespace',
          value: sourceNamespace, // <--
        },
      ],
      workspaces: [
        {
          name: 'shared-data',
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '10Mi',
                },
              },
            },
          },
        },
        {
          name: 'kubeconfig',
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: '10Mi',
                },
              },
            },
          },
        },
      ],
      pipelineRef: {
        name: pipelineName,
      },
    },
  };

  return { pipeline, pipelineRun };
};
