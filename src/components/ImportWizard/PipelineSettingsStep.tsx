import * as React from 'react';
import { TextContent, Text, Form, Checkbox } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ImportWizardFormContext } from './ImportWizardFormContext';
import { ValidatedTextInput } from '@konveyor/lib-ui';

export const PipelineSettingsStep: React.FunctionComponent = () => {
  const form = React.useContext(ImportWizardFormContext).pipelineSettings;
  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="h2">Migration pipeline settings</Text>
        <Text component="p">
          Enter a name for the OpenShift pipeline that will drive the tasks required to migrate your
          application.
        </Text>
      </TextContent>
      <Form isWidthLimited>
        <ValidatedTextInput field={form.fields.pipelineName} isRequired fieldId="pipeline-name" />
        <Checkbox
          label="Start the pipeline immediately"
          id="start-immediately-checkbox"
          isChecked={form.values.startImmediately}
          onChange={form.fields.startImmediately.setValue}
        />
      </Form>
    </>
  );
};
