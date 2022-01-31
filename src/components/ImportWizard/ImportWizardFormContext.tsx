import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolume } from '../../types/PersistentVolume';

export const useImportWizardFormState = () => ({
  sourceClusterProject: useFormState({
    apiUrl: useFormField('', yup.string().label('Cluster API URL').required()), // TODO format validation, and async connection validation?
    token: useFormField('', yup.string().label('OAuth token').required()), // TODO format validation, and async connection validation?
    namespace: useFormField('', yup.string().label('Project name').required()), // TODO format validation, and async exists validation?
  }),
  pvSelect: useFormState({
    selectedPVs: useFormField<PersistentVolume[]>([], yup.array().required().min(1)),
    migrationTypeByPV: null, // TODO
  }),
  pvEdit: useFormState({}),
  pipelineSettings: useFormState({}),
});

export type ImportWizardFormState = ReturnType<typeof useImportWizardFormState>;

export const ImportWizardFormContext = React.createContext<ImportWizardFormState>(
  {} as ImportWizardFormState,
);
