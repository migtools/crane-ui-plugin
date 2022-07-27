import * as React from 'react';
import { EmptyState, EmptyStateIcon, Spinner, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const LoadingEmptyState: React.FunctionComponent = () => (
  <EmptyState className={spacing.mtXl}>
    <EmptyStateIcon variant="container" component={Spinner} />
    <Title size="lg" headingLevel="h4">
      Loading
    </Title>
  </EmptyState>
);
