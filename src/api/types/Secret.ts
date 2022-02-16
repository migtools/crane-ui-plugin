import { K8sResourceCommon, ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/configuration/secret/

export interface Secret extends K8sResourceCommon {
  apiVersion: 'v1';
  kind: 'Secret';
  data: Record<string, string>;
  type:
    | 'Opaque'
    | 'kubernetes.io/service-account-token'
    | 'kubernetes.io/dockercfg'
    | 'kubernetes.io/dockerconfigjson'
    | 'kubernetes.io/basic-auth'
    | 'kubernetes.io/ssh-auth'
    | 'kubernetes.io/tls'
    | 'bootstrap.kubernetes.io/token';
}

export interface OAuthSecret extends Secret {
  metadata: ObjectMetadata & {
    annotations: ObjectMetadata['annotations'] & {
      'konveyor.io/crane-ui-plugin'?: 'source-cluster-oauth' | 'destination-cluster-oauth';
    };
  };
  data: {
    url: string;
    token: string;
  };
  type: 'Opaque';
}
