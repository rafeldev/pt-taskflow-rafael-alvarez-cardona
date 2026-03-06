import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="py-6 text-center text-sm text-muted-foreground">
        No hay tareas para mostrar con el filtro seleccionado.
      </CardContent>
    </Card>
  );
}
