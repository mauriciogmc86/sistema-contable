"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Briefcase, Copy, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import type { CargoInput, ClausulaGlobalInput } from "@/application/validation";
import {
  listCargos,
  createCargo,
  updateCargo,
  deleteCargo,
  getCargo,
  getCargoForDuplicate,
  type CargoRecord,
} from "@/infrastructure/repositories/SupabaseCargoRepository";
import {
  listGlobalClausulas,
  createGlobalClausula,
  updateClausula,
  deleteClausula,
  type ClausulaRecord,
} from "@/infrastructure/repositories/SupabaseClausulaRepository";
import { existsCargoNombre } from "@/infrastructure/repositories/duplicateChecks";
import { ensureFreshSession } from "@/lib/supabase/session";
import { Button } from "@/presentation/components/atoms/Button";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { ConfirmDialog } from "@/presentation/components/molecules/ConfirmDialog";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { SaveSuccessModal, type SaveSuccessKind } from "@/presentation/components/molecules/SaveSuccessModal";
import { TableSkeleton } from "@/presentation/components/molecules/Skeleton";
import { Modal } from "@/presentation/components/organisms/Modal";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useAsync } from "@/presentation/hooks";
import { cn } from "@/presentation/utils/cn";

const CargoForm = dynamic(
  () => import("@/presentation/components/organisms/CargoForm").then((m) => m.CargoForm),
  { ssr: false },
);

const ClausulaGlobalForm = dynamic(
  () => import("@/presentation/components/organisms/ClausulaGlobalForm").then((m) => m.ClausulaGlobalForm),
  { ssr: false },
);

type Tab = "cargos" | "globales";

type CargoModalState =
  | { mode: "new"; formKey: string }
  | { mode: "edit"; id: number; values: CargoInput; formKey: string }
  | { mode: "duplicate"; values: CargoInput; formKey: string; usedFallbackClausulas: boolean };

async function nextCargoCopyName(baseName: string): Promise<string> {
  const base = baseName.trim();
  let candidate = `${base} (copia)`;
  let n = 2;
  while (await existsCargoNombre(candidate)) {
    candidate = `${base} (copia ${n})`;
    n += 1;
  }
  return candidate;
}

function buildDuplicatedCargo(values: CargoInput, nombre: string): CargoInput {
  return {
    nombre_cargo: nombre,
    funciones: values.funciones ?? "",
    clausulas: (values.clausulas ?? []).map((clausula, index) => ({
      id: `tmp-${Date.now()}-${index}`,
      titulo: clausula.titulo,
      descripcion: clausula.descripcion,
      orden: clausula.orden ?? (index + 1) * 10,
    })),
  };
}

