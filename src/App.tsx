import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from 'lucide-react';
import ExecutionPhase from './components/ExecutionPhase';
import MainPanel from './components/MainPanel';
import Sidebar from './components/Sidebar';
import { SideBarIsOpenProvider } from './context/SideBarContext';
import { ThemeProvider } from './context/ThemeContext';
import type { Session } from './types';

const createSession = (): Session => ({
  id: Date.now().toString(),
  title: 'New Session',
  status: 'planning',
  messages: [{ role: 'ai', content: 'Hi! What would you like to learn today?' }],
  todos: [],
  createdAt: Date.now(),
});


function App() {
  // 1. 初始化：从 localStorage 读取 sessions
  const [sessions, setSessions] = useState<Session[]>(()=>{
    try{
      //从localStorage读取所有会话
      const saved = localStorage.getItem('today-sessions');
      if(saved){
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [createSession()];
      }
    } catch(error){
      console.error('读取会话失败:', error);
    }

    const initial = [createSession()];
    return initial;
  });

  // 2. 初始化：从 localStorage 读取 activeId
  const [activeId, setActiveId] = useState<string | null>(()=>{
    try{
      const saved = localStorage.getItem('today-active-id');
      return saved || null;
    } catch(error){
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
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
  };

  // 6. 更新会话（
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

  const activeSession = sessions.find((s) => s.id === activeId); //当前选中的会话

  return (
    <ThemeProvider>
      <SideBarIsOpenProvider>
        {/* 布局用 Tailwind，背景色用 CSS 类 */}
        <div className="flex h-screen font-sans overflow-hidden">
          <Sidebar
            sessions={sessions}
            activeId={activeId}
            setActiveId={setActiveId}
            deleteSession={deleteSession}
            createNewSession={createNewSession}
          />

          {/* 主内容区域 - 布局用 Tailwind，背景色用 CSS 类 */}
          <main className="main-content flex flex-col h-full overflow-hidden relative transition-colors">
            {activeSession ? (
              <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-5xl mx-auto p-4 md:p-8 h-full">
                  {activeSession.status === 'planning' && (
                    <MainPanel
                      key={activeSession.id}
                      session={activeSession}
                      onUpdate={(data) => updateSession(activeSession.id, data)}
                    />
                  )}

                  {(activeSession.status === 'executing' || activeSession.status === 'completed') && (
                    <ExecutionPhase
                      key={activeSession.id}
                      session={activeSession}
                      onUpdate={(data) => updateSession(activeSession.id, data)}
                      onComplete={() => updateSession(activeSession.id, { status: 'completed' })}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state h-full flex flex-col items-center justify-center">
                <Layout size={64} className="mb-6 opacity-10" />
                <p className="text-lg font-medium opacity-50">Select a session to start learning</p>
              </div>
            )}
          </main>
        </div>
      </SideBarIsOpenProvider>
    </ThemeProvider>
  );
}

export default App;
