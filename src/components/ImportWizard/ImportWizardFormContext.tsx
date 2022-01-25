import * as React from 'react';
import { useFormState } from '@konveyor/lib-ui';

export const useImportWizardFormState = () => ({
  sourceClusterProject: useFormState({}),
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
