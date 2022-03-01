export interface ApiRootQuerySuccessResponse {
  kind: 'APIVersions';
  versions: string[];
  serverAddressByClientCIDRs: {
    clientCIDR: string;
    serverAddress: string;
  }[];
}

export interface ApiRootQueryFailureResponse {
  kind: 'Status';
  apiVersion: string;
  metadata: Record<string, never>;
  status: 'Failure';
  message: string;
  reason: string;
  code: number;
}

export type ApiRootQueryResponse = ApiRootQuerySuccessResponse | ApiRootQueryFailureResponse;
