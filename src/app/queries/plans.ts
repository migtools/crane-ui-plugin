import {
  UseQueryResult,
  useQuery,
  UseQueryOptions,
  UseMutationResult,
  useQueryClient,
  MutationFunction,
  UseMutationOptions,
  useMutation,
} from 'react-query';
import * as React from 'react';
import { IGroupVersionKindPlural, NamespacedResource } from '@konveyor/lib-ui';

import { AxiosError } from 'axios';
import { useHistory } from 'react-router-dom';
import { IKubeResponse, useAuthorizedK8sClient, useFetchContext } from './fetchHelpers';
export type KubeClientError = AxiosError<{ message: string }>;

export type MockPlanFormState = ReturnType<any>;

interface IHasName {
  name?: string;
  metadata?: { name: string };
}
export interface IMetaTypeMeta {
  apiVersion: string;
  kind: string;
}
export interface IKubeList<T> extends IMetaTypeMeta {
  items: T[];
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}

export const useMockableQuery = <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  params: UseQueryOptions<TQueryFnData, TError, TData>,
  mockData: TQueryFnData
) =>
  useQuery<TQueryFnData, TError, TData>({
    ...params,
    queryFn: params.queryFn,
  });

export const sortByName = <T extends IHasName>(data?: T[]): T[] => {
  const getName = (obj: T) => obj.name || obj.metadata?.name || '';
  return (data || []).sort((a, b) => (getName(a) < getName(b) ? -1 : 1));
};

export const sortKubeListByName = <T>(result: IKubeList<T>) => ({
  ...result,
  items: sortByName(result.items || []),
});
export enum MigResourceKind {
  MigPlan = 'migplans',
  MigStorage = 'migstorages',
  MigAssetCollection = 'migassetcollections',
  MigStage = 'migstages',
  MigMigration = 'migmigrations',
  MigCluster = 'migclusters',
  MigHook = 'mighooks',
  MigToken = 'migtokens',
  MigAnalytic = 'miganalytics',
}

export class MigResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: MigResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'migration.openshift.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}
const planResource = new MigResource(MigResourceKind.MigPlan, 'openshift-migration');

export const usePlansQuery = (): UseQueryResult<IKubeList<any>> => {
  const client = useAuthorizedK8sClient();
  const sortKubeListByNameCallback = React.useCallback((data): IKubeList<any> => data, []);
  const result = useMockableQuery<IKubeList<any>>(
    {
      queryKey: 'plans',
      queryFn: async () => (await client.list<IKubeList<any>>(planResource)).data,
      refetchInterval: 5000,
      select: sortKubeListByNameCallback,
    },
    mockKubeList([], 'Plan')
  );
  console.log('result', result);
  return result;
};

export const mockKubeList = <T>(items: T[], kind: string): IKubeList<T> => ({
  apiVersion: '',
  items,
  kind,
  metadata: {
    continue: '',
    resourceVersion: '',
    selfLink: '/foo/list/selfLink',
  },
});

// const mockPromise = <TQueryFnData>(
//   data: TQueryFnData,
//   timeout = process.env.NODE_ENV === "test" ? 0 : 1000,
//   success = true
// ) => {
//   return new Promise<TQueryFnData>((resolve, reject) => {
//     setTimeout(() => {
//       if (success) {
//         resolve(data);
//       } else {
//         reject({ message: "Error" });
//       }
//     }, timeout);
//   });
// };

export const useMockableMutation = <
  TQueryFnData = unknown,
  TError = KubeClientError,
  TVariables = unknown,
  TSnapshot = unknown
>(
  mutationFn: MutationFunction<TQueryFnData, TVariables>,
  config: UseMutationOptions<TQueryFnData, TError, TVariables, TSnapshot> | undefined
) => {
  const { checkExpiry } = useFetchContext();
  const history = useHistory();
  return useMutation<TQueryFnData, TError, TVariables, TSnapshot>(async (vars: TVariables) => {
    try {
      return await mutationFn(vars);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      console.error(error);
      checkExpiry(error, history);
      throw error;
    }
  }, config);
};

export const useCreatePlanMutation = (
  onSuccess?: () => void
): UseMutationResult<IKubeResponse<any>, KubeClientError, MockPlanFormState, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryClient = useQueryClient();
  return useMockableMutation<IKubeResponse<any>, KubeClientError, MockPlanFormState>(
    async (forms) => {
      const mockPlan = {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigPlan',
        metadata: {
          name: 'plan',
          namespace: 'openshift-migration',
        },
        spec: {
          destMigClusterRef: {
            name: 'host',
            namespace: 'openshift-migration',
          },
          migStorageRef: {
            name: 's43',
            namespace: 'openshift-migration',
          },
          srcMigClusterRef: {
            name: 'src332',
            namespace: 'openshift-migration',
          },
        },
      };

      const planResponse = await client.create<any>(planResource, mockPlan);

      return planResponse;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        onSuccess && onSuccess();
      },
    }
  );
};
