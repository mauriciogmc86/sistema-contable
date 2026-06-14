"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Building2, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { EmpresaInput, TrabajadorInput } from "@/application/validation";
import {
  createEmpresa,
  createTrabajador,
  deleteEmpresa,
  deleteTrabajador,
  getEmpresa,
  getTrabajador,
  listEmpresas,
  listTrabajadores,
  updateEmpresa,
  updateTrabajador,
  type EmpresaRecord,
  type TrabajadorRecord,
} from "@/infrastructure/repositories/SupabaseEmpresaRepository";
import { Badge } from "@/presentation/components/atoms/Badge";
import { Button } from "@/presentation/components/atoms/Button";
import { Card, CardContent } from "@/presentation/components/molecules/Card";
import { ConfirmDialog } from "@/presentation/components/molecules/ConfirmDialog";
import { EmptyState } from "@/presentation/components/molecules/EmptyState";
import { ErrorState } from "@/presentation/components/molecules/ErrorState";
import { SaveSuccessModal, type SaveSuccessKind } from "@/presentation/components/molecules/SaveSuccessModal";
import { SearchInput } from "@/presentation/components/molecules/SearchInput";
import { TableSkeleton } from "@/presentation/components/molecules/Skeleton";
import { Modal } from "@/presentation/components/organisms/Modal";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { useAsync } from "@/presentation/hooks";
import { useCompanyStore } from "@/presentation/store/useCompanyStore";
import { formatCurrency } from "@/presentation/utils/format";
import { useCurrencyStore } from "@/presentation/store/useCurrencyStore";
import { cn } from "@/presentation/utils/cn";

const EmpresaForm = dynamic(
  () => import("@/presentation/components/organisms/EmpresaForm").then((m) => m.EmpresaForm),
  { ssr: false },
);

const TrabajadorForm = dynamic(
  () => import("@/presentation/components/organisms/TrabajadorForm").then((m) => m.TrabajadorForm),
  { ssr: false },
);

