import * as React from 'react';

// TODO candidate for lib-ui

export const useLocalStorage = (key: string): [string | null, (value: string | null) => void] => {
  const [value, setCachedValue] = React.useState<string | null>(window.localStorage.getItem(key));

  const setValue = (newValue: string | null) => {
    if (newValue === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, newValue);
    }
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));
  };

  React.useEffect(() => {
    const onStorageUpdated = (event: StorageEvent) => {
      if (event.key === key) setCachedValue(event.newValue);
    };
    window.addEventListener('storage', onStorageUpdated);
    return () => {
      window.removeEventListener('storage', onStorageUpdated);
    };
  }, [key]);

  return [value, setValue];
};
