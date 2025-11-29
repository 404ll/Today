import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import type { Session } from '../types';

type SidebarProps = {
  sessions: Session[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  deleteSession: (event: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  createNewSession: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeId, setActiveId, deleteSession, createNewSession }) => {
  return (
    <div
      className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-all`}
    >
      <div className="p-4 border-b border-gray-100 flex items-center gap-2 h-16">
        <div className="text-white shadow-sm">
          <img src="/logo.png" alt="Today" className="w-10 h-10 rounded-full" />
        </div>
        <h1 className="font-bold text-gray-900 tracking-tight ">Today</h1>
      </div>

      <div className="p-3">
        <button
          onClick={createNewSession}
          className="w-full flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-2">
          Your Plans
        </div>
        {sessions.length === 0 && (
          <div className="text-sm text-gray-400 px-2 italic">No sessions.</div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => setActiveId(session.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-transparent
                        ${
                          activeId === session.id
                            ? "bg-blue-50 text-blue-700 border-blue-100 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:border-gray-100"
                        }`}
          >
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <MessageSquare
                size={18}
                className={`flex-shrink-0 ${
                  activeId === session.id ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-medium truncate">
                  {session.title}
                </span>
                <span className="text-[10px] opacity-60 truncate">
                  {session.status === "completed"
                    ? "Completed"
                    : session.status === "planning"
                    ? "Planning"
                    : `${session.todos.filter((t) => t.completed).length}/${
                        session.todos.length
                      } Done`}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => deleteSession(e, session.id)}
              className={`p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500
                            ${activeId === session.id ? "opacity-100" : ""} 
                        `}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 text-xs text-gray-400">
        v0.1 simple
      </div>
    </div>
  );
};

export default Sidebar;
