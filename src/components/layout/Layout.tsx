import type { ReactNode, MouseEvent } from 'react';
import { Sidebar } from './Sidebar';
import type { Session } from '../../types';

type LayoutProps = {
  children: ReactNode;
  sessions?: Session[];
  activeId?: string | null;
  setActiveId?: (id: string) => void;
  deleteSession?: (event: MouseEvent<HTMLButtonElement>, id: string) => void;
  createNewSession?: () => void;
};

/**
 * 布局组件
 * 用于在多个页面中共享 Sidebar
 */
export function Layout({
  children,
  sessions = [],
  activeId = null,
  setActiveId = () => {},
  deleteSession = () => {},
  createNewSession = () => {},
}: LayoutProps) {
  return (
    <div className="flex h-screen font-sans overflow-hidden relative">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        setActiveId={setActiveId}
        deleteSession={deleteSession}
        createNewSession={createNewSession}
      />
      <main className="main-content flex flex-col h-full overflow-hidden relative transition-colors flex-1">
        {children}
      </main>
    </div>
  );
}

