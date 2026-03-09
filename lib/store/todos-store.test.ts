import { deleteTodo, getTodos, updateTodo } from "@/lib/api/todos";
import {
  partializeTodosState,
  sanitizePersistedState,
  useTodosStore,
} from "@/lib/store/todos-store";
import { Todo } from "@/lib/types/todo";

jest.mock("@/lib/api/todos", () => ({
  getTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

const mockedGetTodos = getTodos as jest.MockedFunction<typeof getTodos>;
const mockedUpdateTodo = updateTodo as jest.MockedFunction<typeof updateTodo>;
const mockedDeleteTodo = deleteTodo as jest.MockedFunction<typeof deleteTodo>;

const baseTodo: Todo = {
  id: 1,
  todo: "Task test",
  completed: false,
  userId: 1,
};

describe("useTodosStore critical tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const initialState = useTodosStore.getInitialState();
    useTodosStore.setState(initialState, true);
    useTodosStore.setState({
      todosByPage: { 1: [baseTodo] },
      currentPage: 1,
      total: 1,
      limit: 10,
    });
  });

  it("toggleTodo: optimistic update and rollback on API error", async () => {
    mockedUpdateTodo.mockRejectedValueOnce(new Error("patch failed"));

    const promise = useTodosStore.getState().toggleTodo(baseTodo);

    const optimisticState = useTodosStore.getState();
    expect(optimisticState.updatedTodos[baseTodo.id]?.completed).toBe(true);

    const result = await promise;
    expect(result).toBe(false);

    const rollbackState = useTodosStore.getState();
    expect(rollbackState.updatedTodos[baseTodo.id]?.completed).toBe(false);
    expect(rollbackState.mutationError).toBe("No fue posible actualizar el estado de la tarea.");
  });

  it("removeTodo: optimistic delete and rollback on API error", async () => {
    mockedDeleteTodo.mockRejectedValueOnce(new Error("delete failed"));

    const promise = useTodosStore.getState().removeTodo(baseTodo.id);

    const optimisticState = useTodosStore.getState();
    expect(optimisticState.deletedTodoIds.includes(baseTodo.id)).toBe(true);

    const result = await promise;
    expect(result).toBe(false);

    const rollbackState = useTodosStore.getState();
    expect(rollbackState.deletedTodoIds.includes(baseTodo.id)).toBe(false);
    expect(rollbackState.mutationError).toBe("No fue posible eliminar la tarea.");
  });

  it("retryCurrentPage: retries fetch and clears error on success", async () => {
    mockedGetTodos.mockRejectedValueOnce(new Error("network failed")).mockResolvedValueOnce({
      todos: [baseTodo],
      total: 1,
      skip: 0,
      limit: 10,
    });

    await useTodosStore.getState().fetchPage(1);
    expect(useTodosStore.getState().error).toBe("No fue posible cargar las tareas. Intenta nuevamente.");

    await useTodosStore.getState().retryCurrentPage();

    const stateAfterRetry = useTodosStore.getState();
    expect(stateAfterRetry.error).toBeNull();
    expect(stateAfterRetry.todosByPage[1]).toHaveLength(1);
    expect(stateAfterRetry.todosByPage[1][0].id).toBe(baseTodo.id);
  });

  it("persist partialize: includes only durable state", () => {
    useTodosStore.setState({
      createdTodos: [baseTodo],
      localCreatedTodoIds: [baseTodo.id],
      updatedTodos: { [baseTodo.id]: { ...baseTodo, completed: true } },
      deletedTodoIds: [2],
      currentPage: 3,
      filter: "completed",
      isLoading: true,
      mutationError: "error temporal",
      pendingToggleIds: [baseTodo.id],
    });

    const partializedState = partializeTodosState(useTodosStore.getState());

    expect(partializedState).toEqual({
      createdTodos: [baseTodo],
      localCreatedTodoIds: [baseTodo.id],
      updatedTodos: { [baseTodo.id]: { ...baseTodo, completed: true } },
      deletedTodoIds: [2],
      currentPage: 3,
      filter: "completed",
    });
    expect(partializedState).not.toHaveProperty("isLoading");
    expect(partializedState).not.toHaveProperty("pendingToggleIds");
    expect(partializedState).not.toHaveProperty("mutationError");
  });

  it("persist merge: sanitizes invalid persisted values", () => {
    const sanitizedState = sanitizePersistedState({
      createdTodos: [baseTodo, { invalid: true }],
      localCreatedTodoIds: [1, "bad", null],
      updatedTodos: {
        [baseTodo.id]: { ...baseTodo, completed: true },
        invalid: { bad: true },
      },
      deletedTodoIds: [3, "x"],
      currentPage: -10,
      filter: "bad-filter",
    });

    expect(sanitizedState.createdTodos).toEqual([baseTodo]);
    expect(sanitizedState.localCreatedTodoIds).toEqual([1]);
    expect(sanitizedState.updatedTodos).toEqual({
      [baseTodo.id]: { ...baseTodo, completed: true },
    });
    expect(sanitizedState.deletedTodoIds).toEqual([3]);
    expect(sanitizedState.currentPage).toBe(1);
    expect(sanitizedState.filter).toBe("all");
  });
});
