"use client";

import { Todo } from "@/lib/types/todo";
import { useMemo } from "react";
import { LoadingState } from "@/components/todos/loading-state";
import { EmptyState } from "@/components/todos/empty-state";
import { TodoItem } from "@/components/todos/todo-item";

type ViewState = "loading" | "empty" | "ready";

interface TodosContentProps {
  isLoading: boolean;
  todos: Todo[];
  pendingToggleIds: number[];
  pendingDeleteIds: number[];
  onToggle: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

function getViewState(isLoading: boolean, todosCount: number): ViewState {
  if (isLoading) return "loading";
  if (todosCount === 0) return "empty";
  return "ready";
}

const TodosContent = ({
  isLoading,
  todos,
  pendingToggleIds,
  pendingDeleteIds,
  onToggle,
  onDelete,
}: TodosContentProps) => {
  const toggleSet = useMemo(() => new Set(pendingToggleIds), [pendingToggleIds]);
  const deleteSet = useMemo(() => new Set(pendingDeleteIds), [pendingDeleteIds]);

  const viewState = getViewState(isLoading, todos.length);

  return (
    <div>
      {viewState === "loading" && <LoadingState />}
      {viewState === "empty" && <EmptyState />}
      {viewState === "ready" && (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleDisabled={toggleSet.has(todo.id)}
              deleteDisabled={deleteSet.has(todo.id)}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodosContent;
