import * as React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  sortable,
  truncate,
  cellWidth,
  TableComposable,
  Caption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useCreatePlanMutation } from '../../queries/plans';

interface IPlansTableProps {
  planList: any[];
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({ planList }: IPlansTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable, cellWidth(10)] },
    { title: 'Source', transforms: [sortable, cellWidth(10)] },
    { title: 'Target', transforms: [sortable, cellWidth(10)] },
    { title: 'Repository', transforms: [sortable, cellWidth(10)] },
    {
      title: 'Namespaces',
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: 'Last state',
      transforms: [sortable, cellWidth(40)],
      cellTransforms: [truncate],
    },
  ];
  console.log('columns', columns);

  const rows = planList.map((plan: any) => {
    console.log('plan', plan);
    return {
      cells: [
        plan.metadata.name,
        plan.spec.srcMigClusterRef.name,
        plan.spec.destMigClusterRef.name,
        plan.spec.migStorageRef.name,
        <ul>
          {plan.spec?.namespaces.map((ns) => {
            <li>Namespace: {ns}</li>;
          })}
        </ul>,
        'Status',
      ],
      meta: {
        id: 'thisid',
      }, // See comments on onSelect
    };
  });
  const createPlanMutation = useCreatePlanMutation();

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            onClick={() => {
              createPlanMutation.mutate('mockvals');
            }}
            id="add-plan-btn"
            variant="secondary"
          >
            Add migration plan
          </Button>
        </FlexItem>
        <FlexItem
          className={`${spacing.mrLg}`}
          alignSelf={{ default: 'alignSelfFlexEnd' }}
          flex={{ default: 'flex_1' }}
        ></FlexItem>
      </Flex>
      <TableComposable aria-label="Simple table">
        <Caption>Migration plans</Caption>
        <Thead>
          <Tr>
            <Th width={20}>{columns[0].title} </Th>
            <Th width={10}>{columns[1].title}</Th>
            <Th width={10}>{columns[2].title}</Th>
            <Th width={10}>{columns[3].title}</Th>
            <Th width={10}>{columns[4].title}</Th>
            <Th width={10}>{columns[5].title}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {row.cells.map((cell, cellIndex) => {
                console.log('what is cell', cell);
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

export default PlansTable;
