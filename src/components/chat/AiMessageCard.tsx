import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import {MessageContent} from './MessageContent';

type AiMessageCardProps = {
  message: string;
  index: number;
  timestamp: number;
  onExtractTodos: () => void;
  isExtracting?: boolean;
};

/**
 * AI 消息卡片组件
 * 显示 AI 消息内容，支持展开/收起和提取待办
 */
export function AiMessageCard({
  message,
  index,
  timestamp,
  onExtractTodos,
  isExtracting = false,
}: AiMessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 消息预览（前 200 个字符）
  const preview = message.length > 200 ? message.slice(0, 200) + '...' : message;
  const hasMore = message.length > 200;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      {/* 消息头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI 消息 #{index + 1}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExtractTodos}
            disabled={isExtracting}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isExtracting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            {isExtracting ? '提取中...' : '提取待办'}
          </button>
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 消息内容 */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {isExpanded ? (
          <MessageContent content={message} role="ai" />
        ) : (
          <div>
            <MessageContent content={preview} role="ai" />
            {hasMore && (
              <button
                onClick={() => setIsExpanded(true)}
                className="mt-2 text-blue-500 hover:text-blue-600 text-xs font-medium"
              >
                展开全文
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

