import React from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';
import type { Todo } from '../types';

type PlanCardProps = {
  todos: Todo[];
  onAddTodo: () => void;
  onRemoveTodo: (id: string) => void;
  onStart: () => void;
};

const PlanCard: React.FC<PlanCardProps> = ({ todos, onAddTodo, onRemoveTodo, onStart }) => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white dark:bg-blue-800">
        <span className="font-semibold text-gray-800 dark:text-gray-300">Your Plan</span>
        <button 
          onClick={onAddTodo} 
          className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors dark:text-gray-300"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {/* Todo List */}
      <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
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
              <li 
                key={todo.id} 
                className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/30 transition-all animate-in slide-in-from-bottom-2 duration-300 dark:bg-gray-800 dark:border-gray-700" 
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-blue-100 text-blue-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 leading-relaxed pt-0.5 dark:text-gray-300">
                  {todo.text}
                </span>
                <button 
                  onClick={() => onRemoveTodo(todo.id)} 
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Footer - Start Button */}
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
  );
};

export default PlanCard;

