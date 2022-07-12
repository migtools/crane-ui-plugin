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
  EmptyState,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

import { useDeletePipelineMutation, useWatchCranePipelineGroups } from 'src/api/queries/pipelines';
import { watchErrorToString } from 'src/utils/helpers';
import { NamespaceContext } from 'src/context/NamespaceContext';

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
  const {
    params: { pipelineGroupName: activePipelineGroupName, namespace },
  } = useRouteMatch<{ pipelineGroupName: string; namespace: string }>();
  const history = useHistory();

  const setActivePipelineGroupName = React.useCallback(
    (name: string, op: 'push' | 'replace' = 'push') =>
      history[op](`/app-imports/ns/${namespace}/${name}`),
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
      deletePipelineMutation.reset();
      history.replace(`/app-imports/ns/${namespace}`);
    }
  }, [activePipelineGroupName, activePipelineGroup, deletePipelineMutation, history, namespace]);

  const isEmptyState = loaded && pipelineGroups.length === 0;
  const goToImportWizard = () => history.push(`/app-imports/new/ns/${namespace}`);

  return (
    <NamespaceContext.Provider value={namespace}>
      <Page>
        <PageSection variant="light">
          <Level>
            <TextContent>
              <Title headingLevel="h1">Application Imports</Title>
              <Text>View status and take actions on your application import pipelines.</Text>
            </TextContent>
            {namespace !== '#ALL_NS#' && !isEmptyState ? (
              <Button className={spacing.mxMd} onClick={goToImportWizard}>
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
        ) : isEmptyState ? (
          <EmptyState variant="large" className={spacing.mtXl}>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h4" size="lg">
              No application imports yet
            </Title>
            <Button variant="primary" onClick={goToImportWizard}>
              Start a new import
            </Button>
          </EmptyState>
        ) : !loaded || !activePipelineGroup || !deletePipelineMutation.isIdle ? (
          <EmptyState className={spacing.mtXl}>
            <EmptyStateIcon variant="container" component={Spinner} />
            <Title size="lg" headingLevel="h4">
              Loading
            </Title>
          </EmptyState>
        ) : (
          <>
            {areTabsVisible ? (
              <PageSection
                variant="light"
                type="tabs"
                className={`${spacing.pt_0} ${spacing.pbLg}`}
              >
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
    </NamespaceContext.Provider>
  );
};

export default AppImportsPageWrapper;
