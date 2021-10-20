import * as React from "react";
import { Button, Flex, FlexItem } from "@patternfly/react-core";
import spacing from "@patternfly/react-styles/css/utilities/Spacing/spacing";
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
} from "@patternfly/react-table";
import { useCreateClusterMutation } from "./clusters";

interface IPlansTableProps {
  planList: any[];
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  planList,
}: IPlansTableProps) => {
  const columns = [
    { title: "Name", transforms: [sortable, cellWidth(10)] },
    { title: "Namespace", transforms: [sortable, cellWidth(10)] },
    { title: "Host cluster", transforms: [sortable, cellWidth(10)] },
  ];
  console.log("columns", columns);

  const rows = planList.map((plan: any) => {
    return {
      cells: [
        plan.metadata.name,
        plan.metadata.namespace,
        plan.spec.isHostCluster,
      ],
      meta: {
        id: "thisid",
      }, // See comments on onSelect
    };
  });
  const createClusterMutation = useCreateClusterMutation();

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            onClick={() => {
              createClusterMutation.mutate("mockvals");
            }}
            id="add-plan-btn"
            variant="secondary"
          >
            Add cluster
          </Button>
        </FlexItem>
        <FlexItem
          className={`${spacing.mrLg}`}
          alignSelf={{ default: "alignSelfFlexEnd" }}
          flex={{ default: "flex_1" }}
        ></FlexItem>
      </Flex>
      <TableComposable aria-label="Simple table">
        <Caption>Migration clusters</Caption>
        <Thead>
          <Tr>
            <Th width={20}>{columns[0].title} </Th>
            <Th width={10}>{columns[1].title}</Th>
            <Th width={10}>{columns[2].title}</Th>
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

export default PlansTable;
