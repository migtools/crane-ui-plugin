import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown, KebabToggle, DropdownItem } from '@patternfly/react-core';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { useDeletePipelineMutation } from 'src/api/queries/pipelines';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import { pipelinesListUrl } from 'src/utils/paths';
import { ConfirmModal } from 'src/common/components/ConfirmModal';

interface PipelineGroupKebabMenuProps {
  pipelineGroup: CranePipelineGroup;
  deletePipelineMutation: ReturnType<typeof useDeletePipelineMutation>;
}

export const PipelineGroupKebabMenu: React.FunctionComponent<PipelineGroupKebabMenuProps> = ({
  pipelineGroup,
  deletePipelineMutation,
}) => {
  const namespace = useNamespaceContext();
  const history = useHistory();

  const onFocus = (id: string) => {
    const element = document.getElementById(id);
    element?.focus();
  };

  const [isAppKebabOpen, toggleAppKebabOpen] = React.useReducer((isOpen) => !isOpen, false);

  const onAppKebabSelect = () => {
    toggleAppKebabOpen();
    onFocus('toggle-id-app-kebab');
  };

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = React.useState(false);

  return (
    <>
      <Dropdown
        onSelect={onAppKebabSelect}
        toggle={<KebabToggle onToggle={toggleAppKebabOpen} id="toggle-id-app-kebab" />}
        isOpen={isAppKebabOpen}
        isPlain
        position="right"
        dropdownItems={[
          <DropdownItem
            key="app-delete"
            component="button"
            onClick={() => setIsConfirmDeleteModalOpen(true)}
            isDisabled={deletePipelineMutation.isLoading}
          >
            Delete
          </DropdownItem>,
          <DropdownItem
            key="app-view-pipelies"
            component="button"
            onClick={() => history.push(pipelinesListUrl(namespace, pipelineGroup.name))}
          >
            View pipelines
          </DropdownItem>,
        ]}
      />
      <ConfirmModal
        title="Delete pipelines and history?"
        body={
          <>
            This will delete all Pipelines, PipelineRuns and Secrets that were created with the
            group name <strong>&quot;{pipelineGroup.name}&quot;</strong>. All related logs and
            history will be lost.
          </>
        }
        confirmButtonText="Delete"
        isOpen={isConfirmDeleteModalOpen}
        toggleOpen={() => setIsConfirmDeleteModalOpen(!isConfirmDeleteModalOpen)}
        mutateFn={() => deletePipelineMutation.mutate(pipelineGroup.pipelines.cutover)}
        mutateResult={deletePipelineMutation}
        errorText="Cannot delete resources"
      />
    </>
  );
};
