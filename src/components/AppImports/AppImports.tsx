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
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { TableComposable, Tbody, Thead, Tr, Th, Td } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useWatchPipelines } from 'src/api/queries/pipelines';

export const AppImports: React.FunctionComponent = () => {

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const pipelines = useWatchPipelines();

  const handleTabClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, eventKey: string | number) => {
    setActiveTabKey(eventKey);
  }

  const onFocus = () => {
    const element = document.getElementById('toggle-id-0');
    element?.focus();
  };

  const [isKebabOpen, toggleKebabOpen] = React.useReducer((isOpen) => !isOpen, false);

  const onKebabSelect = (event?: React.SyntheticEvent<HTMLDivElement, Event> | undefined) => {
    toggleKebabOpen();
    onFocus();
  }

  const dropdownItems = [
    <DropdownItem key="delete" component="button">Delete</DropdownItem>,
    <DropdownItem key="view-pipelies" component="button">
      View pipelines
    </DropdownItem>
  ]

  return (
    <>
      <PageSection variant="light" type="tabs" className={spacing.pMd}>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} isBox>
          <Tab eventKey={0} title={<TabTitleText>application-0</TabTitleText>}>

            <Grid hasGutter className={spacing.ptMd}>

              <GridItem span={6}>
                <Title headingLevel="h3">application-0</Title>
              </GridItem>

              <GridItem span={6}>
                <Button variant="secondary" className="pf-u-mr-sm">Copy PVC data</Button>
                <Button variant="secondary">Cutover</Button>
                <Dropdown
                  onSelect={onKebabSelect}
                  toggle={<KebabToggle onToggle={toggleKebabOpen} id="toggle-id-0" />}
                  isOpen={isKebabOpen}
                  isPlain
                  dropdownItems={dropdownItems}
                />
              </GridItem>

              <GridItem>
                <TableComposable aria-label="Application import review" variant="compact" borders={false} gridBreakPoint="grid">
                  <Thead>
                    <Th modifier="nowrap" id="source-project-heading">Source project</Th>
                    <Th modifier="nowrap" id="pvc-heading">Persistant volume claims</Th>
                    <Th modifier="nowrap" id="status-heading">Status</Th>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td className="pf-m-truncate" dataLabel="Source project" aria-labelledby="source-project-heading">my-project</Td>
                      <Td className="pf-m-truncate" dataLabel="Persistant volume claims" aria-labelledby="pvc-heading">1</Td>
                      <Td className="pf-m-truncate" dataLabel="Status" aria-labelledby="status-heading">Ready</Td>
                    </Tr>
                  </Tbody>
                </TableComposable>
              </GridItem>

            </Grid>

          </Tab>

          <Tab isDisabled eventKey={1} title={<TabTitleText>application-1</TabTitleText>}>
            stub
          </Tab>

        </Tabs>

      </PageSection>

      <PageSection variant="light" type="default" className={spacing.pMd}>
        <Grid hasGutter>
          <GridItem>
            <Title headingLevel="h3">"Pipeline" history</Title>
          </GridItem>

          <GridItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>filter 1</ToolbarItem>
                <ToolbarItem>filter 2</ToolbarItem>
                <ToolbarItem>button</ToolbarItem>
                <ToolbarItem>button</ToolbarItem>
                <ToolbarItem>kebab-dropdown</ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </GridItem>

          <GridItem>
            <TableComposable aria-label="Pipeline history" variant="compact" borders={false} gridBreakPoint="grid-md">
              <Thead>
                <Th modifier="nowrap" id="pipeline-run-heading">Pipeline run</Th>
                <Th modifier="nowrap" id="executed-heading">Executed</Th>
                <Th modifier="nowrap" id="result-heading">Result</Th>
                <Th modifier="nowrap" id="delete-heading"></Th>
              </Thead>
              <Tbody>

                {pipelines && pipelines.data && pipelines.data.map((el) => {
                  console.log(el);
                  return (
                    <Tr>
                      <Td className="pf-m-truncate" dataLabel="Pipeline run" aria-labelledby="pipeline-run-heading">{el.metadata?.name}</Td>
                      <Td className="pf-m-truncate" dataLabel="Executed" aria-labelledby="executed-heading">{el.metadata?.creationTimestamp}</Td>
                      <Td className="pf-m-truncate" dataLabel="Result" aria-labelledby="result-heading">todo</Td>
                      <Td className="pf-m-truncate" dataLabel="" aria-labelledby="delete-heading">
                        <Button variant="secondary" onClick={() => alert('todo')}>Delete</Button>
                      </Td>
                    </Tr>
                  )
                })}

              </Tbody>
            </TableComposable>

          </GridItem>

        </Grid>
      </PageSection>
    </>
  );
};
