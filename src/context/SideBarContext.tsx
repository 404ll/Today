import { createContext, useContext, useState } from 'react';
export const SideBarIsOpenContext = createContext<{ isOpen: boolean; toggleSideBar: () => void }>({ isOpen: false, toggleSideBar: () => {} });

export const SideBarIsOpenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSideBar = () => {
    setIsOpen(!isOpen);
  };
  return <SideBarIsOpenContext.Provider value={{ isOpen, toggleSideBar }}>{children}</SideBarIsOpenContext.Provider>;
};

export const useSideBarIsOpen = () => {
  return useContext(SideBarIsOpenContext);
};