export default function EmpresasPage() {
  const [tab, setTab] = useState<"mercantil" | "personal">("mercantil");
  const [search, setSearch] = useState("");
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const loadCompanies = useCompanyStore((s) => s.loadCompanies);
  const currency = useCurrencyStore((s) => s.currency);

  const empresas = useAsync(() => listEmpresas(), []);
  const trabajadores = useAsync(
    () => (activeCompanyId ? listTrabajadores(activeCompanyId) : Promise.resolve<TrabajadorRecord[]>([])),
    [activeCompanyId],
  );

  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [trabajadorModalOpen, setTrabajadorModalOpen] = useState(false);
  const [empresaEdit, setEmpresaEdit] = useState<{ id: string; values: EmpresaInput } | null>(null);
  const [trabajadorEdit, setTrabajadorEdit] = useState<{ id: string; values: TrabajadorInput } | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<EmpresaRecord | null>(null);
  const [trabajadorToDelete, setTrabajadorToDelete] = useState<TrabajadorRecord | null>(null);
  const [editLoading, setEditLoading] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<SaveSuccessKind | null>(null);

  const filtered = (empresas.data ?? []).filter(
    (e) =>
      !search ||
      e.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      e.rif?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreateEmpresa = async (data: EmpresaInput, logoFile?: File | null) => {
    if (empresaEdit) {
      await updateEmpresa(empresaEdit.id, data, logoFile);
    } else {
      await createEmpresa(data, logoFile);
    }
    empresas.reload();
    loadCompanies();
    setEmpresaModalOpen(false);
    setEmpresaEdit(null);
    setSaveSuccess(empresaEdit ? "empresa-updated" : "empresa-created");
  };

  const handleCreateTrabajador = async (data: TrabajadorInput) => {
    if (!activeCompanyId) return;
    if (trabajadorEdit) {
      await updateTrabajador(trabajadorEdit.id, data);
    } else {
      await createTrabajador(activeCompanyId, data);
    }
    trabajadores.reload();
    setTrabajadorModalOpen(false);
    setTrabajadorEdit(null);
    setSaveSuccess(trabajadorEdit ? "trabajador-updated" : "trabajador-created");
  };

  const openNewEmpresa = () => {
    setEmpresaEdit(null);
    setEmpresaModalOpen(true);
  };

  const openEditEmpresa = async (empresa: EmpresaRecord) => {
    setEditLoading(empresa.id);
    try {
      const values = await getEmpresa(empresa.id);
      setEmpresaEdit({ id: empresa.id, values });
      setEmpresaModalOpen(true);
    } finally {
      setEditLoading(null);
    }
  };

  const openNewTrabajador = () => {
    setTrabajadorEdit(null);
    setTrabajadorModalOpen(true);
  };

  const openEditTrabajador = async (trabajador: TrabajadorRecord) => {
    setEditLoading(trabajador.id);
    try {
      const values = await getTrabajador(trabajador.id);
      setTrabajadorEdit({ id: trabajador.id, values });
      setTrabajadorModalOpen(true);
    } finally {
      setEditLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Empresas y Nómina" description="Gestiona el catálogo de empresas y su personal." />

      <div role="tablist" aria-label="Secciones" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
        {([
          { id: "mercantil", label: "Datos Mercantiles", icon: Building2 },
          { id: "personal", label: "Personal", icon: Users },
        ] as const).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mercantil" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-sm flex-1">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o RIF..." />
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewEmpresa}>
              Nueva empresa
            </Button>
          </div>

          {empresas.error ? (
            <ErrorState description={empresas.error} onRetry={empresas.reload} />
          ) : empresas.loading ? (
            <Card>
              <CardContent className="pt-6">
                <TableSkeleton rows={4} cols={3} />
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Sin empresas"
              description="Registra tu primera empresa."
              action={
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewEmpresa}>
                  Nueva empresa
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Empresa</th>
                      <th className="py-2 pr-4">RIF</th>
                      <th className="py-2 pr-4">Dirección</th>
                      <th className="py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td className="py-3 pr-4 font-medium text-foreground">{e.nombre}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{e.rif}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{e.direccion_fiscal || "—"}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              disabled={editLoading === e.id}
                              onClick={() => openEditEmpresa(e)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => setEmpresaToDelete(e)}>
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
      ) : !activeCompanyId ? (
        <EmptyState
          icon={Users}
          title="Selecciona una empresa"
          description="Elige una empresa en el selector del encabezado para gestionar su personal."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewTrabajador}>
              Añadir trabajador
            </Button>
          </div>

          {trabajadores.error ? (
            <ErrorState description={trabajadores.error} onRetry={trabajadores.reload} />
          ) : trabajadores.loading ? (
            <Card>
              <CardContent className="pt-6">
                <TableSkeleton rows={4} cols={3} />
              </CardContent>
            </Card>
          ) : (trabajadores.data ?? []).length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin trabajadores"
              description="Esta empresa aún no tiene personal registrado."
              action={
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openNewTrabajador}>
                  Añadir trabajador
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="overflow-x-auto pt-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Cédula</th>
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4 text-right">Sueldo base</th>
                      <th className="py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(trabajadores.data ?? []).map((t) => (
                      <tr key={t.id}>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{t.cedula}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {t.primer_nombre} {t.primer_apellido}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          <Badge tone="success">{formatCurrency(Number(t.salario_base) || 0, currency)}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              disabled={editLoading === t.id}
                              onClick={() => openEditTrabajador(t)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => setTrabajadorToDelete(t)}>
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

      <Modal
        open={empresaModalOpen}
        onClose={() => {
          setEmpresaModalOpen(false);
          setEmpresaEdit(null);
        }}
        title={empresaEdit ? "Editar empresa" : "Registrar empresa"}
        description={empresaEdit ? "Actualiza los datos mercantiles de la empresa." : "Completa los datos mercantiles de la empresa."}
        size="lg"
      >
        <EmpresaForm
          key={empresaEdit?.id ?? "new"}
          defaultValues={empresaEdit?.values}
          excludeEmpresaId={empresaEdit?.id}
          submitLabel={empresaEdit ? "Guardar cambios" : "Registrar empresa"}
          onSubmit={handleCreateEmpresa}
          onCancel={() => {
            setEmpresaModalOpen(false);
            setEmpresaEdit(null);
          }}
        />
      </Modal>

      <Modal
        open={trabajadorModalOpen}
        onClose={() => {
          setTrabajadorModalOpen(false);
          setTrabajadorEdit(null);
        }}
        title={trabajadorEdit ? "Editar trabajador" : "Añadir trabajador"}
        description={trabajadorEdit ? "Actualiza los datos del integrante del personal." : "Registra un nuevo integrante del personal."}
        size="lg"
      >
        <TrabajadorForm
          key={trabajadorEdit?.id ?? "new"}
          defaultValues={trabajadorEdit?.values}
          excludeTrabajadorId={trabajadorEdit?.id}
          submitLabel={trabajadorEdit ? "Guardar cambios" : "Guardar trabajador"}
          onSubmit={handleCreateTrabajador}
          onCancel={() => {
            setTrabajadorModalOpen(false);
            setTrabajadorEdit(null);
          }}
        />
      </Modal>

      <SaveSuccessModal
        open={saveSuccess !== null}
        kind={saveSuccess}
        onClose={() => setSaveSuccess(null)}
      />

      <ConfirmDialog
        open={Boolean(empresaToDelete)}
        title="Eliminar empresa"
        description={`¿Eliminar ${empresaToDelete?.nombre}? Se borrarán también sus datos asociados.`}
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setEmpresaToDelete(null)}
        onConfirm={async () => {
          if (empresaToDelete) {
            await deleteEmpresa(empresaToDelete.id);
            empresas.reload();
            loadCompanies();
          }
          setEmpresaToDelete(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(trabajadorToDelete)}
        title="Eliminar trabajador"
        description={`¿Eliminar a ${trabajadorToDelete?.primer_nombre} ${trabajadorToDelete?.primer_apellido ?? ""}?`}
        confirmLabel="Eliminar"
        destructive
        onCancel={() => setTrabajadorToDelete(null)}
        onConfirm={async () => {
          if (trabajadorToDelete) {
            await deleteTrabajador(trabajadorToDelete.id);
            trabajadores.reload();
          }
          setTrabajadorToDelete(null);
        }}
      />
    </div>
  );
}
