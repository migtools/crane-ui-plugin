import { Wizard } from '@patternfly/react-core';
import * as React from 'react';

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
          component: <></>,
          enableNext: true,
        },
        {
          id: StepId.SourceProjectDetails,
          name: 'Project details',
          component: <></>,
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
          component: <></>,
          enableNext: true,
        },
        {
          id: StepId.PVsEdit,
          name: '',
          component: <></>,
          enableNext: true,
        },
      ],
    },
    {
      id: StepId.PipelineSettings,
      name: 'Pipeline settings',
      component: <></>,
      enableNext: true,
    },
    {
      id: StepId.Review,
      name: 'Review',
      component: <></>,
    },
  ];

  return (
    <Wizard
      steps={steps}
      onSubmit={(event) => event.preventDefault()}
      onSave={onSave}
      onClose={onClose}
      onBack={resetResultsOnNav}
      onGoToStep={resetResultsOnNav}
    />
  );
};
