import * as React from 'react';
import { useHistory } from 'react-router';
import { useHostNamespaceQuery } from 'src/api/queries/namespaces';

const NamespaceContext = React.createContext<string>('');
export const NamespaceContextProvider = NamespaceContext.Provider;
export const useNamespaceContext = () => {
  const namespace = React.useContext(NamespaceContext);
  const validateQuery = useHostNamespaceQuery(namespace);
  return {
    namespace,
    isValidatingNamespace: validateQuery.isLoading,
    isNamespaceValid: !!validateQuery.data,
    isAllNamespaces: !validateQuery.isLoading && (!namespace || namespace === '#ALL_NS#'),
  };
};

export const useRedirectOnInvalidNamespaceEffect = (href: string) => {
  const { isValidatingNamespace, isNamespaceValid, isAllNamespaces } = useNamespaceContext();
  const history = useHistory();
  React.useEffect(() => {
    if (!isValidatingNamespace && !isNamespaceValid && !isAllNamespaces) {
      history.push(href);
    }
  }, [history, href, isAllNamespaces, isNamespaceValid, isValidatingNamespace]);
};
