// TODO remove this when we have real CRUD stuff, the mocks should be for read-only operations

export const MOCK_NEW_PIPELINE = {
  apiVersion: 'tekton.dev/v1beta1',
  kind: 'Pipeline',
  metadata: {
    name: 'tmp-crane-git-clone-delete-me',
    namespace: 'mturley-tmp',
  },
  spec: {
    tasks: [
      {
        name: 'git-clone',
        params: [
          {
            name: 'url',
            value: 'git@github.com:konveyor/crane-ui-plugin.git',
          },
          {
            name: 'submodules',
            value: 'true',
          },
          {
            name: 'depth',
            value: '1',
          },
          {
            name: 'sslVerify',
            value: 'true',
          },
          {
            name: 'deleteExisting',
            value: 'true',
          },
          {
            name: 'verbose',
            value: 'true',
          },
          {
            name: 'gitInitImage',
            value:
              'registry.redhat.io/openshift-pipelines/pipelines-git-init-rhel8@sha256:da1aedf0b17f2b9dd2a46edc93ff1c0582989414b902a28cd79bad8a035c9ea4',
          },
          {
            name: 'userHome',
            value: '/tekton/home',
          },
        ],
        taskRef: {
          kind: 'ClusterTask',
          name: 'git-clone',
        },
        workspaces: [
          {
            name: 'output',
            workspace: 'mturley-tmp-ws',
          },
        ],
      },
    ],
    workspaces: [
      {
        name: 'mturley-tmp-ws',
      },
    ],
  },
};

export const MOCK_PIPELINE = {
  ...MOCK_NEW_PIPELINE,
  metadata: {
    ...MOCK_NEW_PIPELINE.metadata,
    creationTimestamp: '2022-01-17T20:45:08Z',
    generation: 1,
    managedFields: [
      {
        apiVersion: 'tekton.dev/v1beta1',
        fieldsType: 'FieldsV1',
        fieldsV1: {
          'f:spec': {
            '.': {},
            'f:finally': {},
            'f:params': {},
            'f:resources': {},
            'f:tasks': {},
            'f:workspaces': {},
          },
        },
        manager: 'Mozilla',
        operation: 'Update',
        time: '2022-01-17T20:45:08Z',
      },
    ],
  },
  resourceVersion: '11702043',
  uid: '84170efc-7d88-4068-bb5f-73814971caec',
};
