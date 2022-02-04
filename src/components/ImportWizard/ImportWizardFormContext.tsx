import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolumeClaim } from 'src/types/PersistentVolume';
import { MOCK_STORAGE_CLASSES } from 'src/mock/StorageClasses.mock';
import { getCapacity } from 'src/utils/helpers';

export const useImportWizardFormState = () => {
  // TODO load this from the host cluster via the SDK
  const storageClasses = MOCK_STORAGE_CLASSES; // TODO do we need to pass this in? call the SDK hook here?
  const defaultStorageClass = storageClasses[0]; // TODO how to determine this?

  // pvcSelect and pvcEdit form fields are lifted out so they can reference each other
  const baseSelectedPVsField = useFormField<PersistentVolumeClaim[]>(
    [],
    yup.array().required().min(1),
  );
  const selectedPVCsField = {
    ...baseSelectedPVsField,
    setValue: (selectedPVCs: PersistentVolumeClaim[]) => {
      baseSelectedPVsField.setValue(selectedPVCs);
      // When selected PVs change, initialize the per-PV form values for the Edit PVs step
      const defaultIsEditModeByPVC: PVIsEditModeByPVCName = {};
      const defaultEditValuesByPVC: PVCEditValuesByPVCName = {};
      selectedPVCs.forEach((pvc) => {
        defaultIsEditModeByPVC[pvc.metadata.name] = false;
        const defaultEditValues: PVCEditRowFormValues = {
          targetPvcName: pvc.metadata.name,
          storageClass: defaultStorageClass.metadata.name,
          capacity: getCapacity(pvc),
          verifyCopy: false,
        };
        defaultEditValuesByPVC[pvc.metadata.name] =
          editValuesByPVCField.value[pvc.metadata.name] || defaultEditValues;
      });
      isEditModeByPVCField.reinitialize(defaultIsEditModeByPVC);
      editValuesByPVCField.reinitialize(defaultEditValuesByPVC);
    },
  };

  const isEditModeByPVCField = useFormField<PVIsEditModeByPVCName>(
    {},
    yup.mixed<PVIsEditModeByPVCName>(),
  );
  const editValuesByPVCField = useFormField<PVCEditValuesByPVCName>(
    {},
    yup.mixed<PVCEditValuesByPVCName>().required(),
  );

  return {
    sourceClusterProject: useFormState({
      apiUrl: useFormField('', yup.string().label('Cluster API URL').required()), // TODO format validation, and async connection validation?
      token: useFormField('', yup.string().label('OAuth token').required()), // TODO format validation, and async connection validation?
      namespace: useFormField('', yup.string().label('Project name').required()), // TODO format validation, and async exists validation?
    }),
    pvcSelect: useFormState({
      selectedPVCs: selectedPVCsField,
    }),
    pvcEdit: useFormState({
      isEditModeByPVC: isEditModeByPVCField,
      editValuesByPVC: editValuesByPVCField,
    }),
    pipelineSettings: useFormState({
      pipelineName: useFormField('', yup.string().label('Pipeline name').required()), // TODO format validation, check if it already exists
      startImmediately: useFormField(false, yup.boolean().required()),
    }),
    review: useFormState({
      pipelineYaml: useFormField('', yup.string().label('Pipeline').required()), // TODO validate yaml
      pipelineRunYaml: useFormField('', yup.string().label('PipelineRun').required()), // TODO validate yaml
    }),
  };
};

export type ImportWizardFormState = ReturnType<typeof useImportWizardFormState>;

export const ImportWizardFormContext = React.createContext<ImportWizardFormState>(
  {} as ImportWizardFormState,
);

export interface PVCEditRowFormValues {
  targetPvcName: string;
  storageClass: string;
  capacity: string;
  verifyCopy: boolean;
}

export const usePVCEditRowFormState = (existingValues: PVCEditRowFormValues) => {
  const { targetPvcName, storageClass, capacity, verifyCopy } = existingValues;
  return useFormState<PVCEditRowFormValues>({
    targetPvcName: useFormField(targetPvcName, yup.string().label('Target PVC name').required()), // TODO format validation, check it doesn't already exist?
    storageClass: useFormField(storageClass, yup.string().label('Storage class').required()), // TODO find real default value and type, validate it exists?
    capacity: useFormField(capacity, yup.string().label('Capacity').required()), // TODO validate format. Binary SI (Ki, Mi, Gi, Pi, Ti) or Decimal SI (k, M, G, P, T) format
    verifyCopy: useFormField(verifyCopy, yup.boolean().label('Verify copy').required()),
  });
};

export type PVCEditValuesByPVCName = Record<string, PVCEditRowFormValues>;
export type PVIsEditModeByPVCName = Record<string, boolean>;
