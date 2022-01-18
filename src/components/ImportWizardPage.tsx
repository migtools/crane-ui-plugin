import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { Page, PageSection, Text, TextContent, TextVariants, Title } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TmpCrudTesting } from './TmpCrudTesting';

const queryClient = new QueryClient();

interface PipelineWizardPageProps {
  match: RouteMatch<{ namespace: string }>;
}

const ImportWizardPage: React.FunctionComponent<PipelineWizardPageProps> = ({
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
        <Title headingLevel="h1">Hello, Crane!</Title>
      </PageSection>
      <PageSection variant="light">
        <TextContent>
          <Text component={TextVariants.p}>Wizard goes here! Using namespace: {namespace}</Text>
        </TextContent>
        <TmpCrudTesting namespace={namespace} />
      </PageSection>
    </Page>
  </QueryClientProvider>
);

export default ImportWizardPage;
