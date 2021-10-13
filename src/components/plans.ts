import { UseQueryResult, useQuery, UseQueryOptions } from "react-query";
import * as React from "react";
import { IGroupVersionKindPlural, NamespacedResource } from "@konveyor/lib-ui";
import { useAuthorizedK8sClient } from "./fetchHelpers";

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

export const useMockableQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData
>(
  params: UseQueryOptions<TQueryFnData, TError, TData>,
  mockData: TQueryFnData
) =>
  useQuery<TQueryFnData, TError, TData>({
    ...params,
    queryFn: params.queryFn,
  });

export const sortByName = <T extends IHasName>(data?: T[]): T[] => {
  const getName = (obj: T) => obj.name || obj.metadata?.name || "";
  return (data || []).sort((a, b) => (getName(a) < getName(b) ? -1 : 1));
};

export const sortKubeListByName = <T>(result: IKubeList<T>) => ({
  ...result,
  items: sortByName(result.items || []),
});
export enum MigResourceKind {
  MigPlan = "migplans",
  MigStorage = "migstorages",
  MigAssetCollection = "migassetcollections",
  MigStage = "migstages",
  MigMigration = "migmigrations",
  MigCluster = "migclusters",
  MigHook = "mighooks",
  MigToken = "migtokens",
  MigAnalytic = "miganalytics",
}

export class MigResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: MigResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: "migration.openshift.io",
      version: "v1alpha1",
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}
const planResource = new MigResource(
  MigResourceKind.MigPlan,
  "openshift-migration"
);

export const usePlansQuery = (): UseQueryResult<IKubeList<any>> => {
  const client = useAuthorizedK8sClient();
  const sortKubeListByNameCallback = React.useCallback(
    (data): IKubeList<any> => data,
    []
  );
  const result = useMockableQuery<IKubeList<any>>(
    {
      queryKey: "plans",
      queryFn: async () =>
        (await client.list<IKubeList<any>>(planResource)).data,
      refetchInterval: 5000,
      select: sortKubeListByNameCallback,
    },
    mockKubeList(null, "Plan")
  );
  debugger;
  console.log("result", result);
  return result;
};

export const mockKubeList = <T>(items: T[], kind: string): IKubeList<T> => ({
  apiVersion: null,
  items,
  kind,
  metadata: {
    continue: "",
    resourceVersion: "",
    selfLink: "/foo/list/selfLink",
  },
});
