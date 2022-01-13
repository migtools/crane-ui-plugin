import * as React from 'react';
import Helmet from 'react-helmet';
import { match as Rmatch } from 'react-router-dom';
import { Page, PageSection, Text, TextContent, TextVariants, Title } from '@patternfly/react-core';

interface PipelineWizardPageProps {
  match: Rmatch<{ namespace: string }>;
}

const PipelineWizardPage: React.FunctionComponent<PipelineWizardPageProps> = ({ match }) => {
  const {
    params: { namespace },
  } = match;
  return (
    <>
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
        </PageSection>
      </Page>
    </>
  );
};

export default PipelineWizardPage;
