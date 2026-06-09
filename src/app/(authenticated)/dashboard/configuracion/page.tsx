"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, CheckCircle2, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/presentation/components/atoms/Button";
import { Checkbox } from "@/presentation/components/atoms/Checkbox";
import { Input } from "@/presentation/components/atoms/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/molecules/Card";
import { FormField } from "@/presentation/components/molecules/FormField";
import { PageHeader } from "@/presentation/components/organisms/PageHeader";
import { cn } from "@/presentation/utils/cn";

const passwordSchema = z
  .object({
    current: z.string().min(1, "Ingresa tu contraseña actual"),
    next: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

type PasswordInput = z.infer<typeof passwordSchema>;

const TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "seguridad", label: "Seguridad", icon: ShieldCheck },
] as const;

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const flash = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 2500);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Preferencias de la cuenta y de la empresa." />

      {savedMsg && (
        <p role="status" className="flex items-center gap-2 rounded-lg bg-success-subtle px-3 py-2 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {savedMsg}
        </p>
      )}

      <div role="tablist" aria-label="Secciones" className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
        {TABS.map((t) => (
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

      {tab === "general" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Datos de la empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                flash("Datos guardados correctamente.");
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <FormField label="Nombre de la empresa">{({ id }) => <Input id={id} defaultValue="Contable Pro C.A." />}</FormField>
              <FormField label="RIF">{({ id }) => <Input id={id} defaultValue="J-12345678-9" />}</FormField>
              <FormField label="Correo de contacto">{({ id }) => <Input id={id} type="email" defaultValue="admin@empresa.com" />}</FormField>
              <FormField label="Teléfono">{({ id }) => <Input id={id} type="tel" defaultValue="0212-1234567" />}</FormField>
              <div className="sm:col-span-2">
                <Button type="submit">Guardar cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "notificaciones" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Preferencias de notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox id="n1" label="Recibir alertas de vencimientos fiscales" defaultChecked />
            <Checkbox id="n2" label="Resumen semanal por correo" defaultChecked />
            <Checkbox id="n3" label="Avisos de nuevos asientos" />
            <Button onClick={() => flash("Preferencias actualizadas.")}>Guardar preferencias</Button>
          </CardContent>
        </Card>
      )}

      {tab === "seguridad" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(async () => {
                await new Promise((r) => setTimeout(r, 500));
                reset();
                flash("Contraseña actualizada.");
              })}
              className="flex max-w-sm flex-col gap-4"
              noValidate
            >
              <FormField label="Contraseña actual" required error={errors.current?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="password" autoComplete="current-password" aria-describedby={describedBy} invalid={invalid} {...register("current")} />
                )}
              </FormField>
              <FormField label="Nueva contraseña" required error={errors.next?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="password" autoComplete="new-password" aria-describedby={describedBy} invalid={invalid} {...register("next")} />
                )}
              </FormField>
              <FormField label="Confirmar contraseña" required error={errors.confirm?.message}>
                {({ id, describedBy, invalid }) => (
                  <Input id={id} type="password" autoComplete="new-password" aria-describedby={describedBy} invalid={invalid} {...register("confirm")} />
                )}
              </FormField>
              <Button type="submit" isLoading={isSubmitting}>
                Actualizar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
