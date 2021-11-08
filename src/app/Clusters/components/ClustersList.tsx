import { PageSection } from '@patternfly/react-core/dist/esm/components/Page/PageSection';
import * as React from 'react';
import { ResolvedQuery } from '@konveyor/lib-ui';
import { Card } from '@patternfly/react-core/dist/esm/components/Card/Card';
import { CardBody } from '@patternfly/react-core/dist/esm/components/Card/CardBody';
import { EmptyState } from '@patternfly/react-core/dist/esm/components/EmptyState/EmptyState';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { EmptyStateIcon } from '@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateIcon';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Title } from '@patternfly/react-core/dist/esm/components/Title/Title';
import { EmptyStateBody } from '@patternfly/react-core/dist/esm/components/EmptyState/EmptyStateBody';
import CreatePlanButton from '../../common/CreatePlanButton';
import { useClustersQuery } from '../../queries/clusters';
import ClustersTable from './ClustersTable';

const ClustersList: React.FC = () => {
  const clustersQuery = useClustersQuery();
  return (
    <PageSection>
      <ResolvedQuery
        result={clustersQuery}
        errorTitle={'Could not load clusters'}
        errorsInline={false}
      >
        <Card>
          <CardBody>
            {!clustersQuery.data ? null : clustersQuery.data.items.length === 0 ? (
              <EmptyState className={spacing.my_2xl}>
                <EmptyStateIcon icon={PlusCircleIcon} />
                <Title size="lg" headingLevel="h2">
                  No clusters
                </Title>
                <EmptyStateBody>Create a cluster to migrate to or from </EmptyStateBody>
                <CreatePlanButton />
              </EmptyState>
            ) : (
              <ClustersTable planList={clustersQuery.data?.items || []} />
            )}
          </CardBody>
        </Card>
      </ResolvedQuery>
    </PageSection>
  );
};

export default ClustersList;
