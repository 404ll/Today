import React, { useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import ChatCard from "./ChatCard";
import { chat } from "../api/ai/chat";

type PlanningPhaseProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
  onStart: () => void;
};

const PlanningPhase: React.FC<PlanningPhaseProps> = ({ session, onUpdate }) => {
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
    const newMessages = [
      { role: "user" as const, content: userContent },
    ];

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
    //调用AI接口
    const response = await chat(newMessages);
    //获取AI回复
    const aiMessage = {
      role: "ai" as const,
      content: response.data?.message,
    };
    onUpdate({ messages: [...newMessages, aiMessage] });
   } catch (error) {
    console.error("AI 调用失败:", error);
    const errorMessage = {
      role: "ai" as const,
      content: error instanceof Error ? error.message : "AI 调用失败",
    };
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

export default PlanningPhase;
