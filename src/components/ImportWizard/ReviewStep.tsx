import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export const ReviewStep: React.FunctionComponent = () => (
  <>
    <TextContent className={spacing.mbMd}>
      <Text component="h2">Review</Text>
    </TextContent>
    <>TODO: content for review</>
  </>
);
