import * as React from 'react';
import { TextContent, Text, Form, Popover, Button } from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import {
  ListPageFilter,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import { useSortState } from 'src/common/hooks/useSortState';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { ImportWizardFormContext } from './ImportWizardFormContext';
import { PVCEditStepTableRow } from './PVCEditStepTableRow';

export const columnNames = {
  sourcePvcName: 'Source PVC name',
  targetPvcName: 'Target PVC name',
  storageClass: 'Storage class',
  capacity: 'Capacity',
  verifyCopy: 'Verify copy',
};

export const PVCEditStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const form = forms.pvcEdit;
  const { selectedPVCs } = forms.pvcSelect.values;

  const rowFilters: RowFilter<PersistentVolumeClaim>[] = []; // TODO do we need to add one here for storage classes, by the available ones in the source?
  const [data, filteredData, onFilterChange] = useListPageFilter(selectedPVCs, rowFilters);
  const { sortBy, onSort, sortedItems } = useSortState(filteredData, (pvc) => [
    pvc.metadata?.name || '',
  ]);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Edit persistent volume claims</Text>
        <Text component="p">
          Change properties of persistent volume claims when copied to the target project. Also,
          select whether the copy should be verified on the target.
        </Text>
      </TextContent>
      <ListPageFilter
        data={data}
        loaded
        rowFilters={rowFilters}
        onFilterChange={onFilterChange}
        hideLabelFilter
      />
      <Form>
        <TableComposable borders={false} variant="compact">
          <Thead>
            <Tr>
              <Th sort={{ sortBy, onSort, columnIndex: 0 }}>{columnNames.sourcePvcName}</Th>
              <Th>{columnNames.targetPvcName}</Th>
              <Th width={20}>{columnNames.storageClass}</Th>
              <Th>{columnNames.capacity}</Th>
              <Th textCenter>
                {columnNames.verifyCopy}
                <Popover
                  position="top"
                  bodyContent={
                    <>
                      Enables checksum verification after copy. Each file is verified with a
                      checksum, which significantly reduces performance. See the product
                      documentation for more information.
                    </>
                  }
                >
                  <Button
                    aria-label="More info for verify copy column"
                    variant="link"
                    isInline
                    className={`${spacing.mlSm} inline-help-popover-icon`}
                  >
                    <HelpIcon />
                  </Button>
                </Popover>
              </Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems.map((pvc) => {
              const pvcName = pvc.metadata?.name || '';
              return (
                <PVCEditStepTableRow
                  key={pvcName}
                  pvc={pvc}
                  existingValues={form.values.editValuesByPVC[pvcName]}
                  setEditedValues={(newValues) => {
                    form.fields.editValuesByPVC.setValue((oldValues) => ({
                      ...oldValues,
                      [pvcName]: newValues,
                    }));
                  }}
                  isEditMode={form.values.isEditModeByPVC[pvcName]}
                  setIsEditMode={(isEditMode) => {
                    form.fields.isEditModeByPVC.setValue((oldValues) => ({
                      ...oldValues,
                      [pvcName]: isEditMode,
                    }));
                  }}
                />
              );
            })}
          </Tbody>
        </TableComposable>
      </Form>
    </>
  );
};
