import { useEffect, useRef, useState } from "react";
import type { Session } from "../../types";
import { ChatCard } from "../chat/ChatCard";
import { chatStream } from "../../api/ai/chat";

type MainPanelProps = {
  session: Session;
  onUpdate: (data: Partial<Session>) => void;
};

export function MainPanel({ session, onUpdate }: MainPanelProps) {
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);//消息列表底部锚点 用于滚动到底部
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);//消息列表容器 用于检测用户滚动行为
  const shouldAutoScrollRef = useRef(true); // 用于判断用户是否在底部
  const abortControllerRef = useRef<AbortController | null>(null); // 用于取消请求
  // const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
/// 不使用 useState的原因：每次滚动都会触发组件重渲染
/// 这个值不用于 UI，重渲染是浪费
/// 滚动事件频繁，会造成性能问题

  const { messages } = session;

  // 检查用户是否在底部附近（距离底部 100px 内）
  const checkIfNearBottom = () => {
    // shouldAutoScrollRef.current 是实际的值
  ///这是 React 的设计：
  /// useRef 返回一个持久化的对象引用
  /// 值存储在 .current 属性中
  /// 修改 .current 不会触发重渲染
    if (!scrollContainerRef.current) return false;//如果消息列表容器不存在，则返回false
    const container = scrollContainerRef.current;//获取消息列表容器
    const threshold = 100; // 100px 阈值
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;//计算消息列表容器底部到用户滚动位置的距离
    return distanceFromBottom < threshold;//如果距离小于阈值，则返回true
  };

  const scrollToBottom = () => {
    //如果自动滚动，则滚动到底部，否则不滚动
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 处理滚动事件：检测用户是否在底部
  const handleScroll = () => {
    shouldAutoScrollRef.current = checkIfNearBottom();//检查用户是否在底部附近，如果是，则设置为true，否则设置为false
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
      
      // 根据错误类型显示不同的提示
      let errorContent = error.message || "AI 调用失败";
      
      // 网络相关错误
      if (error.message?.includes('网络') || error.message?.includes('连接')) {
        errorContent = "网络连接失败，请检查网络设置后重试";
      } else if (error.message?.includes('超时')) {
        errorContent = "请求超时，请稍后重试";
      } else if (error.message?.includes('取消')) {
        errorContent = "请求已取消";
        return; // 取消时不需要显示错误消息
      }
      
      const errorMessage = {
        role: "ai" as const,
        content: `❌ ${errorContent}`,
      };
      onUpdate({ messages: [...newMessages, errorMessage] });
      setIsTyping(false);
    };
  
    // 7. 创建取消控制器
    abortControllerRef.current = new AbortController();
  
    // 8. 调用流式 API（启用自动重试）
    try {
      await chatStream(
        newMessages, 
        onChunk, 
        onComplete, 
        onError,
        {
          timeout: 5 * 60 * 1000,  // 5 分钟超时
          signal: abortControllerRef.current.signal,  // 支持取消
          retry: true,  // 启用自动重试
          maxRetries: 3,  // 最多重试 3 次
        }
      );
    } catch (error) {
      // 额外的错误处理（如果 chatStream 本身抛出异常）
      console.error("流式请求异常:", error);
      onError(error instanceof Error ? error : new Error("未知错误"));
    } finally {
      // 清理
      abortControllerRef.current = null;
    }
  };
  
  // 取消当前请求的函数（可选：可以暴露给 UI）
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
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
    </div>
  );
}
