import * as React from 'react';
import {
  TextContent,
  Text,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ImportWizardFormContext } from './ImportWizardFormContext';

import './SourceProjectDetailsStep.css';

export const SourceProjectDetailsStep: React.FunctionComponent = () => {
  const forms = React.useContext(ImportWizardFormContext);
  return (
    <>
      <TextContent className={spacing.mbXl}>
        <Text component="h2">Project details</Text>
        <Text component="h3">{forms.sourceClusterProject.values.namespace}</Text>
      </TextContent>
      <DescriptionList className="project-details-description-list" isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Pods</DescriptionListTerm>
          <DescriptionListDescription id="details-pods">TODO</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Persistent Volume Claims (PVCs)</DescriptionListTerm>
          <DescriptionListDescription id="details-pvcs">TODO</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Services</DescriptionListTerm>
          <DescriptionListDescription id="details-services">TODO</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Images</DescriptionListTerm>
          <DescriptionListDescription id="details-images">
            TODO
            {/* From Erik:
              "I think you can safely use ImageStream as the object that you list here. In openshift there is also an Image object, but it's cluster scoped, so it makes no sense in the context of this screen."
              "some of these fields will only make sense if the source cluster is an OpenShift cluster. I don't think native Kube has a concept of an "Image". There's a way to query an API server to ask "does this API exist?", so if the answer is no I think that's safe to exclude."
            */}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Total image size</DescriptionListTerm>
          <DescriptionListDescription id="details-imagesize">TODO</DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};
