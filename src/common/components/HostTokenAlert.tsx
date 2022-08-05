import * as React from 'react';
import { Alert } from '@patternfly/react-core';
import { useValidatedNamespace } from '../hooks/useValidatedNamespace';

interface HostTokenAlertProps {
  className?: string;
}

export const HostTokenAlert: React.FunctionComponent<HostTokenAlertProps> = ({
  className = '',
}) => {
  const { namespace } = useValidatedNamespace();
  return (
    <Alert
      className={className}
      variant="info"
      isInline
      isLiveRegion
      title={
        <>
          If you proceed, your current session&apos;s OAuth token will be stored in a secret in the
          &quot;{namespace}&quot; namespace.
        </>
      }
    >
      This allows the pipeline tasks to be performed with the required permissions.
    </Alert>
  );
};
