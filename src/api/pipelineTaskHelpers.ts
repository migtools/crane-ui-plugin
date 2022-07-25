import { ImportWizardFormState } from 'src/components/ImportWizard/ImportWizardFormContext';
import { PipelineTask } from 'src/reused/pipelines-plugin/src/types';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { getValidatedName } from 'src/utils/helpers';

export const getAllPipelineTasks = (forms: ImportWizardFormState, namespace: string) => {
  const { sourceNamespace } = forms.sourceClusterProject.values;
  const { selectedPVCs } = forms.pvcSelect.values;
  const { editValuesByPVC } = forms.pvcEdit.values;

  const registryReplacements = [
    `$(tasks.source-registry-info.results.internal)/${sourceNamespace}=$(tasks.destination-registry-info.results.internal)/$(context.taskRun.namespace)`,
    `$(tasks.source-registry-info.results.public)/${sourceNamespace}=$(tasks.destination-registry-info.results.public)/$(context.taskRun.namespace)`,
  ];

  const pvcRenameMap = (pvc: PersistentVolumeClaim): string => {
    const editValues = editValuesByPVC[pvc.metadata?.name || ''];
    const { targetPvcName } = editValues;
    return `${pvc.metadata?.name}:${targetPvcName}`;
  };

  const generateSourceKubeconfigTask: PipelineTask = {
    name: 'generate-source-kubeconfig',
    params: [
      { name: 'cluster-secret', value: '$(params.source-cluster-secret)' },
      { name: 'context-name', value: 'source' },
    ],
    taskRef: { name: 'crane-kubeconfig-generator', kind: 'ClusterTask' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const generateDestinationKubeconfigTask: PipelineTask = {
    name: 'generate-destination-kubeconfig',
    runAfter: ['generate-source-kubeconfig'],
    params: [
      { name: 'cluster-secret', value: '$(params.destination-cluster-secret)' },
      { name: 'context-name', value: 'destination' },
    ],
    taskRef: { name: 'crane-kubeconfig-generator', kind: 'ClusterTask' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const craneExportTask: PipelineTask = {
    name: 'export',
    params: [
      { name: 'context', value: 'source' },
      { name: 'namespace', value: '$(params.source-namespace)' },
    ],
    runAfter: ['generate-destination-kubeconfig'],
    taskRef: { kind: 'ClusterTask', name: 'crane-export' },
    workspaces: [
      { name: 'export', subPath: 'export', workspace: 'shared-data' },
      { name: 'kubeconfig', workspace: 'kubeconfig' },
    ],
  };

  const sourceRegistryInfo: PipelineTask = {
    name: 'source-registry-info',
    runAfter: ['export'],
    params: [{ name: 'context', value: 'source' }],
    taskRef: { name: 'oc-registry-info', kind: 'ClusterTask' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const destinationRegistryInfo: PipelineTask = {
    name: 'destination-registry-info',
    runAfter: ['export'],
    params: [{ name: 'context', value: 'destination' }],
    taskRef: { name: 'oc-registry-info', kind: 'ClusterTask' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const imageSyncTask: PipelineTask = {
    name: 'image-sync',
    runAfter: ['source-registry-info', 'destination-registry-info'],
    params: [
      { name: 'src-context', value: 'source' },
      {
        name: 'src-internal-registry-url',
        value: '$(tasks.source-registry-info.results.internal)',
      },
      { name: 'src-public-registry-url', value: '$(tasks.source-registry-info.results.public)' },
      { name: 'dest-context', value: 'destination' },
      { name: 'dest-namespace', value: '$(context.taskRun.namespace)' },
      {
        name: 'dest-public-registry-url',
        value: '$(tasks.destination-registry-info.results.public)',
      },
    ],
    taskRef: { name: 'crane-image-sync', kind: 'ClusterTask' },
    workspaces: [
      { name: 'export', workspace: 'shared-data', subPath: 'export' },
      { name: 'skopeo', workspace: 'shared-data', subPath: 'skopeo' },
      { name: 'kubeconfig', workspace: 'kubeconfig' },
    ],
  };

  const craneTransformTask: PipelineTask = {
    name: 'transform',
    runAfter: ['source-registry-info', 'destination-registry-info'],
    params: [
      {
        name: 'optional-flags',
        value: `"registry-replacement=${registryReplacements.join(
          ',',
        )}","pvc-rename-map=${selectedPVCs.map(pvcRenameMap).join(',')}"`,
      },
    ],
    taskRef: { name: 'crane-transform', kind: 'ClusterTask' },
    workspaces: [
      { name: 'export', workspace: 'shared-data', subPath: 'export' },
      { name: 'transform', workspace: 'shared-data', subPath: 'transform' },
    ],
  };

  const craneApplyTask: PipelineTask = {
    name: 'apply',
    runAfter: ['transform'],
    taskRef: { name: 'crane-apply', kind: 'ClusterTask' },
    workspaces: [
      { name: 'export', workspace: 'shared-data', subPath: 'export' },
      { name: 'transform', workspace: 'shared-data', subPath: 'transform' },
      { name: 'apply', workspace: 'shared-data', subPath: 'apply' },
    ],
  };

  const kustomizeInitTask: PipelineTask = {
    name: 'kustomize-init',
    runAfter: ['apply'],
    params: [
      { name: 'source-namespace', value: '$(params.source-namespace)' },
      { name: 'namespace', value: '$(context.taskRun.namespace)' },
    ],
    taskRef: { name: 'crane-kustomize-init', kind: 'ClusterTask' },
    workspaces: [
      { name: 'apply', workspace: 'shared-data', subPath: 'apply' },
      { name: 'kustomize', workspace: 'shared-data' },
    ],
  };

  const kubectlApplyKustomizeTask: PipelineTask = {
    name: 'kubectl-apply-kustomize',
    runAfter: ['kustomize-init'],
    params: [{ name: 'context', value: 'destination' }],
    taskRef: { name: 'kubectl-apply-kustomize', kind: 'ClusterTask' },
    workspaces: [
      { name: 'kustomize', workspace: 'shared-data' },
      { name: 'kubeconfig', workspace: 'kubeconfig' },
    ],
  };

  const quiesceDeploymentsTask: PipelineTask = {
    name: 'quiesce-deployments',
    params: [
      { name: 'context', value: 'source' },
      { name: 'namespace', value: '$(params.source-namespace)' },
      { name: 'resource-type', value: 'deployment' },
    ],
    runAfter: ['export'],
    taskRef: { kind: 'ClusterTask', name: 'kubectl-scale-down' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const quiesceDeploymentConfigsTask: PipelineTask = {
    name: 'quiesce-deploymentconfigs',
    params: [
      { name: 'context', value: 'source' },
      { name: 'namespace', value: '$(params.source-namespace)' },
      { name: 'resource-type', value: 'deploymentconfig' },
    ],
    runAfter: ['export'],
    taskRef: { kind: 'ClusterTask', name: 'kubectl-scale-down' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const quiesceStatefulSetsTask: PipelineTask = {
    name: 'quiesce-statefulsets',
    params: [
      { name: 'context', value: 'source' },
      { name: 'namespace', value: '$(params.source-namespace)' },
      { name: 'resource-type', value: 'statefulset' },
    ],
    runAfter: ['export'],
    taskRef: { kind: 'ClusterTask', name: 'kubectl-scale-down' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const quiesceJobsTask: PipelineTask = {
    name: 'quiesce-jobs',
    params: [
      { name: 'context', value: 'source' },
      { name: 'namespace', value: '$(params.source-namespace)' },
      { name: 'resource-type', value: 'job' },
    ],
    runAfter: ['export'],
    taskRef: { kind: 'ClusterTask', name: 'kubectl-scale-down' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  const transferPvcTasks: PipelineTask[] = selectedPVCs.map((pvc) => {
    const editValues = editValuesByPVC[pvc.metadata?.name || ''];
    const { targetPvcName, storageClass, capacity, verifyCopy } = editValues; // TODO where to put verifyCopy?
    console.log('TODO: use verifyCopy flag!', pvc.metadata?.name, verifyCopy);
    return {
      name: getValidatedName('transfer-pvc-', pvc.metadata?.name || ''),
      params: [
        { name: 'source-context', value: 'source' },
        { name: 'source-namespace', value: sourceNamespace },
        { name: 'source-pvc-name', value: pvc.metadata?.name },
        { name: 'dest-context', value: 'destination' },
        { name: 'dest-pvc-name', value: targetPvcName },
        { name: 'dest-namespace', value: namespace },
        { name: 'dest-storage-class-name', value: storageClass },
        { name: 'dest-storage-requests', value: capacity },
        { name: 'endpoint-type', value: 'route' },
      ],
      taskRef: { kind: 'ClusterTask', name: 'crane-transfer-pvc' },
      workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
    };
  });

  const chownTask = {
    name: 'chown',
    params: [
      { name: 'pvcs', value: selectedPVCs.map((pvc) => pvc.metadata?.name).join(',') },
      { name: 'namespace', value: '$(params.source-namespace)' },
      { name: 'context', value: 'destination' },
    ],
    runAfter: ['transfer-pvc'],
    taskRef: { kind: 'ClusterTask', name: 'crane-ownership-change' },
    workspaces: [{ name: 'kubeconfig', workspace: 'kubeconfig' }],
  };

  return {
    generateSourceKubeconfigTask,
    generateDestinationKubeconfigTask,
    craneExportTask,
    sourceRegistryInfo,
    destinationRegistryInfo,
    imageSyncTask,
    craneTransformTask,
    craneApplyTask,
    kustomizeInitTask,
    kubectlApplyKustomizeTask,
    quiesceDeploymentsTask,
    quiesceDeploymentConfigsTask,
    quiesceStatefulSetsTask,
    quiesceJobsTask,
    transferPvcTasks,
    chownTask,
  };
};
