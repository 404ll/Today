import { MessageSquare, Search } from 'lucide-react';
import type { Session } from '../../types';

type SessionSelectorProps = {
  sessions: Session[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

/**
 * 会话选择器组件
 * 显示所有会话列表，支持搜索和筛选
 */
export function SessionSelector({
  sessions,
  selectedSessionId,
  onSelectSession,
  searchQuery,
  onSearchChange,
}: SessionSelectorProps) {
  // 根据搜索关键词筛选会话
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 搜索框 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? '未找到匹配的会话' : '暂无会话'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              const aiMessagesCount = session.messages.filter(
                (msg) => msg.role === 'ai'
              ).length;

              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${
                          isSelected
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {session.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{aiMessagesCount} 条 AI 消息</span>
                        <span>
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

