import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { columnNames } from './PVEditStep';
import { PersistentVolume } from 'src/types/PersistentVolume';
import { ValidatedTextInput } from '@konveyor/lib-ui';
import { PVEditRowFormValues, usePVEditRowFormState } from './ImportWizardFormContext';

interface PVEditStepTableRowProps {
  pv: PersistentVolume;
  existingValues: PVEditRowFormValues;
  setEditedValues: (values: PVEditRowFormValues) => void;
}

export const PVEditStepTableRow: React.FunctionComponent<PVEditStepTableRowProps> = ({
  pv,
  existingValues,
  // setEditedValues,
}) => {
  const rowForm = usePVEditRowFormState(existingValues);

  return (
    <Tr key={pv.metadata.name}>
      <Td dataLabel={columnNames.sourcePvcName}>{pv.spec.claimRef.name}</Td>
      <Td dataLabel={columnNames.targetPvcName}>
        <ValidatedTextInput field={rowForm.fields.targetPvcName} fieldId="target-pvc-name" />
      </Td>
      <Td dataLabel={columnNames.storageClass}>TODO: Select</Td>
      <Td dataLabel={columnNames.capacity}>TODO: TextInput</Td>
      <Td dataLabel={columnNames.verifyCopy}></Td>
      <Td>TODO: edit controls</Td>
    </Tr>
  );
};
