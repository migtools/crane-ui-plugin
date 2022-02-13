import * as React from 'react';
import {
  K8sGroupVersionKind,
  useK8sWatchResource,
  k8sCreate,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { useMutation } from 'react-query';
import { MOCK_NEW_PIPELINE } from 'src/api/mock/Pipelines.mock';
import { Button, Flex, FlexItem, Modal, TextInput } from '@patternfly/react-core';
import { useNamespaceContext } from 'src/context/NamespaceContext';

// TODO -- move these helpers elsewhere? do we need them at all? Taken from https://github.com/spadgett/console-customization-plugin/blob/main/src/k8s/resources.ts
/*
// TODO: Use utility when available in the SDK.
export const referenceFor = (group: string, version: string, kind: string) =>
  `${group}~${version}~${kind}`;

const groupVersionKindForObj = (obj: K8sResourceCommon) => {
  const [group, version] = obj.apiVersion.split('/');
  return { group, version, kind: obj.kind };
};

export const referenceForObj = (obj: K8sResourceCommon) => {
  const { group, version, kind } = groupVersionKindForObj(obj);
  return referenceFor(group, version, kind);
};
*/

const pipelineResource: K8sGroupVersionKind = {
  group: 'tekton.dev',
  version: 'v1beta1',
  kind: 'Pipeline',
};

// TODO add types for pipelines, I wonder if we can somehow import from https://github.com/openshift/console/tree/master/frontend/packages/pipelines-plugin/src/types?
// TODO replace all instances of any, i'm just hacking around without types for now

const getNewMockPipeline = (name: string, namespace: string) => ({
  ...MOCK_NEW_PIPELINE,
  metadata: { ...MOCK_NEW_PIPELINE.metadata, name, namespace },
});

const useCreatePipelineMutation = () => {
  // based on https://github.com/spadgett/console-customization-plugin/blob/5c19d8f3d74aaf9430e5a7817bae93f57669175d/src/components/forms/CreateConsoleLinkPage.tsx
  const [model] = useK8sModel(pipelineResource);
  return useMutation<any, any, any, any>((data) => k8sCreate<any>({ model, data }));
};

export const TmpCrudTesting: React.FunctionComponent = () => {
  const namespace = useNamespaceContext();
  const [data, loaded, error] = useK8sWatchResource<any[]>({
    groupVersionKind: pipelineResource,
    isList: true,
    namespaced: true,
    namespace,
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const createPipelineMutation = useCreatePipelineMutation();
  const [newPipelineName, setNewPipelineName] = React.useState('');
  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        style={{ position: 'absolute', bottom: 15, right: 15 }}
        variant="secondary"
      >
        CRUD debugging (ignore me)
      </Button>
      <Modal
        isOpen={isModalOpen}
        title="CRUD debugging (ignore me)"
        onClose={() => setIsModalOpen(false)}
      >
        <Flex>
          <FlexItem>
            <TextInput value={newPipelineName} onChange={setNewPipelineName} />
          </FlexItem>
          <Button
            onClick={() => {
              createPipelineMutation.mutate(getNewMockPipeline(newPipelineName, namespace));
              setNewPipelineName('');
            }}
          >
            Create pipeline
          </Button>
          <FlexItem>Status: {createPipelineMutation.status}</FlexItem>
        </Flex>
        <br />
        Testing a watch for pipeline CRs:
        <br />
        <pre>{JSON.stringify({ data, loaded, error }, null, 4)}</pre>
      </Modal>
    </>
  );
};
