import * as React from 'react';
import { Button, Flex, Modal, Stack, TextContent, Text } from '@patternfly/react-core';
import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { UpdateCredentialsForm, useUpdateCredentialsFormState } from './UpdateCredentialsForm';

interface UpdateCredentialsModalProps {
  pipelineGroup: CranePipelineGroup;
  isOpen: boolean;
  onClose: () => void;
}

// TODO: add field for pasting source cluster token, and repeat warning from first wizard step
// TODO: validate before submitting? that's tricky... what if it's running (probably need to disable this while it's running)
//       - maybe store the existing source token before letting the user edit it, and if they cancel, restore it on the secret before closing the modal?
//       - or maybe create a separate temporary secret just for validation, and then delete it when we update the original? i like that more.
// TODO: on submit, patch the source cluster secret with the new token, and patch the target cluster secret via crane-secret-service (noop? how to get that to just patch the token?)
// TODO: when user clicks Stage or Cutover, somehow test the source and target tokens and prompt the user to reset them?
//       - start with just a warning followed by opening this modal?
//       - maybe instead: in the Stage or Cutover confirm modals themselves, add a checkbox for "update oauth tokens before starting" that defaults to checked? expand under it to show the body contents of this modal?
//       - abstract just the fields into `UpdateCredentialsForm`? How to reuse the mutation itself? probably factor out into a shared useUpdateCredentialsMutation hook
export const UpdateCredentialsModal: React.FunctionComponent<UpdateCredentialsModalProps> = ({
  pipelineGroup,
  isOpen,
  onClose,
}) => {
  const { form } = useUpdateCredentialsFormState({ defaultExpanded: true });

  // TODO mutation for updating both the source and target secrets?
  return (
    <Modal
      id="update-credentials-modal"
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
