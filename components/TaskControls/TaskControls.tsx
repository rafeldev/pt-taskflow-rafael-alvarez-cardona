
"use client";

import { SubmitEvent } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TodoFilter } from "../../lib/types/todo";


interface TaskControlsProps {
  handleCreateTodo: (event: SubmitEvent<HTMLFormElement>) => void;
  newTodo: string;
  setNewTodo: (value: string) => void;
  isMutating: boolean;
  filter: TodoFilter;
  setFilter: (value: TodoFilter) => void;
  FILTER_OPTIONS: Array<{ label: string; value: TodoFilter }>;
}


const TaskControls = ({ handleCreateTodo, newTodo, setNewTodo, isMutating, filter, setFilter, FILTER_OPTIONS }: TaskControlsProps) => {
  return (
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
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-10 w-[190px] border-white/15 bg-white/5 cursor-pointer">
              <SelectValue placeholder="Selecciona un filtro" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskControls;
