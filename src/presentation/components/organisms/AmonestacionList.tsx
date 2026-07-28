"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteAllAmonestacionesByTrabajadorId,
  deleteAmonestacionById,
  listAmonestacionesByTrabajadorId,
  type AmonestacionRecord,
  type AmonestacionWorkerContext,
} from "@/infrastructure/repositories/SupabaseAmonestacionRepository";
import { Button } from "@/presentation/components/atoms/Button";
import { ConfirmDialog } from "@/presentation/components/molecules/ConfirmDialog";

interface AmonestacionListProps {
  worker: AmonestacionWorkerContext;
  onChanged: () => void;
}

export function AmonestacionList({ worker, onChanged }: AmonestacionListProps) {
  const [records, setRecords] = useState<AmonestacionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteOne, setConfirmDeleteOne] = useState<AmonestacionRecord | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAmonestacionesByTrabajadorId(worker.trabajadorId);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las amonestaciones.");
    } finally {
      setLoading(false);
    }
  }, [worker.trabajadorId]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const handleDeleteOne = async () => {
    if (!confirmDeleteOne) return;
    setDeletingId(confirmDeleteOne.id);
    try {
      await deleteAmonestacionById(confirmDeleteOne.id);
      setConfirmDeleteOne(null);
      await loadRecords();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la amonestación.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingId("all");
    try {
      await deleteAllAmonestacionesByTrabajadorId(worker.trabajadorId);
      setConfirmDeleteAll(false);
      await loadRecords();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron eliminar las amonestaciones.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando amonestaciones registradas…</p>;
  }

  if (records.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">
          Amonestaciones registradas ({records.length})
        </h3>
        <Button
          type="button"
          variant="danger"
          size="sm"
          leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
          onClick={() => setConfirmDeleteAll(true)}
          disabled={Boolean(deletingId)}
        >
          Eliminar todas
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger-subtle px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <ul className="divide-y divide-border rounded-md border border-border bg-background">
        {records.map((record) => (
          <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
            <div>
              <p className="font-medium text-foreground">Código {record.codigo}</p>
              <p className="text-muted-foreground">
                {record.fecha_documento} · {record.ciudad}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
              onClick={() => setConfirmDeleteOne(record)}
              disabled={Boolean(deletingId)}
            >
              Eliminar
            </Button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmDeleteAll}
        title="Eliminar todas las amonestaciones"
        description={`¿Eliminar las ${records.length} amonestaciones registradas para este trabajador? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar todas"
        destructive
        loading={deletingId === "all"}
        onCancel={() => setConfirmDeleteAll(false)}
        onConfirm={handleDeleteAll}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteOne)}
        title="Eliminar amonestación"
        description={
          confirmDeleteOne
            ? `¿Eliminar la amonestación ${confirmDeleteOne.codigo}? Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        destructive
        loading={Boolean(confirmDeleteOne && deletingId === confirmDeleteOne.id)}
        onCancel={() => setConfirmDeleteOne(null)}
        onConfirm={handleDeleteOne}
      />
    </div>
  );
}
