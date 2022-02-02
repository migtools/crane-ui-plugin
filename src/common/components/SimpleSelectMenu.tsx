import * as React from 'react';
import { MenuToggle, Menu, Popper, MenuToggleProps, MenuProps } from '@patternfly/react-core';

// Based on https://www.patternfly.org/v4/demos/composable-menu#select-menu

interface SimpleSelectMenuProps<T extends string | number> extends MenuProps {
  selected: T;
  setSelected: (value: T) => void;
  children: React.ReactNode;
  toggleProps?: Partial<MenuToggleProps>;
}

export const SimpleSelectMenu = <T extends string | number>({
  selected,
  setSelected,
  children,
  toggleProps = {},
  ...props
}: React.PropsWithChildren<SimpleSelectMenuProps<T>>): JSX.Element | null => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>();
  const menuRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    const handleMenuKeys = (event: KeyboardEvent) => {
      if (isOpen && menuRef.current?.contains(event.target as Node)) {
        if (event.key === 'Escape' || event.key === 'Tab') {
          setIsOpen(!isOpen);
          toggleRef.current?.focus();
        }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleMenuKeys);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleMenuKeys);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, menuRef]);

  const onToggleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation(); // Stop handleClickOutside from handling
    setTimeout(() => {
      if (menuRef.current) {
        const firstElement = menuRef.current.querySelector('li > button:not(:disabled)');
        firstElement && (firstElement as HTMLButtonElement).focus();
      }
    }, 0);
    setIsOpen(!isOpen);
  };

  const toggle = (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} {...toggleProps}>
      {selected}
    </MenuToggle>
  );
  const menu = (
    <Menu
      ref={menuRef}
      id="select-menu"
      onSelect={(_ev, itemId) => {
        setSelected(itemId as T);
        setIsOpen(false);
      }}
      selected={selected}
      {...props}
    >
      {children}
    </Menu>
  );
  return <Popper trigger={toggle} popper={menu} isVisible={isOpen} />;
};
