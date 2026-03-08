"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteTaskDialogProps {
  todoToDelete: number | null;
  setTodoToDelete: (todoToDelete: number | null) => void;
  handleDeleteTodo: (todoToDelete: number) => void;
}

const DeleteTaskDialog = ({
  todoToDelete,
  setTodoToDelete,
  handleDeleteTodo,
}: DeleteTaskDialogProps) => {
  return (
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
  );
};
export default DeleteTaskDialog;
