import { Todo } from "@/lib/types/todo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItemProps {
  todo: Todo;
  toggleDisabled?: boolean;
  deleteDisabled?: boolean;
  onToggle: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export function TodoItem({
  todo,
  toggleDisabled = false,
  deleteDisabled = false,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <li>
      <Card
        size="sm"
        className="border-white/10 bg-white/[0.03] ring-1 ring-white/5 transition hover:bg-white/[0.05]"
      >
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <Checkbox
              checked={todo.completed}
              disabled={toggleDisabled}
              onCheckedChange={() => onToggle(todo)}
              className="size-4 accent-blue-400"
            />

            <span
              className={`truncate text-sm ${
                todo.completed ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {todo.todo}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <Badge
              variant={todo.completed ? "secondary" : "outline"}
              className={todo.completed ? "bg-emerald-500/20 text-emerald-200" : ""}
            >
              {todo.completed ? "Completada" : "Pendiente"}
            </Badge>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={deleteDisabled}
              onClick={() => onDelete(todo.id)}
              className="text-red-300 hover:bg-red-500/10 hover:text-red-200 cursor-pointer"
            >
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
