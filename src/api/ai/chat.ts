import { Message } from "../../types";
import api, { BASE_URL, getToken } from "../client";

// 定义接口返回类型
interface ChatResponse {
    reply: string;
    usage: number;
}

// 1. 非流式 (Axios)
export const chat = async (messages: Message[]) => {
    return api.post<ChatResponse>("/chat", { messages });
};

// 2. 流式(原生 Fetch + 复用配置)
export const chatStream = async (
    messages: Message[],
    onChunk: (chunk: string) => void, // 实时吐字回调
    onComplete: () => void,           // 完成回调
    onError: (error: Error) => void,  // 错误回调
) => {
    try {
        // 🔥 关键修正：复用 BASE_URL 和 Token，防止 401 和 路径错误
        const response = await fetch(`${BASE_URL}/chat-stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`, // 手动补齐 Token
            },
            body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            // 尝试读取后端返回的错误信息
            const errText = await response.text(); 
            throw new Error(errText || `HTTP Error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) throw new Error("无法初始化流读取器");

        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                // 流结束时，如果 buffer 里还有剩余数据没处理，需要在这里处理
                if(buffer.trim()) { 
                    // 处理剩余 buffer 逻辑... 
                }
                onComplete();
                break;
            }

            // 解码并追加到缓冲区
            buffer += decoder.decode(value, { stream: true });

            // 🔥 稍微优化一点的 SSE 解析逻辑
            // 只有当 buffer 包含换行符时才处理，避免处理半截数据
            while (buffer.includes("\n")) {
                const index = buffer.indexOf("\n");
                const line = buffer.slice(0, index).trim(); // 取出一行
                buffer = buffer.slice(index + 1); // 剩下的放回 buffer

                if (!line.startsWith("data: ")) continue; // 忽略心跳或非数据行

                try {
                    const jsonStr = line.slice(6); // 去掉 "data: "
                    if (jsonStr === "[DONE]") { // OpenAI 标准结束标记
                        onComplete();
                        return;
                    }

                    const data = JSON.parse(jsonStr);
                    
                    // 错误处理
                    if (data.error) {
                         throw new Error(data.error);
                    }
                    
                    // 业务逻辑：提取内容
                    // 假设后端格式是 { content: "哈" } 或 OpenAI 格式 { choices: [...] }
                    const content = data.content || data.choices?.[0]?.delta?.content || "";
                    if (content) {
                        onChunk(content);
                    }

                } catch (e) {
                    console.warn("JSON解析失败，可能是数据包不完整", line);
                    // 解析失败不应该打断整个流，通常选择忽略这一行
                }
            }
        }
    } catch (err: any) {
        console.error("Stream Error:", err);
        onError(err instanceof Error ? err : new Error(String(err)));
    }
};