import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { Page, PageSection, Text, TextContent, TextVariants, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TmpCrudTesting } from './TmpCrudTesting';
import { ImportWizard } from './ImportWizard/ImportWizard';

const queryClient = new QueryClient();

interface PipelineWizardPageProps {
  match: RouteMatch<{ namespace: string }>;
}

const ImportPage: React.FunctionComponent<PipelineWizardPageProps> = ({
  match: {
    params: { namespace },
  },
}) => (
  <QueryClientProvider client={queryClient}>
    <Helmet>
      <title>Crane</title>
    </Helmet>
    <Page>
      <PageSection variant="light">
        <Title headingLevel="h1">Smart Import Wizard Name</Title>
        <TmpCrudTesting namespace={namespace} />
      </PageSection>
      <PageSection variant="light" type="wizard">
        <ImportWizard />
      </PageSection>
    </Page>
  </QueryClientProvider>
);

export default ImportPage;
