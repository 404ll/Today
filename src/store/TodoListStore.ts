import { create } from 'zustand'
import type { Todo } from '../types'
import {createJSONStorage, persist} from 'zustand/middleware'

interface TodoListStore {
  todos: Todo[]
  addTodo: (text: string) => void // 添加待办事项
  removeTodo: (id: string) => void // 删除
  toggleTodo: (id: string) => void // 完成/未完成
  updateTodo: (id: string, updates: Partial<Todo>) => void // 更新待办事项
  clearCompleted: () => void // 清除已完成事项
  setTodos: (todos: Todo[]) => void // 设置待办事项
  getStats: () => {
    total: number
    completed: number
    pending: number
  }
}

const useTodoListStore = create<TodoListStore>()(persist((set,get) =>({  
    todos: [],
    addTodo: (text: string) =>{
        const newTodo: Todo = {
            id: Date.now().toString(),
            text,
            completed: false,
        }
        set((state) => ({ todos: [...state.todos, newTodo] }))
    },
    removeTodo: (id: string) => {
        set((state) => ({ todos: state.todos.filter((todo) => todo.id !== id) }))
    },
    toggleTodo: (id: string) => {
        set((state) => ({ todos: state.todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo) }))
    },
    updateTodo: (id: string, updates: Partial<Todo>) => {
        set((state) => ({ todos: state.todos.map((todo) => todo.id === id ? { ...todo, ...updates } : todo) }))
    },
    clearCompleted: () => {
        set((state) => ({ todos: state.todos.filter((todo) => !todo.completed) }))
    },
    setTodos: (todos: Todo[]) => {
        set({ todos })
    },
    getStats: () => {
        const todos = get().todos;
        return {
            total: todos.length,
            completed: todos.filter((todo) => todo.completed).length,
            pending: todos.filter((todo) => !todo.completed).length,
        }
    }
  }
),{
    //persist配置：持久化存储
    name: 'todo-list', // 存储的键名
    storage: createJSONStorage(() => localStorage), // 存储方式
}))

export default useTodoListStore;