import React, { useState } from 'react';
import { Play, Plus, Trash2 } from 'lucide-react';
import useTodoListStore from '../store/TodoListStore';
import type { Todo } from '../types';
import TodoItem from './TodoItem';

const TodoListCard: React.FC = () => {
  //使用选择器订阅需要的状态
  const todos = useTodoListStore((state) => state.todos);
  const addTodo = useTodoListStore((state) => state.addTodo);
  const removeTodo = useTodoListStore((state) => state.removeTodo);
  const toggleTodo = useTodoListStore((state) => state.toggleTodo);
  const updateTodo = useTodoListStore((state) => state.updateTodo);
  const clearCompleted = useTodoListStore((state) => state.clearCompleted);
  const setTodos = useTodoListStore((state) => state.setTodos);
  const getStats = useTodoListStore((state) => state.getStats);


    const handleRemoveTodo = (id: string) => {
        removeTodo(id);
    }

    const handleToggleTodo = (id: string) => {
        toggleTodo(id);
    }

    const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
        updateTodo(id, updates);
    }

    const handleClearCompleted = () => {
        clearCompleted();
    }

    const handleSetTodos = (todos: Todo[]) => {
        setTodos(todos);
    }

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white dark:bg-blue-800">
        <span className="font-semibold text-gray-800 dark:text-gray-300">Your Plan</span>
        <button 
          onClick={() => addTodo('')} 
          className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors dark:text-gray-300"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {/* Todo List */}
      <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
        {todos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 dark:text-white">
            <div className="p-4 bg-gray-100 rounded-full dark:bg-gray-700">
              <Play size={32} className="opacity-100" />
            </div>
            <p className="text-sm">Plan will appear here...</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                index={index}
                onRemove={handleRemoveTodo}
                onToggle={handleToggleTodo}
                onUpdate={handleUpdateTodo}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodoListCard;

