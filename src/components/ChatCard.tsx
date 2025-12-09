import React from "react";
import { Sparkles, Send } from "lucide-react";
import type { Message } from "../types";

type ChatCardProps = {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
};

const ChatCard: React.FC<ChatCardProps> = ({ messages, isTyping, messagesEndRef, input, setInput, handleSend }) => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
  );
};

export default ChatCard;