export default function CargosPage() {
  const [tab, setTab] = useState<Tab>("cargos");

  // ── Cargos state ────────────────────────────────────────────
  const cargos = useAsync(() => listCargos(), []);
  const [cargoModal, setCargoModal] = useState<CargoModalState | null>(null);
  const [cargoToDelete, setCargoToDelete] = useState<CargoRecord | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<SaveSuccessKind | null>(null);

  // ── Global clausulas state ───────────────────────────────────
  const clausulas = useAsync(() => listGlobalClausulas(), []);
  const [clausulaModalOpen, setClausulaModalOpen] = useState(false);
  const [clausulaEdit, setClausulaEdit] = useState<{ id: string; values: ClausulaGlobalInput } | null>(null);
  const [clausulaToDelete, setClausulaToDelete] = useState<ClausulaRecord | null>(null);

  // ── Cargo handlers ───────────────────────────────────────────
  const closeCargoModal = () => setCargoModal(null);

  const handleSaveCargo = async (data: CargoInput) => {
    if (cargoModal?.mode === "edit") {
      await updateCargo(cargoModal.id, data);
      setSaveSuccess("cargo-updated");
    } else {
      await createCargo(data);
      setSaveSuccess("cargo-created");
    }
    cargos.reload();
    closeCargoModal();
  };

  const openNewCargo = () => {
    setCargoModal({ mode: "new", formKey: `new-${Date.now()}` });
  };

  const openEditCargo = async (cargo: CargoRecord) => {
    setEditLoadingId(cargo.id);
    try {
      await ensureFreshSession();
      const values = await getCargo(cargo.id);
      setCargoModal({
        mode: "edit",
        id: cargo.id,
        values,
        formKey: `edit-${cargo.id}-${values.clausulas.length}-${Date.now()}`,
      });
    } finally {
      setEditLoadingId(null);
    }
  };

  const openDuplicateCargo = async (cargo: CargoRecord) => {
    setEditLoadingId(cargo.id);
    try {
      await ensureFreshSession();
      const own = await getCargo(cargo.id);
      const values = own.clausulas.length > 0 ? own : await getCargoForDuplicate(cargo.id);
      const usedFallbackClausulas = own.clausulas.length === 0 && values.clausulas.length > 0;
      const nombre = await nextCargoCopyName(values.nombre_cargo);
      const draft = buildDuplicatedCargo(values, nombre);
      setCargoModal({
        mode: "duplicate",
        values: draft,
        usedFallbackClausulas,
        formKey: `dup-${cargo.id}-${draft.clausulas.length}-${Date.now()}`,
      });
    } finally {
      setEditLoadingId(null);
    }
  };

  // ── Clausula global handlers ─────────────────────────────────
  const handleSaveClausula = async (data: ClausulaGlobalInput) => {
    if (clausulaEdit) {
      await updateClausula(clausulaEdit.id, data);
    } else {
      await createGlobalClausula(data);
    }
    clausulas.reload();
    setClausulaModalOpen(false);
    setClausulaEdit(null);
    setSaveSuccess(clausulaEdit ? "clausula-updated" : "clausula-created");
  };

  const openNewClausula = () => {
    setClausulaEdit(null);
    setClausulaModalOpen(true);
  };

  const openEditClausula = (c: ClausulaRecord) => {
    setClausulaEdit({
      id: c.id,
      values: { titulo: c.titulo, descripcion: c.descripcion, orden: c.orden },
    });
    setClausulaModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargos y Cláusulas"
        description="Administra los cargos de tu empresa y las cláusulas que componen los contratos."
      />

      <div role="tablist" aria-label="Secciones" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
        {([
          { id: "cargos", label: "Cargos", icon: Briefcase },
          { id: "globales", label: "Cláusulas Globales", icon: FileText },
        ] as const).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CARGOS TAB ── */}
      {tab === "cargos" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewCargo}>
              Nuevo cargo
            </Button>
          </div>

          {cargos.error ? (
            <ErrorState description={cargos.error} onRetry={cargos.reload} />
          ) : cargos.loading ? (
            <Card>
              <CardContent className="pt-6">
                <TableSkeleton rows={4} cols={3} />
              </CardContent>
            </Card>
          ) : (cargos.data ?? []).length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Sin cargos registrados"
              description="Registra los cargos de tu empresa para asociarlos a los trabajadores y sus contratos."
              action={
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewCargo}>
                  Nuevo cargo
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Cargo</th>
                      <th className="py-2 pr-4">Cláusulas</th>
                      <th className="py-2 pr-4">Funciones</th>
                      <th className="py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(cargos.data ?? []).map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 pr-4 font-medium text-foreground">{c.nombre_cargo}</td>
                        <td className="py-3 pr-4">
                          <Badge tone={c.clausulas_count ? "neutral" : "warning"}>
                            {c.clausulas_count ?? 0}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 max-w-xs truncate text-muted-foreground">
                          {c.funciones ? (
                            <span title={c.funciones}>{c.funciones.slice(0, 80)}{c.funciones.length > 80 ? "…" : ""}</span>
                          ) : (
                            <span className="italic">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Duplicar cargo ${c.nombre_cargo}`}
                              title="Duplicar"
                              disabled={editLoadingId === c.id}
                              onClick={() => openDuplicateCargo(c)}
                            >
                              <Copy className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              title="Editar"
                              disabled={editLoadingId === c.id}
                              onClick={() => openEditCargo(c)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Eliminar"
                              title="Eliminar"
                              onClick={() => setCargoToDelete(c)}
                            >
                              <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── GLOBAL CLAUSULAS TAB ── */}
      {tab === "globales" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="max-w-prose text-sm text-muted-foreground">
              Las cláusulas globales aplican a <strong>todos</strong> los contratos, independientemente
              del cargo. Se combinan con las cláusulas específicas de cada cargo, ordenadas por el campo &quot;Orden&quot;.
            </p>
            <Button
              leftIcon={<Plus className="h-4 w-4" aria-hidden />}
              onClick={openNewClausula}
              className="shrink-0"
            >
              Nueva cláusula
            </Button>
          </div>

          {clausulas.error ? (
            <ErrorState description={clausulas.error} onRetry={clausulas.reload} />
          ) : clausulas.loading ? (
            <Card>
              <CardContent className="pt-6">
                <TableSkeleton rows={6} cols={3} />
              </CardContent>
            </Card>
          ) : (clausulas.data ?? []).length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Sin cláusulas globales"
              description="Agrega cláusulas que apliquen a todos los contratos de la empresa."
              action={
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewClausula}>
                  Nueva cláusula
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 w-16">Orden</th>
                      <th className="py-2 pr-4">Título</th>
                      <th className="py-2 pr-4">Descripción</th>
                      <th className="py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(clausulas.data ?? []).map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 pr-4">
                          <Badge tone="neutral">{c.orden}</Badge>
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground max-w-xs">
                          <span title={c.titulo} className="line-clamp-2">{c.titulo}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground max-w-sm">
                          <span title={c.descripcion} className="line-clamp-2">
                            {c.descripcion.slice(0, 100)}{c.descripcion.length > 100 ? "…" : ""}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              onClick={() => openEditClausula(c)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Eliminar"
                              onClick={() => setClausulaToDelete(c)}
                            >
                              <Trash2 className="h-4 w-4 text-danger" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── CARGO MODAL ── */}
      <Modal
        open={cargoModal !== null}
        onClose={closeCargoModal}
        title={
          cargoModal?.mode === "edit"
            ? "Editar cargo"
            : cargoModal?.mode === "duplicate"
              ? "Duplicar cargo"
              : "Nuevo cargo"
        }
        description={
          cargoModal?.mode === "edit"
            ? "Actualiza el nombre, funciones y cláusulas de este cargo."
            : cargoModal?.mode === "duplicate"
              ? cargoModal.usedFallbackClausulas
                ? `Se copiaron ${cargoModal.values.clausulas.length} cláusula(s) del contrato (globales + cargo). Ajusta el nombre y guarda la copia.`
                : `Se copiaron ${cargoModal.values.clausulas.length} cláusula(s) del cargo original. Cambia el nombre y ajusta lo que necesites antes de guardar.`
              : "Define el nombre del cargo, sus funciones generales y las cláusulas específicas que aplican en el contrato."
        }
        size="lg"
      >
        {cargoModal && (
          <CargoForm
            key={cargoModal.formKey}
            defaultValues={
              cargoModal.mode === "new" ? undefined : cargoModal.values
            }
            excludeCargoId={cargoModal.mode === "edit" ? cargoModal.id : undefined}
            submitLabel={
              cargoModal.mode === "edit"
                ? "Guardar cambios"
                : cargoModal.mode === "duplicate"
                  ? "Guardar copia"
                  : "Registrar cargo"
            }
            onSubmit={handleSaveCargo}
            onCancel={closeCargoModal}
          />
        )}
      </Modal>

      {/* ── CLAUSULA GLOBAL MODAL ── */}
      <Modal
        open={clausulaModalOpen}
        onClose={() => { setClausulaModalOpen(false); setClausulaEdit(null); }}
        title={clausulaEdit ? "Editar cláusula global" : "Nueva cláusula global"}
        description={
          clausulaEdit
            ? "Actualiza el título y descripción de esta cláusula."
            : "Esta cláusula se incluirá en todos los contratos, independientemente del cargo del trabajador."
        }
        size="lg"
      >
        <ClausulaGlobalForm
          key={clausulaEdit?.id ?? "new-clausula"}
          defaultValues={clausulaEdit?.values}
          submitLabel={clausulaEdit ? "Guardar cambios" : "Registrar cláusula"}
          onSubmit={handleSaveClausula}
          onCancel={() => { setClausulaModalOpen(false); setClausulaEdit(null); }}
        />
      </Modal>

      {/* ── SUCCESS MODAL ── */}
      <SaveSuccessModal
        open={saveSuccess !== null}
        kind={saveSuccess}
        onClose={() => setSaveSuccess(null)}
      />

      {/* ── DELETE CARGO CONFIRM ── */}
      <ConfirmDialog
        open={Boolean(cargoToDelete)}
        title="Eliminar cargo"
        description={`¿Eliminar el cargo "${cargoToDelete?.nombre_cargo}"? Se eliminarán también sus cláusulas asociadas. Los trabajadores con este cargo perderán la referencia.`}
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setCargoToDelete(null)}
        onConfirm={async () => {
          if (cargoToDelete) {
            await deleteCargo(cargoToDelete.id);
            cargos.reload();
          }
          setCargoToDelete(null);
        }}
      />

      {/* ── DELETE CLAUSULA CONFIRM ── */}
      <ConfirmDialog
        open={Boolean(clausulaToDelete)}
        title="Eliminar cláusula global"
        description={`¿Eliminar la cláusula "${clausulaToDelete?.titulo}"? Ya no se incluirá en los contratos generados.`}
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setClausulaToDelete(null)}
        onConfirm={async () => {
          if (clausulaToDelete) {
            await deleteClausula(clausulaToDelete.id);
            clausulas.reload();
          }
          setClausulaToDelete(null);
        }}
      />
    </div>
  );
}
