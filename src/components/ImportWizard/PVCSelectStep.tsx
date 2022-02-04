import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';

import { MOCK_PERSISTENT_VOLUME_CLAIMS } from 'src/mock/PersistentVolumes.mock';
import { getCapacity, isSameResource } from 'src/utils/helpers';
import { useSortState } from 'src/common/hooks/useSortState';
import { ImportWizardFormContext } from './ImportWizardFormContext';

export const PVCSelectStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const form = forms.pvcSelect;

  const pvcs = MOCK_PERSISTENT_VOLUME_CLAIMS; // TODO load from a real query via proxy

  // TODO filter state -- move to lib-ui and add generics?
  const { sortBy, onSort, sortedItems } = useSortState(pvcs, (pvc) => [pvc.metadata.name]);

  const { isItemSelected, toggleItemSelected, areAllSelected, selectAll } = useSelectionState({
    items: pvcs,
    isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
    externalState: [form.fields.selectedPVCs.value, form.fields.selectedPVCs.setValue],
  });

  const columnNames = {
    pvcName: 'PVC Name',
    storageClass: 'Storage class',
    capacity: 'Capacity',
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Select persistent volume claims</Text>
        <Text component="p">
          Select persistent volume claims to be copied to the target project.
        </Text>
      </TextContent>
      {/* TODO FilterToolbar -- do we want to actually move it to lib-ui now? */}
      <Form>
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
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems.map((pvc, rowIndex) => (
              <Tr key={pvc.metadata.name}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: (_event, isSelecting) => toggleItemSelected(pvc, isSelecting),
                    isSelected: isItemSelected(pvc),
                  }}
                />
                <Td dataLabel={columnNames.pvcName}>{pvc.metadata.name}</Td>
                <Td dataLabel={columnNames.storageClass}>{pvc.spec.storageClassName}</Td>
                <Td dataLabel={columnNames.capacity}>{getCapacity(pvc)}</Td>
                <Td modifier="fitContent">
                  <a href="#" onClick={() => alert('TODO!')}>
                    View JSON {/* TODO see how this is done in MTC, or open a modal? */}
                  </a>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </Form>
    </>
  );
};
