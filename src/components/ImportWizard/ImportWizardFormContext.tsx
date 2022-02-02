import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolume } from 'src/types/PersistentVolume';
import { MOCK_STORAGE_CLASSES } from 'src/mock/StorageClasses.mock';

export const useImportWizardFormState = () => {
  // TODO load this from the host cluster via the SDK
  const storageClasses = MOCK_STORAGE_CLASSES; // TODO do we need to pass this in? call the SDK hook here?
  const defaultStorageClass = storageClasses[0]; // TODO how to determine this?

  const baseSelectedPVsField = useFormField<PersistentVolume[]>([], yup.array().required().min(1));
  const selectedPVsField = {
    ...baseSelectedPVsField,
    setValue: (selectedPVs: PersistentVolume[]) => {
      baseSelectedPVsField.setValue(selectedPVs);
      // When selected PVs change, initialize the per-PV form values for the Edit PVs step
      const defaultIsEditModeByPV: PVIsEditModeByPVName = {};
      const defaultEditValuesByPV: PVEditValuesByPVName = {};
      selectedPVs.forEach((pv) => {
        defaultIsEditModeByPV[pv.metadata.name] = false;
        const defaultEditValues: PVEditRowFormValues = {
          targetPvcName: pv.spec.claimRef.name,
          storageClass: defaultStorageClass.metadata.name,
          capacity: pv.spec.capacity.storage, // TODO format? suffix?
          verifyCopy: false,
        };
        defaultEditValuesByPV[pv.metadata.name] =
          editValuesByPVField.value[pv.metadata.name] || defaultEditValues;
      });
      isEditModeByPVField.reinitialize(defaultIsEditModeByPV);
      editValuesByPVField.reinitialize(defaultEditValuesByPV);
    },
  };

  const isEditModeByPVField = useFormField<PVIsEditModeByPVName>(
    {},
    yup.mixed<PVIsEditModeByPVName>(),
  );
  const editValuesByPVField = useFormField<PVEditValuesByPVName>(
    {},
    yup.mixed<PVEditValuesByPVName>().required(),
  );

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
      isEditModeByPV: isEditModeByPVField,
      editValuesByPV: editValuesByPVField,
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

export const usePVEditRowFormState = (existingValues: PVEditRowFormValues) => {
  const { targetPvcName, storageClass, capacity, verifyCopy } = existingValues;
  return useFormState<PVEditRowFormValues>({
    targetPvcName: useFormField(targetPvcName, yup.string().label('Target PVC name').required()), // TODO format validation, check it doesn't already exist?
    storageClass: useFormField(storageClass, yup.string().label('Storage class').required()), // TODO find real default value and type, validate it exists?
    capacity: useFormField(capacity, yup.string().label('Capacity').required()), // TODO format validation? other validation / min / max?
    verifyCopy: useFormField(verifyCopy, yup.boolean().label('Verify copy').required()),
  });
};

export type PVEditValuesByPVName = Record<string, PVEditRowFormValues>;
export type PVIsEditModeByPVName = Record<string, boolean>;
