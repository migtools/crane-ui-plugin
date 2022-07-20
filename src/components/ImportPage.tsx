import * as React from 'react';
import Helmet from 'react-helmet';
import { useRouteMatch } from 'react-router-dom';
import { PageSection, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ImportWizard } from './ImportWizard/ImportWizard';
import { NamespaceContext } from 'src/context/NamespaceContext';

const queryClient = new QueryClient();

const ImportPage: React.FunctionComponent = () => {
  const {
    params: { namespace },
  } = useRouteMatch<{ namespace: string }>();
  return (
    <>
      <Helmet>
        <title>Crane</title>
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <NamespaceContext.Provider value={namespace}>
          <>
            <PageSection variant="light">
              <Title headingLevel="h1">Import application</Title>
            </PageSection>
            <PageSection variant="light" type="wizard">
              <ImportWizard />
            </PageSection>
          </>
        </NamespaceContext.Provider>
      </QueryClientProvider>
    </>
  );
};

export default ImportPage;
