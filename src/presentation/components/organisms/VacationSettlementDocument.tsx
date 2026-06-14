"use client";

import type { VacationCalculationFormInput } from "@/application/validation";
import type { PayrollEmpresaContext, PayrollWorkerInput } from "@/lib/payrollTypes";
import {
  formatLongDate,
  formatShortDate,
  getCalendarDays,
  getMonthsInRange,
  isDateInRange,
} from "@/lib/payrollDates";
import type { VacationCalculationResult } from "@/lib/vacationCalculation";
import { formatNumber } from "@/presentation/utils/format";

export interface VacationSettlementDocumentProps {
  worker: PayrollWorkerInput;
  empresa: PayrollEmpresaContext | null;
  form: VacationCalculationFormInput;
  result: VacationCalculationResult;
}

function fmt(n: number): string {
  return formatNumber(n, 2);
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="payroll-data-row">
      <span className="payroll-data-label">{label}</span>
      <span className="payroll-data-value">{value}</span>
    </div>
  );
}

function PayrollTable({
  title,
  rows,
  totalLabel,
  total,
}: {
  title: string;
  rows: { label: string; ref: string; days: number; rate: number; total: number }[];
  totalLabel: string;
  total: number;
}) {
  return (
    <div className="payroll-table-section">
      <div className="payroll-section-bar">{title}</div>
      <table className="payroll-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th className="num">Días</th>
            <th className="num">Días a Bs.</th>
            <th className="num">Total Sumatoria</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>
                {r.label}
                {r.ref && <span className="payroll-ref">: {r.ref}</span>}
              </td>
              <td className="num">{r.days > 0 ? r.days : ""}</td>
              <td className="num">{fmt(r.rate)}</td>
              <td className="num">{fmt(r.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="total-label">
              {totalLabel}
            </td>
            <td className="num total-value">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function VacationMonthGrid({
  year,
  month,
  start,
  end,
}: {
  year: number;
  month: number;
  start: string;
  end: string;
}) {
  const days = getCalendarDays(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-VE", { month: "short", year: "2-digit" });

  return (
    <div className="payroll-calendar-month-block">
      <div className="payroll-calendar-month">{monthLabel}</div>
      <div className="payroll-calendar-weekdays">
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="payroll-calendar-days">
        {days.map((day, i) => (
          <span
            key={i}
            className={
              day && isDateInRange(day, start, end)
                ? "payroll-cal-day payroll-cal-day--active"
                : "payroll-cal-day"
            }
          >
            {day?.getDate() ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function VacationCalendar({ start, end }: { start: string; end: string }) {
  const months = getMonthsInRange(start, end);

  return (
    <div className="payroll-calendar-block">
      <p className="payroll-calendar-date">
        {formatLongDate(start)} — {formatShortDate(end)}
      </p>
      <div className="payroll-calendar-grid">
        <div className="payroll-calendars">
          {months.map(({ year, month }) => (
            <VacationMonthGrid key={`${year}-${month}`} year={year} month={month} start={start} end={end} />
          ))}
        </div>
        <div className="payroll-cesta-calc">
          <p>Cesta Ticket Gaceta Oficial</p>
          <p>6,746 Del 1 de Myo 2,023</p>
          <p>40 Dolares / 20 Dolares</p>
          <p>tasa del Dia BCV</p>
        </div>
      </div>
    </div>
  );
}

export function VacationSettlementDocument({ worker, empresa, form, result }: VacationSettlementDocumentProps) {
  const nombre = worker.nombres;
  const apellido = worker.apellidos;
  const cedula = worker.cedula;
  const cargo = worker.cargo;
  const docDate = form.fechaDocumento ?? new Date().toISOString().slice(0, 10);

  return (
    <>
      <div id="printable-vacation" className="payroll-document">
        {/* Encabezado empresa */}
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

        <div className="payroll-section-bar">EMPRESA: {empresa?.nombre ?? "—"}</div>

        <p className="payroll-legal-intro">
          Las Vacaciones se calculan despues de haber cumplido 12 meses de forma ininterrumpida para la organización,
          de conformidad con la LEY ORGANICA DEL TRABAJO, LOS TRABAJADORES Y LAS TRABAJADORAS, publicada en la Gaceta
          Oficial Ext. 6.076 del 7-05-2012.
        </p>

        <div className="payroll-section-bar">DATOS PERSONALES DEL TRABAJADOR</div>

        <DataRow label="Nombre del Trabajador" value={nombre.toUpperCase()} />
        <DataRow label="Apellido del Trabajador" value={apellido.toUpperCase()} />
        <DataRow label="Cedula del Trabajador" value={cedula} />
        <DataRow label="Cargo del Trabajador" value={cargo.toUpperCase()} />
        <DataRow
          label="Sueldo Mensual del Trabajador"
          value={`$${fmt(worker.sueldoMensualUsd)} USD (${fmt(result.sueldoMensualBs)} Bs. a tasa ${fmt(result.tasaBcv)})`}
        />
        <DataRow label="Sueldo Diario del Trabajador" value={fmt(result.sueldoDiario)} />
        <DataRow label="Fecha de Ingreso del Trabajador" value={formatLongDate(worker.fechaIngreso)} />
        <DataRow label="Periodo Vacacional del Trabajador" value={result.periodoVacacional} />
        <DataRow label="FECHA DE COMENZAR EL PERIODO VACACIONAL" value={formatShortDate(result.fechaInicioVacaciones)} />

        <div className="payroll-dates-row">
          <span>DESDE: {formatShortDate(result.fechaInicioVacaciones)}</span>
          <span>HASTA: {formatShortDate(result.fechaFinVacaciones)}</span>
        </div>

        <VacationCalendar start={result.fechaInicioVacaciones} end={result.fechaFinVacaciones} />

        <div className="payroll-cesta-detail">
          <span className="payroll-cesta-rate">{fmt(result.cestaTicketDetalle.tasaBcv)}</span>
          <span> POR {result.cestaTicketDetalle.usdMensual}</span>
          <span className="payroll-cesta-total"> {fmt(result.cestaTicketDetalle.tasaBcv * result.cestaTicketDetalle.usdMensual)}</span>
          <span className="payroll-cesta-total"> {fmt(result.cestaTicketDetalle.totalBs)}</span>
        </div>

        <p className="payroll-worker-name">
          {nombre.toUpperCase()} {apellido.toUpperCase()}
          <br />
          {cedula}
        </p>

        <PayrollTable
          title="ASIGNACIONES DEL TRABAJADOR"
          rows={result.asignaciones.map((a) => ({
            label: a.label,
            ref: a.legalRef,
            days: a.days,
            rate: a.rateBs,
            total: a.totalBs,
          }))}
          totalLabel="Total ASIGNACIONES"
          total={result.totalAsignaciones}
        />

        <PayrollTable
          title="DEDUCCIONES DEL TRABAJADOR"
          rows={result.deducciones.map((d) => ({
            label: d.label,
            ref: d.legalRef,
            days: d.days,
            rate: d.rateBs,
            total: d.totalBs,
          }))}
          totalLabel="Total DEDUCCIONES"
          total={result.totalDeducciones}
        />

        <div className="payroll-section-bar">LUGAR A PAGO DEL TRABAJADOR</div>
        <div className="payroll-total-pay">
          <span>TOTAL A PAGAR</span>
          <strong>{fmt(result.totalAPagar)}</strong>
        </div>

        <div className="payroll-section-bar">FECHA DE SALIDA Y REINCORPORACION A SU JORNADA DE TRABAJO</div>
        <div className="payroll-reintegration">
          <p>
            <strong>Fecha de Salida:</strong> {formatLongDate(result.fechaInicioVacaciones)}
          </p>
          <p>
            <strong>Debe Reintegrarse:</strong> {formatLongDate(result.fechaReincorporacion)}
          </p>
        </div>

        <div className="payroll-signature-block">
          <p className="payroll-signature-title">FIRMA DEL TRABAJADOR</p>
          <div className="payroll-signature-box" />
          <p className="payroll-signature-text">
            El Suscrito Trabajador de: <strong>{empresa?.nombre ?? "—"}</strong> hace constar que ha recibido el
            valor correspondiente a las Vacaciones a que se ha hecho por un monto de:{" "}
            <strong>{fmt(result.totalAPagar)}</strong>. Igualmente hace constar que acepta en todas sus partes estos
            calculos y en especial la fecha de reintegro a sus labores arriba mencionada:
          </p>
          <p className="payroll-signature-place">
            {form.ciudad}; {formatShortDate(docDate)}
          </p>
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
          line-height: 1.45;
        }
        .payroll-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #d9d9d9;
          padding: 12px 16px;
          margin-bottom: 0;
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
          letter-spacing: 0.04em;
          margin-top: 0;
        }
        .payroll-legal-intro {
          text-align: center;
          font-size: 12px;
          padding: 10px 8px;
          margin: 0;
          background: #ececec;
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
        .payroll-dates-row {
          display: flex;
          justify-content: space-around;
          background: #ececec;
          padding: 8px;
          font-weight: bold;
          font-size: 12px;
        }
        .payroll-calendar-block {
          background: #bfbfbf;
          padding: 12px;
          margin: 8px 0;
        }
        .payroll-calendar-date {
          text-align: center;
          font-weight: bold;
          margin: 0 0 8px;
        }
        .payroll-calendar-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: start;
        }
        .payroll-calendars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .payroll-calendar-month-block {
          display: grid;
          gap: 4px;
        }
        .payroll-calendar-month {
          font-weight: bold;
          text-align: center;
        }
        .payroll-calendar-weekdays,
        .payroll-calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          font-size: 11px;
          text-align: center;
        }
        .payroll-cal-day {
          padding: 2px;
        }
        .payroll-cal-day--active {
          background: #c0392b;
          color: #fff;
          font-weight: bold;
          border-radius: 2px;
        }
        .payroll-cesta-calc {
          font-size: 11px;
          line-height: 1.5;
        }
        .payroll-cesta-calc p {
          margin: 0;
        }
        .payroll-cesta-detail {
          text-align: center;
          font-size: 12px;
          padding: 8px;
          background: #ececec;
        }
        .payroll-cesta-rate,
        .payroll-cesta-total {
          color: #c0392b;
          font-weight: bold;
        }
        .payroll-worker-name {
          text-align: center;
          font-weight: bold;
          margin: 12px 0;
          font-size: 13px;
        }
        .payroll-table-section {
          margin-top: 0;
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
          font-weight: bold;
          text-align: left;
        }
        .payroll-table th.num,
        .payroll-table td.num {
          text-align: right;
        }
        .payroll-table td {
          padding: 5px 8px;
          border-bottom: 1px solid #ddd;
        }
        .payroll-ref {
          font-style: italic;
          color: #444;
        }
        .payroll-table tfoot td {
          font-weight: bold;
          background: #f0f0f0;
          border-top: 2px solid #333;
        }
        .total-label {
          text-align: right;
          text-transform: uppercase;
        }
        .total-value {
          font-size: 14px;
        }
        .payroll-total-pay {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #fff;
          border: 2px solid #111;
          margin: 0;
        }
        .payroll-total-pay strong {
          font-size: 22px;
        }
        .payroll-reintegration {
          padding: 12px 16px;
          background: #f5f5f5;
        }
        .payroll-reintegration p {
          margin: 4px 0;
        }
        .payroll-signature-block {
          margin-top: 24px;
          page-break-inside: avoid;
        }
        .payroll-signature-title {
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .payroll-signature-box {
          border: 1px solid #111;
          height: 80px;
          max-width: 280px;
          margin: 0 auto 12px;
        }
        .payroll-signature-text {
          text-align: justify;
          font-size: 12px;
        }
        .payroll-signature-place {
          text-align: right;
          margin-top: 16px;
          font-size: 12px;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .payroll-document {
            max-width: 100%;
            padding: 12mm;
          }
        }
      `}</style>
    </>
  );
}
