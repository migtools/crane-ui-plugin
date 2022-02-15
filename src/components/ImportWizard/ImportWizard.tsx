import * as React from 'react';
import {
  Wizard,
  WizardFooter,
  WizardContextConsumer,
  Button,
  Tooltip,
  WizardStepFunctionType,
} from '@patternfly/react-core';
import wizardStyles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { IFormState } from '@konveyor/lib-ui';

import { useNamespaceContext } from 'src/context/NamespaceContext';
import { SourceClusterProjectStep } from './SourceClusterProjectStep';
import { SourceProjectDetailsStep } from './SourceProjectDetailsStep';
import { PVCSelectStep } from './PVCSelectStep';
import { PVCEditStep } from './PVCEditStep';
import { PipelineSettingsStep } from './PipelineSettingsStep';
import { ReviewStep } from './ReviewStep';
import { ImportWizardFormContext, useImportWizardFormState } from './ImportWizardFormContext';

import './ImportWizard.css';
import { TmpCrudTesting } from '../TmpCrudTesting';

enum StepId {
  SourceClusterProject = 0,
  SourceProjectDetails,
  PVCSelect,
  PVCEdit,
  PipelineSettings,
  Review,
}

export const ImportWizard: React.FunctionComponent = () => {
  const forms = useImportWizardFormState();

  const formsByStepId: Record<StepId, IFormState<unknown> | null> = {
    [StepId.SourceClusterProject]: forms.sourceClusterProject,
    [StepId.SourceProjectDetails]: null,
    [StepId.PVCSelect]: forms.pvcSelect,
    [StepId.PVCEdit]: forms.pvcEdit,
    [StepId.PipelineSettings]: forms.pipelineSettings,
    [StepId.Review]: null,
  };
  const hiddenStepIds = forms.pvcSelect.values.selectedPVCs.length === 0 ? [StepId.PVCEdit] : [];
  const nextVisibleStep = (currentStepId: StepId) => {
    let newStepId = currentStepId + 1;
    while (hiddenStepIds.includes(newStepId)) newStepId++;
    return newStepId;
  };
  const prevVisibleStep = (currentStepId: StepId) => {
    let newStepId = currentStepId - 1;
    while (hiddenStepIds.includes(newStepId)) newStepId--;
    return newStepId;
  };

  const firstInvalidFormStepId = Object.values(StepId).find(
    (id: StepId) => formsByStepId[id] && !hiddenStepIds.includes(id) && !formsByStepId[id].isValid,
  ) as StepId | undefined;
  const stepIdReached =
    firstInvalidFormStepId !== undefined ? firstInvalidFormStepId : StepId.Review;

  const somePVRowIsEditMode = Object.values(forms.pvcEdit.values.isEditModeByPVC).some(
    (isEditMode) => isEditMode,
  );
  const allNavDisabled = somePVRowIsEditMode;
  const navDisabledReason = somePVRowIsEditMode
    ? 'Confirm or cancel row edits before proceeding'
    : null;
  const canMoveToStep = (stepId: StepId) =>
    !allNavDisabled && stepId >= 0 && stepIdReached >= stepId;

  /*
  const allMutationResults = []; // TODO do we need this?

  // TODO do we need this?
  const resetResultsOnNav: WizardStepFunctionType = (_newStep, prevStep) => {
    if (prevStep.prevId === StepId.Review) {
      allMutationResults.forEach((result) => result.reset());
    }
  };
  */

  const namespace = useNamespaceContext();

  const onMoveToStep: WizardStepFunctionType = (newStep, prevStep) => {
    if (newStep.id === StepId.Review) {
      // TODO generate YAML from forms
      forms.review.fields.pipelineYaml.prefill('---\nTODO: generate Pipeline yaml here');
      forms.review.fields.pipelineRunYaml.prefill('---\nTODO: generate PipelineRun yaml here');
    }
  };

  return (
    <ImportWizardFormContext.Provider value={forms}>
      <Wizard
        id="crane-import-wizard"
        steps={[
          {
            name: 'Source information',
            steps: [
              {
                id: StepId.SourceClusterProject,
                name: 'Cluster and project',
                component: <SourceClusterProjectStep />,
                canJumpTo: canMoveToStep(StepId.SourceClusterProject),
              },
              {
                id: StepId.SourceProjectDetails,
                name: 'Project details',
                component: <SourceProjectDetailsStep />,
                canJumpTo: canMoveToStep(StepId.SourceProjectDetails),
              },
            ],
          },
          {
            name: 'Persistent volume claims',
            steps: [
              {
                id: StepId.PVCSelect,
                name: 'Select',
                component: <PVCSelectStep />,
                canJumpTo: canMoveToStep(StepId.PVCSelect),
              },
              ...(!hiddenStepIds.includes(StepId.PVCEdit)
                ? [
                    {
                      id: StepId.PVCEdit,
                      name: 'Edit',
                      component: <PVCEditStep />,
                      canJumpTo: canMoveToStep(StepId.PVCEdit),
                    },
                  ]
                : []),
            ],
          },
          {
            id: StepId.PipelineSettings,
            name: 'Pipeline settings',
            component: <PipelineSettingsStep />,
            canJumpTo: canMoveToStep(StepId.PipelineSettings),
          },
          {
            id: StepId.Review,
            name: 'Review',
            component: <ReviewStep />,
            canJumpTo: canMoveToStep(StepId.Review),
          },
        ]}
        onSubmit={(event) => event.preventDefault()}
        onSave={() => console.log('SAVE WIZARD!')}
        onClose={() => (document.location = `/add/ns/${namespace}`)}
        onNext={onMoveToStep}
        onBack={onMoveToStep}
        onGoToStep={onMoveToStep}
        footer={
          <WizardFooter>
            <WizardContextConsumer>
              {({ activeStep, onNext, onBack, onClose }) => {
                const onFinalStep = activeStep.id === StepId.Review;
                const isNextDisabled = !canMoveToStep(nextVisibleStep(activeStep.id as StepId));
                const isBackDisabled = !canMoveToStep(prevVisibleStep(activeStep.id as StepId));
                return (
                  <>
                    <Tooltip
                      content={navDisabledReason}
                      trigger={navDisabledReason ? 'mouseenter focus' : ''}
                    >
                      <Button
                        variant="primary"
                        type="submit"
                        onClick={onNext}
                        isAriaDisabled={isNextDisabled}
                      >
                        {onFinalStep ? 'Finish' : 'Next'}
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={navDisabledReason}
                      trigger={navDisabledReason ? 'mouseenter focus' : ''}
                    >
                      <Button variant="secondary" onClick={onBack} isAriaDisabled={isBackDisabled}>
                        Back
                      </Button>
                    </Tooltip>
                    <div className={wizardStyles.wizardFooterCancel}>
                      <Button variant="link" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                    <TmpCrudTesting />
                  </>
                );
              }}
            </WizardContextConsumer>
          </WizardFooter>
        }
      />
    </ImportWizardFormContext.Provider>
  );
};
