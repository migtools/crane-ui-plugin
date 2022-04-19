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
  // ToolbarItem
} from '@patternfly/react-core';
import { TableComposable, Tbody, Thead, Tr, Th, Td } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const AppImports: React.FunctionComponent = () => {
  // const history = useHistory();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

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
                <Button>Copy PVC data</Button>
                <Button>Cutover</Button>
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

          <Tab eventKey={1} title={<TabTitleText>application-1</TabTitleText>}>
            stub
          </Tab>

        </Tabs>

      </PageSection>

      <PageSection variant="light" type="default" className={spacing.pMd}>
        <Grid>
          <GridItem>
            <Title headingLevel="h3">"Pipeline" history</Title>
          </GridItem>
          <GridItem>
            <Toolbar>
              {/* toolbar items */}
            </Toolbar>
            <div>sortable table here</div>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};
