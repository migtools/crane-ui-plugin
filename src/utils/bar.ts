import { SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

export default (label: string) => `Hello ${label} Function!`;

export const testHandler = function(callback: SetFeatureFlag) {
  // eslint-disable-next-line no-console
  console.log('testHandler called', arguments);
};
