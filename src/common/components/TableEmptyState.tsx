import * as React from 'react';
import {
  Flex,
  FlexItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateIconProps,
  Title,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

// TODO possibly a lib-ui candidate?

export interface TableEmptyStateProps {
  icon?: EmptyStateIconProps['icon'];
  titleText?: string;
  bodyText?: string;
  onClearFiltersClick?: () => void;
  isHiddenActions?: boolean;
}

export const TableEmptyState: React.FunctionComponent<TableEmptyStateProps> = ({
  icon = SearchIcon,
  titleText = 'No results found',
  bodyText = 'No results match the filter criteria. Remove filters or clear all filters to show results.',
  onClearFiltersClick,
  isHiddenActions = false,
}) => (
  <Flex justifyContent={{ default: 'justifyContentCenter' }}>
    <FlexItem>
      <EmptyState variant="small">
        <EmptyStateIcon icon={icon} />
        <Title headingLevel="h5" size="lg">
          {titleText}
        </Title>
        <EmptyStateBody>{bodyText}</EmptyStateBody>
        {onClearFiltersClick && !isHiddenActions && (
          <Button variant="link" onClick={onClearFiltersClick}>
            Clear all filters
          </Button>
        )}
      </EmptyState>
    </FlexItem>
  </Flex>
);
