import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';

export const SourceProjectDetailsStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);

  return (
    <>
      <TextContent className={spacing.mbXl}>
        <Text component="h2">Project details</Text>
        <Text component="h3">{forms.sourceClusterProject.values.namespace}</Text>
      </TextContent>
      <TableComposable
        aria-label="Project details table"
        variant="compact"
        className="project-details-table"
      >
        <Tbody>
          <Tr>
            <Th className={spacing.pr_2xl}>Pods</Th>
            <Td id="details-pods">TODO</Td>
          </Tr>
          <Tr>
            <Th className={spacing.pr_2xl}>Persistent Volume Claims (PVCs)</Th>
            <Td id="details-pvcs">TODO</Td>
          </Tr>
          <Tr>
            <Th className={spacing.pr_2xl}>Services</Th>
            <Td id="details-services">TODO</Td>
          </Tr>
          <Tr>
            <Th className={spacing.pr_2xl}>Images</Th>
            <Td id="details-images">TODO</Td>
          </Tr>
          <Tr>
            <Th className={spacing.pr_2xl}>Total image size</Th>
            <Td id="details-imagesize">TODO</Td>
          </Tr>
        </Tbody>
      </TableComposable>
    </>
  );
};
