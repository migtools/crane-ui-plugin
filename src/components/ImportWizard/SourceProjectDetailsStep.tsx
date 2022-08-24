import * as React from 'react';
import {
  TextContent,
  Text,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import {
  useSourcePodsQuery,
  useSourcePVCsQuery,
  useSourceServicesQuery,
} from 'src/api/queries/sourceResources';
import { ResolvedQueries } from '@migtools/lib-ui';

export const SourceProjectDetailsStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const sourcePodsQuery = useSourcePodsQuery(forms.sourceClusterProject.values);
  const sourcePVCsQuery = useSourcePVCsQuery(forms.sourceClusterProject.values);
  const sourceServicesQuery = useSourceServicesQuery(forms.sourceClusterProject.values);

  return (
    <ResolvedQueries
      spinnerMode="emptyState"
      resultsWithErrorTitles={[
        { result: sourcePodsQuery, errorTitle: 'Cannot load pods from source cluster' },
        { result: sourcePVCsQuery, errorTitle: 'Cannot load PVCs from source cluster' },
        { result: sourceServicesQuery, errorTitle: 'Cannot load services from source cluster' },
      ]}
    >
      <TextContent className={spacing.mbXl}>
        <Text component="h2">Project details</Text>
        <Text component="h3">{forms.sourceClusterProject.values.sourceNamespace}</Text>
      </TextContent>
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '30ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Pods</DescriptionListTerm>
          <DescriptionListDescription>
            {sourcePodsQuery.data?.data.items.length}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Persistent Volume Claims (PVCs)</DescriptionListTerm>
          <DescriptionListDescription>
            {sourcePVCsQuery.data?.data.items.length}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Services</DescriptionListTerm>
          <DescriptionListDescription>
            {sourceServicesQuery.data?.data.items.length}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ResolvedQueries>
  );
};
