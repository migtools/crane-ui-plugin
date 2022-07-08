import * as React from 'react';
import { TextContent, Text, Form } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { ValidatedTextInput } from '@konveyor/lib-ui';

export const PipelineSettingsStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  const form = forms.pipelineSettings;
  const isStatefulMigration = forms.pvcSelect.values.selectedPVCs.length > 0;
  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Import pipeline settings</Text>
        <Text component="p">
          {isStatefulMigration
            ? 'Enter a name for the group of OpenShift pipelines that will drive the tasks required to import your application.'
            : 'Enter a name for the OpenShift pipeline that will drive the tasks required to import your application.'}
        </Text>
      </TextContent>
      <Form isWidthLimited>
        <ValidatedTextInput
          field={form.fields.pipelineGroupName}
          isRequired
          fieldId="pipeline-group-name"
        />
      </Form>
    </>
  );
};
