import * as React from 'react';
import {
  PageSection,
  Tabs,
  Tab,
  TabTitleText,
  Title,
  Button,
  Dropdown,
  KebabToggle,
  DropdownItem,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Thead, Tr, Th, Td } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';

import './AppImports.css';
import { getPipelineGroupSourceNamespace } from 'src/api/pipelineHelpers';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { useDeletePipelineMutation } from 'src/api/queries/pipelines';

// TODO wire up useStartPipelineRunMutation for each button
// TODO progress/status

// TODO features: stage, cutover, refresh secrets, delete, ???
// TODO stage only for pipelines with PVCs - disable or hide button? tooltip?
// TODO add a header button for starting a new import / take you to the wizard

interface IAppImportsProps {
  pipelineGroups: CranePipelineGroup[];
}

export const AppImports: React.FunctionComponent<IAppImportsProps> = ({ pipelineGroups }) => {
  const [namespace] = useActiveNamespace();
  const {
    params: { importName: activeCutoverPipelineName },
  } = useRouteMatch<{ importName: string }>();
  const history = useHistory();

  const setActiveCutoverPipelineName = React.useCallback(
    (name: string, op: 'replace' | 'push' = 'push') =>
      history[op](`/application-imports/ns/${namespace}/${name}`),
    [history, namespace],
  );

  console.log({ activeCutoverPipelineName });

  React.useEffect(() => {
    if (!activeCutoverPipelineName && pipelineGroups[0].pipelines.cutover.metadata?.name) {
      setActiveCutoverPipelineName(pipelineGroups[0].pipelines.cutover.metadata?.name, 'replace');
    }
  }, [activeCutoverPipelineName, pipelineGroups, setActiveCutoverPipelineName]);

  // TODO is this working? does the element exist when focus is attempted? (renders when kebab opens)
  const onFocus = (id: string) => {
    const element = document.getElementById(id);
    element?.focus();
  };

  const [isAppKebabOpen, toggleAppKebabOpen] = React.useReducer((isOpen) => !isOpen, false);

  const onAppKebabSelect = () => {
    toggleAppKebabOpen();
    onFocus('toggle-id-app-kebab');
  };

  const activePipelineGroup = pipelineGroups.find(
    (group) => group.pipelines.cutover.metadata.name === activeCutoverPipelineName,
  );
  const areTabsVisible = pipelineGroups.length > 1;

  console.log({ activePipelineGroup });

  const nonPendingPipelineRuns = activePipelineGroup?.pipelineRuns.all.filter(
    (pipelineRun) => pipelineRun.spec.status !== 'PipelineRunPending',
  );

  const deletePipelineMutation = useDeletePipelineMutation();

  if (!activeCutoverPipelineName) return null; // TODO do we want to lift the tabs out to AppImportsPage and have this be part of the spinner case?

  return (
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
      <PageSection variant="light" className={spacing.pt_0}>
        <Level hasGutter className={spacing.mbMd}>
          <Title headingLevel="h3">{activePipelineGroup?.pipelines.cutover.metadata.name}</Title>
          {/* TODO this will result in '-cutover' being in the tab itself... do we need an annotation for the name prefix / group name? */}
          <LevelItem>
            {/* TODO add tooltip on disabled stage when there are no PVCs */}
            <Button
              onClick={() => {
                // TODO add a confirm modal here, call mutation, then redirect to PLR page
                alert(
                  `todo start stage for ${activePipelineGroup?.pipelines.stage?.metadata?.name}`,
                );
              }}
              variant="secondary"
              className="pf-u-mr-sm"
              isAriaDisabled={!activePipelineGroup?.pipelines.stage}
            >
              Stage
            </Button>
            <Button
              onClick={() => {
                // TODO add a confirm modal here, call mutation, then redirect to PLR page
                alert(
                  `todo start cutover for ${activePipelineGroup?.pipelines.cutover.metadata?.name}`,
                );
              }}
              variant="secondary"
            >
              Cutover
            </Button>
            <Dropdown
              onSelect={onAppKebabSelect}
              toggle={<KebabToggle onToggle={toggleAppKebabOpen} id="toggle-id-app-kebab" />}
              isOpen={isAppKebabOpen}
              isPlain
              position="right"
              dropdownItems={[
                <DropdownItem
                  key="app-delete"
                  component="button"
                  onClick={() =>
                    // TODO add a confirmation dialog!
                    activePipelineGroup &&
                    deletePipelineMutation.mutate(activePipelineGroup?.pipelines.cutover)
                  }
                  isDisabled={deletePipelineMutation.isLoading} // TODO do we maybe want to put the whole page in a loading state while a delete happens?
                >
                  Delete
                </DropdownItem>,
                <DropdownItem
                  key="app-view-pipelies"
                  component="button"
                  onClick={() => history.push(`/dev-pipelines/ns/${namespace}`)}
                >
                  View pipelines
                </DropdownItem>,
              ]}
            />
          </LevelItem>
        </Level>
        <TableComposable
          aria-label="Pipeline import review"
          variant="compact"
          borders={false}
          gridBreakPoint="grid"
          className={`summary-table ${spacing.mbLg}`}
        >
          <Thead>
            <Tr>
              <Th modifier="nowrap" id="source-project-heading">
                Source project
              </Th>
              <Th modifier="nowrap" id="pvc-heading">
                Persistant volume claims
              </Th>
              <Th modifier="nowrap" id="status-heading">
                Status
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr className={spacing.pl_0}>
              <Td
                className="pf-m-truncate"
                dataLabel="Source project"
                aria-labelledby="source-project-heading"
              >
                {getPipelineGroupSourceNamespace(activePipelineGroup)}
              </Td>
              <Td
                className="pf-m-truncate"
                dataLabel="Persistant volume claims"
                aria-labelledby="pvc-heading"
              >
                TODO (number of PVCs)
              </Td>
              <Td className="pf-m-truncate" dataLabel="Status" aria-labelledby="status-heading">
                TODO (status -- basic text, or maybe try to reuse status from pipelines UI)
              </Td>
            </Tr>
          </Tbody>
        </TableComposable>
        <Title headingLevel="h3" className={spacing.mbMd}>
          Import pipeline history
        </Title>
        {nonPendingPipelineRuns?.length === 0 ? (
          <h1>TODO: empty state</h1>
        ) : (
          <TableComposable aria-label="Pipeline history" variant="compact">
            <Thead>
              <Tr>
                <Th modifier="nowrap" id="pipeline-run-heading">
                  Pipeline run
                </Th>
                <Th modifier="nowrap" id="executed-heading">
                  Executed
                </Th>
                <Th modifier="nowrap" id="result-heading">
                  Result
                </Th>
                <Th modifier="nowrap" id="delete-heading"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {activePipelineGroup?.pipelineRuns.all
                .filter((pipelineRun) => pipelineRun.spec.status !== 'PipelineRunPending')
                .map((pipelineRun) => (
                  <Tr key={`${pipelineRun.metadata?.name}`}>
                    <Td
                      className="pf-m-truncate"
                      dataLabel="Pipeline run"
                      aria-labelledby="pipeline-run-heading"
                    >
                      {pipelineRun.metadata?.name}
                    </Td>
                    <Td
                      className="pf-m-truncate"
                      dataLabel="Executed"
                      aria-labelledby="executed-heading"
                    >
                      TODO this needs to be time it was removed from pending?
                      {pipelineRun.metadata?.creationTimestamp}
                    </Td>
                    <Td
                      className="pf-m-truncate"
                      dataLabel="Result"
                      aria-labelledby="result-heading"
                    >
                      todo
                    </Td>
                    <Td className="pf-m-truncate" dataLabel="" aria-labelledby="delete-heading">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          alert(`todo implement delete for ${pipelineRun.metadata?.name}`)
                        }
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </TableComposable>
        )}
      </PageSection>
    </>
  );
};
