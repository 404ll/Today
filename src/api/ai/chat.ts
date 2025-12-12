import { Message } from "../../types";
import api from "../client";

//非流式
export const chat = async (messages: Message[]) => {
    // 响应拦截器已经返回了 response.data，所以这里直接返回 response
    const response = await api.post("/chat", { messages }); //Axios写法？
    return response.data;
};

// 流式聊天
export const chatStream = async (
    messages: Message[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
  ) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
  
    try {
      const response = await fetch(`${baseURL}/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
      
      console.log("前端流式响应体 response", response);
      if (!response.ok) {
        throw new Error("请求失败");
      }
  
      const reader = response.body?.getReader(); //web原生API获取响应体-流式响应
      const decoder = new TextDecoder(); //web原生API解码器
  
      if (!reader) {
        throw new Error("无法获取响应体");
      }
  
      let buffer = "";
      let fullMessage = "";
  
      while (true) {
        const { done, value } = await reader.read();
  
        if (done) {
          onComplete();
          break;
        }
  
        buffer += decoder.decode(value, { stream: true }); //解码二进制数据为字符串
  
        // SSE: 每条消息以 \n\n 分隔
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; //最后一段可能是不完整的
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
  
            if (data.error) {
              onError(new Error(data.error));
              return;
            }
  
            if (data.done) {
              fullMessage = data.fullMessage || fullMessage;
              onComplete();
              return;
            }
  
            if (data.content) {
              fullMessage += data.content;
              onChunk(data.content);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err);
    }
  };
  