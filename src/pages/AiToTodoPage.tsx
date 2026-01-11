import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { SessionSelector } from '../components/session/SessionSelector';
import { AiMessageCard } from '../components/chat/AiMessageCard';
import { ExtractedTodosPreview } from '../components/todo/ExtractedTodosPreview';
import { extractTodosFromMessage } from '../api/ai/extractTodos';
import { extractTodosFromAiMessage } from '../utils/todoExtractor';
import useTodoListStore from '../store/TodoListStore';
import type { Session, Todo } from '../types';

/**
 * AI 分析转 TodoList 页面
 * 从历史 AI 对话中提取待办事项并添加到 TodoList
 */
function AiToTodoPage () {
  // 从 localStorage 读取所有会话数据
  const sessions = useMemo<Session[]>(() => {
    try {
      const saved = localStorage.getItem('today-sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('读取会话数据失败:', error);
    }
    return [];
  }, []);

  // 状态管理
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [extractedTodos, setExtractedTodos] = useState<Todo[]>([]);
  const [extractingMessageIndex, setExtractingMessageIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // 获取 TodoList store 方法
  const addTodo = useTodoListStore((state) => state.addTodo);
  const setTodos = useTodoListStore((state) => state.setTodos);

  // 获取选中的会话
  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || null;
  }, [sessions, selectedSessionId]);

  // 获取选中会话的所有 AI 消息
  const aiMessages = useMemo(() => {
    if (!selectedSession) return [];
    return selectedSession.messages
      .map((msg, index) => ({ 
        ...msg, 
        originalIndex: index,
        // 估算时间戳：使用会话创建时间 + 消息索引 * 1分钟
        estimatedTimestamp: selectedSession.createdAt + index * 60000
      }))
      .filter((msg) => msg.role === 'ai');
  }, [selectedSession]);

  // 处理提取待办事项
  const handleExtractTodos = async (message: string, messageIndex: number) => {
    setExtractingMessageIndex(messageIndex);
    try {
      // 先尝试前端基础提取（快速）
      const basicTodos = extractTodosFromAiMessage(message);
      
      if (basicTodos.length > 0) {
        // 如果基础提取成功，直接使用
        setExtractedTodos((prev) => [...prev, ...basicTodos]);
      } else {
        // 如果基础提取失败，尝试使用后端 AI 辅助提取
        try {
          const aiTodos = await extractTodosFromMessage(message, {
            sessionContext: selectedSession?.title,
            useAI: true,
          });
          
          if (aiTodos.length > 0) {
            setExtractedTodos((prev) => [...prev, ...aiTodos]);
          } else {
            alert('未能从此消息中提取到待办事项');
          }
        } catch (error) {
          console.error('AI 提取失败:', error);
          alert('提取失败，请稍后重试');
        }
      }
    } catch (error) {
      console.error('提取待办事项失败:', error);
      alert('提取失败，请稍后重试');
    } finally {
      setExtractingMessageIndex(null);
    }
  };

  // 更新待办事项
  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    setExtractedTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );
  };

  // 删除待办事项
  const handleDeleteTodo = (id: string) => {
    setExtractedTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 添加到当前会话
  const handleAddToSession = () => {
    if (!selectedSession || extractedTodos.length === 0) return;

    setIsAdding(true);
    try {
      // 从 localStorage 读取会话数据
      const saved = localStorage.getItem('today-sessions');
      if (saved) {
        const parsedSessions: Session[] = JSON.parse(saved);
        const updatedSessions = parsedSessions.map((session) => {
          if (session.id === selectedSession.id) {
            return {
              ...session,
              todos: [...session.todos, ...extractedTodos],
            };
          }
          return session;
        });
        localStorage.setItem('today-sessions', JSON.stringify(updatedSessions));
        alert(`已添加 ${extractedTodos.length} 个待办事项到会话`);
        setExtractedTodos([]);
      }
    } catch (error) {
      console.error('添加到会话失败:', error);
      alert('添加失败，请稍后重试');
    } finally {
      setIsAdding(false);
    }
  };

  // 添加到全局列表
  const handleAddToGlobal = () => {
    if (extractedTodos.length === 0) return;

    setIsAdding(true);
    try {
      // 获取当前全局待办列表
      const currentTodos = useTodoListStore.getState().todos;
      
      // 合并待办事项（避免重复）
      const newTodos = [...currentTodos];
      extractedTodos.forEach((todo) => {
        // 检查是否已存在相同的待办
        const exists = newTodos.some((t) => t.text === todo.text);
        if (!exists) {
          newTodos.push(todo);
        }
      });

      setTodos(newTodos);
      alert(`已添加 ${extractedTodos.length} 个待办事项到全局列表`);
      setExtractedTodos([]);
    } catch (error) {
      console.error('添加到全局列表失败:', error);
      alert('添加失败，请稍后重试');
    } finally {
      setIsAdding(false);
    }
  };

  // 清空提取的待办
  const handleClear = () => {
    if (confirm('确定要清空所有提取的待办事项吗？')) {
      setExtractedTodos([]);
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 overflow-hidden p-4 md:p-8">
          {/* 页面标题 */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI 分析转 TodoList
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              从历史 AI 对话中提取待办事项并添加到你的 TodoList
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* 左侧：会话选择器 */}
            <div className="lg:col-span-1 h-full">
              <SessionSelector
                sessions={sessions}
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* 中间：AI 消息列表 */}
            <div className="lg:col-span-1 h-full overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  AI 消息列表
                  {selectedSession && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({aiMessages.length} 条)
                    </span>
                  )}
                </h2>
                {selectedSession ? (
                  aiMessages.length > 0 ? (
                    <div className="space-y-4">
                      {aiMessages.map((msg, index) => (
                        <AiMessageCard
                          key={`${msg.originalIndex}-${index}`}
                          message={msg.content}
                          index={index}
                          timestamp={msg.estimatedTimestamp}
                          onExtractTodos={() => handleExtractTodos(msg.content, index)}
                          isExtracting={extractingMessageIndex === index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <p>该会话暂无 AI 消息</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>请选择一个会话</p>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：提取的待办预览 */}
            <div className="lg:col-span-1 h-full">
              <ExtractedTodosPreview
                todos={extractedTodos}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
                onAddToSession={handleAddToSession}
                onAddToGlobal={handleAddToGlobal}
                onClear={handleClear}
                isAdding={isAdding}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AiToTodoPage;

