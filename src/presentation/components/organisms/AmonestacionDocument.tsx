"use client";

import { fechaEnLetras } from "@/lib/contractUtils";
import { parseIsoDate } from "@/lib/payrollDates";
import type { AmonestacionRecord } from "@/infrastructure/repositories/SupabaseAmonestacionRepository";
import type { WorkerDocumentData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import { fullWorkerName, workerCargo } from "@/lib/workerDocumentUtils";
import { PayrollLetterStyles } from "@/presentation/components/molecules/PayrollLetterStyles";
import { PayrollLetterWatermarks } from "@/presentation/components/molecules/PayrollLetterWatermarks";

interface AmonestacionDocumentProps {
  data: WorkerDocumentData;
  record: AmonestacionRecord;
}

const B = ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>;

export function AmonestacionDocument({ data, record }: AmonestacionDocumentProps) {
  const { empleado, empresa } = data;
  const rep = empresa?.representantes?.[0];
  const docDate = parseIsoDate(record.fecha_documento);
  const nombreTrabajador = fullWorkerName(empleado) || "—";
  const cargo = workerCargo(empleado) || "—";
  const ciudad = record.ciudad?.trim() || "Maracaibo";

  return (
    <>
      <div id="printable-amonestacion" className="payroll-letter-document payroll-letter-document--amonestacion">
        <PayrollLetterWatermarks logoUrl={empresa?.logo_url} showHeader={false} />
        <div className="payroll-letter-content">
          <p className="payroll-letter-date">
            {ciudad}; {fechaEnLetras(docDate)}
          </p>

          <div className="payroll-letter-code-section">
            {empresa?.logo_url && (
              <img
                src={empresa.logo_url}
                alt=""
                aria-hidden
                className="payroll-letter-inline-logo"
                crossOrigin="anonymous"
              />
            )}
            <p className="payroll-letter-code">Amonestación {record.codigo}</p>
          </div>

        <p className="payroll-letter-recipient">
          Sr./Sra. {nombreTrabajador.toUpperCase()}
          <br />
          C.I. {empleado.cedula ?? "—"}
          <br />
          {cargo.toUpperCase()}
        </p>

        <div className="payroll-letter-title">Carta de Amonestación</div>

        <div className="payroll-letter-body">
          <p>Estimado/a {nombreTrabajador.toUpperCase()}</p>

          <p>
            Por medio de la presente, se le informa que ha incurrido en incumplimiento de la Cláusula{" "}
            <B>{record.clausula}</B>
          </p>

          <p>
            Esta conducta es inaceptable y contraria a los valores y estándares que la Sociedad Mercantil{" "}
            <B>{empresa?.nombre ?? "—"}</B> espera de su talento humano: el mejor ejemplo y su mejor versión.
          </p>

          <p>
            Es imperativo que comprenda la seriedad de sus acciones y el impacto negativo que estas tienen en el
            ambiente laboral y en la imagen de nuestra organización. Se le exhorta a tomar medidas inmediatas para
            corregir su comportamiento y evitar futuras incidencias, ya que de alcanzar 3 amonestaciones se considera
            causa justificada de despido.
          </p>

          <p>
            De no observarse una mejora significativa, se tomarán acciones disciplinarias adicionales, las cuales
            pueden ir desde la suspensión de su actividad hasta la desincorporación de su puesto de trabajo.
          </p>

          <p>
            Esperamos que este incidente sirva como un llamado de atención para fortalecer su compromiso y desempeño
            dentro de la empresa. Valoramos su contribución y confiamos en que tomará esta amonestación con la seriedad
            que amerita.
          </p>
        </div>

        <div className="payroll-letter-signatures">
          <div className="payroll-letter-signature-col">
            <p className="payroll-letter-signature-name">{rep?.nombre_completo ?? "—"}</p>
            <div className="payroll-letter-signature-line" />
            <p className="payroll-letter-signature-role">{empresa?.nombre ?? "—"}</p>
            <p className="payroll-letter-signature-role">{rep?.profesion_cargo ?? "GTE RRHH"}</p>
          </div>
          <div className="payroll-letter-signature-col">
            <p className="payroll-letter-signature-name">&nbsp;</p>
            <div className="payroll-letter-signature-line" />
            <p className="payroll-letter-signature-role">TRABAJADOR (A)</p>
          </div>
        </div>
        </div>
      </div>

      <PayrollLetterStyles />
      <style jsx global>{`
        .payroll-letter-document--amonestacion {
          min-height: auto !important;
          padding: 14mm 18mm !important;
          font-size: 12px;
          line-height: 1.42;
        }
        .payroll-letter-document--amonestacion .payroll-letter-date {
          margin: 0 0 10px;
          font-size: 11px;
        }
        .payroll-letter-document--amonestacion .payroll-letter-title {
          margin: 10px 0 8px;
          font-size: 14px;
        }
        .payroll-letter-document--amonestacion .payroll-letter-body {
          margin-bottom: 6px;
        }
        .payroll-letter-document--amonestacion .payroll-letter-body p {
          margin: 0 0 7px;
        }
        .payroll-letter-code-section {
          margin-bottom: 2px;
        }
        .payroll-letter-inline-logo {
          display: block;
          width: 56px;
          height: 56px;
          object-fit: contain;
          opacity: 0.2;
          margin-bottom: 4px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .payroll-letter-code {
          font-weight: bold;
          margin: 0 0 10px;
        }
        .payroll-letter-recipient {
          margin: 0 0 12px;
          line-height: 1.45;
        }
        .payroll-letter-signatures {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          margin-top: 18px;
        }
        .payroll-letter-signature-col {
          flex: 1;
          text-align: center;
        }
        .payroll-letter-signature-line {
          border-top: 1px solid #111;
          margin: 6px 0;
          min-height: 1px;
        }
        .payroll-letter-document--amonestacion .payroll-letter-signature-role {
          font-size: 11px;
        }
        @media print {
          .payroll-letter-document--amonestacion {
            min-height: auto !important;
            height: auto !important;
            max-height: none;
            padding: 12mm 16mm !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          .payroll-letter-document--amonestacion .contract-watermark {
            position: absolute !important;
          }
          .payroll-letter-document--amonestacion .payroll-letter-signatures {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
