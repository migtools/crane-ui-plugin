import * as yaml from 'js-yaml';
import { ImportWizardFormState } from 'src/components/ImportWizard/ImportWizardFormContext';
import { getAllPipelineTasks } from './pipelineTaskHelpers';
import { OAuthSecret } from './types/Secret';
import { CranePipeline, CranePipelineRun } from './types/CranePipeline';

export interface WizardTektonResources {
  stagePipeline: CranePipeline | null;
  stagePipelineRun: CranePipelineRun | null;
  cutoverPipeline: CranePipeline;
  cutoverPipelineRun: CranePipelineRun;
}

export const formsToTektonResources = (
  forms: ImportWizardFormState,
  destinationApiSecret: OAuthSecret,
  namespace: string,
): WizardTektonResources => {
  const { sourceNamespace, sourceApiSecret } = forms.sourceClusterProject.values;
  const { pipelineName: namePrefix } = forms.pipelineSettings.values;
  const { selectedPVCs } = forms.pvcSelect.values;
  const isStatefulMigration = selectedPVCs.length > 0;
  const hasMultiplePipelines = isStatefulMigration;
  const cutoverPipelineName = hasMultiplePipelines ? `${namePrefix}-cutover` : namePrefix;

  const pipelineCommon: Partial<CranePipeline> = {
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

  const pipelineRunCommon: Partial<CranePipelineRun> = {
    apiVersion: 'tekton.dev/v1beta1',
    kind: 'PipelineRun',
    spec: {
      status: 'PipelineRunPending',
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

  const stagePipeline: CranePipeline | null = hasMultiplePipelines
    ? {
        ...pipelineCommon,
        metadata: {
          name: `${namePrefix}-stage`,
          namespace,
          annotations: {
            'crane-ui-plugin.konveyor.io/action': 'stage',
            'crane-ui-plugin.konveyor.io/associated-cutover-pipeline': cutoverPipelineName,
          },
        },
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

  const stagePipelineRun: CranePipelineRun | null = hasMultiplePipelines
    ? {
        ...pipelineRunCommon,
        metadata: {
          generateName: `${namePrefix}-stage-`,
          namespace,
          annotations: {
            'crane-ui-plugin.konveyor.io/action': 'stage',
            'crane-ui-plugin.konveyor.io/associated-cutover-pipeline': cutoverPipelineName,
          },
        },
        spec: {
          ...pipelineRunCommon.spec,
          pipelineRef: { name: `${namePrefix}-stage` },
          workspaces: [{ name: 'kubeconfig', volumeClaimTemplate: workspaceVolumeClaimTemplate }],
        },
      }
    : null;

  const cutoverPipeline: CranePipeline = {
    ...pipelineCommon,
    metadata: {
      name: cutoverPipelineName,
      namespace,
      annotations: {
        'crane-ui-plugin.konveyor.io/action': 'cutover',
        'crane-ui-plugin.konveyor.io/associated-cutover-pipeline': cutoverPipelineName,
      },
    },
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
            ]
          : []),
        tasks.craneTransformTask,
        tasks.craneApplyTask,
        tasks.kustomizeInitTask,
        isStatefulMigration
          ? {
              ...tasks.kubectlApplyKustomizeTask,
              runAfter: ['kustomize-init'],
            }
          : tasks.kubectlApplyKustomizeTask,
      ],
    },
  };

  const cutoverPipelineRun: CranePipelineRun = {
    ...pipelineRunCommon,
    metadata: {
      generateName: hasMultiplePipelines ? `${namePrefix}-cutover-` : `${namePrefix}-`,
      namespace,
      annotations: {
        'crane-ui-plugin.konveyor.io/action': 'cutover',
        'crane-ui-plugin.konveyor.io/associated-cutover-pipeline': cutoverPipelineName,
      },
    },
    spec: {
      ...pipelineRunCommon.spec,
      pipelineRef: { name: cutoverPipelineName },
      workspaces: [
        { name: 'shared-data', volumeClaimTemplate: workspaceVolumeClaimTemplate },
        { name: 'kubeconfig', volumeClaimTemplate: workspaceVolumeClaimTemplate },
      ],
    },
  };

  return { stagePipeline, stagePipelineRun, cutoverPipeline, cutoverPipelineRun };
};

export const yamlToTektonResources = (
  forms: ImportWizardFormState,
): Partial<WizardTektonResources> => {
  const { stagePipelineYaml, stagePipelineRunYaml, cutoverPipelineYaml, cutoverPipelineRunYaml } =
    forms.review.values;
  let stagePipeline: CranePipeline | null | undefined;
  let stagePipelineRun: CranePipelineRun | null | undefined;
  let cutoverPipeline: CranePipeline | undefined;
  let cutoverPipelineRun: CranePipelineRun | undefined;
  try {
    stagePipeline = stagePipelineYaml ? (yaml.load(stagePipelineYaml) as CranePipeline) : null;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  try {
    stagePipelineRun = stagePipelineRunYaml
      ? (yaml.load(stagePipelineRunYaml) as CranePipelineRun)
      : null;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  try {
    cutoverPipeline = yaml.load(cutoverPipelineYaml) as CranePipeline;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  try {
    cutoverPipelineRun = yaml.load(cutoverPipelineRunYaml) as CranePipelineRun;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return { stagePipeline, stagePipelineRun, cutoverPipeline, cutoverPipelineRun };
};
