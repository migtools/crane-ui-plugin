import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal, TextContent, Text, Checkbox } from '@patternfly/react-core';
import { appImportsPageUrl, pipelinesListUrl, WizardReachedFromParam } from 'src/utils/paths';
import { useNamespaceContext } from 'src/common/context/NamespaceContext';
import { localStorageContext } from 'src/common/constants';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

type ImportWizardWelcomeModalProps = {
  reachedFrom: WizardReachedFromParam;
};

export const ImportWizardWelcomeModal: React.FunctionComponent<ImportWizardWelcomeModalProps> = ({
  reachedFrom,
}) => {
  const namespace = useNamespaceContext();
  const [isDisabled, setIsDisabled] = localStorageContext.useKey(
    'isCraneWizardWelcomeModalDisabled',
  );
  const [isOpen, setIsOpen] = React.useState(false);
  React.useEffect(() => {
    if (reachedFrom !== 'add' && isDisabled !== 'true') setIsOpen(true);
  }, [isDisabled, reachedFrom]);
  const onClose = () => setIsOpen(false);
  return (
    <Modal
      variant="small"
      title="Import application from another cluster"
      actions={[
        <Button key="confirm" variant="primary" onClick={onClose}>
          Get started
        </Button>,
      ]}
      isOpen={isOpen}
      onClose={onClose}
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
      <Checkbox
        className={spacing.mtMd}
        label="Don't show this again"
        id="show-again-checkbox"
        isChecked={isDisabled === 'true'}
        onChange={(checked: boolean) => {
          setIsDisabled(checked ? 'true' : 'false');
        }}
      />
    </Modal>
  );
};
