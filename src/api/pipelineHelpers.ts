import * as yaml from 'js-yaml';
import { ImportWizardFormState } from 'src/components/ImportWizard/ImportWizardFormContext';
import { getAllPipelineTasks } from './pipelineTaskHelpers';
import { OAuthSecret } from './types/Secret';
import {
  CranePipeline,
  CranePipelineAction,
  CranePipelineGroup,
  CranePipelineRun,
} from './types/CranePipeline';

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
  const { pipelineGroupName } = forms.pipelineSettings.values;
  const { selectedPVCs } = forms.pvcSelect.values;
  const isStatefulMigration = selectedPVCs.length > 0;
  const hasMultiplePipelines = isStatefulMigration;
  const cutoverPipelineName = hasMultiplePipelines
    ? `${pipelineGroupName}-cutover`
    : pipelineGroupName;

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
          name: `${pipelineGroupName}-stage`,
          namespace,
          annotations: {
            'crane-ui-plugin.konveyor.io/action': 'stage',
            'crane-ui-plugin.konveyor.io/group': pipelineGroupName,
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
          generateName: `${pipelineGroupName}-stage-`,
          namespace,
          annotations: {
            'crane-ui-plugin.konveyor.io/action': 'stage',
            'crane-ui-plugin.konveyor.io/group': pipelineGroupName,
          },
        },
        spec: {
          ...pipelineRunCommon.spec,
          pipelineRef: { name: `${pipelineGroupName}-stage` },
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
        'crane-ui-plugin.konveyor.io/group': pipelineGroupName,
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
      generateName: hasMultiplePipelines
        ? `${pipelineGroupName}-cutover-`
        : `${pipelineGroupName}-`,
      namespace,
      annotations: {
        'crane-ui-plugin.konveyor.io/action': 'cutover',
        'crane-ui-plugin.konveyor.io/group': pipelineGroupName,
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

export const getPipelineGroupSourceNamespace = (group?: CranePipelineGroup) =>
  (group?.pipelineRuns.all[0]?.spec.params?.find((param) => param.name === 'source-namespace')
    ?.value as string) || 'Unknown';

export const actionToString = (action: CranePipelineAction, parens = false) =>
  `${parens ? '(' : ''}${action.charAt(0).toUpperCase()}${action.slice(1)}${parens ? ')' : ''}`;

export const resourceActionToString = (
  resource: CranePipeline | CranePipelineRun,
  parens = false,
) => {
  const action = resource.metadata.annotations?.['crane-ui-plugin.konveyor.io/action'] || '';
  return action ? actionToString(action, parens) : '';
};

// If a PLR has no startTime, sort it as started last because it is still starting
export const sortByStartedTime = (pipelineRuns: CranePipelineRun[], direction: 'asc' | 'desc') =>
  [...pipelineRuns].sort((a, b) => {
    const [aTimestamp, bTimestamp] = [a, b].map((plr) => plr.status?.startTime || null);
    if ((!!aTimestamp && !bTimestamp) || (!!aTimestamp && !!bTimestamp && aTimestamp < bTimestamp))
      return direction === 'asc' ? -1 : 1;
    if ((!aTimestamp && !!bTimestamp) || (!!aTimestamp && !!bTimestamp && aTimestamp > bTimestamp))
      return direction === 'asc' ? 1 : -1;
    return 0;
  });
