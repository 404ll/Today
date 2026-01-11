import { useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import type { Todo } from '../../types';

type ExtractedTodosPreviewProps = {
  todos: Todo[];
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onAddToSession: () => void;
  onAddToGlobal: () => void;
  onClear: () => void;
  isAdding?: boolean;
};

/**
 * 提取的待办事项预览组件
 * 显示提取的待办事项，支持编辑、删除和批量添加
 */
export function ExtractedTodosPreview({
  todos,
  onUpdateTodo,
  onDeleteTodo,
  onAddToSession,
  onAddToGlobal,
  onClear,
  isAdding = false,
}: ExtractedTodosPreviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      onUpdateTodo(id, { text: editText.trim() });
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (todos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无提取的待办事项</p>
          <p className="text-sm mt-2">点击 AI 消息卡片上的"提取待办"按钮开始提取</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            提取的待办事项 ({todos.length})
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          清空
        </button>
      </div>

      {/* 待办列表 */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex-1 min-w-0">
              {editingId === todo.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(todo.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(todo.id)}
                    className="p-1 text-green-500 hover:text-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-500 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-gray-900 dark:text-gray-100">
                    {todo.text}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(todo)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <button
          onClick={onAddToSession}
          disabled={isAdding || todos.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isAdding || todos.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
          }`}
        >
          <Plus className="w-4 h-4" />
          添加到当前会话
        </button>
        <button
          onClick={onAddToGlobal}
          disabled={isAdding || todos.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isAdding || todos.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
          }`}
        >
          <Plus className="w-4 h-4" />
          添加到全局列表
        </button>
      </div>
    </div>
  );
}

