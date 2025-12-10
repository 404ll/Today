import { Message } from "../../types";
import api from "../client";
export const chat = async (messages: Message[]) => {
    // 响应拦截器已经返回了 response.data，所以这里直接返回 response
    const response = await api.post("/chat", { messages });
    return response.data;
};