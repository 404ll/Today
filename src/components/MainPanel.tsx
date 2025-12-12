import React, { useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import ChatCard from "./ChatCard";
import {chatStream } from "../api/ai/chat";

type MainPanelProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
};

const MainPanel: React.FC<MainPanelProps> = ({ session, onUpdate }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages } = session;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userContent = input;
    
    // 1. 准备新消息列表（包含用户消息）
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userContent },
    ];
  
    // 2. 更新 UI：显示用户消息和更新标题
    const updates: Partial<Session> = { messages: newMessages };
    if (session.title === "New Session") {
      updates.title = `${userContent.slice(0, 20)}${userContent.length > 20 ? "..." : ""}`;
    }
    onUpdate(updates);
  
    // 3. 清空输入框，设置加载状态
    setInput("");
    setIsTyping(true);
  
    // 4. 创建 AI 消息占位符（先显示空消息）
    let aiMessageContent = '';
    const tempAiMessage = {
      role: "ai" as const,
      content: '',
    };
    
    // 5. 更新 UI：添加 AI 消息占位符
    onUpdate({ messages: [...newMessages, tempAiMessage] });
  
    // 6. 定义回调函数
    const onChunk = (chunk: string) => {
      aiMessageContent += chunk;
      // 实时更新 AI 消息内容
      onUpdate({ 
        messages: [...newMessages, { 
          role: "ai" as const, 
          content: aiMessageContent 
        }] 
      });
    };
  
    const onComplete = () => {
      // 流式输出完成，最终更新消息
      onUpdate({ 
        messages: [...newMessages, { 
          role: "ai" as const, 
          content: aiMessageContent 
        }] 
      });
      setIsTyping(false);
    };
  
    const onError = (error: Error) => {
      console.error("AI 调用失败:", error);
      const errorMessage = {
        role: "ai" as const,
        content: error.message || "AI 调用失败",
      };
      onUpdate({ messages: [...newMessages, errorMessage] });
      setIsTyping(false);
    };
  
    // 7. 调用流式 API
    try {
      await chatStream(newMessages, onChunk, onComplete, onError);
    } catch (error) {
      // 额外的错误处理（如果 chatStream 本身抛出异常）
      console.error("流式请求异常:", error);
      onError(error instanceof Error ? error : new Error("未知错误"));
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[600px] dark:text-white">
      <ChatCard
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
      />
    </div>
  );
};

export default MainPanel;
