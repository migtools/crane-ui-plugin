import * as React from 'react';
import Helmet from 'react-helmet';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  Page,
  PageSection,
  Title,
  TextContent,
  Text,
  Level,
  Button,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { useDeletePipelineMutation, useWatchCranePipelineGroups } from 'src/api/queries/pipelines';
import { AppImportsBody } from './AppImports/AppImportsBody';
import './AppImports/AppImports.css';

const queryClient = new QueryClient();

const AppImportsPageWrapper: React.FunctionComponent = () => (
  <>
    <Helmet>
      <title>Application Imports</title>
    </Helmet>
    <QueryClientProvider client={queryClient}>
      <AppImportsPage />
    </QueryClientProvider>
  </>
);

// TODO proper looking loading / empty states

const AppImportsPage: React.FunctionComponent = () => {
  const { pipelineGroups, loaded, error } = useWatchCranePipelineGroups();
  const [namespace] = useActiveNamespace();
  const {
    params: { importName: activeCutoverPipelineName },
  } = useRouteMatch<{ importName: string }>();
  const history = useHistory();

  const setActiveCutoverPipelineName = React.useCallback(
    (name: string, op: 'push' | 'replace' = 'push') =>
      history[op](`/application-imports/ns/${namespace}/${name}`),
    [history, namespace],
  );

  // If pipeline groups are loaded and we don't have one selected, select the first one.
  React.useEffect(() => {
    if (
      !activeCutoverPipelineName &&
      loaded &&
      pipelineGroups.length > 0 &&
      pipelineGroups[0].pipelines.cutover.metadata?.name
    ) {
      setActiveCutoverPipelineName(pipelineGroups[0].pipelines.cutover.metadata?.name, 'replace');
    }
  }, [activeCutoverPipelineName, loaded, pipelineGroups, setActiveCutoverPipelineName]);

  const areTabsVisible = pipelineGroups.length > 1;
  const activePipelineGroup = pipelineGroups.find(
    (group) => group.pipelines.cutover.metadata.name === activeCutoverPipelineName,
  );

  const deletePipelineMutation = useDeletePipelineMutation();

  // The onSuccess of deletePipelineMutation is not enough to know the data is gone, we have to wait for useWatchCranePipelineGroups to catch up.
  // If we just deleted the current group and it no longer exists in the watched groups, reset the deletion state and navigate away from the deleted group's route.
  React.useEffect(() => {
    if (
      deletePipelineMutation.isSuccess &&
      deletePipelineMutation.variables?.metadata.name === activeCutoverPipelineName &&
      !activePipelineGroup
    ) {
      deletePipelineMutation.reset();
      history.replace(`/application-imports/ns/${namespace}`);
    }
  }, [activeCutoverPipelineName, activePipelineGroup, deletePipelineMutation, history, namespace]);

  return (
    <Page>
      <PageSection variant="light">
        <Level>
          <TextContent>
            <Title headingLevel="h1">Application Imports</Title>
            {/* TODO does this subheading make sense when we only have one pipeline group / no tabs? */}
            <Text>Select a &quot;pipeline&quot; to import from another cluster.</Text>
          </TextContent>
          {namespace !== '#ALL_NS#' ? (
            <Button
              className={spacing.mxMd}
              onClick={() => history.push(`/import-application/ns/${namespace}`)}
              // TODO this button should be in the empty state instead when we have an empty state
            >
              Start a new import
            </Button>
          ) : null}
        </Level>
      </PageSection>
      {namespace === '#ALL_NS#' ? (
        <h1>TODO: handle all-namespaces case</h1>
      ) : error ? (
        <h1>TODO: handle error case</h1>
      ) : loaded && pipelineGroups.length === 0 ? (
        <h1>TODO: empty state w/ button</h1>
      ) : !loaded || !activePipelineGroup || !deletePipelineMutation.isIdle ? (
        <h1>TODO: spinner</h1>
      ) : (
        <>
          {areTabsVisible ? (
            <PageSection variant="light" type="tabs" className={`${spacing.pt_0} ${spacing.pbLg}`}>
              <Tabs
                activeKey={activeCutoverPipelineName}
                onSelect={(_event, tabKey) => setActiveCutoverPipelineName(tabKey as string)}
                className={spacing.pxLg}
              >
                {pipelineGroups.map((group) => (
                  <Tab
                    key={group.pipelines.cutover.metadata.name}
                    eventKey={group.pipelines.cutover.metadata.name || ''}
                    title={<TabTitleText>{group.pipelines.cutover.metadata.name}</TabTitleText>}
                  />
                ))}
              </Tabs>
            </PageSection>
          ) : null}
          <AppImportsBody
            pipelineGroup={activePipelineGroup}
            deletePipelineMutation={deletePipelineMutation}
          />
        </>
      )}
    </Page>
  );
};

export default AppImportsPageWrapper;
