import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { OAuthSecret } from 'src/api/types/Secret';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { MOCK_STORAGE_CLASSES } from 'src/api/mock/StorageClasses.mock';
import { getCapacity } from 'src/utils/helpers';
import { capacitySchema, dnsLabelNameSchema, yamlSchema } from 'src/common/schema';

export const useImportWizardFormState = () => {
  // Some form field state objects are lifted out of the useFormState calls so they can reference each other

  const sourceApiSecretField = useFormField<OAuthSecret | null>(null, yup.mixed());
  const apiUrlField = useFormField('', yup.string().label('Cluster API URL').required(), {
    onChange: () => sourceApiSecretField.setValue(null),
  });
  const tokenField = useFormField('', yup.string().label('OAuth token').required(), {
    onChange: () => sourceApiSecretField.setValue(null),
  });

  // TODO create secret and configure proxy with a mutation onBlur of both the above fields (if both defined) in the SourceProjectDetailsStep
  // TODO add a namespaces query that is disabled until the secret field has a value
  // TODO add a yup test to the apiUrl and token fields to pass validation if the namespaces query data is there, or show errors with that query on the token field?

  // TODO load this from the host cluster via the SDK -- probably prefill async
  const storageClasses = MOCK_STORAGE_CLASSES; // TODO do we need to pass this in? call the SDK hook here?
  const defaultStorageClass = storageClasses[0]; // TODO how to determine this?

  const isEditModeByPVCField = useFormField<PVIsEditModeByPVCName>(
    {},
    yup.mixed<PVIsEditModeByPVCName>(),
  );
  const editValuesByPVCField = useFormField<PVCEditValuesByPVCName>(
    {},
    yup.mixed<PVCEditValuesByPVCName>().required(),
  );

  // When selected PVs change, initialize the per-PV form values for the Edit PVs step
  const onSelectedPVCsChange = (selectedPVCs: PersistentVolumeClaim[]) => {
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
  };

  return {
    sourceClusterProject: useFormState({
      apiUrl: apiUrlField,
      token: tokenField,
      namespace: useFormField('', dnsLabelNameSchema.label('Project name').required()), // TODO check if it exists (use list or single lookup?)
      sourceApiSecret: sourceApiSecretField,
    }),
    pvcSelect: useFormState({
      selectedPVCs: useFormField<PersistentVolumeClaim[]>([], yup.array(), {
        onChange: onSelectedPVCsChange,
      }),
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
      pipelineYaml: useFormField('', yamlSchema.label('Pipeline').required()),
      pipelineRunYaml: useFormField('', yamlSchema.label('PipelineRun').required()),
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
