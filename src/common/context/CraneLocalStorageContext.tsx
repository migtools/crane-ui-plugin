import { createLocalStorageContext } from './LocalStorageContext';

export const LOCAL_STORAGE_KEYS = ['isCraneWizardWelcomeModalDisabled'] as const;
export const localStorageContext = createLocalStorageContext<typeof LOCAL_STORAGE_KEYS>();
