import React, { useMemo, useState } from 'react';
import { Layout } from 'lucide-react';
import ExecutionPhase from './components/ExecutionPhase';
import PlanningPhase from './components/PlanningPhase';
import Sidebar from './components/Sidebar';
import { SideBarIsOpenProvider } from './context/SideBarContext';
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
  const initialSession = useMemo(() => createSession(), []);
  const [sessions, setSessions] = useState<Session[]>([initialSession]);
  const [activeId, setActiveId] = useState<string | null>(initialSession.id);
  const [isSidebarOpen] = useState(true); // TODO: remove when responsive sidebar is finished

  const createNewSession = () => {
    const newSession = createSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
  };

  const updateSession = (id: string, data: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSession = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;

    const newSessions = sessions.filter((s) => s.id !== id);
    setSessions(newSessions);
    if (activeId === id) {
      setActiveId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeId);

  return (
    <SideBarIsOpenProvider>
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sessions={sessions}
          activeId={activeId}
          setActiveId={setActiveId}
          deleteSession={deleteSession}
          createNewSession={createNewSession}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
        {activeSession ? (
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-5xl mx-auto p-4 md:p-8 h-full">
                    {activeSession.status === 'planning' && (
                        <PlanningPhase 
                            key={activeSession.id} 
                            session={activeSession}
                            onUpdate={data => updateSession(activeSession.id, data)}
                            onStart={() => updateSession(activeSession.id, { status: 'executing' })}
                        />
                    )}
                    
                    {(activeSession.status === 'executing' || activeSession.status === 'completed') && (
                        <ExecutionPhase 
                            key={activeSession.id}
                            session={activeSession}
                            onUpdate={data => updateSession(activeSession.id, data)}
                            onComplete={() => updateSession(activeSession.id, { status: 'completed' })}
                        />
                    )}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Layout size={64} className="mb-6 opacity-10" />
                <p className="text-lg font-medium opacity-50">Select a session to start learning</p>
            </div>
        )}
        </main>
      </div>
    </SideBarIsOpenProvider>
  );
}

export default App;
