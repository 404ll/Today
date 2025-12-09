import { createContext, useContext, useState } from 'react';
export const SideBarIsOpenContext = createContext<{ isOpen: boolean; toggleSideBar: () => void }>({ isOpen: true, toggleSideBar: () => {} });

export const SideBarIsOpenProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSideBar = () => {
    setIsOpen(!isOpen);
  };
  return <SideBarIsOpenContext.Provider value={{ isOpen, toggleSideBar }}>{children}</SideBarIsOpenContext.Provider>;
};

export const useSideBarIsOpen = () => {
  return useContext(SideBarIsOpenContext);
};