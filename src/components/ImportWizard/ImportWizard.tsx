import * as React from 'react';
import { Wizard, WizardFooter, WizardContextConsumer, Button } from '@patternfly/react-core';
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

  return (
    <ImportWizardFormContext.Provider value={forms}>
      <Wizard
        steps={[
          {
            name: 'Source information',
            steps: [
              {
                id: StepId.SourceClusterProject,
                name: 'Cluster and project',
                component: <SourceClusterProjectStep />,
                canJumpTo: stepIdReached >= StepId.SourceClusterProject,
              },
              {
                id: StepId.SourceProjectDetails,
                name: 'Project details',
                component: <SourceProjectDetailsStep />,
                canJumpTo: stepIdReached >= StepId.SourceProjectDetails,
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
                canJumpTo: stepIdReached >= StepId.PVSelect,
              },
              {
                id: StepId.PVEdit,
                name: 'Edit',
                component: <PVEditStep />,
                canJumpTo: stepIdReached >= StepId.PVEdit,
              },
            ],
          },
          {
            id: StepId.PipelineSettings,
            name: 'Pipeline settings',
            component: <PipelineSettingsStep />,
            canJumpTo: stepIdReached >= StepId.PipelineSettings,
          },
          {
            id: StepId.Review,
            name: 'Review',
            component: <ReviewStep />,
            canJumpTo: stepIdReached >= StepId.Review,
          },
        ]}
        onSubmit={(event) => event.preventDefault()}
        onSave={() => console.log('SAVE WIZARD!')}
        onClose={() => (document.location = `/add/ns/${namespace}`)}
        // onBack={resetResultsOnNav} // TODO do we need this?
        // onGoToStep={resetResultsOnNav} // TODO do we need this?
        footer={
          <WizardFooter>
            <WizardContextConsumer>
              {({ activeStep, onNext, onBack, onClose }) => {
                const onFinalStep = activeStep.id === StepId.Review;
                const stepForm = formsByStepId[activeStep.id as StepId];
                const isNextDisabled = !!stepForm && !stepForm.isValid;
                const isBackDisabled = false;
                return (
                  <>
                    <Button
                      variant="primary"
                      type="submit"
                      onClick={onNext}
                      isDisabled={isNextDisabled}
                    >
                      {onFinalStep ? 'Finish' : 'Next'}
                    </Button>
                    <Button variant="secondary" onClick={onBack} isDisabled={isBackDisabled}>
                      Back
                    </Button>
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
