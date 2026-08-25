import React from 'react';

export interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const DrawerContext = React.createContext<DrawerContextType>({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function useDrawer() {
  return React.useContext(DrawerContext);
}