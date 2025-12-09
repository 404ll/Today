import React from 'react';
import { ChevronsLeft, Menu, MessageSquare, Moon, Plus, Sun, Trash2 } from 'lucide-react';
import { useSideBarIsOpen } from '../context/SideBarContext';
import type { Session } from '../types';
import { useTheme } from '../context/ThemeContext';

type SidebarProps = {
  sessions: Session[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  deleteSession: (event: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  createNewSession: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeId,
  setActiveId,
  deleteSession,
  createNewSession,
}) => {
  const { isOpen, toggleSideBar } = useSideBarIsOpen();
  const { theme, toggleTheme } = useTheme();
  
  // 侧边栏收起状态 - 简单布局用 Tailwind
  if (!isOpen) {
    return (
      <div className="w-16 sidebar flex flex-col items-center justify-between py-4">
        <button
          type="button"
          onClick={toggleSideBar}
          className="text-white shadow-sm"
          aria-label="Open sidebar"
        >
          <img src="/logo.png" alt="Today" className="w-10 h-10 rounded-full" />
        </button>
      </div>
    );
  }

  // 侧边栏展开状态
  return (
    <div className="w-64 sidebar flex flex-col transition-all">
      {/* 头部：Logo + 标题 + 主题切换按钮 */}
      {/* 布局用 Tailwind，颜色用 CSS 类 */}
      <div className="p-4 sidebar-header border-b flex items-center gap-2 h-16" onClick={toggleSideBar}>
        <img src="/logo.png" alt="Today" className="w-10 h-10 rounded-full" />
        <h1 className="font-bold sidebar-title tracking-tight">Today</h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          className="sidebar-button transition-colors"
          aria-label="切换主题"
        >
          {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* 新建会话按钮 - 使用 CSS 类处理主题，Tailwind 处理布局 */}
      <div className="p-3">
        <button onClick={createNewSession} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> New Session
        </button>
      </div>

      {/* 会话列表 - 布局用 Tailwind，颜色用 CSS 类 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="text-xs font-bold sidebar-text uppercase tracking-wider px-2 py-2">
          Your Plans
        </div>
        {sessions.length === 0 && (
          <div className="text-sm px-2 italic" style={{ color: 'var(--text-secondary)' }}>
            No sessions.
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveId(session.id)}
            className={`sidebar-item flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-transparent ${
              activeId === session.id ? 'sidebar-item-active' : ''
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <MessageSquare
                size={18}
                className="flex-shrink-0"
                style={{
                  color:
                    activeId === session.id
                      ? 'var(--active-icon)'
                      : 'var(--text-tertiary)',
                }}
              />
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-medium truncate">{session.title}</span>
                <span className="text-[10px] opacity-60 truncate">
                  {session.status === 'completed'
                    ? 'Completed'
                    : session.status === 'planning'
                      ? 'Planning'
                      : `${session.todos.filter((t) => t.completed).length}/${session.todos.length} Done`}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => deleteSession(e, session.id)}
              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 ${
                activeId === session.id ? 'opacity-100' : ''
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 底部版本信息 - 布局用 Tailwind，颜色用 CSS 变量 */}
      <div
        className="p-4 border-t text-xs"
        style={{
          borderColor: 'var(--sidebar-header-border)',
          color: 'var(--text-secondary)',
        }}
      >
        v0.1 simple
      </div>
    </div>
  );
};

export default Sidebar;
