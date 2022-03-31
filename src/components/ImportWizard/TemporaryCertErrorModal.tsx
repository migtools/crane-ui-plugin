import { Modal, TextContent, Text, List, ListItem } from '@patternfly/react-core';
import * as React from 'react';
import { useTemporaryCORSProxyUrlQuery } from 'src/api/queries/temporaryCorsWorkaround';

export const TemporaryCertErrorModal: React.FunctionComponent = () => {
  const corsProxyQuery = useTemporaryCORSProxyUrlQuery();
  const url = corsProxyQuery.data?.url || '';
  const hasCertErrors = corsProxyQuery.data?.hasCertError || false;
  return (
    <Modal
      title="Certificate trust required"
      titleIconVariant="warning"
      isOpen={hasCertErrors}
      showClose={false}
      variant="large"
    >
      <TextContent>
        <Text component="h3">Hello QE tester!</Text>
        <Text component="p">
          Due to an OpenShift bug we are currently working around, this UI needs to make CORS
          requests to a service with an untrusted certificate. This will not be necessary in future
          builds.
        </Text>
        <Text component="p">To proceed:</Text>
        <List>
          <ListItem>
            Open this URL:{' '}
            <a href={url} target="_blank" rel="noreferrer">
              {url}
            </a>
          </ListItem>
          <ListItem>
            Dismiss the security warning by clicking &quot;Advanced&quot;, then &quot;Proceed to
            ...&quot; (Chrome) or &quot;Accept the risk and continue&quot; (Firefox). It is expected
            for this to result in a &quot;404 not found&quot; page.
          </ListItem>
          <ListItem>Return to this tab and reload the page.</ListItem>
        </List>
      </TextContent>
    </Modal>
  );
};
