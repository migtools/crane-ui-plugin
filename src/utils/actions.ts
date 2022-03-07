import * as React from 'react';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement, Node, isGraph } from '@patternfly/react-topology';
import { importIconElement } from './icons';

// Copied from https://github.com/openshift/console/blob/d7b965d/frontend/packages/dev-console/src/actions/providers.ts#L29-L32
type TopologyActionProvider = (data: {
  element: GraphElement;
  connectorSource?: Node;
}) => [Action[], boolean, Error | undefined];

// Based on https://github.com/openshift/console/blob/d7b965d/frontend/packages/dev-console/src/actions/providers.ts#L66
export const useTopologyGraphActionProvider: TopologyActionProvider = ({ element }) =>
  React.useMemo(() => {
    if (isGraph(element)) {
      const namespace = element.getGraph().getData().namespace;
      return [
        [
          {
            id: 'import-application',
            label: 'Import application from cluster',
            icon: importIconElement,
            cta: {
              href: `/import-application/ns/${namespace}`,
            },
            path: 'add-to-project',
          },
        ],
        true,
        undefined,
      ];
    }
    return [[], true, undefined];
  }, [element]);
