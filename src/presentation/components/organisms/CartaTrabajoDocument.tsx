"use client";

import type { CartaTrabajoFormInput } from "@/application/validation";
import { fechaEnLetras } from "@/lib/contractUtils";
import { parseIsoDate } from "@/lib/payrollDates";
import type { WorkerDocumentData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import {
  buildCartaTrabajoSalary,
  constitucionDateParts,
  formatBsAmount,
  formatForeignAmount,
  fullWorkerName,
  serviceYearsDescription,
  workerCargo,
} from "@/lib/workerDocumentUtils";
import { PayrollCompanyHeader } from "@/presentation/components/molecules/PayrollCompanyHeader";
import { PayrollLetterStyles } from "@/presentation/components/molecules/PayrollLetterStyles";
import { PayrollLetterWatermarks } from "@/presentation/components/molecules/PayrollLetterWatermarks";

interface CartaTrabajoDocumentProps {
  data: WorkerDocumentData;
  form: CartaTrabajoFormInput;
}

const B = ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>;

export function CartaTrabajoDocument({ data, form }: CartaTrabajoDocumentProps) {
  const { empleado, empresa } = data;
  const rep = empresa?.representantes?.[0];
  const docDateIso = form.fechaDocumento ?? new Date().toISOString().slice(0, 10);
  const docDate = parseIsoDate(docDateIso);
  const constitucion = constitucionDateParts(empresa?.fecha_constitucion);
  const nombreTrabajador = fullWorkerName(empleado) || "—";
  const cargo = workerCargo(empleado) || "—";
  const fechaIngreso = empleado.fecha_ingreso ?? "";
  const antiguedad = fechaIngreso
    ? serviceYearsDescription(fechaIngreso, docDate)
    : { years: 0, enLetras: "—", enNumeros: "00" };
  const salarioBase = Number(empleado.salario_base) || 0;
  const salary = buildCartaTrabajoSalary(salarioBase, form.tasaBcv, form.monedaConversion);
  const ciudad = form.ciudad?.trim() || "Maracaibo";

  return (
    <>
      <div id="printable-carta-trabajo" className="payroll-letter-document">
        <PayrollLetterWatermarks logoUrl={empresa?.logo_url} />
        <div className="payroll-letter-content">
          <PayrollCompanyHeader empresa={empresa} showLogoSpacer={Boolean(empresa?.logo_url)} />

        <div className="payroll-letter-title">Constancia de Trabajo</div>

        <div className="payroll-letter-body">
          <p>
            Quien suscribe, <B>{rep?.nombre_completo ?? "—"}</B>, venezolano, mayor de edad, titular de la cédula de
            identidad N° <B>{rep?.cedula ?? "—"}</B>, actuando en mi carácter de{" "}
            <B>{rep?.profesion_cargo ?? "Gerente de Talento Humano"}</B>, de la sociedad mercantil{" "}
            <B>{empresa?.nombre ?? "—"}</B>, inscrita en el Registro Mercantil{" "}
            <B>{empresa?.registro_mercantil ?? "—"}</B>, de la Circunscripción Judicial del Estado Zulia, en fecha{" "}
            <B>{constitucion.dia}</B> de <B>{constitucion.mes}</B> de <B>{constitucion.anio}</B>, bajo el N°{" "}
            <B>{empresa?.numero_registro ?? "—"}</B>, Tomo <B>{empresa?.tomo_numero ?? "—"}</B>, hago constar por
            medio de la presente lo siguiente:
          </p>

          <p>
            Que el ciudadano <B>{nombreTrabajador.toUpperCase()}</B>, venezolano, mayor de edad, titular de la cédula
            de identidad N° <B>{empleado.cedula ?? "—"}</B>, presta sus servicios personales y de carácter subordinado
            para esta Sociedad Mercantil desde hace <B>{antiguedad.enLetras.toUpperCase()}</B> ({antiguedad.enNumeros}){" "}
            {antiguedad.years === 1 ? "año" : "años"} ininterrumpidos, desempeñando el cargo de{" "}
            <B>{cargo.toUpperCase()}</B>, bajo relación de dependencia laboral, devengando un sueldo mensual de: Bs.{" "}
            <B>{formatBsAmount(salary.sueldoMensualBs)}</B>, conforme a lo establecido en la Ley Orgánica del Trabajo,
            los Trabajadores y las Trabajadoras (LOTTT) vigente en la República Bolivariana de Venezuela.
          </p>

          <p>
            Durante todo este tiempo, el referido trabajador ha demostrado constancia, disciplina, responsabilidad y una
            marcada disposición al cumplimiento de sus deberes, destacándose por su excelente desempeño en las labores
            asignadas, así como el cumplimiento de tareas conexas a su cargo.
          </p>

          <p>
            El trabajador devenga actualmente un sueldo mensual de <B>{salary.sueldoMensualBsLetras}</B>, equivalente
            aproximadamente a <B>{salary.sueldoExtranjeroLetras}</B>, calculado a la tasa de referencia del Banco
            Central de Venezuela ({form.monedaConversion}) al momento de la emisión de esta constancia
            {form.monedaConversion === "USD"
              ? ` (${formatForeignAmount(salary.sueldoExtranjero, "USD")} conversión según tasa BCV).`
              : ` (${formatForeignAmount(salary.sueldoExtranjero, "EUR")} conversión según tasa BCV).`}
          </p>

          {fechaIngreso && (
            <p>
              Fecha de ingreso del trabajador: <B>{fechaEnLetras(parseIsoDate(fechaIngreso))}</B>.
            </p>
          )}
        </div>

        <div className="payroll-letter-signature">
          <p className="payroll-letter-signature-name">{rep?.nombre_completo ?? "—"}</p>
          <p className="payroll-letter-signature-role">{rep?.profesion_cargo ?? "Gerente de Talento Humano"}</p>
        </div>

        <p className="payroll-letter-place">
          {ciudad}; {fechaEnLetras(docDate)}
        </p>
        </div>
      </div>

      <PayrollLetterStyles />
    </>
  );
}
