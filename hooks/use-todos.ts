"use client";

import { useEffect, useMemo } from "react";
import { useTodosStore } from "@/lib/store/todos-store";
import { Todo } from "@/lib/types/todo";

function applyFilter(todos: Todo[], filter: "all" | "completed" | "pending"): Todo[] {
  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  if (filter === "pending") {
    return todos.filter((todo) => !todo.completed);
  }

  return todos;
}

export function useTodos() {
  const {
    todosByPage,
    createdTodos,
    updatedTodos,
    deletedTodoIds,
    currentPage,
    total,
    limit,
    filter,
    isLoading,
    isMutating,
    error,
    mutationError,
    fetchPage,
    setPage,
    goToPreviousPage,
    goToNextPage,
    setFilter,
    retryCurrentPage,
    addTodo,
    toggleTodo,
    removeTodo,
  } = useTodosStore();

  useEffect(() => {
    if (Object.keys(todosByPage).length === 0) {
      void fetchPage(1);
    }
  }, [fetchPage, todosByPage]);

  const currentPageTodos = useMemo(() => {
    const apiTodos = todosByPage[currentPage] ?? [];
    const withUpdates = apiTodos.map((todo) => updatedTodos[todo.id] ?? todo);
    const withoutDeleted = withUpdates.filter((todo) => !deletedTodoIds.includes(todo.id));

    const localCreated = createdTodos.filter((todo) => !deletedTodoIds.includes(todo.id));
    const merged = currentPage === 1 ? [...localCreated, ...withoutDeleted] : withoutDeleted;

    return applyFilter(merged, filter);
  }, [createdTodos, currentPage, deletedTodoIds, filter, todosByPage, updatedTodos]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    todos: currentPageTodos,
    currentPage,
    totalPages,
    filter,
    isLoading,
    isMutating,
    error,
    mutationError,
    setPage,
    goToPreviousPage,
    goToNextPage,
    setFilter,
    retryCurrentPage,
    addTodo,
    toggleTodo,
    removeTodo,
  };
}
