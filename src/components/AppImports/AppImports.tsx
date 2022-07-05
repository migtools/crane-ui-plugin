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

import './AppImports.css';
import { CranePipeline, CranePipelineRun } from 'src/api/types/Pipeline';

// import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
// import { secretGVK } from 'src/api/queries/secrets';
// import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
// import { useRunStageMutation } from 'src/api/queries/pipelines';
// import { } from 'src/api/pipelineHelpers';

// TODO load pipelines and pipelineruns and group them by all resources owned by each cutover pipeline (runs sorted by latest first?)
// TODO render a tab for each group, buttons for stage/cutover
// TODO wire up useStartPipelineRunMutation for each button
// TODO remaining layout, text, stub out progress/status
// TODO progress/status

// TODO features: stage, cutover, refresh secrets, delete, ???
// TODO stage only for pipelines with PVCs - disable or hide button? tooltip?
// TODO add a header button for starting a new import / take you to the wizard

interface IAppImportsProps {
  pipelines: {
    data: CranePipeline[];
    loaded: boolean;
    error: Error;
  };
  pipelineRuns: {
    data: CranePipelineRun[];
    loaded: boolean;
    error: Error;
  };
}

export const AppImports: React.FunctionComponent<IAppImportsProps> = ({
  pipelines,
  pipelineRuns,
}: IAppImportsProps) => {
  // TODO filter pipelines by cutover and stage - stateless pipelines don't have -cutover suffix, we need an annotation or label to distinguish cutover and stage pipelines

  // const [pipelineRunSecret, setPipelineRunSecret] = React.useState(pipelineRuns?.data[0]?.spec?.params?.find(param => param.name === 'source-cluster-secret')?.name);

  // const [namespace] = useActiveNamespace();

  const [activeCutoverPipelineName, setActiveCutoverPipelineName] = React.useState<string | number>(
    pipelines.data[0].metadata?.name || '', // TODO this needs to come from filtered cutover pipelines
  );

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

  const appDropdownItems = [
    <DropdownItem key="app-delete" component="button" onClick={() => alert('todo confirm delete')}>
      Delete
    </DropdownItem>,
    <DropdownItem
      key="app-view-pipelies"
      component="button"
      onClick={() => alert('todo view pipelines')}
    >
      View pipelines
    </DropdownItem>,
  ];

  // const [secretModel] = useK8sModel(secretGVK);

  // const runStageMutation = useRunStageMutation(() => {
  //   console.log('started cutover!');
  // });

  const activeCutoverPipeline = pipelines.data.find(
    (pipeline) => pipeline.metadata?.name === activeCutoverPipelineName,
  );
  const areTabsVisible = pipelines.data.length > 1;

  return (
    <>
      {areTabsVisible ? (
        <PageSection variant="light" type="tabs" className={`${spacing.pt_0} ${spacing.pbLg}`}>
          <Tabs
            activeKey={activeCutoverPipelineName}
            onSelect={(_event, tabKey) => setActiveCutoverPipelineName(tabKey)}
            className={spacing.pxLg}
          >
            {pipelines.data &&
              pipelines.data
                .filter(() => true) // TODO stateless pipelines don't have -cutover suffix, we need an annotation or label to distinguish cutover and stage pipelines
                .map((cutoverPipeline) => {
                  console.log('first ', cutoverPipeline);
                  return (
                    cutoverPipeline.metadata?.name && (
                      <Tab
                        eventKey={cutoverPipeline.metadata.name}
                        title={<TabTitleText>{cutoverPipeline.metadata.name}</TabTitleText>}
                      />
                    )
                  );
                })}
          </Tabs>
        </PageSection>
      ) : null}
      <PageSection variant="light" className={spacing.pt_0}>
        <Level hasGutter className={spacing.mbMd}>
          <Title headingLevel="h3">{activeCutoverPipeline?.metadata?.name}</Title>
          <LevelItem>
            <Button
              onClick={() => {
                // stagePipline
                // latest stagePipelineRun (filter on ownerReference & "-staged")
                // const hasPendingRun = pipelineRuns.data.some(run => run.spec.status === 'PipelineRunPending');
                // runStageMutation.mutate({stagePipelineRun, stagePipeline: cutoverPipeline});
              }}
              variant="secondary"
              className="pf-u-mr-sm"
            >
              Stage
            </Button>
            <Button
              onClick={() => {
                // alert(`todo start cutover for ${pipeline.metadata?.name}`)
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
              dropdownItems={appDropdownItems}
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
            <Th modifier="nowrap" id="source-project-heading">
              Source project
            </Th>
            <Th modifier="nowrap" id="pvc-heading">
              Persistant volume claims
            </Th>
            <Th modifier="nowrap" id="status-heading">
              Status
            </Th>
          </Thead>
          <Tbody>
            <Tr className={spacing.pl_0}>
              <Td
                className="pf-m-truncate"
                dataLabel="Source project"
                aria-labelledby="source-project-heading"
              >
                my-project
              </Td>
              <Td
                className="pf-m-truncate"
                dataLabel="Persistant volume claims"
                aria-labelledby="pvc-heading"
              >
                1
              </Td>
              <Td className="pf-m-truncate" dataLabel="Status" aria-labelledby="status-heading">
                Ready
              </Td>
            </Tr>
          </Tbody>
        </TableComposable>
        <Title headingLevel="h3" className={spacing.mbMd}>
          &quot;Pipeline&quot; history
        </Title>
        <TableComposable
          aria-label="Pipeline history"
          variant="compact"
          borders={false}
          gridBreakPoint="grid-md"
        >
          <Thead>
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
          </Thead>
          {/* TODO - empty-state here? */}
          <Tbody>
            {pipelineRuns.data &&
              pipelineRuns.data
                .filter((pipeline) => pipeline.metadata?.name?.includes('-stage'))
                .map((pipeline) => {
                  console.log('second ', pipeline);
                  console.log(pipeline?.metadata?.ownerReferences?.[0].uid);
                  return (
                    <Tr key={`${pipeline.metadata?.name}`}>
                      <Td
                        className="pf-m-truncate"
                        dataLabel="Pipeline run"
                        aria-labelledby="pipeline-run-heading"
                      >
                        {pipeline.metadata?.name}
                      </Td>
                      <Td
                        className="pf-m-truncate"
                        dataLabel="Executed"
                        aria-labelledby="executed-heading"
                      >
                        {pipeline.metadata?.creationTimestamp}
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
                            alert(`todo implement delete for ${pipeline.metadata?.name}`)
                          }
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
          </Tbody>

          {/* <Tbody>
                            {pipelines.data &&
                              pipelines.data
                                .filter((pipeline) => pipeline.metadata?.name?.includes('-stage'))
                                .map((pipeline) => {
                                  console.log('second ', pipeline);
                                  console.log(pipeline?.metadata?.ownerReferences?.[0].uid);
                                  return (
                                    <Tr key={`${pipeline.metadata?.name}`}>
                                      <Td
                                        className="pf-m-truncate"
                                        dataLabel="Pipeline run"
                                        aria-labelledby="pipeline-run-heading"
                                      >
                                        {pipeline.metadata?.name}
                                      </Td>
                                      <Td
                                        className="pf-m-truncate"
                                        dataLabel="Executed"
                                        aria-labelledby="executed-heading"
                                      >
                                        {pipeline.metadata?.creationTimestamp}
                                      </Td>
                                      <Td
                                        className="pf-m-truncate"
                                        dataLabel="Result"
                                        aria-labelledby="result-heading"
                                      >
                                        todo
                                      </Td>
                                      <Td
                                        className="pf-m-truncate"
                                        dataLabel=""
                                        aria-labelledby="delete-heading"
                                      >
                                        <Button
                                          variant="secondary"
                                          onClick={() =>
                                            alert(`todo implement delete for ${pipeline.metadata?.name}`)
                                          }
                                        >
                                          Delete
                                        </Button>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                          </Tbody> */}
        </TableComposable>
      </PageSection>
    </>
  );
};
