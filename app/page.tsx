"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { EmptyState } from "@/components/todos/empty-state";
import { LoadingState } from "@/components/todos/loading-state";
import { TodoItem } from "@/components/todos/todo-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTodos } from "@/hooks/use-todos";
import { TodoFilter } from "@/lib/types/todo";

const FILTER_OPTIONS: Array<{ label: string; value: TodoFilter }> = [
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

  async function handleCreateTodo(event: FormEvent<HTMLFormElement>) {
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
          <Card className="border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl tracking-tight">TaskFlow</CardTitle>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-100">
                  Frontend Challenge
                </Badge>
              </div>
              <CardDescription className="text-slate-300">Administra tareas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCreateTodo} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newTodo}
                  onChange={(event) => setNewTodo(event.target.value)}
                  placeholder="Escribe una nueva tarea"
                  className="h-10 border-white/15 bg-white/5 text-slate-100 placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  disabled={isMutating}
                  className="h-10 bg-blue-500 hover:bg-blue-400 cursor-pointer"
                >
                  Agregar tarea
                </Button>
              </form>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Filtro:</span>
                <Select value={filter} onValueChange={(value) => setFilter(value as TodoFilter)}>
                  <SelectTrigger className="h-10 w-[190px] border-white/15 bg-white/5 cursor-pointer">
                    <SelectValue placeholder="Selecciona un filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                  toggleDisabled={pendingToggleIds.includes(todo.id)}
                  deleteDisabled={pendingDeleteIds.includes(todo.id)}
                  onToggle={toggleTodo}
                  onDelete={setTodoToDelete}
                />
              ))}
            </ul>
          )}

          <Card className="border-white/10 bg-slate-900/70">
            <CardContent className="flex items-center justify-between py-3">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousPage}
                disabled={isLoading || currentPage <= 1}
                className="border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                Anterior
              </Button>
              <p className="text-sm text-slate-300">
                Página {currentPage} de {totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={goToNextPage}
                disabled={isLoading || currentPage >= totalPages}
                className="border-white/15 bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                Siguiente
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={todoToDelete !== null} onOpenChange={(open) => !open && setTodoToDelete(null)}>
        <DialogContent className="border-white/15 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2Icon className="size-4" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Esta acción removerá la tarea del listado local actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTodoToDelete(null)}
              className="border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-500 cursor-pointer"
              onClick={() => {
                if (todoToDelete !== null) {
                  void handleDeleteTodo(todoToDelete);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
