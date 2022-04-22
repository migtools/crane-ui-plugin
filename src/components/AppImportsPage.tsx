import * as React from 'react';
import Helmet from 'react-helmet';
import { match as RouteMatch } from 'react-router-dom';
import { Page, PageSection, Title, TextContent, Text } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppImports } from './AppImports/AppImports';
import { NamespaceContext } from 'src/context/NamespaceContext';
import { useWatchPipelines, useWatchPipelineRuns } from 'src/api/queries/pipelines';

const queryClient = new QueryClient();

interface AppImportsPageProps {
  match: RouteMatch<{ namespace: string }>;
}

const AppImportsPage: React.FunctionComponent<AppImportsPageProps> = ({
  match: {
    params: { namespace },
  },
}) => {
  const pipelines = useWatchPipelines();
  const pipelineRuns = useWatchPipelineRuns();

  return (
    <>
      <Helmet>
        <title>Crane - Pipeline Imports</title>
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <NamespaceContext.Provider value={namespace}>
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
        </NamespaceContext.Provider>
      </QueryClientProvider>
    </>
  );
};

export default AppImportsPage;
