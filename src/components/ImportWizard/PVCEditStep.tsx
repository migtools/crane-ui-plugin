import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { useSortState } from 'src/common/hooks/useSortState';
import { ImportWizardFormContext } from './ImportWizardFormContext';
import { PVEditStepTableRow } from './PVCEditStepTableRow';

export const columnNames = {
  sourcePvcName: 'Source PVC name',
  targetPvcName: 'Target PVC name',
  storageClass: 'Storage class',
  capacity: 'Capacity',
  verifyCopy: 'Verify copy',
};

export const PVEditStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const form = forms.pvEdit;
  const { selectedPVCs } = forms.pvSelect.values;

  // TODO filter state -- move to lib-ui and add generics?
  const { sortBy, onSort, sortedItems } = useSortState(selectedPVCs, (pvc) => [pvc.metadata.name]);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Edit persistent volume claims</Text>
        <Text component="p">
          Change properties of persistent volume claims when copied to the target project. Also,
          select whether the copy should be verified on the target.
        </Text>
      </TextContent>
      {/* TODO FilterToolbar -- do we want to actually move it to lib-ui now? */}
      <Form>
        <TableComposable borders={false} variant="compact">
          <Thead>
            <Tr>
              <Th sort={{ sortBy, onSort, columnIndex: 0 }}>{columnNames.sourcePvcName}</Th>
              <Th>{columnNames.targetPvcName}</Th>
              <Th width={20}>{columnNames.storageClass}</Th>
              <Th>{columnNames.capacity}</Th>
              <Th textCenter>{columnNames.verifyCopy}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems.map((pvc) => (
              <PVEditStepTableRow
                key={pvc.metadata.name}
                pvc={pvc}
                existingValues={form.values.editValuesByPVC[pvc.metadata.name]}
                setEditedValues={(newValues) => {
                  form.fields.editValuesByPVC.setValue((oldValues) => ({
                    ...oldValues,
                    [pvc.metadata.name]: newValues,
                  }));
                }}
                isEditMode={form.values.isEditModeByPVC[pvc.metadata.name]}
                setIsEditMode={(isEditMode) => {
                  form.fields.isEditModeByPVC.setValue((oldValues) => ({
                    ...oldValues,
                    [pvc.metadata.name]: isEditMode,
                  }));
                }}
              />
            ))}
          </Tbody>
        </TableComposable>
      </Form>
    </>
  );
};
