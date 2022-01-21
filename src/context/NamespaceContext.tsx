import * as React from 'react';

export const NamespaceContext = React.createContext<string>('');
export const useNamespaceContext = () => React.useContext(NamespaceContext);
