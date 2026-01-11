import React, { useEffect, useState } from 'react';
import { Layout as LayoutIcon } from 'lucide-react';
import { MainPanel } from '../components/session/MainPanel';
import { Layout } from '../components/layout/Layout';
import type { Session } from '../types';

const createSession = (): Session => ({
  id: Date.now().toString(),
  title: 'New Session',
  status: 'planning',
  messages: [{ role: 'ai', content: 'Hi! What would you like to learn today?' }],
  todos: [],
  createdAt: Date.now(),
});

function HomePage() {
  // 1. 初始化：从 localStorage 读取 sessions
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      //从localStorage读取所有会话
      const saved = localStorage.getItem('today-sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createSession()];
      }
    } catch (error) {
      console.error('读取会话失败:', error);
    }
    // 如果没有保存的会话，创建一个新的初始会话
    const initial = [createSession()];
    return initial;
  });

  // 2. 初始化：从 localStorage 读取 activeId
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('today-active-id');
      return saved || null;
    } catch (error) {
      console.error('读取activeId失败:', error);
    }
    return null;
  });

  // 3. 自动保存 sessions
  useEffect(() => {
    try {
      localStorage.setItem('today-sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('保存 sessions 失败:', error);
    }
  }, [sessions]);

  // 4. 自动保存 activeId
  useEffect(() => {
    try {
      if (activeId) {
        localStorage.setItem('today-activeId', activeId);
      } else {
        localStorage.removeItem('today-activeId');
      }
    } catch (error) {
      console.error('保存 activeId 失败:', error);
    }
  }, [activeId]);

  // 5. 创建会话
  const createNewSession = () => {
    const newSession = createSession();
    setSessions((prev) => [newSession, ...prev]);// 新会话添加到最前面  
    setActiveId(newSession.id);// 切换到新会话
  };

  // 6. 更新会话
  const updateSession = (id: string, data: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  // 7. 删除会话
  const deleteSession = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;

    const newSessions = sessions.filter((s) => s.id !== id);
    setSessions(newSessions);

    if (activeId === id) {
      setActiveId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeId) || sessions[0];

  return (
    <Layout
      sessions={sessions}
      activeId={activeId}
      setActiveId={setActiveId}
      deleteSession={deleteSession}
      createNewSession={createNewSession}
    >
      {activeSession ? (
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-5xl mx-auto p-4 md:p-8 h-full">
              <MainPanel
                key={activeSession.id}
                session={activeSession}
                onUpdate={(data) => updateSession(activeSession.id, data)}
              />
          </div>
        </div>
      ) : (
        <div className="empty-state h-full flex flex-col items-center justify-center">
          <LayoutIcon size={64} className="mb-6 opacity-10" />
          <p className="text-lg font-medium opacity-50">Select a session to start learning</p>
        </div>
      )}

    </Layout>
  );
};

export default HomePage;

