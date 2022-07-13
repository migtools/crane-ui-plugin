import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Dropdown, KebabToggle, DropdownItem } from '@patternfly/react-core';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { useDeletePipelineMutation } from 'src/api/queries/pipelines';
import { useNamespaceContext } from 'src/context/NamespaceContext';

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

  // TODO is this working? does the element exist when focus is attempted? (renders when kebab opens)
  const onFocus = (id: string) => {
    const element = document.getElementById(id);
    element?.focus();
  };

  const [isAppKebabOpen, toggleAppKebabOpen] = React.useReducer((isOpen) => !isOpen, false);

  const onAppKebabSelect = () => {
    toggleAppKebabOpen();
    onFocus('toggle-id-app-kebab');
  };

  return (
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
          onClick={() =>
            // TODO add a confirmation dialog!
            deletePipelineMutation.mutate(pipelineGroup.pipelines.cutover)
          }
          isDisabled={deletePipelineMutation.isLoading}
        >
          Delete
        </DropdownItem>,
        <DropdownItem
          key="app-view-pipelies"
          component="button"
          onClick={() => history.push(`/dev-pipelines/ns/${namespace}?name=${pipelineGroup.name}`)}
        >
          View pipelines
        </DropdownItem>,
      ]}
    />
  );
};
