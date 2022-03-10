import { ImportWizardFormState } from 'src/components/ImportWizard/ImportWizardFormContext';
import { getAllPipelineTasks } from './pipelineTaskHelpers';
import { PipelineKind, PipelineRunKind } from './types/pipelines-plugin';
import { OAuthSecret } from './types/Secret';

export interface WizardTektonResources {
  stagePipeline: PipelineKind | null;
  stagePipelineRun: PipelineRunKind | null;
  cutoverPipeline: PipelineKind;
  cutoverPipelineRun: PipelineRunKind;
}

export const formsToTektonResources = (
  forms: ImportWizardFormState,
  destinationApiSecret: OAuthSecret,
  namespace: string,
): WizardTektonResources => {
  const { sourceNamespace, sourceApiSecret } = forms.sourceClusterProject.values;
  const { pipelineName, startImmediately } = forms.pipelineSettings.values;
  const { selectedPVCs } = forms.pvcSelect.values;
  const isStatefulMigration = selectedPVCs.length > 0;

  const pipelineCommon: PipelineKind = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'Pipeline',
    spec: {
      params: [
        { name: 'source-cluster-secret', type: 'string' },
        { name: 'source-namespace', type: 'string' },
        { name: 'destination-cluster-secret', type: 'string' },
      ],
      tasks: [],
    },
  };

  const pipelineRunCommon: PipelineRunKind = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    spec: {
      params: [
        { name: 'source-cluster-secret', value: sourceApiSecret?.metadata.name || '' },
        { name: 'destination-cluster-secret', value: destinationApiSecret?.metadata.name || '' },
        { name: 'source-namespace', value: sourceNamespace },
      ],
    },
  };

  const workspaceVolumeClaimTemplate = {
    spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: '10Mi' } } },
  };

  const tasks = getAllPipelineTasks(forms, namespace);

  const stagePipeline: PipelineKind | null = isStatefulMigration
    ? {
        ...pipelineCommon,
        metadata: { name: `${pipelineName}-stage`, namespace },
        spec: {
          ...pipelineCommon.spec,
          workspaces: [{ name: 'kubeconfig' }],
          tasks: [
            tasks.generateSourceKubeconfigTask,
            tasks.generateDestinationKubeconfigTask,
            ...tasks.transferPvcTasks.map((task) => ({
              ...task,
              runAfter: ['generate-destination-kubeconfig'],
            })),
          ],
        },
      }
    : null;

  const stagePipelineRun: PipelineRunKind | null = isStatefulMigration
    ? {
        ...pipelineRunCommon,
        metadata: { generateName: `${pipelineName}-stage-`, namespace },
        spec: {
          ...pipelineRunCommon.spec,
          ...(!startImmediately ? { status: 'PipelineRunPending' } : {}),
          pipelineRef: { name: `${pipelineName}-stage` },
          workspaces: [{ name: 'kubeconfig', volumeClaimTemplate: workspaceVolumeClaimTemplate }],
        },
      }
    : null;

  const cutoverPipeline: PipelineKind = {
    ...pipelineCommon,
    metadata: { name: isStatefulMigration ? `${pipelineName}-cutover` : pipelineName, namespace },
    spec: {
      ...pipelineCommon.spec,
      workspaces: [{ name: 'shared-data' }, { name: 'kubeconfig' }],
      tasks: [
        tasks.generateSourceKubeconfigTask,
        tasks.generateDestinationKubeconfigTask,
        tasks.craneExportTask,
        ...(isStatefulMigration
          ? [
              tasks.quiesceDeploymentsTask,
              tasks.quiesceDeploymentConfigsTask,
              tasks.quiesceStatefulSetsTask,
              tasks.quiesceJobsTask,
              ...tasks.transferPvcTasks.map((task) => ({
                ...task,
                runAfter: [
                  'quiesce-deployments',
                  'quiesce-deploymentconfigs',
                  'quiesce-statefulsets',
                  'quiesce-jobs',
                ],
              })),
              tasks.chownTask,
            ]
          : []),
        tasks.craneTransformTask,
        tasks.craneApplyTask,
        tasks.kustomizeInitTask,
        tasks.kubectlApplyKustomizeTask,
      ],
    },
  };

  const cutoverPipelineRun: PipelineRunKind = {
    ...pipelineRunCommon,
    metadata: {
      generateName: isStatefulMigration ? `${pipelineName}-cutover-` : `${pipelineName}-`,
      namespace,
    },
    spec: {
      ...pipelineRunCommon.spec,
      ...(isStatefulMigration || !startImmediately ? { status: 'PipelineRunPending' } : {}),
      pipelineRef: { name: isStatefulMigration ? `${pipelineName}-cutover` : pipelineName },
      workspaces: [
        { name: 'shared-data', volumeClaimTemplate: workspaceVolumeClaimTemplate },
        { name: 'kubeconfig', volumeClaimTemplate: workspaceVolumeClaimTemplate },
      ],
    },
  };

  return { stagePipeline, stagePipelineRun, cutoverPipeline, cutoverPipelineRun };
};
