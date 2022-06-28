import * as React from 'react';
import Helmet from 'react-helmet';
import { Page, PageSection, Title, TextContent, Text } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppImports } from './AppImports/AppImports';
import { useWatchPipelines, useWatchPipelineRuns } from 'src/api/queries/pipelines';

const queryClient = new QueryClient();

const AppImportsPage: React.FunctionComponent = () => {
  const pipelines = useWatchPipelines();
  const pipelineRuns = useWatchPipelineRuns();

  return (
    <>
      <Helmet>
        <title>Crane - Pipeline Imports</title>
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <Page>
          <PageSection variant="light">
            <TextContent>
              <Title headingLevel="h1">Pipeline Imports</Title>
              <Text>Select a &quot;pipeline&quot; to import from another cluster.</Text>
            </TextContent>
          </PageSection>
          {pipelines && pipelines.data && pipelineRuns && pipelineRuns.data && (
            <AppImports pipelineRuns={pipelineRuns} pipelines={pipelines} />
          )}
        </Page>
      </QueryClientProvider>
    </>
  );
};

export default AppImportsPage;
