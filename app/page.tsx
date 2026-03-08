"use client";

import { SubmitEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTodos } from "@/hooks/use-todos";
import { TodoFilter } from "@/lib/types/todo";
import TodosContent from "@/components/TodosContent/TodosContent";
import TaskControls from "@/components/TaskControls/TaskControls";
import Pagination from "@/components/Pagination/Pagination";
import DeleteTaskDialog from "@/components/DeleteTaskDialog/DeleteTaskDialog";

const filterOptions: Array<{ label: string; value: TodoFilter }> = [
  { label: "Todas", value: "all" },
  { label: "Completadas", value: "completed" },
  { label: "Pendientes", value: "pending" },
];

export default function Home() {
  const [newTodo, setNewTodo] = useState("");
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const prevMutationErrorRef = useRef<string | null>(null);
  const prevErrorRef = useRef<string | null>(null);

  const {
    todos,
    currentPage,
    totalPages,
    filter,
    isLoading,
    isMutating,
    pendingToggleIds,
    pendingDeleteIds,
    error,
    mutationError,
    goToPreviousPage,
    goToNextPage,
    setFilter,
    retryCurrentPage,
    addTodo,
    toggleTodo,
    removeTodo,
  } = useTodos();

  useEffect(() => {
    if (mutationError && mutationError !== prevMutationErrorRef.current) {
      toast.error("No se pudo completar la acción", { description: mutationError });
    }
    prevMutationErrorRef.current = mutationError;
  }, [mutationError]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      toast.error("Error al cargar tareas", {
        description: error,
        action: {
          label: "Reintentar",
          onClick: () => void retryCurrentPage(),
        },
      });
    }
    prevErrorRef.current = error;
  }, [error, retryCurrentPage]);

  async function handleCreateTodo(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const wasCreated = await addTodo(newTodo);
    if (wasCreated) {
      setNewTodo("");
      toast.success("Tarea creada correctamente.");
    }
  }

  async function handleDeleteTodo(id: number) {
    setTodoToDelete(null);
    const wasDeleted = await removeTodo(id);
    if (wasDeleted) {
      toast.success("Tarea eliminada correctamente.");
    }
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_45%)]" />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-5">
          <TaskControls
            handleCreateTodo={handleCreateTodo}
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            isMutating={isMutating}
            filter={filter}
            setFilter={setFilter}
            FILTER_OPTIONS={filterOptions}
          />

          <TodosContent
            isLoading={isLoading}
            todos={todos}
            pendingToggleIds={pendingToggleIds}
            pendingDeleteIds={pendingDeleteIds}
            onToggle={toggleTodo}
            onDelete={setTodoToDelete}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            isLoading={isLoading}
          />
        </div>
      </main>

      <DeleteTaskDialog
        todoToDelete={todoToDelete}
        setTodoToDelete={setTodoToDelete}
        handleDeleteTodo={handleDeleteTodo}
      />
    </>
  );
}
