import * as React from 'react';
import ReactJson from 'react-json-view';
import { TextContent, Text, Form, Popover, Button } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import {
  ListPageFilter,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { ResolvedQuery, useSelectionState } from '@konveyor/lib-ui';

import { getCapacity, isSameResource } from 'src/utils/helpers';
import { useSortState } from 'src/common/hooks/useSortState';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { useSourcePVCsQuery } from 'src/api/queries/sourceResources';
import { ImportWizardFormContext } from './ImportWizardFormContext';
import { TableEmptyState } from 'src/common/components/TableEmptyState';

const EMPTY_PVCS: PersistentVolumeClaim[] = [];

export const PVCSelectStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const form = forms.pvcSelect;

  // Start with all PVCs selected once they are loaded, but be sure to only do this once
  const sourcePVCsQuery = useSourcePVCsQuery(forms.sourceClusterProject.values);
  const pvcs = sourcePVCsQuery.data?.data.items || EMPTY_PVCS;
  const hasPreselectedPVCsRef = React.useRef(false);
  React.useEffect(() => {
    if (
      !hasPreselectedPVCsRef.current &&
      pvcs.length > 0 &&
      forms.pvcSelect.fields.selectedPVCs.value.length === 0 &&
      !forms.pvcSelect.fields.selectedPVCs.isTouched
    ) {
      forms.pvcSelect.fields.selectedPVCs.setValue(pvcs);
      hasPreselectedPVCsRef.current = true;
    }
  }, [pvcs, forms.pvcSelect.fields.selectedPVCs]);

  const rowFilters: RowFilter<PersistentVolumeClaim>[] = []; // TODO do we need to add one here for storage classes, by the available ones in the source?
  const [data, filteredData, onFilterChange] = useListPageFilter(pvcs, rowFilters);

  const { sortBy, onSort, sortedItems } = useSortState(filteredData, (pvc) => [
    pvc.metadata?.name || '',
  ]);

  const { isItemSelected, toggleItemSelected, areAllSelected, selectAll } = useSelectionState({
    items: pvcs,
    isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
    externalState: [
      form.fields.selectedPVCs.value,
      (value) => {
        form.fields.selectedPVCs.setValue(value);
        form.fields.selectedPVCs.setIsTouched(true);
      },
    ],
  });

  const columnNames = {
    pvcName: 'PVC Name',
    storageClass: 'Storage class',
    capacity: 'Capacity',
  };

  // TODO warn with a confirm modal when clicking Next with no PVCs selected

  return (
    <ResolvedQuery result={sourcePVCsQuery} errorTitle="Cannot load PVCs from source cluster">
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Select persistent volume claims</Text>
        <Text component="p">
          Select persistent volume claims to be copied to the target project.
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
              {sortedItems.length > 0 ? (
                <Th
                  select={{
                    onSelect: (_event, isSelecting) => selectAll(isSelecting),
                    isSelected: areAllSelected,
                  }}
                />
              ) : null}
              <Th sort={{ sortBy, onSort, columnIndex: 0 }}>{columnNames.pvcName}</Th>
              <Th>{columnNames.storageClass}</Th>
              <Th>{columnNames.capacity}</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {sortedItems.length === 0 ? (
              <Tr>
                <Td colSpan={4}>
                  <TableEmptyState
                    titleText="No results found"
                    bodyText={
                      pvcs.length === 0
                        ? 'No PVCs were found in the selected project on the source cluster. If you proceed, only workloads will be migrated.'
                        : 'Adjust your filters and try again.'
                    }
                  />
                </Td>
              </Tr>
            ) : (
              sortedItems.map((pvc, rowIndex) => {
                const pvcName = pvc.metadata?.name;
                return (
                  <Tr key={pvcName}>
                    <Td
                      select={{
                        rowIndex,
                        onSelect: (_event, isSelecting) => toggleItemSelected(pvc, isSelecting),
                        isSelected: isItemSelected(pvc),
                      }}
                    />
                    <Td dataLabel={columnNames.pvcName}>{pvcName}</Td>
                    <Td dataLabel={columnNames.storageClass}>{pvc.spec.storageClassName}</Td>
                    <Td dataLabel={columnNames.capacity}>{getCapacity(pvc)}</Td>
                    <Td>
                      <Popover
                        className="json-popover"
                        position="bottom"
                        bodyContent={
                          <div onClick={(event) => event.stopPropagation()}>
                            <ReactJson src={pvc} enableClipboard={false} />
                          </div>
                        }
                        aria-label={`View JSON for PVC ${pvcName}`}
                        closeBtnAriaLabel="Close JSON view"
                        maxWidth="200rem"
                      >
                        <Button variant="link" className={text.textNowrap}>
                          View JSON
                        </Button>
                      </Popover>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </TableComposable>
      </Form>
    </ResolvedQuery>
  );
};
