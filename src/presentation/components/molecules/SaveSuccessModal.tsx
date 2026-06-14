"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/presentation/components/atoms/Button";
import { Modal } from "@/presentation/components/organisms/Modal";

export type SaveSuccessKind =
  | "empresa-created"
  | "empresa-updated"
  | "trabajador-created"
  | "trabajador-updated";

const MESSAGES: Record<SaveSuccessKind, { title: string; description: string }> = {
  "empresa-created": {
    title: "Empresa registrada",
    description: "Los datos de la empresa se guardaron correctamente.",
  },
  "empresa-updated": {
    title: "Empresa actualizada",
    description: "Los cambios en la empresa se guardaron correctamente.",
  },
  "trabajador-created": {
    title: "Trabajador registrado",
    description: "Los datos del trabajador se guardaron correctamente.",
  },
  "trabajador-updated": {
    title: "Trabajador actualizado",
    description: "Los cambios del trabajador se guardaron correctamente.",
  },
};

export interface SaveSuccessModalProps {
  open: boolean;
  kind: SaveSuccessKind | null;
  onClose: () => void;
}

export function SaveSuccessModal({ open, kind, onClose }: SaveSuccessModalProps) {
  if (!kind) return null;

  const { title, description } = MESSAGES[kind];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button type="button" onClick={onClose}>
          Entendido
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden />
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Modal>
  );
}
