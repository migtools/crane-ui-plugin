import * as React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useHostNamespaceQuery } from 'src/api/queries/namespaces';

export const useValidatedNamespace = () => {
  const {
    params: { namespace },
  } = useRouteMatch<{ namespace: string }>();
  const validateQuery = useHostNamespaceQuery(namespace);
  return {
    namespace,
    isValidatingNamespace: validateQuery.isLoading,
    isNamespaceValid: !!validateQuery.data,
    isAllNamespaces: !validateQuery.isLoading && (!namespace || namespace === '#ALL_NS#'),
  };
};

export const useRedirectOnInvalidNamespaceEffect = (href: string) => {
  const { isValidatingNamespace, isNamespaceValid, isAllNamespaces } = useValidatedNamespace();
  const history = useHistory();
  React.useEffect(() => {
    if (!isValidatingNamespace && !isNamespaceValid && !isAllNamespaces) {
      history.push(href);
    }
  }, [history, href, isAllNamespaces, isNamespaceValid, isValidatingNamespace]);
};
