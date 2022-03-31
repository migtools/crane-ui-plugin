import {
  k8sGet,
  K8sGroupVersionKind,
  K8sResourceCommon,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { useQuery } from 'react-query';

const routeGVK: K8sGroupVersionKind = { group: 'route.openshift.io', version: 'v1', kind: 'Route' };
type Route = K8sResourceCommon & { spec: { host: string } };

export const useTemporaryCORSProxyUrlQuery = () => {
  const [routeModel] = useK8sModel(routeGVK);
  return useQuery<{ url: string; hasCertError: boolean }>('temp-cors-proxy-url', async () => {
    const route = await k8sGet<Route>({
      model: routeModel,
      name: 'proxy',
      ns: 'openshift-migration',
    });

    const url = `https://${route.spec.host}`;
    try {
      await fetch(url);
    } catch (e) {
      return { url, hasCertError: true };
    }
    return { url, hasCertError: false };
  });
};
