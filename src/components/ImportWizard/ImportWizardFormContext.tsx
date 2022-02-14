import * as React from 'react';
import * as yup from 'yup';
import { useFormField, useFormState } from '@konveyor/lib-ui';
import { OAuthSecret } from 'src/api/types/Secret';
import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { MOCK_STORAGE_CLASSES } from 'src/api/mock/StorageClasses.mock';
import { getCapacity } from 'src/utils/helpers';
import { capacitySchema, dnsLabelNameSchema, yamlSchema } from 'src/common/schema';
import { useSourceNamespacesQuery } from 'src/api/queries/sourceNamespaces';
import { areSourceCredentialsValid } from 'src/api/proxyHelpers';
import { secretMatchesCredentials } from 'src/api/queries/secrets';

export const useImportWizardFormState = () => {
  // Some form field state objects are lifted out of the useFormState calls so they can reference each other
  const sourceApiSecretField = useFormField<OAuthSecret | null>(null, yup.mixed());

  const credentialsFieldSchema = yup
    .string()
    .required()
    .test('is-not-validating', (_value, context) => {
      if (sourceNamespacesQuery.isLoading) {
        return context.createError();
      }
      return true;
    })
    .test('loads-namespaces', (_value, context) => {
      if (
        sourceApiSecretField.value &&
        secretMatchesCredentials(sourceApiSecretField.value, apiUrlField.value, tokenField.value) &&
        !credentialsAreValid
      ) {
        return context.createError({ message: 'Cannot connect using these credentials' });
      }
      return true;
    });

  const apiUrlField = useFormField<string>('', credentialsFieldSchema.label('Cluster API URL'));
  const tokenField = useFormField<string>('', credentialsFieldSchema.label('OAuth token'));

  const sourceNamespacesQuery = useSourceNamespacesQuery(sourceApiSecretField.value);
  const credentialsAreValid = areSourceCredentialsValid(
    apiUrlField,
    tokenField,
    sourceApiSecretField,
    sourceNamespacesQuery,
  );

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
    sourceClusterProject: useFormState(
      {
        apiUrl: apiUrlField,
        token: tokenField,
        namespace: useFormField(
          '',
          dnsLabelNameSchema
            .label('Project name')
            .required()
            .test('exists', (value, context) => {
              if (value && !credentialsAreValid) {
                return context.createError({
                  message: 'Cannot validate project name without connecting to the cluster',
                });
              }
              const namespaceExists = sourceNamespacesQuery.data?.data.items.find(
                (ns) => ns.metadata.name === value,
              );
              if (value && !namespaceExists) {
                return context.createError({
                  message: 'This project does not exist in the source cluster',
                });
              }
              return true;
            }),
        ),
        sourceApiSecret: sourceApiSecretField,
      },
      {
        revalidateOnChange: [credentialsAreValid],
      },
    ),
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
