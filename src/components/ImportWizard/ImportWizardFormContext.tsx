import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolume } from 'src/types/PersistentVolume';

export const useImportWizardFormState = () => {
  // TODO move the setSelectedPVsAndPrefillEdit behavior from PVSelectStep here somehow? replace the setValue? useEffect?
  const selectedPVsField = useFormField<PersistentVolume[]>([], yup.array().required().min(1));
  return {
    sourceClusterProject: useFormState({
      apiUrl: useFormField('', yup.string().label('Cluster API URL').required()), // TODO format validation, and async connection validation?
      token: useFormField('', yup.string().label('OAuth token').required()), // TODO format validation, and async connection validation?
      namespace: useFormField('', yup.string().label('Project name').required()), // TODO format validation, and async exists validation?
    }),
    pvSelect: useFormState({
      selectedPVs: selectedPVsField,
    }),
    pvEdit: useFormState({
      valuesByPVName: useFormField<PVEditValuesByPVName>(
        {},
        yup.mixed<PVEditValuesByPVName>().required(),
      ),
    }),
    pipelineSettings: useFormState({}),
  };
};

export type ImportWizardFormState = ReturnType<typeof useImportWizardFormState>;

export const ImportWizardFormContext = React.createContext<ImportWizardFormState>(
  {} as ImportWizardFormState,
);

export interface PVEditRowFormValues {
  targetPvcName: string;
  storageClass: string;
  capacity: string;
  verifyCopy: boolean;
}

export const usePVEditRowFormState = (existing: PVEditRowFormValues) =>
  useFormState<PVEditRowFormValues>({
    targetPvcName: useFormField(
      existing.targetPvcName,
      yup.string().label('Target PVC name').required(),
    ), // TODO format validation, check it doesn't already exist?
    storageClass: useFormField(
      existing.storageClass,
      yup.string().label('Storage class').required(),
    ), // TODO find real default value and type, validate it exists?
    capacity: useFormField(existing.capacity, yup.string().label('Capacity').required()), // TODO format validation? other validation / min / max?
    verifyCopy: useFormField(existing.verifyCopy, yup.boolean().label('Verify copy').required()),
  });

export type PVEditValuesByPVName = Record<string, PVEditRowFormValues>;

export const getDefaultEditValuesForPV = (pv: PersistentVolume): PVEditRowFormValues => ({
  targetPvcName: pv.spec.claimRef.name,
  storageClass: '',
  capacity: '',
  verifyCopy: false,
});
