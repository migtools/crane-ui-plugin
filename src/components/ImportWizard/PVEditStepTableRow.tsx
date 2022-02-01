import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { Button } from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { PersistentVolume } from 'src/types/PersistentVolume';
import { columnNames } from './PVEditStep';
import { PVEditRowFormValues, usePVEditRowFormState } from './ImportWizardFormContext';

interface PVEditStepTableRowProps {
  pv: PersistentVolume;
  existingValues: PVEditRowFormValues;
  setEditedValues: (values: PVEditRowFormValues) => void;
}

export const PVEditStepTableRow: React.FunctionComponent<PVEditStepTableRowProps> = ({
  pv,
  existingValues,
  setEditedValues,
}) => {
  const rowForm = usePVEditRowFormState(existingValues);

  const [isEditMode, setIsEditMode] = React.useState(false);

  return (
    <Tr key={pv.metadata.name}>
      <Td dataLabel={columnNames.sourcePvcName}>{pv.spec.claimRef.name}</Td>
      <Td dataLabel={columnNames.targetPvcName}>
        {isEditMode ? (
          <ValidatedTextInput field={rowForm.fields.targetPvcName} fieldId="target-pvc-name" />
        ) : (
          existingValues.targetPvcName
        )}
      </Td>
      <Td dataLabel={columnNames.storageClass}>TODO: Select</Td>
      <Td dataLabel={columnNames.capacity}>TODO: TextInput</Td>
      <Td dataLabel={columnNames.verifyCopy}>TODO</Td>
      <Td>
        {!isEditMode ? (
          <Button
            variant="link"
            icon={<PencilAltIcon />}
            iconPosition="right"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="link"
              icon={<CheckIcon />}
              onClick={() => {
                rowForm.markSaved();
                setEditedValues(rowForm.values);
                setIsEditMode(!isEditMode);
              }}
            />
            <Button
              variant="plain"
              icon={<TimesIcon />}
              onClick={() => {
                rowForm.revert();
                setEditedValues(existingValues);
                setIsEditMode(!isEditMode);
              }}
            >
              <TimesIcon />
            </Button>
          </>
        )}
      </Td>
    </Tr>
  );
};
