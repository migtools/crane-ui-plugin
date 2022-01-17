import * as React from 'react';
import {
  K8sGroupVersionKind,
  // K8sResourceCommon,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

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

interface TmpCrudTestingProps {
  namespace: string;
}

export const TmpCrudTesting: React.FunctionComponent<TmpCrudTestingProps> = ({ namespace }) => {
  const [data, loaded, error] = useK8sWatchResource<any[]>({
    groupVersionKind: pipelineResource,
    isList: true,
    namespaced: true,
    namespace,
  });
  console.log('RENDERED!');
  return (
    <div>
      Testing a watch for pipeline CRs:
      <br />
      <pre>{JSON.stringify({ data, loaded, error }, null, 4)}</pre>
    </div>
  );
};
