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
    options?: {
        timeout?: number;              // 超时时间（毫秒），默认 5 分钟
        signal?: AbortSignal;          // 取消信号
        retry?: boolean;               // 是否自动重试
        maxRetries?: number;           // 最大重试次数
    }
) => {
    const {
        timeout = 5 * 60 * 1000,      // 默认 5 分钟超时
        signal,
        retry = false,
        maxRetries = 3,
    } = options || {};

    let retryCount = 0;
    const maxAttempts = retry ? maxRetries + 1 : 1;

    const attemptStream = async (): Promise<void> => {
        // 检查是否已取消
        if (signal?.aborted) {
            throw new Error("请求已取消");
        }

        // 创建超时控制器
        const timeoutId = timeout > 0 ? setTimeout(() => {
            throw new Error("请求超时，请检查网络连接");
        }, timeout) : null;

        try {
            // 复用 BASE_URL 和 Token，防止 401 和 路径错误
            const controller = new AbortController();
            
            // 如果外部传入 signal，监听取消事件
            if (signal) {
                signal.addEventListener('abort', () => {
                    controller.abort();
                });
            }

            const response = await fetch(`${BASE_URL}/chat-stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`, // 手动补齐 Token
                },
                body: JSON.stringify({ messages }),  // ✅ 完整消息数组 = 上下文
                signal: controller.signal,  // 支持取消
            });

            if (timeoutId) clearTimeout(timeoutId);

            if (!response.ok) {
                // 尝试读取后端返回的错误信息
                const errText = await response.text(); 
                throw new Error(errText || `HTTP Error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) throw new Error("无法初始化流读取器");

            let buffer = "";
            let lastChunkTime = Date.now();
            const HEARTBEAT_TIMEOUT = 30000; // 30 秒无数据视为连接中断

            // 心跳检测：定期检查是否还在接收数据
            const heartbeatCheck = setInterval(() => {
                const timeSinceLastChunk = Date.now() - lastChunkTime;
                if (timeSinceLastChunk > HEARTBEAT_TIMEOUT) {
                    clearInterval(heartbeatCheck);
                    reader.cancel(); // 取消读取
                    throw new Error("连接超时：超过 30 秒未收到数据");
                }
            }, 5000); // 每 5 秒检查一次

            try {
                while (true) {
                    // 检查是否已取消
                    if (signal?.aborted || controller.signal.aborted) {
                        reader.cancel();
                        throw new Error("请求已取消");
                    }

                    const { done, value } = await reader.read();

                    if (done) {
                        clearInterval(heartbeatCheck);
                        // 流结束时，如果 buffer 里还有剩余数据没处理，需要在这里处理
                        if(buffer.trim()) { 
                            // 处理剩余 buffer 逻辑... 
                        }
                        onComplete();
                        break;
                    }

                    // 更新最后接收数据的时间
                    lastChunkTime = Date.now();

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
                                clearInterval(heartbeatCheck);
                                onComplete();
                                return;
                            }

                            const data = JSON.parse(jsonStr);
                            
                            // 错误处理
                            if (data.error) {
                                clearInterval(heartbeatCheck);
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
            } catch (streamError: any) {
                clearInterval(heartbeatCheck);
                reader.cancel(); // 确保清理资源
                
                // 如果是网络错误且允许重试，则重试
                if (retry && retryCount < maxRetries) {
                    const isNetworkError = 
                        streamError.message?.includes('网络') ||
                        streamError.message?.includes('连接') ||
                        streamError.message?.includes('超时') ||
                        streamError.message?.includes('fetch') ||
                        streamError.name === 'AbortError' ||
                        streamError.name === 'TypeError';
                    
                    if (isNetworkError) {
                        retryCount++;
                        console.log(`连接中断，正在重试 (${retryCount}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 指数退避
                        return attemptStream(); // 递归重试
                    }
                }
                
                throw streamError;
            }
        } catch (err: any) {
            if (timeoutId) clearTimeout(timeoutId);
            
            // 网络错误处理
            if (err.name === 'AbortError') {
                throw new Error("请求已取消");
            }
            
            if (err.message?.includes('fetch')) {
                throw new Error("网络连接失败，请检查网络设置");
            }
            
            // 如果是网络错误且允许重试
            if (retry && retryCount < maxRetries) {
                const isNetworkError = 
                    err.message?.includes('网络') ||
                    err.message?.includes('连接') ||
                    err.message?.includes('超时') ||
                    err.name === 'AbortError' ||
                    err.name === 'TypeError';
                
                if (isNetworkError) {
                    retryCount++;
                    console.log(`连接失败，正在重试 (${retryCount}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 指数退避
                    return attemptStream(); // 递归重试
                }
            }
            
            throw err;
        }
    };

    try {
        await attemptStream();
    } catch (err: any) {
        console.error("Stream Error:", err);
        onError(err instanceof Error ? err : new Error(String(err)));
    }
};