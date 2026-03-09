# TaskFlow - Prueba Tecnica Frontend

Aplicacion de gestion de tareas construida con `Next.js`, `React`, `TypeScript`, `TailwindCSS`, `shadcn/ui` y `Zustand`, consumiendo la API de DummyJSON.

## Stack

- Next.js (App Router)
- React 19
- TypeScript
- TailwindCSS + shadcn/ui
- Zustand (estado global)
- Sonner (toasts)

## Requisitos previos

- Node.js 20+ recomendado
- pnpm 10+

## Instalacion y ejecucion local

1. Clona el repositorio:

```bash
git clone https://github.com/rafeldev/pt-taskflow-rafael-alvarez-cardona.git
cd pt-taskflow-rafael-alvarez-cardona
```

2. Instala dependencias:

```bash
pnpm install
```

3. Crea el archivo de entorno local:

```bash
cp .env.example .env.local
```

4. Ejecuta el proyecto:

```bash
pnpm dev
```

Abre `http://localhost:3000`.

## Variables de entorno

`.env.example`:

```env
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
```

## Scripts utiles

```bash
pnpm dev           # entorno de desarrollo
pnpm build         # build de produccion
pnpm start         # correr build en local
pnpm lint          # validar eslint
pnpm lint:fix      # corregir lint automaticamente
pnpm format        # formatear con prettier
pnpm format:check  # verificar formato
pnpm test          # ejecutar pruebas unitarias una vez
pnpm test:watch    # ejecutar pruebas en modo watch
```

## Ejecucion de tests

La aplicacion incluye pruebas unitarias con `Jest` + `ts-jest` enfocadas en la logica critica del store global.

### Ejecutar una corrida de tests

```bash
pnpm test
```

### Ejecutar tests en modo watch (desarrollo)

```bash
pnpm test:watch
```

### Que se valida actualmente

- `toggleTodo`: optimistic update y rollback cuando falla la API.
- `removeTodo`: eliminacion optimista y rollback cuando falla la API.
- `retryCurrentPage`: reintento de carga y limpieza de error al recuperar respuesta.

Archivo principal de pruebas:

- `lib/store/todos-store.test.ts`

## Funcionalidades implementadas

- Listado de tareas paginado (10 por pagina)
- Crear tarea (POST) con actualizacion en estado local
- Cambiar estado completada/pendiente (PATCH) con optimistic update + rollback
- Eliminar tarea (DELETE) con optimistic update + rollback
- Confirmacion antes de eliminar (Dialog)
- Filtro local: todas, completadas, pendientes
- Loading/empty states y feedback de errores con opcion de reintentar

## Arquitectura (resumen)

- `lib/api/*`: cliente HTTP y endpoints
- `lib/store/todos-store.ts`: estado global y reglas de negocio CRUD
- `hooks/use-todos.ts`: composicion de estado para UI
- `components/*`: UI reutilizable y componentes de dominio
- `app/page.tsx`: pantalla principal (container)

## Notas tecnicas

DummyJSON no persiste operaciones de escritura.  
Por eso se maneja estado local para mantener consistencia en UI despues de crear, actualizar o eliminar tareas.

### Persistencia en sesion (Zustand + sessionStorage)

La aplicacion persiste parte del estado del store en `sessionStorage` para conservar el contexto al recargar la pagina en la misma pestana.

Se persiste unicamente estado durable:

- `createdTodos`
- `updatedTodos`
- `deletedTodoIds`
- `localCreatedTodoIds`
- `filter`
- `currentPage`

No se persisten estados transitorios de UI/red (`isLoading`, `isMutating`, `error`, `mutationError`, `pendingToggleIds`, `pendingDeleteIds`, `lastFailedAction`, `todosByPage`) para evitar inconsistencias al hidratar.

La hidratacion incluye saneamiento de datos para manejar payloads invalidos de storage (por ejemplo: `filter` no reconocido o `currentPage` fuera de rango minimo).

## Deploy

- Produccion: https://pt-taskflow-rafael-alvarez-cardona.vercel.app
- Deploy puntual: https://pt-taskflow-rafael-alvarez-cardona-86y9uh2e8.vercel.app
