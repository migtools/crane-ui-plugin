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
import { PVSelectStep } from './PVSelectStep';
import { PVEditStep } from './PVEditStep';
import { PipelineSettingsStep } from './PipelineSettingsStep';
import { ReviewStep } from './ReviewStep';
import { ImportWizardFormContext, useImportWizardFormState } from './ImportWizardFormContext';

import './ImportWizard.css';

enum StepId {
  SourceClusterProject = 0,
  SourceProjectDetails,
  PVSelect,
  PVEdit,
  PipelineSettings,
  Review,
}

export const ImportWizard: React.FunctionComponent = () => {
  const forms = useImportWizardFormState();

  const formsByStepId: Record<StepId, IFormState<unknown> | null> = {
    [StepId.SourceClusterProject]: forms.sourceClusterProject,
    [StepId.SourceProjectDetails]: null,
    [StepId.PVSelect]: forms.pvSelect,
    [StepId.PVEdit]: forms.pvEdit,
    [StepId.PipelineSettings]: forms.pipelineSettings,
    [StepId.Review]: null,
  };
  const firstInvalidFormStepId = Object.values(StepId).find(
    (id: StepId) => formsByStepId[id] && !formsByStepId[id].isValid,
  ) as StepId | undefined;
  const stepIdReached =
    firstInvalidFormStepId !== undefined ? firstInvalidFormStepId : StepId.Review;

  const somePVRowIsEditMode = Object.values(forms.pvEdit.values.isEditModeByPV).some(
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
      forms.review.fields.pipelineYaml.prefill('TODO generate yaml here');
      forms.review.fields.pipelineRunYaml.prefill('TODO generate yaml here');
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
            name: 'Persistent volumes',
            steps: [
              {
                id: StepId.PVSelect,
                name: 'Select',
                component: <PVSelectStep />,
                canJumpTo: canMoveToStep(StepId.PVSelect),
              },
              {
                id: StepId.PVEdit,
                name: 'Edit',
                component: <PVEditStep />,
                canJumpTo: canMoveToStep(StepId.PVEdit),
              },
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
                const isNextDisabled = !canMoveToStep((activeStep.id as StepId) + 1);
                const isBackDisabled = !canMoveToStep((activeStep.id as StepId) - 1);
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
