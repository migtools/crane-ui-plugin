import * as React from 'react';
import Helmet from 'react-helmet';
import { PageSection, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ImportWizard } from './ImportWizard/ImportWizard';

const queryClient = new QueryClient();

const ImportPage: React.FunctionComponent = () => (
  <>
    <Helmet>
      <title>Crane</title>
    </Helmet>
    <QueryClientProvider client={queryClient}>
      <PageSection variant="light">
        <Title headingLevel="h1">Import application</Title>
      </PageSection>
      <PageSection variant="light" type="wizard">
        <ImportWizard />
      </PageSection>
    </QueryClientProvider>
  </>
);

export default ImportPage;
