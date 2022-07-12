import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { PageSection, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
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

export default ImportPage;
