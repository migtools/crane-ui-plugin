import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Tr } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import {
  useSourcePodsQuery,
  useSourcePVCsQuery,
  useSourceServicesQuery,
} from 'src/api/queries/sourceResources';
import { ResolvedQueries } from '@konveyor/lib-ui';

export const SourceProjectDetailsStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const sourcePodsQuery = useSourcePodsQuery(forms.sourceClusterProject.values);
  const sourcePVCsQuery = useSourcePVCsQuery(forms.sourceClusterProject.values);
  const sourceServicesQuery = useSourceServicesQuery(forms.sourceClusterProject.values);

  return (
    <>
      <TextContent className={spacing.mbXl}>
        <Text component="h2">Project details</Text>
        <Text component="h3">{forms.sourceClusterProject.values.namespace}</Text>
      </TextContent>
      <ResolvedQueries
        spinnerMode="emptyState"
        resultsWithErrorTitles={[
          { result: sourcePodsQuery, errorTitle: 'Cannot load pods from source cluster' },
          { result: sourcePVCsQuery, errorTitle: 'Cannot load PVCs from source cluster' },
          { result: sourceServicesQuery, errorTitle: 'Cannot load services from source cluster' },
        ]}
      >
        <TableComposable
          aria-label="Project details table"
          variant="compact"
          className="project-details-table"
        >
          <Tbody>
            <Tr>
              <Th className={spacing.pr_2xl}>Pods</Th>
              <Td id="details-pods">{sourcePodsQuery.data?.data.items.length}</Td>
            </Tr>
            <Tr>
              <Th className={spacing.pr_2xl}>Persistent Volume Claims (PVCs)</Th>
              <Td id="details-pvcs">{sourcePVCsQuery.data?.data.items.length}</Td>
            </Tr>
            <Tr>
              <Th className={spacing.pr_2xl}>Services</Th>
              <Td id="details-services">{sourceServicesQuery.data?.data.items.length}</Td>
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
      </ResolvedQueries>
    </>
  );
};
