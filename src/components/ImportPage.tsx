import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { Page, PageSection, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TmpCrudTesting } from './TmpCrudTesting';
import { ImportWizard } from './ImportWizard/ImportWizard';
import { NamespaceContext } from 'src/context/NamespaceContext';

const queryClient = new QueryClient();

interface PipelineWizardPageProps {
  match: RouteMatch<{ namespace: string }>;
}

const ImportPage: React.FunctionComponent<PipelineWizardPageProps> = ({
  match: {
    params: { namespace },
  },
}) => (
  <>
    <Helmet>
      <title>Crane</title>
    </Helmet>
    <QueryClientProvider client={queryClient}>
      <NamespaceContext.Provider value={namespace}>
        <Page>
          <PageSection variant="light">
            <Title headingLevel="h1">Smart Import Wizard Name</Title>
            <TmpCrudTesting />
          </PageSection>
          <PageSection variant="light" type="wizard">
            <ImportWizard />
          </PageSection>
        </Page>
      </NamespaceContext.Provider>
    </QueryClientProvider>
  </>
);

export default ImportPage;
