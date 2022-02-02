import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { Button, Checkbox, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';
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
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

export const PVEditStepTableRow: React.FunctionComponent<PVEditStepTableRowProps> = ({
  pv,
  existingValues,
  setEditedValues,
  isEditMode,
  setIsEditMode,
}) => {
  // TODO load this from the host cluster via the SDK
  const storageClasses = MOCK_STORAGE_CLASSES;

  const rowForm = usePVEditRowFormState(existingValues);

  return (
    <Tr key={pv.metadata.name}>
      <Td dataLabel={columnNames.sourcePvcName}>{pv.spec.claimRef.name}</Td>
      <Td dataLabel={columnNames.targetPvcName}>
        {isEditMode ? (
          <ValidatedTextInput
            field={rowForm.fields.targetPvcName}
            fieldId={`target-pvc-name-${pv.spec.claimRef.name}`}
          />
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
            id={`storage-class-select-${pv.spec.claimRef.name}`}
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
          <ValidatedTextInput
            field={rowForm.fields.capacity}
            fieldId={`capacity-${pv.spec.claimRef.name}`}
          />
        ) : (
          existingValues.capacity
        )}
      </Td>
      <Td dataLabel={columnNames.verifyCopy} textCenter>
        <Checkbox
          aria-label={`Verify copy for PVC ${pv.spec.claimRef.name}`}
          isDisabled={!isEditMode}
          isChecked={rowForm.values.verifyCopy}
          onChange={rowForm.fields.verifyCopy.setValue}
          id={`verify-copy-${pv.spec.claimRef.name}`}
        />
      </Td>
      <Td modifier="nowrap">
        {!isEditMode ? (
          <Button
            variant="link"
            icon={<PencilAltIcon />}
            iconPosition="right"
            onClick={() => setIsEditMode(true)}
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
                setIsEditMode(false);
              }}
              isDisabled={!rowForm.isValid}
            />
            <Button
              variant="plain"
              icon={<TimesIcon />}
              onClick={() => {
                rowForm.revert();
                setEditedValues(existingValues);
                setIsEditMode(false);
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
