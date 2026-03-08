import { CreateTodoPayload, Todo, TodosResponse, UpdateTodoPayload } from "@/lib/types/todo";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "https://dummyjson.com";

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getTodos(params: { limit: number; page: number }): Promise<TodosResponse> {
  const skip = (params.page - 1) * params.limit;
  return request<TodosResponse>(`/todos?limits=${params.limit}&skip=${skip}`);
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return request<Todo>("/todos/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTodo(id: number, payload: UpdateTodoPayload): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTodo(id: number): Promise<{ id: number; isDeleted: boolean }> {
  return request<{ id: number; isDeleted: boolean }>(`/todos/${id}`, {
    method: "DELETE",
  });
}
