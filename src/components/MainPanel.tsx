import React, { useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import ChatCard from "./ChatCard";
import {chatStream } from "../api/ai/chat";
import TodoListCard from "./TodoListCard";

type MainPanelProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
};

const MainPanel: React.FC<MainPanelProps> = ({ session, onUpdate }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);//消息列表底部锚点 用于滚动到底部
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);//消息列表容器 用于检测用户滚动行为
  const shouldAutoScrollRef = useRef(true); // 用于判断用户是否在底部

  const { messages } = session;

  // 检查用户是否在底部附近（距离底部 100px 内）
  const checkIfNearBottom = () => {
    if (!scrollContainerRef.current) return false;//如果消息列表容器不存在，则返回false
    const container = scrollContainerRef.current;//获取消息列表容器
    const threshold = 100; // 100px 阈值
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;//计算消息列表容器底部到用户滚动位置的距离
    return distanceFromBottom < threshold;//如果距离小于阈值，则返回true
  };

  const scrollToBottom = () => {
    // 只有当用户接近底部时才自动滚动
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 处理滚动事件：检测用户是否在底部
  const handleScroll = () => {
    shouldAutoScrollRef.current = checkIfNearBottom();
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    } else if (checkIfNearBottom()) {
      shouldAutoScrollRef.current = true;
      scrollToBottom();
    }
  }, [messages, isTyping]);


  const handleSend = async () => {
    if (!input.trim()) return;
  
    const userContent = input;
    
    // 用户发送消息时，强制滚动到底部
    shouldAutoScrollRef.current = true;
    
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
  
    // 8. 调用流式 API
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
        scrollContainerRef={scrollContainerRef}
        onScroll={handleScroll}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
      />

      <TodoListCard/>
    </div>
  );
};

export default MainPanel;
