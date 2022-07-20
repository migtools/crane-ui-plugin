import * as React from 'react';

// TODO - duplicated from forklift-ui and made generic, candidate for reuse in lib-ui

export const createLocalStorageContext = <KeyListType extends readonly string[]>(
  keyList: KeyListType,
) => {
  type LocalStorageValues = {
    [key in KeyListType[number]]?: string;
  };

  const getLocalStorageValues = (): LocalStorageValues =>
    keyList.reduce((values, key) => {
      return { ...values, [key]: window.localStorage.getItem(key) };
    }, {});

  interface ContextData {
    storageValues: LocalStorageValues;
    setStorageValues: (newValues: LocalStorageValues) => void;
  }

  const context = React.createContext<ContextData>({
    storageValues: {},
    setStorageValues: () => {
      console.error(
        'setStorageValues was called without a LocalStorageContextProvider in the tree',
      );
    },
  });

  const Provider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
    const [values, setStateValues] = React.useState<LocalStorageValues>(getLocalStorageValues());

    const setStorageValues = (newValues: LocalStorageValues) => {
      try {
        Object.keys(newValues).forEach((key: KeyListType[number]) => {
          if (newValues[key]) window.localStorage.setItem(key, newValues[key] as string);
        });
        setStateValues({ ...values, ...newValues });
      } catch (error) {
        console.error('Failed to update local storage', { newValues, error });
      }
    };

    React.useEffect(() => {
      const updateFromStorage = () => setStateValues(getLocalStorageValues());
      window.addEventListener('storage', updateFromStorage);
      return () => {
        window.removeEventListener('storage', updateFromStorage);
      };
    }, []);

    return (
      <context.Provider value={{ storageValues: values, setStorageValues }}>
        {children}
      </context.Provider>
    );
  };

  const useStorage = <KeyListType extends readonly string[]>(
    key: KeyListType[number],
  ): [string | undefined, (value: string) => void] => {
    const { storageValues, setStorageValues } = React.useContext(context);
    const value = storageValues[key];
    const setValue = (value: string) => setStorageValues({ [key]: value } as LocalStorageValues);
    return [value, setValue];
  };

  return { context, Provider, useStorage };
};
