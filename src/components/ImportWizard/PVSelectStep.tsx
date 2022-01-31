import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { PersistentVolume } from '../../types/PersistentVolume';
import { MOCK_PERSISTENT_VOLUMES } from '../../mock/PersistentVolumes.mock';
import { isSameResource } from '../../utils/helpers';
import { useSortState } from '../../common/hooks/useSortState';

export const PVSelectStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).pvSelect;

  const pvs = MOCK_PERSISTENT_VOLUMES; // TODO load from a real query via proxy

  // TODO filter state -- move to lib-ui and add generics?
  const { sortBy, onSort, sortedItems } = useSortState(pvs, (pv) => [pv.spec.claimRef.name]);

  // TODO figure out if we need infinite-scroll? Look into how VirtualizedTable works in the SDK / Console?

  const { isItemSelected, toggleItemSelected, areAllSelected, selectAll } =
    useSelectionState<PersistentVolume>({
      items: pvs,
      isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
      externalState: [form.fields.selectedPVs.value, form.fields.selectedPVs.setValue],
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
      <TableComposable borders={false} variant="compact">
        <Thead>
          <Tr>
            <Th
              select={{
                onSelect: (_event, isSelecting) => selectAll(isSelecting),
                isSelected: areAllSelected,
              }}
            />
            <Th sort={{ sortBy, onSort, columnIndex: 0 }}>{columnNames.pvcName}</Th>
            <Th>{columnNames.storageClass}</Th>
            <Th>{columnNames.capacity}</Th>
            <Th>{columnNames.pvMigrationType}</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {sortedItems.map((pv, rowIndex) => (
            <Tr key={pv.metadata.name}>
              <Td
                select={{
                  rowIndex,
                  onSelect: (_event, isSelecting) => toggleItemSelected(pv, isSelecting),
                  isSelected: isItemSelected(pv),
                }}
              />
              <Td dataLabel={columnNames.pvcName}>{pv.spec.claimRef.name}</Td>
              <Td dataLabel={columnNames.storageClass}>{pv.spec.storageClassName}</Td>
              <Td dataLabel={columnNames.capacity}>{pv.spec.capacity.storage}</Td>
              <Td dataLabel={columnNames.pvMigrationType}>TODO state</Td>
              <Td modifier="fitContent">
                <a href="#" onClick={() => alert('TODO!')}>
                  View JSON {/* TODO see how this is done in MTC, or open a modal? */}
                </a>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};
