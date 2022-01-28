import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { PersistentVolume } from '../../types/PersistentVolume';
import { MOCK_PERSISTENT_VOLUMES } from '../../mock/PersistentVolumes.mock';

export const PVSelectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).pvSelect;
  console.log('pvs select form', form);

  const pvs = MOCK_PERSISTENT_VOLUMES; // TODO load from a real query via proxy

  // TODO add sort and filter state -- move to lib-ui and add generics?
  const sortedItems = pvs;

  const { selectedItems, isItemSelected, toggleItemSelected, areAllSelected, selectAll } =
    useSelectionState<PersistentVolume>({
      items: pvs,
      isEqual: (a, b) => a === b, // TODO
      // TODO use externalState to save the selection in the form state
    });

  const columnNames = {
    pvcName: 'PVC Name',
    storageClass: 'Storage class',
    capacity: 'Capacity',
    pvMigrationType: 'PV migration type',
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Select persistent volumes</Text>
        <Text component="p">
          Select persistent volumes to be moved or copied to the target project.
        </Text>
      </TextContent>
      {/* TODO FilterToolbar -- do we want to actually move it to lib-ui now? */}
      {/* TODO do we need to remove the border on the bottom of the header row as in the mockups? */}
      <TableComposable borders={false}>
        <Thead>
          <Tr>
            <Th>{columnNames.pvcName}</Th>
            <Th>{columnNames.storageClass}</Th>
            <Th>{columnNames.capacity}</Th>
            <Th>{columnNames.pvMigrationType}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {sortedItems.map((pv) => (
            <Tr key={pv.metadata.name}>
              <Td dataLabel={columnNames.pvcName}>TODO</Td>
              <Td dataLabel={columnNames.storageClass}>TODO</Td>
              <Td dataLabel={columnNames.capacity}>TODO</Td>
              <Td dataLabel={columnNames.pvMigrationType}>TODO</Td>
              <Td modifier="fitContent">
                <a href="#">View JSON</a>
                {/* TODO see how this is done in MTC, or open a modal? */}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};
