import * as React from 'react';
import { TextContent, Text, Form, Checkbox } from '@patternfly/react-core';
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
        <Text component="h2">Migration pipeline settings</Text>
        <Text component="p">
          {isStatefulMigration
            ? 'Enter a name prefix for the OpenShift pipelines that will drive the tasks required to migrate your application.'
            : 'Enter a name for the OpenShift pipeline that will drive the tasks required to migrate your application.'}
        </Text>
      </TextContent>
      <Form isWidthLimited>
        <ValidatedTextInput field={form.fields.pipelineName} isRequired fieldId="pipeline-name" />
        <Checkbox
          label={
            isStatefulMigration
              ? 'Start the stage pipeline immediately'
              : 'Start the pipeline immediately'
          }
          id="start-immediately-checkbox"
          isChecked={form.values.startImmediately}
          onChange={form.fields.startImmediately.setValue}
        />
      </Form>
    </>
  );
};
