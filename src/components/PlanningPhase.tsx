import React, { useEffect, useRef, useState } from 'react';
import { Play, Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import type { Session, Todo } from '../types';

type PlanningPhaseProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
  onStart: () => void;
};

const PlanningPhase: React.FC<PlanningPhaseProps> = ({ session, onUpdate, onStart }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, todos } = session;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const generateTodos = (text: string): Todo[] => {
    const newTodos: Todo[] = [];
    // Mock Logic
    if (text.toLowerCase().includes('react')) {
      newTodos.push({ id: `${Date.now()}-1`, text: `Read React Docs: ${text}`, completed: false });
      newTodos.push({ id: `${Date.now()}-2`, text: `Build Demo: ${text}`, completed: false });
    } else {
      newTodos.push({ id: `${Date.now()}-1`, text: `Research ${text}`, completed: false });
      newTodos.push({ id: `${Date.now()}-2`, text: `Practice ${text}`, completed: false });
      newTodos.push({ id: `${Date.now()}-3`, text: 'Summarize Findings', completed: false });
    }
    return newTodos;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userContent = input;
    const newMessages = [...messages, { role: 'user' as const, content: userContent }];

    const updates: Partial<Session> = { messages: newMessages };
    if (session.title === 'New Session') {
      updates.title = `${userContent.slice(0, 20)}${userContent.length > 20 ? '...' : ''}`;
    }
    onUpdate(updates);

    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const generated = generateTodos(userContent);
      const updatedTodos = [...todos, ...generated];
      const aiMsg = {
        role: 'ai' as const,
        content: `I've added ${generated.length} tasks for "${userContent}". Check the plan!`,
      };

      onUpdate({
        messages: [...newMessages, aiMsg],
        todos: updatedTodos,
      });
      setIsTyping(false);
    }, 1000);
  };

  const addTodo = () => {
    const text = prompt('New task:');
    if (text) {
      onUpdate({ todos: [...todos, { id: Date.now().toString(), text, completed: false }] });
    }
  };

  const removeTodo = (id: string) => {
    onUpdate({ todos: todos.filter((t) => t.id !== id) });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-140px)] md:h-[600px] dark:text-white">
      {/* Chat Area */}
      <div className="flex  flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-white dark:bg-blue-900 p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                <Sparkles size={18} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-300">AI Assistant</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm 
                ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none dark:bg-gray-300 dark:text-black' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none dark:bg-gray-800 dark:text-white'}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100">
          <div className="flex gap-2 items-center bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
            <input 
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-white"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your learning goal..."
            />
            <button 
                onClick={handleSend} 
                disabled={!input.trim()}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Plan Preview Area */}
      <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white dark:bg-blue-800 ">
          <span className="font-semibold text-gray-800 dark:text-gray-300">Your Plan</span>
          <button onClick={addTodo} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors dark:text-gray-300">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900 ">
          {todos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 dark:text-white">
              <div className="p-4 bg-gray-50 rounded-full dark:bg-gray-700">
                <Play size={32} className="opacity-20" />
              </div>
              <p className="text-sm">Plan will appear here...</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo, index) => (
                <li key={todo.id} className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/30 transition-all animate-in slide-in-from-bottom-2 duration-300 dark:bg-gray-800 dark:border-gray-700" style={{animationDelay: `${index * 50}ms`}}>
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 leading-relaxed pt-0.5 dark:text-gray-300">{todo.text}</span>
                  <button onClick={() => removeTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <button 
            onClick={onStart}
            disabled={todos.length === 0}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
              ${todos.length > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 dark:bg-blue-700 dark:text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'}
            `}
          >
            <Play size={18} fill="currentColor" /> Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningPhase;
