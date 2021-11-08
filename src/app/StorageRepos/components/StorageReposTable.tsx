import * as React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  sortable,
  cellWidth,
  TableComposable,
  Caption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

interface IStorageReposTableProps {
  storageList: any[];
}

const StorageReposTable: React.FunctionComponent<IStorageReposTableProps> = ({
  storageList,
}: IStorageReposTableProps) => {
  const columns = [{ title: 'Name', transforms: [sortable, cellWidth(10)] }];

  const rows = storageList.map((storage: any) => {
    return {
      cells: [storage.metadata.name],
      meta: {
        id: 'thisid',
      }, // See comments on onSelect
    };
  });

  return (
    <>
      <Flex>
        <FlexItem>
          <Button id="add-storage-btn" variant="secondary">
            Add replication repository
          </Button>
        </FlexItem>
        <FlexItem
          className={`${spacing.mrLg}`}
          alignSelf={{ default: 'alignSelfFlexEnd' }}
          flex={{ default: 'flex_1' }}
        ></FlexItem>
      </Flex>
      <TableComposable aria-label="Simple table">
        <Caption>Replication repositories</Caption>
        <Thead>
          <Tr>
            <Th width={20}>{columns[0].title} </Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => {
                return (
                  <>
                    <Td key={`${rowIndex}_${cellIndex}`}>{cell}</Td>
                  </>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </TableComposable>
    </>
  );
};

export default StorageReposTable;
