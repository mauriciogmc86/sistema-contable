"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/presentation/components/atoms/Button";

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Paginación">
      <p className="text-sm text-muted-foreground">
        Página <span className="font-medium text-foreground">{page}</span> de {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          leftIcon={<ChevronLeft className="h-4 w-4" aria-hidden />}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          rightIcon={<ChevronRight className="h-4 w-4" aria-hidden />}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
