import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

// https://kubernetes.io/docs/concepts/configuration/secret/

export interface Secret extends K8sResourceCommon {
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
  data: {
    url: string;
    token: string;
  };
  type: 'Opaque';
}
