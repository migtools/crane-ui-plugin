import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal, ModalProps, TextContent, Text } from '@patternfly/react-core';
import { appImportsPageUrl, pipelinesListUrl } from 'src/utils/paths';
import { useNamespaceContext } from 'src/common/context/NamespaceContext';

type ImportWizardWelcomeModalProps = Pick<ModalProps, 'isOpen' | 'onClose'>;

export const ImportWizardWelcomeModal: React.FunctionComponent<ImportWizardWelcomeModalProps> = (
  props,
) => {
  const namespace = useNamespaceContext();
  return (
    <Modal
      variant="small"
      title="Import application from another cluster"
      actions={[
        <Button key="confirm" variant="primary" onClick={props.onClose}>
          Get started
        </Button>,
      ]}
      {...props}
    >
      <TextContent>
        <Text component="p">
          This wizard will generate OpenShift Pipelines and pre-populated PipelineRuns for importing
          a manually deployed application on another cluster to an automated GitOps workflow.
        </Text>
        <Text component="p">
          The <Link to={appImportsPageUrl(namespace)}>Application Imports</Link> page can be used to
          view status and take actions on these pipelines, and they can also be seen in more detail
          on the <Link to={pipelinesListUrl(namespace)}>Pipelines</Link> page.
        </Text>
      </TextContent>
    </Modal>
  );
};
