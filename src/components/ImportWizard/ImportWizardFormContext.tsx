import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { PersistentVolumeClaim } from 'src/types/PersistentVolume';
import { MOCK_STORAGE_CLASSES } from 'src/mock/StorageClasses.mock';
import { getCapacity } from 'src/utils/helpers';
import { capacitySchema, dnsLabelNameSchema } from 'src/common/schema';

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
      apiUrl: useFormField('', dnsLabelNameSchema.label('Cluster API URL').required()), // TODO async connection validation
      token: useFormField('', yup.string().label('OAuth token').required()), // TODO async connection validation
      namespace: useFormField('', dnsLabelNameSchema.label('Project name').required()), // TODO check if it exists (use list or single lookup?)
    }),
    pvcSelect: useFormState({
      selectedPVCs: selectedPVCsField,
    }),
    pvcEdit: useFormState({
      isEditModeByPVC: isEditModeByPVCField,
      editValuesByPVC: editValuesByPVCField,
    }),
    pipelineSettings: useFormState({
      pipelineName: useFormField('', dnsLabelNameSchema.label('Pipeline name').required()), // TODO check if it exists (use list or single lookup?)
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
    targetPvcName: useFormField(
      targetPvcName,
      dnsLabelNameSchema.label('Target PVC name').required(),
    ), // TODO check if it exists
    storageClass: useFormField(storageClass, dnsLabelNameSchema.label('Storage class').required()), // TODO find real default value
    capacity: useFormField(capacity, capacitySchema.label('Capacity').required()),
    verifyCopy: useFormField(verifyCopy, yup.boolean().label('Verify copy').required()),
  });
};

export type PVCEditValuesByPVCName = Record<string, PVCEditRowFormValues>;
export type PVIsEditModeByPVCName = Record<string, boolean>;
