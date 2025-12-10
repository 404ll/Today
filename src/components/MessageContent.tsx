import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageContentProps = {
  content: string;
  role: 'user' | 'ai';
};

const MessageContent: React.FC<MessageContentProps> = ({ content, role }) => {
  if (role === 'user') {
    return <>{content}</>;
  } else {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none prose-sm prose-headings:font-semibold prose-p:my-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-code:text-sm prose-code:bg-gray-100 prose-code:dark:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-table:text-sm prose-th:border prose-td:border prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-2 prose-blockquote:italic p-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
};

export default MessageContent;
