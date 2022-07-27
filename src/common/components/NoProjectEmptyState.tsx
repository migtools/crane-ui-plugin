import * as React from 'react';
import { EmptyState, Title, EmptyStateBody } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link } from 'react-router-dom';

interface NoProjectEmptyStateProps {
  selectProjectHref: string;
}

export const NoProjectEmptyState: React.FunctionComponent<NoProjectEmptyStateProps> = ({
  selectProjectHref,
}) => (
  <EmptyState variant="large" className={spacing.mtXl}>
    <Title headingLevel="h4" size="lg">
      No project selected
    </Title>
    <EmptyStateBody>
      <Link to={selectProjectHref}>Select a project</Link> and return to this page.
    </EmptyStateBody>
  </EmptyState>
);
