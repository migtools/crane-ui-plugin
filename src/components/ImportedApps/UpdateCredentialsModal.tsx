import * as React from 'react';
import { Button, Flex, Modal, Stack, TextContent, Text } from '@patternfly/react-core';
import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { UpdateCredentialsForm, useUpdateCredentialsFormState } from './UpdateCredentialsForm';

interface UpdateCredentialsModalProps {
  pipelineGroup: CranePipelineGroup;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateCredentialsModal: React.FunctionComponent<UpdateCredentialsModalProps> = ({
  pipelineGroup,
  isOpen,
  onClose,
}) => {
  const { form } = useUpdateCredentialsFormState({ defaultExpanded: true });

  // TODO mutation for updating both the source and target secrets?
  return (
    <Modal
      className="crane-modal"
      variant="medium"
      title="Update OAuth tokens"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <Stack hasGutter>
          {/*mutateResult?.isError ? (
          <ResolvedQuery result={mutateResult} errorTitle={errorText} spinnerMode="inline" />
        ) : null*/}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              onClick={() => {
                // TODO
              }}
              isDisabled={
                !(form.values.isUpdatingSourceToken || form.values.isUpdatingTargetToken) ||
                !form.isValid /* || mutateResult?.isLoading */
              }
            >
              Update
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={onClose}
              // isDisabled={mutateResult?.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <TextContent>
        <Text component="p">
          You can update the stored credentials used by the pipelines in this group to authenticate
          with the source and target clusters during import.
        </Text>
      </TextContent>
      <UpdateCredentialsForm form={form} />
    </Modal>
  );
};
