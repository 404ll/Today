import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Check, X, Pencil } from 'lucide-react';
import type { Todo } from '../types';

type TodoItemProps = {
  todo: Todo;
  index: number;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  className?: string;
};

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  onRemove,
  onToggle,
  onUpdate,
  className = '',
}) => {
 
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  // 进入编辑态自动聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 外部更新时同步
  useEffect(() => {
    setEditText(todo.text);
  }, [todo.text]);


  const handleSave = () => {
    const trimmedText = editText.trim();

    if (trimmedText && trimmedText !== todo.text) {
      onUpdate(todo.id, { text: trimmedText });
    } else if (!trimmedText) {
      setEditText(todo.text);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  // 键盘控制
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // 失焦自动保存
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null;

    if (
      relatedTarget === saveButtonRef.current ||
      relatedTarget === cancelButtonRef.current
    ) {
      return;
    }

    handleSave();
  };

  return (
    <li
      className={`group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/30 transition-all animate-in slide-in-from-bottom-2 duration-300 dark:bg-gray-800 dark:border-gray-700 ${className}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* 序号 / 完成状态 */}
      <span
        onClick={() => onToggle(todo.id)}
        className="bg-blue-100 text-blue-600 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer"
      >
        {todo.completed ? <Check size={16} /> : index + 1}
      </span>

      {/* 内容区域 */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        ) : (
          <span className="flex-1 text-sm text-gray-700 leading-relaxed dark:text-gray-300 truncate">
            {todo.text}
          </span>
        )}
      </div>

      {/* 操作按钮 - 固定宽度，始终保留空间 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button
              ref={saveButtonRef}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/20"
              aria-label="保存"
            >
              <Check size={16} />
            </button>
            <button
              ref={cancelButtonRef}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
              aria-label="取消"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-gray-400 hover:text-blue-500"
              aria-label="编辑"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(todo.id);
              }}
              className="text-gray-400 hover:text-red-500"
              aria-label={`删除 ${todo.text}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default TodoItem;
