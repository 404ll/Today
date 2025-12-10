import React, { useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import ChatCard from "./ChatCard";
import { chat } from "../api/ai/chat";

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

  const handleSend = async() => {
    if (!input.trim()) return;

    const userContent = input;
    // 合并历史消息和新消息，保留对话上下文
    const newMessages = [
      ...messages, // 包含之前的消息
      { role: "user" as const, content: userContent },
    ];

    // 先更新 UI，显示用户消息
    const updates: Partial<Session> = { messages: newMessages };
    if (session.title === "New Session") {
      updates.title = `${userContent.slice(0, 20)}${
        userContent.length > 20 ? "..." : ""
      }`;
    }
    onUpdate(updates);

    setInput("");
    setIsTyping(true);

   try{
    // 调用AI接口，发送完整的对话历史（包含上下文）
    const response = await chat(newMessages);
    // 获取AI回复
    const aiMessage = {
      role: "ai" as const,
      content: response.message,
    };
    // 更新消息列表，包含所有历史消息和新的AI回复
    onUpdate({ messages: [...newMessages, aiMessage] });
   } catch (error) {
    console.error("AI 调用失败:", error);
    const errorMessage = {
      role: "ai" as const,
      content: error instanceof Error ? error.message : "AI 调用失败",
    };
    // 错误时也保留所有历史消息
    onUpdate({ messages: [...newMessages, errorMessage] });
   } finally {
    setIsTyping(false);
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
