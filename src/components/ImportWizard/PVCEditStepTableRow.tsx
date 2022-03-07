import * as React from 'react';
import { Tr, Td } from '@patternfly/react-table';
import { Button, Checkbox, MenuContent, MenuItem, MenuList } from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { PersistentVolumeClaim } from 'src/api/types/PersistentVolume';
import { SimpleSelectMenu } from 'src/common/components/SimpleSelectMenu';
import { columnNames } from './PVCEditStep';
import { PVCEditRowFormValues, usePVCEditRowFormState } from './ImportWizardFormContext';
import { isDefaultStorageClass, useWatchStorageClasses } from 'src/api/queries/storageClasses';

interface PVCEditStepTableRowProps {
  pvc: PersistentVolumeClaim;
  existingValues: PVCEditRowFormValues;
  setEditedValues: (values: PVCEditRowFormValues) => void;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
}

export const PVCEditStepTableRow: React.FunctionComponent<PVCEditStepTableRowProps> = ({
  pvc,
  existingValues,
  setEditedValues,
  isEditMode,
  setIsEditMode,
}) => {
  const storageClassWatch = useWatchStorageClasses();
  const rowForm = usePVCEditRowFormState(existingValues);
  const pvcName = pvc.metadata?.name || '';

  return (
    <Tr key={pvcName}>
      <Td dataLabel={columnNames.sourcePvcName}>{pvcName}</Td>
      <Td dataLabel={columnNames.targetPvcName}>
        {isEditMode ? (
          <ValidatedTextInput
            field={rowForm.fields.targetPvcName}
            fieldId={`target-pvc-name-${pvcName}`}
            label={null}
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
            id={`storage-class-select-${pvcName}`}
          >
            <MenuContent>
              <MenuList>
                {storageClassWatch.data?.map((sc) => (
                  <MenuItem key={sc.metadata.name} itemId={sc.metadata.name}>
                    {sc.metadata.name}
                    {isDefaultStorageClass(sc) ? ' (default)' : ''}
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
            fieldId={`capacity-${pvcName}`}
            label={null}
          />
        ) : (
          existingValues.capacity
        )}
      </Td>
      <Td dataLabel={columnNames.verifyCopy} textCenter>
        <Checkbox
          aria-label={`Verify copy for PVC ${pvcName}`}
          isDisabled={!isEditMode}
          isChecked={rowForm.values.verifyCopy}
          onChange={rowForm.fields.verifyCopy.setValue}
          id={`verify-copy-${pvcName}`}
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
