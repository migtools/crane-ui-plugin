import * as React from 'react';
import Helmet from 'react-helmet';
import { Page, PageSection, Title, TextContent, Text } from '@patternfly/react-core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppImports } from './AppImports/AppImports';
import { useWatchCranePipelineGroups } from 'src/api/queries/pipelines';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

const queryClient = new QueryClient();

// TODO proper looking loading / empty states

const AppImportsPage: React.FunctionComponent = () => {
  const { pipelineGroups, loaded, error } = useWatchCranePipelineGroups();

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
              {/* TODO does this subheading make sense when we only have one pipeline group / no tabs? */}
              <Text>Select a &quot;pipeline&quot; to import from another cluster.</Text>
            </TextContent>
          </PageSection>
          {namespace === '#ALL_NS#' ? (
            <h1>TODO: handle all-namespaces case</h1>
          ) : error ? (
            <h1>TODO: handle error case</h1>
          ) : !loaded ? (
            <h1>TODO: spinner</h1>
          ) : pipelineGroups.length === 0 ? (
            <h1>TODO: empty state</h1>
          ) : (
            <AppImports pipelineGroups={pipelineGroups} />
          )}
        </Page>
      </QueryClientProvider>
    </>
  );
};

export default AppImportsPage;
