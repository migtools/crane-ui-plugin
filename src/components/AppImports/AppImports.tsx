import * as React from 'react';
import {
  PageSection,
  Tabs,
  Tab,
  TabTitleText,
  Title,
  Grid,
  GridItem,
  Button,
  Dropdown,
  KebabToggle,
  DropdownItem,
} from '@patternfly/react-core';
import { TableComposable, Tbody, Thead, Tr, Th, Td } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PipelineKind, PipelineRunKind } from 'src/reused/pipelines-plugin/src/types';
// import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
// import { secretGVK } from 'src/api/queries/secrets';
// import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';
// import { useRunStageMutation } from 'src/api/queries/pipelines';
// import { } from 'src/api/pipelineHelpers';

// TODO move history stuff under the tabs
// TODO load pipelines and pipelineruns and group them by all resources owned by each cutover pipeline (runs sorted by latest first?)
// TODO render a tab for each group, buttons for stage/cutover
// TODO wire up useStartPipelineRunMutation for each button
// TODO remaining layout, text, stub out progress/status
// TODO progress/status

// TODO features: stage, cutover, refresh secrets, delete, ???
// TODO stage only for pipelines with PVCs - disable or hide button? tooltip?

interface IAppImportsProps {
  pipelines: {
    data: PipelineKind[];
    loaded: boolean;
    error: Error;
  };
  pipelineRuns: {
    data: PipelineRunKind[];
    loaded: boolean;
    error: Error;
  };
}

export const AppImports: React.FunctionComponent<IAppImportsProps> = ({
  pipelines,
  pipelineRuns,
}: IAppImportsProps) => {
  // const [pipelineRunSecret, setPipelineRunSecret] = React.useState(pipelineRuns?.data[0]?.spec?.params?.find(param => param.name === 'source-cluster-secret')?.name);

  // const [namespace] = useActiveNamespace();

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>('rocket-chat-cutover');

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: string | number,
  ) => {
    setActiveTabKey(eventKey);
  };

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

  console.log({ pipelines });

  return (
    <PageSection variant="light" type="tabs" className={spacing.pMd}>
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} isBox>
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
                  >
                    <Grid hasGutter className={spacing.ptMd}>
                      <GridItem span={6}>
                        <Title headingLevel="h3">{cutoverPipeline.metadata.name}</Title>
                      </GridItem>

                      <GridItem span={6}>
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
                          toggle={
                            <KebabToggle onToggle={toggleAppKebabOpen} id="toggle-id-app-kebab" />
                          }
                          isOpen={isAppKebabOpen}
                          isPlain
                          dropdownItems={appDropdownItems}
                        />
                      </GridItem>

                      <GridItem>
                        <TableComposable
                          aria-label="Pipeline import review"
                          variant="compact"
                          borders={false}
                          gridBreakPoint="grid"
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
                            <Tr>
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
                              <Td
                                className="pf-m-truncate"
                                dataLabel="Status"
                                aria-labelledby="status-heading"
                              >
                                Ready
                              </Td>
                            </Tr>
                          </Tbody>
                        </TableComposable>
                      </GridItem>
                    </Grid>
                    <Grid hasGutter>
                      <GridItem>
                        <Title headingLevel="h3">&quot;Pipeline&quot; history</Title>
                      </GridItem>

                      <GridItem></GridItem>

                      <GridItem>
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
                                      <Td
                                        className="pf-m-truncate"
                                        dataLabel=""
                                        aria-labelledby="delete-heading"
                                      >
                                        <Button
                                          variant="secondary"
                                          onClick={() =>
                                            alert(
                                              `todo implement delete for ${pipeline.metadata?.name}`,
                                            )
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
                      </GridItem>
                    </Grid>
                  </Tab>
                )
              );
            })}
      </Tabs>
    </PageSection>
  );
};
