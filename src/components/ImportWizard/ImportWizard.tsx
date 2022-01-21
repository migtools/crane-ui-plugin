import * as React from 'react';
import { Wizard, WizardStepFunctionType } from '@patternfly/react-core';
import { useNamespaceContext } from '../../context/NamespaceContext'; // Should we use tsconfig-paths?

export const ImportWizard: React.FunctionComponent = () => {
  enum StepId {
    SourceClusterProject = 0,
    SourceProjectDetails,
    PVsSelect,
    PVsEdit,
    PipelineSettings,
    Review,
  }

  const steps = [
    {
      name: 'Source information',
      steps: [
        {
          id: StepId.SourceClusterProject,
          name: 'Cluster and project',
          component: <>TODO</>,
          enableNext: true,
        },
        {
          id: StepId.SourceProjectDetails,
          name: 'Project details',
          component: <>TODO</>,
          enableNext: true,
        },
      ],
    },
    {
      name: 'Persistent volumes',
      steps: [
        {
          id: StepId.PVsSelect,
          name: 'Select',
          component: <>TODO</>,
          enableNext: true,
        },
        {
          id: StepId.PVsEdit,
          name: 'Edit',
          component: <>TODO</>,
          enableNext: true,
        },
      ],
    },
    {
      id: StepId.PipelineSettings,
      name: 'Pipeline settings',
      component: <>TODO</>,
      enableNext: true,
    },
    {
      id: StepId.Review,
      name: 'Review',
      component: <>TODO</>,
    },
  ];

  const allMutationResults = []; // TODO do we need this?

  // TODO do we need this?
  const resetResultsOnNav: WizardStepFunctionType = (_newStep, prevStep) => {
    if (prevStep.prevId === StepId.Review) {
      allMutationResults.forEach((result) => result.reset());
    }
  };

  const namespace = useNamespaceContext();

  return (
    <Wizard
      steps={steps}
      onSubmit={(event) => event.preventDefault()}
      onSave={() => console.log('SAVE WIZARD!')}
      onClose={() => (document.location = `/add/ns/${namespace}`)}
      onBack={resetResultsOnNav}
      onGoToStep={resetResultsOnNav}
    />
  );
};
