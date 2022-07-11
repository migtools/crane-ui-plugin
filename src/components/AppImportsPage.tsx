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
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { useDeletePipelineMutation, useWatchCranePipelineGroups } from 'src/api/queries/pipelines';
import { AppImportsBody } from './AppImports/AppImportsBody';
import './AppImports/AppImports.css';
import { watchErrorToString } from 'src/utils/helpers';

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
    params: { pipelineGroupName: activePipelineGroupName },
  } = useRouteMatch<{ pipelineGroupName: string }>();
  const history = useHistory();

  const setActivePipelineGroupName = React.useCallback(
    (name: string, op: 'push' | 'replace' = 'push') =>
      history[op](`/application-imports/ns/${namespace}/${name}`),
    [history, namespace],
  );

  // If pipeline groups are loaded and we don't have one selected, or we have one selected that doesn't exist, select the first one
  React.useEffect(() => {
    if (
      loaded &&
      pipelineGroups.length > 0 &&
      (!activePipelineGroupName ||
        !pipelineGroups.find(({ name }) => name === activePipelineGroupName))
    ) {
      setActivePipelineGroupName(pipelineGroups[0].name, 'replace');
    }
  }, [activePipelineGroupName, loaded, pipelineGroups, setActivePipelineGroupName]);

  const areTabsVisible = pipelineGroups.length > 1;
  const activePipelineGroup = pipelineGroups.find(({ name }) => name === activePipelineGroupName);

  const deletePipelineMutation = useDeletePipelineMutation();

  // The onSuccess of deletePipelineMutation is not enough to know the data is gone, we have to wait for useWatchCranePipelineGroups to catch up.
  // If we just deleted the current group and it no longer exists in the watched groups, reset the deletion state and navigate away from the deleted group's route.
  React.useEffect(() => {
    const groupBeingDeletedName =
      deletePipelineMutation.variables?.metadata.annotations?.['crane-ui-plugin.konveyor.io/group'];
    if (
      deletePipelineMutation.isSuccess &&
      groupBeingDeletedName === activePipelineGroupName &&
      !activePipelineGroup
    ) {
      console.log('NAVIGATING AFTER DELETE');
      deletePipelineMutation.reset();
      history.replace(`/application-imports/ns/${namespace}`);
    }
  }, [activePipelineGroupName, activePipelineGroup, deletePipelineMutation, history, namespace]);

  return (
    <Page>
      <PageSection variant="light">
        <Level>
          <TextContent>
            <Title headingLevel="h1">Application Imports</Title>
            <Text>View status and take actions on your application import pipelines.</Text>
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
        <Alert
          variant="danger"
          title="Cannot load Pipelines and PipelineRuns"
          className={spacing.mLg}
        >
          {watchErrorToString(error)}
        </Alert>
      ) : loaded && pipelineGroups.length === 0 ? (
        <h1>TODO: empty state w/ button</h1>
      ) : !loaded || !activePipelineGroup || !deletePipelineMutation.isIdle ? (
        <h1>TODO: spinner</h1>
      ) : (
        <>
          {areTabsVisible ? (
            <PageSection variant="light" type="tabs" className={`${spacing.pt_0} ${spacing.pbLg}`}>
              <Tabs
                activeKey={activePipelineGroupName}
                onSelect={(_event, tabKey) => setActivePipelineGroupName(tabKey as string)}
                className={spacing.pxLg}
              >
                {pipelineGroups.map((group) => (
                  <Tab
                    key={group.name}
                    eventKey={group.name}
                    title={<TabTitleText>{group.name}</TabTitleText>}
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
