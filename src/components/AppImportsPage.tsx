import * as React from 'react';
import Helmet from 'react-helmet';
import { Page, PageSection, Title, TextContent, Text } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppImports } from './AppImports/AppImports';
import { useWatchPipelines, useWatchPipelineRuns } from 'src/api/queries/pipelines';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

const queryClient = new QueryClient();

// TODO proper spinner / loading state?

const AppImportsPage: React.FunctionComponent = () => {
  const pipelines = useWatchPipelines();
  const pipelineRuns = useWatchPipelineRuns();
  const isLoading = !pipelines?.data.length || !pipelineRuns?.data.length;

  const [namespace] = useActiveNamespace();

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
          {namespace === '#ALL_NS#' ? (
            <h1>TODO: handle all-namespaces case</h1>
          ) : isLoading ? (
            <h1>TODO: spinner</h1>
          ) : (
            <AppImports pipelineRuns={pipelineRuns} pipelines={pipelines} />
          )}
        </Page>
      </QueryClientProvider>
    </>
  );
};

export default AppImportsPage;
