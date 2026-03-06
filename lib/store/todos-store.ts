"use client";

import { create } from "zustand";
import { createTodo, deleteTodo, getTodos, updateTodo } from "@/lib/api/todos";
import { Todo, TodoFilter } from "@/lib/types/todo";

const TODOS_PER_PAGE = 10;
const DEFAULT_USER_ID = 1;

interface TodosState {
  todosByPage: Record<number, Todo[]>;
  createdTodos: Todo[];
  localCreatedTodoIds: number[];
  updatedTodos: Record<number, Todo>;
  deletedTodoIds: number[];
  pendingToggleIds: number[];
  pendingDeleteIds: number[];
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
  localCreatedTodoIds: [],
  updatedTodos: {},
  deletedTodoIds: [],
  pendingToggleIds: [],
  pendingDeleteIds: [],
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
          localCreatedTodoIds: [safeCreatedTodo.id, ...state.localCreatedTodoIds],
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
    if (get().localCreatedTodoIds.includes(todo.id)) {
      set((state) => ({
        createdTodos: state.createdTodos.map((item) =>
          item.id === todo.id ? { ...item, completed: !item.completed } : item
        ),
      }));
      return true;
    }

    if (get().pendingToggleIds.includes(todo.id)) {
      return false;
    }

    const optimisticCompleted = !todo.completed;
    set((state) => ({
      mutationError: null,
      pendingToggleIds: [...state.pendingToggleIds, todo.id],
      updatedTodos: {
        ...state.updatedTodos,
        [todo.id]: {
          ...(state.updatedTodos[todo.id] ?? todo),
          completed: optimisticCompleted,
        },
      },
      createdTodos: state.createdTodos.map((item) =>
        item.id === todo.id ? { ...item, completed: optimisticCompleted } : item
      ),
    }));

    try {
      const updated = await updateTodo(todo.id, { completed: optimisticCompleted });

      set((state) => ({
        pendingToggleIds: state.pendingToggleIds.filter((id) => id !== todo.id),
        updatedTodos: {
          ...state.updatedTodos,
          [todo.id]: {
            ...(state.updatedTodos[todo.id] ?? todo),
            ...updated,
          },
        },
      }));

      return true;
    } catch {
      set((state) => ({
        pendingToggleIds: state.pendingToggleIds.filter((id) => id !== todo.id),
        updatedTodos: {
          ...state.updatedTodos,
          [todo.id]: {
            ...(state.updatedTodos[todo.id] ?? todo),
            completed: todo.completed,
          },
        },
        createdTodos: state.createdTodos.map((item) =>
          item.id === todo.id ? { ...item, completed: todo.completed } : item
        ),
        mutationError: "No fue posible actualizar el estado de la tarea.",
      }));
      return false;
    }
  },

  removeTodo: async (id: number) => {
    if (get().localCreatedTodoIds.includes(id)) {
      set((state) => ({
        createdTodos: state.createdTodos.filter((todo) => todo.id !== id),
        localCreatedTodoIds: state.localCreatedTodoIds.filter((todoId) => todoId !== id),
      }));
      return true;
    }

    const stateBeforeDelete = get();
    if (stateBeforeDelete.pendingDeleteIds.includes(id)) {
      return false;
    }

    const wasAlreadyDeleted = stateBeforeDelete.deletedTodoIds.includes(id);
    const createdTodoIndex = stateBeforeDelete.createdTodos.findIndex((todo) => todo.id === id);
    const createdTodoSnapshot =
      createdTodoIndex >= 0 ? stateBeforeDelete.createdTodos[createdTodoIndex] : null;
    const wasLocalCreated = stateBeforeDelete.localCreatedTodoIds.includes(id);

    set((state) => ({
      mutationError: null,
      pendingDeleteIds: [...state.pendingDeleteIds, id],
      deletedTodoIds: state.deletedTodoIds.includes(id)
        ? state.deletedTodoIds
        : [...state.deletedTodoIds, id],
      createdTodos: state.createdTodos.filter((todo) => todo.id !== id),
      localCreatedTodoIds: state.localCreatedTodoIds.filter((todoId) => todoId !== id),
    }));

    try {
      await deleteTodo(id);

      set((state) => ({
        pendingDeleteIds: state.pendingDeleteIds.filter((pendingId) => pendingId !== id),
      }));

      return true;
    } catch {
      set((state) => {
        const rollbackCreatedTodos = [...state.createdTodos];
        if (createdTodoSnapshot && !rollbackCreatedTodos.some((todo) => todo.id === id)) {
          const rollbackIndex = Math.min(createdTodoIndex, rollbackCreatedTodos.length);
          rollbackCreatedTodos.splice(rollbackIndex, 0, createdTodoSnapshot);
        }

        return {
          pendingDeleteIds: state.pendingDeleteIds.filter((pendingId) => pendingId !== id),
          deletedTodoIds: wasAlreadyDeleted
            ? state.deletedTodoIds
            : state.deletedTodoIds.filter((deletedId) => deletedId !== id),
          createdTodos: rollbackCreatedTodos,
          localCreatedTodoIds:
            wasLocalCreated && !state.localCreatedTodoIds.includes(id)
              ? [id, ...state.localCreatedTodoIds]
              : state.localCreatedTodoIds,
          mutationError: "No fue posible eliminar la tarea.",
        };
      });
      return false;
    }
  },
}));
