export type SessionStatus = 'planning' | 'executing' | 'completed';

export type MessageRole = 'user' | 'ai';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface Todo {
  id: string;
  text: string;
  completed?: boolean;
  summary?: string;
}

export interface Session {
  id: string;
  title: string;
  status: SessionStatus;
  messages: Message[];
  todos: Todo[];
  createdAt: number;
  specific?: string;
  measurable?: string;
  timeBound?: number;
  action?: string;
  review?: string;
  aiInsights?: string;
  startTime?: number;
}