import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Title,
  Button,
  Dropdown,
  KebabToggle,
  DropdownItem,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { CranePipelineGroup } from 'src/api/types/CranePipeline';
import { useNamespaceContext } from 'src/context/NamespaceContext';
import {
  isPipelineRunStarting,
  useDeletePipelineMutation,
  useStartPipelineRunMutation,
} from 'src/api/queries/pipelines';

interface PipelineGroupHeaderProps {
  pipelineGroup: CranePipelineGroup;
  deletePipelineMutation: ReturnType<typeof useDeletePipelineMutation>;
}

export const PipelineGroupHeader: React.FunctionComponent<PipelineGroupHeaderProps> = ({
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

  const startStageMutation = useStartPipelineRunMutation(pipelineGroup, 'stage');
  const isStageStarting = isPipelineRunStarting(pipelineGroup, startStageMutation);
  const startCutoverMutation = useStartPipelineRunMutation(pipelineGroup, 'cutover');
  const isCutoverStarting = isPipelineRunStarting(pipelineGroup, startCutoverMutation);
  const isSomePipelineRunStarting = isStageStarting || isCutoverStarting;

  return (
    <Level hasGutter className={spacing.mbMd}>
      <Title headingLevel="h3">{pipelineGroup.name}</Title>
      <LevelItem>
        {/* TODO add tooltip on disabled stage when there are no PVCs */}
        <Button
          id="start-stage-button"
          onClick={() => {
            // TODO add a confirm modal here
            startStageMutation.mutate();
          }}
          variant="primary"
          className={spacing.mrSm}
          isAriaDisabled={!pipelineGroup.pipelines.stage || isSomePipelineRunStarting}
          {...(isStageStarting
            ? {
                spinnerAriaValueText: 'Starting',
                spinnerAriaLabelledBy: 'start-stage-button',
                isLoading: true,
              }
            : {})}
        >
          Stage
        </Button>
        <Button
          id="start-cutover-button"
          onClick={() => {
            // TODO add a confirm modal here
            startCutoverMutation.mutate();
          }}
          variant="primary"
          isAriaDisabled={isSomePipelineRunStarting}
          {...(isCutoverStarting
            ? {
                spinnerAriaValueText: 'Starting',
                spinnerAriaLabelledBy: 'start-stage-button',
                isLoading: true,
              }
            : {})}
        >
          Cutover
        </Button>
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
              onClick={() =>
                history.push(`/dev-pipelines/ns/${namespace}?name=${pipelineGroup.name}`)
              }
            >
              View pipelines
            </DropdownItem>,
          ]}
        />
      </LevelItem>
    </Level>
  );
};
