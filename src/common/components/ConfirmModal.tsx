import * as React from 'react';
import { Modal, Stack, Flex, Button, ModalProps } from '@patternfly/react-core';
import { ResolvedQuery } from '@konveyor/lib-ui';
import { UseMutationResult, UseQueryResult } from 'react-query';

// TODO export this from lib-ui? part of ResolvedQueries
export type UnknownResult = Pick<
  UseQueryResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error'
>;

// TODO export this from lib-ui? part of ResolvedQueries
export type UnknownMutationResult = Pick<
  UseMutationResult<unknown>,
  'isError' | 'isLoading' | 'isIdle' | 'error' | 'reset'
>;

// TODO lib-ui candidate copied from forklift-ui

export interface IConfirmModalProps {
  variant?: ModalProps['variant'];
  isOpen: boolean;
  toggleOpen: () => void;
  mutateFn: () => void;
  mutateResult?: UnknownMutationResult;
  title: string;
  body: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText?: string;
  confirmButtonDisabled?: boolean;
  errorText?: string;
}

export const ConfirmModal: React.FunctionComponent<IConfirmModalProps> = ({
  variant = 'small',
  isOpen,
  toggleOpen,
  mutateFn,
  mutateResult,
  title,
  body,
  confirmButtonText,
  confirmButtonDisabled = false,
  cancelButtonText = 'Cancel',
  errorText = 'Error performing action',
}: IConfirmModalProps) =>
  isOpen ? (
    <Modal
      variant={variant}
      title={title}
      isOpen
      onClose={toggleOpen}
      footer={
        <Stack hasGutter>
          {mutateResult ? (
            <ResolvedQuery result={mutateResult} errorTitle={errorText} spinnerMode="inline" />
          ) : null}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              onClick={mutateFn}
              isDisabled={mutateResult?.isLoading || confirmButtonDisabled}
            >
              {confirmButtonText}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={toggleOpen}
              isDisabled={mutateResult?.isLoading}
            >
              {cancelButtonText}
            </Button>
          </Flex>
        </Stack>
      }
    >
      {body}
    </Modal>
  ) : null;
