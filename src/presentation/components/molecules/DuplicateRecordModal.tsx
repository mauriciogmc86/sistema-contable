"use client";

import { Button } from "@/presentation/components/atoms/Button";
import { Modal } from "@/presentation/components/organisms/Modal";

export type DuplicateRecordKind = "cedula" | "rif" | "cargo";

const MESSAGES: Record<DuplicateRecordKind, { title: string; description: string }> = {
  cedula: {
    title: "Cédula ya registrada",
    description: "Esta cédula de identidad ya está registrada en el sistema. Verifica el número o edita el registro existente.",
  },
  rif: {
    title: "RIF ya registrado",
    description: "Este RIF ya está registrado en el sistema. Verifica el número o edita la empresa existente.",
  },
  cargo: {
    title: "Cargo ya registrado",
    description: "Ya existe un cargo con ese nombre en el sistema. Verifica el nombre o edita el registro existente.",
  },
};

export interface DuplicateRecordModalProps {
  open: boolean;
  kind: DuplicateRecordKind;
  onClose: () => void;
}

export function DuplicateRecordModal({ open, kind, onClose }: DuplicateRecordModalProps) {
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
      <p className="text-sm text-muted-foreground">{description}</p>
    </Modal>
  );
}
