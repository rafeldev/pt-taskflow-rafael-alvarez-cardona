import { Todo } from "@/lib/types/todo";

interface TodoItemProps {
  todo: Todo;
  disabled?: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({ todo, disabled = false, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={disabled}
          onChange={() => onToggle(todo)}
          className="h-4 w-4"
        />
        <span
          className={`text-sm text-slate-800 ${
            todo.completed ? "line-through text-slate-500" : ""
          }`}
        >
          {todo.todo}
        </span>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete(todo.id)}
        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Eliminar
      </button>
    </li>
  );
}
