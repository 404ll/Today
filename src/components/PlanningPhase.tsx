import React, { useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import ChatCard from "./ChatCard";

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

  const handleSend = () => {
    if (!input.trim()) return;

    const userContent = input;
    const newMessages = [
      ...messages,
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

    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
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
