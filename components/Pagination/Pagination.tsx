"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  isLoading: boolean;
}
const Pagination = ({
  currentPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  isLoading,
}: PaginationProps) => {
  return (
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
  );
};

export default Pagination;
