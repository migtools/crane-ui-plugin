import * as React from 'react';
import { Button, Flex, Modal, Stack } from '@patternfly/react-core';
// import { ResolvedQuery } from '@konveyor/lib-ui';
import { CranePipelineGroup } from 'src/api/types/CranePipeline';

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
  // TODO mutation for updating both the source and target secrets?
  return (
    <Modal
      variant="medium"
      title="Update OAuth Tokens"
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
              // isDisabled={mutateResult?.isLoading || confirmButtonDisabled}
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
      TODO
    </Modal>
  );
};
