import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, CheckCircle2, ChevronDown, ChevronUp, Circle, FileText } from 'lucide-react';
import type { Session, Todo } from '../types';

type ExecutionPhaseProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
  onComplete: () => void;
};

const ExecutionPhase: React.FC<ExecutionPhaseProps> = ({ session, onUpdate, onComplete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { todos } = session;

  const toggleTodo = (id: string) => {
    const newTodos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdate({ todos: newTodos });

    const newTodo = newTodos.find((t) => t.id === id);
    if (newTodo?.completed) {
      setExpandedId(id);
    }
  };

  const updateSummary = (id: string, summary: Todo['summary']) => {
    const newTodos = todos.map((t) => (t.id === id ? { ...t, summary } : t));
    onUpdate({ todos: newTodos });
  };

  const allCompleted = todos.every((t) => t.completed);
  const progress = todos.length > 0 ? Math.round((todos.filter((t) => t.completed).length / todos.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto pb-20">
        {/* Header / Nav */}
        <div className="mb-10">
            <button 
                onClick={() => onUpdate({ status: 'planning' })} 
                className="text-xs font-bold dark:text-gray-400 hover:text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-1 text-black"
            >
                <ArrowLeft size={12} /> Back to Plan
            </button>
            
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">{session.title || 'Focus Mode'}</h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="h-2 w-48 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${allCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-500">{progress}% Complete</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            {todos.map(todo => (
                <div key={todo.id} 
                    className={`group rounded-2xl border transition-all duration-300 overflow-hidden dark:bg-gray-800 dark:border-gray-700
                    ${todo.completed 
                        ? 'bg-gray-50 border-gray-100' 
                        : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'}`}
                >
                    <div className="p-5 flex items-start gap-4">
                        <button 
                            onClick={() => toggleTodo(todo.id)} 
                            className={`mt-0.5 transition-all duration-300 ${todo.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                        >
                            {todo.completed ? <CheckCircle2 size={24} fill="currentColor" className="text-green-100" /> : <Circle size={24} />}
                        </button>
                        
                        <div className="flex-1">
                            <div 
                                className={`text-base font-medium cursor-pointer transition-colors dark:text-gray-300 ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                                onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                            >
                                {todo.text}
                            </div>
                            
                            {/* Summary Preview */}
                            {expandedId !== todo.id && todo.summary && (
                                <div className="mt-1 text-sm text-gray-500 flex items-center gap-1 dark:text-gray-300">
                                    <FileText size={12} />
                                    <span className="truncate max-w-[300px]">{todo.summary}</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                            className="text-gray-300 hover:text-gray-600 transition-colors"
                        >
                            {expandedId === todo.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>

                    {/* Summary Expansion */}
                    {expandedId === todo.id && (
                        <div className="bg-blue-50/50 px-5 pb-5 pt-2 border-t border-blue-100/50 animate-in slide-in-from-top-1 dark:bg-gray-800 dark:border-gray-700">
                            <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                                Your Notes
                            </label>
                            <textarea 
                                className="w-full min-h-[100px] p-3 rounded-xl border border-blue-100 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all resize-y dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="What did you learn? Key takeaways..."
                                value={todo.summary || ''}
                                onChange={e => updateSummary(todo.id, e.target.value)}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>

        {session.status !== 'completed' && (
            <div className="mt-12 text-center">
                <button 
                    onClick={onComplete}
                    disabled={!allCompleted}
                    className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300
                        ${allCompleted 
                            ? 'bg-gray-900 text-white hover:bg-black hover:scale-105 hover:shadow-lg' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {allCompleted ? (
                        <span className="flex items-center gap-2"><CheckCircle size={20} /> Mark Session Completed</span>
                    ) : (
                        'Complete All Tasks'
                    )}
                </button>
            </div>
        )}
        
        {session.status === 'completed' && (
             <div className="mt-12 text-center text-gray-500 italic">
                 Session completed on {new Date().toLocaleDateString()}
             </div>
        )}
    </div>
  );
};

export default ExecutionPhase;
