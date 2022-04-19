import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { Page, PageSection, Title, TextContent, Text } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppImports } from './AppImports/AppImports';
import { NamespaceContext } from 'src/context/NamespaceContext';

const queryClient = new QueryClient();

interface AppImportsPageProps {
  match: RouteMatch<{ namespace: string }>;
}

const AppImportsPage: React.FunctionComponent<AppImportsPageProps> = ({
  match: {
    params: { namespace },
  },
}) => (
  <>
    <Helmet>
      <title>Crane - Application Imports</title>
    </Helmet>
    <QueryClientProvider client={queryClient}>
      <NamespaceContext.Provider value={namespace}>
        <Page>
          <PageSection variant="light">
            <TextContent>
              <Title headingLevel="h1">Application Imports</Title>
              <Text>Select a "pipeline" to import an application from another cluster.</Text>
            </TextContent>
          </PageSection>
          <AppImports />
        </Page>
      </NamespaceContext.Provider>
    </QueryClientProvider>
  </>
);

export default AppImportsPage;
