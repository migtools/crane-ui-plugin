import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { Button, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { PersistentVolume } from 'src/types/PersistentVolume';
import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { MOCK_STORAGE_CLASSES } from 'src/mock/StorageClasses.mock';
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
  // TODO load this from the host cluster via the SDK
  const storageClasses = MOCK_STORAGE_CLASSES;

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
      <Td dataLabel={columnNames.storageClass}>
        {isEditMode ? (
          <SimpleSelectMenu<string>
            selected={rowForm.values.storageClass}
            setSelected={rowForm.fields.storageClass.setValue}
            toggleProps={{ style: { width: '100%' } }}
          >
            <MenuContent>
              <MenuList>
                {storageClasses.map((sc) => (
                  <MenuItem key={sc.metadata.name} itemId={sc.metadata.name}>
                    {sc.metadata.name}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuContent>
          </SimpleSelectMenu>
        ) : (
          existingValues.storageClass
        )}
      </Td>
      <Td dataLabel={columnNames.capacity}>
        {isEditMode ? (
          <ValidatedTextInput field={rowForm.fields.capacity} fieldId="capacity" />
        ) : (
          existingValues.capacity
        )}
      </Td>
      <Td dataLabel={columnNames.verifyCopy}>TODO</Td>
      <Td modifier="nowrap">
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
              isDisabled={!rowForm.isValid}
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
