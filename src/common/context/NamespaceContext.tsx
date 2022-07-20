import * as React from 'react';

// TODO this will not be necessary once `useActiveNamespace` is exposed in @openshift-console/dynamic-plugin-sdk

export const NamespaceContext = React.createContext<string>('');
export const useNamespaceContext = () => React.useContext(NamespaceContext);
