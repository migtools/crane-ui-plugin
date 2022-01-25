import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';

export const useImportWizardFormState = () => ({
  sourceClusterProject: useFormState({
    projectName: useFormField('', yup.string().label('Project name').required()),
  }),
  sourceProjectDetails: useFormState({}),
  pvSelect: useFormState({}),
  pvEdit: useFormState({}),
  pipelineSettings: useFormState({}),
  review: useFormState({}),
});

export type ImportWizardFormState = ReturnType<typeof useImportWizardFormState>;

export const ImportWizardFormContext = React.createContext<ImportWizardFormState>(
  {} as ImportWizardFormState,
);
