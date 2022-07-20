import { createLocalStorageContext } from './context/LocalStorageContext';

export const PROXY_SERVICE_URL = '/api/proxy/plugin/crane-ui-plugin/remote-cluster';
export const SECRET_SERVICE_URL = '/api/proxy/plugin/crane-ui-plugin/secret-service';

export const localStorageContext = createLocalStorageContext([
  'isCraneWizardWelcomeModalDisabled',
] as const);
