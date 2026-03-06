"use client";

import { FormEvent, useState } from "react";
import { EmptyState } from "@/components/todos/empty-state";
import { LoadingState } from "@/components/todos/loading-state";
import { TodoItem } from "@/components/todos/todo-item";
import { useTodos } from "@/hooks/use-todos";
import { TodoFilter } from "@/lib/types/todo";

const FILTER_OPTIONS: Array<{ label: string; value: TodoFilter }> = [
  { label: "Todas", value: "all" },
  { label: "Completadas", value: "completed" },
  { label: "Pendientes", value: "pending" },
];

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    todos,
    currentPage,
    totalPages,
    filter,
    isLoading,
    isMutating,
    error,
    mutationError,
    setPage,
    setFilter,
    retryCurrentPage,
    addTodo,
    toggleTodo,
    removeTodo,
  } = useTodos();

  async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const wasCreated = await addTodo(newTodo);
    if (wasCreated) {
      setNewTodo("");
      setFeedback("Tarea creada correctamente.");
    }
  }

  async function handleDeleteTodo(id: number) {
    const confirmed = window.confirm("¿Seguro que deseas eliminar esta tarea?");
    if (!confirmed) return;

    const wasDeleted = await removeTodo(id);
    if (wasDeleted) {
      setFeedback("Tarea eliminada correctamente.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-slate-50 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</h1>
        <p className="text-sm text-slate-600">
          Gestión de tareas con Next.js, TypeScript y Zustand.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleCreateTodo} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Escribe una nueva tarea"
            className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none ring-blue-500 focus:ring-2"
          />
          <button
            type="submit"
            disabled={isMutating}
            className="h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white cursor-pointer transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar
          </button>
        </form>
      </section>

      <section className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer ${
              filter === option.value
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            } hover:bg-slate-900 hover:text-white`}
          >
            {option.label}
          </button>
        ))}
      </section>

      {feedback && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      {mutationError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {mutationError}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={retryCurrentPage}
            className="rounded-md border border-red-300 px-3 py-1 font-medium hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingState />
      ) : todos.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              disabled={isMutating}
              onToggle={toggleTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </ul>
      )}

      <section className="mt-auto flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={isLoading || currentPage <= 1}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <p className="text-sm text-slate-600">
          Página {currentPage} de {totalPages}
        </p>
        <button
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={isLoading || currentPage >= totalPages}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </section>
    </main>
  );
}
