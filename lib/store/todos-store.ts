"use client";

import { create } from "zustand";
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/api/todos";
import { Todo, TodoFilter } from "@/lib/types/todo";

const TODOS_PER_PAGE = 10;
const DEFAULT_USER_ID = 1;

interface TodosState {
  todosByPage: Record<number, Todo[]>;
  createdTodos: Todo[];
  updatedTodos: Record<number, Todo>;
  deletedTodoIds: number[];
  currentPage: number;
  total: number;
  limit: number;
  filter: TodoFilter;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  mutationError: string | null;
  fetchPage: (page: number) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  retryCurrentPage: () => Promise<void>;
  addTodo: (text: string) => Promise<boolean>;
  toggleTodo: (todo: Todo) => Promise<boolean>;
  removeTodo: (id: number) => Promise<boolean>;
}

function uniqueLocalTodoId(currentTodos: Todo[]): number {
  const minId = currentTodos.reduce((min, todo) => Math.min(min, todo.id), 0);
  return Math.min(minId - 1, -1);
}

export const useTodosStore = create<TodosState>((set, get) => ({
  todosByPage: {},
  createdTodos: [],
  updatedTodos: {},
  deletedTodoIds: [],
  currentPage: 1,
  total: 0,
  limit: TODOS_PER_PAGE,
  filter: "all",
  isLoading: false,
  isMutating: false,
  error: null,
  mutationError: null,

  fetchPage: async (page: number) => {
    set({ isLoading: true, error: null });

    try {
      const { limit } = get();
      const response = await getTodos({ limit, page });

      set((state) => ({
        todosByPage: {
          ...state.todosByPage,
          [page]: response.todos,
        },
        total: response.total,
        currentPage: page,
        isLoading: false,
      }));
    } catch {
      set({
        isLoading: false,
        error: "No fue posible cargar las tareas. Intenta nuevamente.",
      });
    }
  },

  setPage: async (page: number) => {
    await get().fetchPage(page);
  },

  goToPreviousPage: async () => {
    const previousPage = Math.max(1, get().currentPage - 1);
    await get().fetchPage(previousPage);
  },

  goToNextPage: async () => {
    const { currentPage, total, limit } = get();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const nextPage = Math.min(totalPages, currentPage + 1);
    await get().fetchPage(nextPage);
  },

  setFilter: (filter: TodoFilter) => {
    set({ filter });
  },

  retryCurrentPage: async () => {
    await get().fetchPage(get().currentPage);
  },

  addTodo: async (text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText) return false;

    set({ isMutating: true, mutationError: null });

    try {
      const created = await createTodo({
        todo: normalizedText,
        completed: false,
        userId: DEFAULT_USER_ID,
      });

      set((state: TodosState) => {
        const existingTodos = [...Object.values(state.todosByPage).flat(), ...state.createdTodos];
        const idAlreadyExists = existingTodos.some((todo) => todo.id === created.id);
        const safeCreatedTodo: Todo = idAlreadyExists
          ? { ...created, id: uniqueLocalTodoId(existingTodos) }
          : created;

        return {
          createdTodos: [safeCreatedTodo, ...state.createdTodos],
          isMutating: false,
        };
      });

      return true;
    } catch {
      set({
        isMutating: false,
        mutationError: "No fue posible crear la tarea.",
      });
      return false;
    }
  },

  toggleTodo: async (todo: Todo) => {
    if (todo.id <= 0) {
      set((state) => ({
        createdTodos: state.createdTodos.map((item) =>
          item.id === todo.id ? { ...item, completed: !item.completed } : item
        ),
      }));
      return true;
    }

    set({ isMutating: true, mutationError: null });

    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });

      set((state) => ({
        updatedTodos: {
          ...state.updatedTodos,
          [todo.id]: {
            ...todo,
            ...updated,
          },
        },
        createdTodos: state.createdTodos.map((item) =>
          item.id === todo.id ? { ...item, completed: !item.completed } : item
        ),
        isMutating: false,
      }));

      return true;
    } catch {
      set({
        isMutating: false,
        mutationError: "No fue posible actualizar el estado de la tarea.",
      });
      return false;
    }
  },

  removeTodo: async (id: number) => {
    if (id <= 0) {
      set((state) => ({
        createdTodos: state.createdTodos.filter((todo) => todo.id !== id),
      }));
      return true;
    }

    set({ isMutating: true, mutationError: null });

    try {
      await deleteTodo(id);

      set((state) => ({
        deletedTodoIds: state.deletedTodoIds.includes(id)
          ? state.deletedTodoIds
          : [...state.deletedTodoIds, id],
        createdTodos: state.createdTodos.filter((todo) => todo.id !== id),
        isMutating: false,
      }));

      return true;
    } catch {
      set({
        isMutating: false,
        mutationError: "No fue posible eliminar la tarea.",
      });
      return false;
    }
  },
}));
