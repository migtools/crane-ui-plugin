import * as React from 'react';
import { Wizard, WizardStepFunctionType } from '@patternfly/react-core';

import { useNamespaceContext } from '../../context/NamespaceContext'; // Should we use tsconfig-paths?
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
  const formState = useImportWizardFormState();

  const allMutationResults = []; // TODO do we need this?

  // TODO do we need this?
  const resetResultsOnNav: WizardStepFunctionType = (_newStep, prevStep) => {
    if (prevStep.prevId === StepId.Review) {
      allMutationResults.forEach((result) => result.reset());
    }
  };

  const namespace = useNamespaceContext();

  return (
    <ImportWizardFormContext.Provider value={formState}>
      <Wizard
        steps={[
          {
            name: 'Source information',
            steps: [
              {
                id: StepId.SourceClusterProject,
                name: 'Cluster and project',
                component: <SourceClusterProjectStep />,
                enableNext: true,
              },
              {
                id: StepId.SourceProjectDetails,
                name: 'Project details',
                component: <SourceProjectDetailsStep />,
                enableNext: true,
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
                enableNext: true,
              },
              {
                id: StepId.PVEdit,
                name: 'Edit',
                component: <PVEditStep />,
                enableNext: true,
              },
            ],
          },
          {
            id: StepId.PipelineSettings,
            name: 'Pipeline settings',
            component: <PipelineSettingsStep />,
            enableNext: true,
          },
          {
            id: StepId.Review,
            name: 'Review',
            component: <ReviewStep />,
          },
        ]}
        onSubmit={(event) => event.preventDefault()}
        onSave={() => console.log('SAVE WIZARD!')}
        onClose={() => (document.location = `/add/ns/${namespace}`)}
        onBack={resetResultsOnNav}
        onGoToStep={resetResultsOnNav}
      />
    </ImportWizardFormContext.Provider>
  );
};
