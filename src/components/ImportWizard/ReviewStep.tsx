import * as React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ImportWizardFormContext } from './ImportWizardFormContext';

export const ReviewStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  console.log('all forms', forms);

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Review</Text>
      </TextContent>
      <>TODO: content for review</>
    </>
  );
};
