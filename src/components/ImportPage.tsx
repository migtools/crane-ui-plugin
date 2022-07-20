import * as React from 'react';
import Helmet from 'react-helmet';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { PageSection, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ImportWizard } from './ImportWizard/ImportWizard';
import { NamespaceContext } from 'src/common/context/NamespaceContext';
import { WizardReachedFromParam } from 'src/utils/paths';
import { LocalStorageContextProvider } from 'src/common/context/LocalStorageContext';
import {
  localStorageContext,
  LOCAL_STORAGE_KEYS,
} from 'src/common/context/CraneLocalStorageContext';

const queryClient = new QueryClient();

const ImportPage: React.FunctionComponent = () => {
  const {
    params: { namespace },
  } = useRouteMatch<{ namespace: string }>();
  const location = useLocation();
  const urlParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  return (
    <>
      <Helmet>
        <title>Crane</title>
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <NamespaceContext.Provider value={namespace}>
          <LocalStorageContextProvider context={localStorageContext} keyList={LOCAL_STORAGE_KEYS}>
            <>
              <PageSection variant="light">
                <Title headingLevel="h1">Import application</Title>
              </PageSection>
              <PageSection variant="light" type="wizard">
                <ImportWizard reachedFrom={urlParams.get('from') as WizardReachedFromParam} />
              </PageSection>
            </>
          </LocalStorageContextProvider>
        </NamespaceContext.Provider>
      </QueryClientProvider>
    </>
  );
};

export default ImportPage;
