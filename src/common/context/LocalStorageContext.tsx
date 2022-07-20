import * as React from 'react';

// TODO - duplicated from forklift-ui and made generic, candidate for reuse in lib-ui

type LocalStorageValues<KeyListType extends readonly string[]> = {
  [key in KeyListType[number]]?: string;
};

const getLocalStorageValues = <KeyListType extends readonly string[]>(
  keyList: KeyListType,
): LocalStorageValues<KeyListType> =>
  keyList.reduce((values, key) => {
    return { ...values, [key]: window.localStorage.getItem(key) };
  }, {});

interface LocalStorageContextValue<KeyListType extends readonly string[]> {
  storageValues: LocalStorageValues<KeyListType>;
  setStorageValues: (newValues: LocalStorageValues<KeyListType>) => void;
}

interface LocalStorageContextProviderProps<KeyListType extends readonly string[]> {
  children: React.ReactNode;
  context: React.Context<LocalStorageContextValue<KeyListType>>;
  keyList: KeyListType;
}

const LocalStorageContextProvider = <KeyListType extends readonly string[]>({
  children,
  context,
  keyList,
}: React.PropsWithChildren<LocalStorageContextProviderProps<KeyListType>>): JSX.Element | null => {
  const [values, setValues] = React.useState<LocalStorageValues<KeyListType>>(
    getLocalStorageValues(keyList),
  );

  const setStorageValues = (newValues: LocalStorageValues<KeyListType>) => {
    try {
      Object.keys(newValues).forEach((key: KeyListType[number]) => {
        if (newValues[key]) window.localStorage.setItem(key, newValues[key] as string);
      });
      setValues({ ...values, ...newValues });
    } catch (error) {
      console.error('Failed to update local storage', { newValues, error });
    }
  };

  React.useEffect(() => {
    const updateFromStorage = () => setValues(getLocalStorageValues(keyList));
    window.addEventListener('storage', updateFromStorage);
    return () => {
      window.removeEventListener('storage', updateFromStorage);
    };
  }, [keyList]);

  return (
    <context.Provider value={{ storageValues: values, setStorageValues }}>
      {children}
    </context.Provider>
  );
};

const useLocalStorageContextKey = <KeyListType extends readonly string[]>(
  context: React.Context<LocalStorageContextValue<KeyListType>>,
  key: KeyListType[number],
): [string | undefined, (value: string) => void] => {
  const { storageValues, setStorageValues } = React.useContext(context);
  const value = storageValues[key];
  const setValue = (value: string) =>
    setStorageValues({ [key]: value } as LocalStorageValues<KeyListType>);
  return [value, setValue];
};

export const createLocalStorageContext = <KeyListType extends readonly string[]>(
  keyList: KeyListType,
) => {
  const context = React.createContext<LocalStorageContextValue<KeyListType>>({
    storageValues: {},
    setStorageValues: () => {
      console.error(
        'setStorageValues was called without a LocalStorageContextProvider in the tree',
      );
    },
  });
  const Provider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => (
    <LocalStorageContextProvider context={context} keyList={keyList}>
      {children}
    </LocalStorageContextProvider>
  );
  const useKey = (key: KeyListType[number]) => useLocalStorageContextKey(context, key);
  return { context, Provider, useKey };
};
