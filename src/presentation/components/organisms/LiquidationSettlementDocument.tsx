"use client";

import type { LiquidationCalculationFormInput } from "@/application/validation";
import type { PayrollEmpresaContext, PayrollWorkerInput } from "@/lib/payrollTypes";
import type { LiquidationResult } from "@/lib/vacationCalculation";
import { formatLongDate, formatShortDate } from "@/lib/payrollDates";
import { formatNumber } from "@/presentation/utils/format";

interface LiquidationSettlementDocumentProps {
  worker: PayrollWorkerInput;
  empresa: PayrollEmpresaContext | null;
  form: LiquidationCalculationFormInput;
  result: LiquidationResult;
}

function fmt(n: number): string {
  return formatNumber(n, 2);
}

export function LiquidationSettlementDocument({ worker, empresa, form, result }: LiquidationSettlementDocumentProps) {
  const docDate = form.fechaDocumento ?? new Date().toISOString().slice(0, 10);

  return (
    <>
      <div id="printable-liquidation" className="payroll-document">
        <div className="payroll-header">
          {empresa?.logoUrl && (
            <img src={empresa.logoUrl} alt="Logo empresa" className="payroll-logo" crossOrigin="anonymous" />
          )}
          <div className="payroll-header-text">
            <p className="payroll-company-name">{empresa?.nombre ?? "EMPRESA"}</p>
            <p className="payroll-company-meta">RIF: {empresa?.rif ?? "—"}</p>
            <p className="payroll-company-meta">{empresa?.direccion ?? ""}</p>
          </div>
        </div>

        <div className="payroll-section-bar">LIQUIDACIÓN LABORAL</div>

        <div className="payroll-section-bar">DATOS PERSONALES DEL TRABAJADOR</div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Nombre del Trabajador</span>
          <span className="payroll-data-value">{worker.nombres.toUpperCase()}</span>
        </div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Apellido del Trabajador</span>
          <span className="payroll-data-value">{worker.apellidos.toUpperCase()}</span>
        </div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Cédula del Trabajador</span>
          <span className="payroll-data-value">{worker.cedula}</span>
        </div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Cargo del Trabajador</span>
          <span className="payroll-data-value">{worker.cargo.toUpperCase()}</span>
        </div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Fecha de ingreso</span>
          <span className="payroll-data-value">{formatLongDate(worker.fechaIngreso)}</span>
        </div>

        <div className="payroll-data-row">
          <span className="payroll-data-label">Sueldo mensual</span>
          <span className="payroll-data-value">
            ${fmt(form.sueldoMensualUsd)} USD ({fmt(result.sueldoMensualBs)} Bs. a tasa {fmt(result.tasaBcv)})
          </span>
        </div>
        <div className="payroll-data-row">
          <span className="payroll-data-label">Sueldo diario</span>
          <span className="payroll-data-value">{fmt(result.sueldoDiario)}</span>
        </div>

        <div className="payroll-section-bar">CONCEPTOS A PAGAR</div>
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Referencia</th>
              <th className="num">Días</th>
              <th className="num">Total Bs.</th>
            </tr>
          </thead>
          <tbody>
            {result.asignaciones.map((a) => (
              <tr key={a.label}>
                <td>{a.label}</td>
                <td>{a.legalRef}</td>
                <td className="num">{a.days > 0 ? a.days : "—"}</td>
                <td className="num">{fmt(a.totalBs)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="total-label">
                TOTAL LIQUIDACIÓN
              </td>
              <td className="num total-value">{fmt(result.totalAPagar)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="payroll-signature-block">
          <p className="payroll-signature-title">FIRMA DEL TRABAJADOR</p>
          <div className="payroll-signature-box" />
          {form.ciudad && (
            <p className="payroll-signature-place">
              {form.ciudad}; {formatShortDate(docDate)}
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .payroll-document {
          background: #fff;
          color: #111;
          max-width: 820px;
          margin: 0 auto;
          padding: 24px 32px 40px;
          font-family: "Times New Roman", Times, serif;
          font-size: 13px;
        }
        .payroll-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #d9d9d9;
          padding: 12px 16px;
        }
        .payroll-logo {
          max-height: 72px;
          max-width: 120px;
          object-fit: contain;
        }
        .payroll-header-text {
          flex: 1;
          text-align: center;
        }
        .payroll-company-name {
          font-weight: bold;
          font-size: 15px;
          text-transform: uppercase;
          margin: 0 0 4px;
        }
        .payroll-company-meta {
          margin: 0;
          font-size: 12px;
        }
        .payroll-section-bar {
          background: #1a1a1a;
          color: #fff;
          text-align: center;
          font-weight: bold;
          font-size: 12px;
          padding: 6px 12px;
          text-transform: uppercase;
        }
        .payroll-data-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #ccc;
        }
        .payroll-data-label {
          padding: 5px 10px;
          font-size: 12px;
        }
        .payroll-data-value {
          padding: 5px 10px;
          background: #e8e8e8;
          font-weight: 600;
          text-align: center;
          font-size: 12px;
        }
        .payroll-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .payroll-table th {
          background: #333;
          color: #fff;
          padding: 5px 8px;
        }
        .payroll-table th.num,
        .payroll-table td.num {
          text-align: right;
        }
        .payroll-table td {
          padding: 5px 8px;
          border-bottom: 1px solid #ddd;
        }
        .payroll-table tfoot td {
          font-weight: bold;
          background: #f0f0f0;
        }
        .total-label {
          text-align: right;
        }
        .payroll-signature-block {
          margin-top: 32px;
        }
        .payroll-signature-title {
          text-align: center;
          font-weight: bold;
        }
        .payroll-signature-box {
          border: 1px solid #111;
          height: 80px;
          max-width: 280px;
          margin: 12px auto;
        }
        .payroll-signature-place {
          text-align: right;
          margin-top: 16px;
          font-size: 12px;
        }
      `}</style>
    </>
  );
}
