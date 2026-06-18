"use client";

import type { EmpresaLegalRow } from "@/infrastructure/repositories/SupabaseLegalRepository";

interface PayrollCompanyHeaderProps {
  empresa: EmpresaLegalRow | null;
  showLogoSpacer?: boolean;
}

export function PayrollCompanyHeader({ empresa, showLogoSpacer = false }: PayrollCompanyHeaderProps) {
  return (
    <div className="payroll-header">
      {showLogoSpacer && <div className="payroll-letter-logo-spacer" aria-hidden />}
      <div className="payroll-header-text">
        <p className="payroll-company-name">{empresa?.nombre ?? "EMPRESA"}</p>
        <p className="payroll-company-meta">RIF: {empresa?.rif ?? "—"}</p>
        <p className="payroll-company-meta">{empresa?.direccion_fiscal ?? ""}</p>
      </div>
    </div>
  );
}
