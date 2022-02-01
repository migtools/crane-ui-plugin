import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolume } from 'src/types/PersistentVolume';

export const useImportWizardFormState = () => {
  const baseSelectedPVsField = useFormField<PersistentVolume[]>([], yup.array().required().min(1));
  const selectedPVsField = {
    ...baseSelectedPVsField,
    setValue: (selectedPVs: PersistentVolume[]) => {
      baseSelectedPVsField.setValue(selectedPVs);
      // When selected PVs change, initialize the per-PV form values for the Edit PVs step
      const defaultEditValuesByPV = {};
      selectedPVs.forEach((pv) => {
        const defaultEditValues = {
          targetPvcName: pv.spec.claimRef.name,
          storageClass: '',
          capacity: '',
          verifyCopy: false,
        };
        defaultEditValuesByPV[pv.metadata.name] =
          editValuesByPVField.value[pv.metadata.name] || defaultEditValues;
      });
      editValuesByPVField.reinitialize(defaultEditValuesByPV);
    },
  };
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
      valuesByPV: editValuesByPVField,
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
