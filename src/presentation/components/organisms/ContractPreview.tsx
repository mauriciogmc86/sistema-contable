"use client";

import {
  calcularEdad,
  edadEnLetras,
  fechaEnLetras,
  fechaNumerica,
} from "@/lib/contractUtils";
import { buildClauseContext, resolveClauseText } from "@/lib/contractClauses";
import type { ContractData } from "@/infrastructure/repositories/SupabaseLegalRepository";

interface ContractPreviewProps {
  data: ContractData;
}

const B = ({ children }: { children: React.ReactNode }) => (
  <strong>{children}</strong>
);

const BLANK = "________";

export function ContractPreview({ data }: ContractPreviewProps) {
  const { empleado, empresa, clausulas } = data;
  const rep = empresa?.representantes?.[0];

  const fullNameTrabajador =
    [
      empleado.primer_nombre,
      empleado.segundo_nombre,
      empleado.primer_apellido,
      empleado.segundo_apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || BLANK;

  const edad = empleado.fecha_nacimiento ? calcularEdad(empleado.fecha_nacimiento) : null;
  const edadTexto = edad ? edadEnLetras(edad) : BLANK;

  const hoy = new Date();
  const fechaInicioLetras = fechaEnLetras(hoy);
  const fechaInicioNum = fechaNumerica(hoy);

  const ctx = buildClauseContext(data);

  const prefijo = rep?.profesion_cargo
    ? rep.profesion_cargo.toLowerCase().startsWith("lic")
      ? "Lic."
      : rep.profesion_cargo.toLowerCase().startsWith("dra")
      ? "Dra."
      : rep.profesion_cargo.toLowerCase().startsWith("dr")
      ? "Dr."
      : rep.profesion_cargo.toLowerCase().startsWith("ing")
      ? "Ing."
      : ""
    : "";

  const diaConst = empresa?.fecha_constitucion
    ? new Date(empresa.fecha_constitucion + "T00:00:00").getDate()
    : BLANK;
  const mesConst = empresa?.fecha_constitucion
    ? new Date(empresa.fecha_constitucion + "T00:00:00").toLocaleString("es-VE", { month: "long" })
    : BLANK;
  const anioConst = empresa?.fecha_constitucion
    ? new Date(empresa.fecha_constitucion + "T00:00:00").getFullYear()
    : BLANK;

  return (
    <>
      <div id="printable-contract" className="printable-contract">
        {empresa?.logo_url && (
          <img
            src={empresa.logo_url}
            alt=""
            aria-hidden
            className="contract-watermark"
            crossOrigin="anonymous"
          />
        )}
        <div className="contract-content">
        {/* ── TÍTULO ── */}
        <div className="contract-header">
          <div className="contract-title">
            CONTRATO DE TRABAJO POR TIEMPO DETERMINADO
            <br />
            LOTTT GACETA OFICIAL EXT 6.076 DEL 7-05-2012 ART 62
          </div>
        </div>

        {/* ── CUERPO: preámbulo + cláusulas dinámicas ── */}
        <div className="contract-body">
          Entre la Sociedad Mercantil, <B>{empresa?.nombre || BLANK}</B> Domiciliada en{" "}
          <B>{empresa?.direccion_fiscal || BLANK}</B>, Signada con el Número de RIF;{" "}
          <B>{empresa?.rif || BLANK}</B>, debidamente registrada por ante el Registro Mercantil{" "}
          <B>{empresa?.registro_mercantil || BLANK}</B> de la Circunscripción Judicial del Estado
          Zulia, el Dia; <B>{diaConst}</B>, de <B>{mesConst}</B> de <B>{anioConst}</B>, bajo el
          Nº <B>{empresa?.numero_registro || BLANK}</B> Tomo <B>{empresa?.tomo_numero || BLANK}</B>,
          representado en este acto por el ciudadano{" "}
          <B>{prefijo} {rep?.nombre_completo || BLANK}</B>, Venezolano, mayor de edad, titular de
          la Cédula de Identidad N°. <B>{rep?.cedula || BLANK}</B>, SignadO con el Numero de RIF;{" "}
          <B>{BLANK}</B>, domiciliado en esta ciudad y Municipio Autónomo de Maracaibo, de Estado
          Zulia, quien actúa con el carácter de{" "}
          <B>{rep?.profesion_cargo || "Gerente de Recursos Humanos"}</B>, quien en lo sucesivo y
          para todos los efectos derivados del presente contrato se denominará{" "}
          <B>EL PATRONO</B>, por una parte y por la otra, El ciudadano{" "}
          <B>{fullNameTrabajador}</B>, venezolano, mayor de edad, <B>{edadTexto}</B> de estado
          civil <B>{empleado.estado_civil || BLANK}</B>, titular de la cedula de identidad{" "}
          <B>{empleado.cedula || BLANK}</B>, y con domicilio en{" "}
          <B>{empleado.direccion_habitacion || BLANK}</B>, Estado Zulia, quien en lo sucesivo y
          para todos los efectos legales derivados del presente contrato se denominará{" "}
          <B>EL TRABAJADOR</B>, hemos convenido en celebrar como en efecto celebramos el siguiente{" "}
          <B>CONTRATO DE TRABAJO POR TIEMPO DETERMINADO</B> de conformidad con lo establecido en
          El artículos 62 de la Ley Orgánica del Trabajo, de los Trabajadores y las Trabajadoras,
          el cual se regirá por las disposiciones de dicha Ley, por las demás normas laborales
          vigentes en el país y por las siguientes cláusulas:
        </div>

        {/* ── CLÁUSULAS DINÁMICAS ── */}
        {clausulas.length === 0 ? (
          <div className="contract-body" style={{ marginTop: "6px", fontStyle: "italic", color: "#666" }}>
            (Sin cláusulas configuradas para este cargo)
          </div>
        ) : (
          clausulas.map((clausula, i) => (
            <div key={clausula.id || i} className="contract-body" style={{ marginTop: "6px" }}>
              <B>{clausula.titulo.toUpperCase()}.</B>{" "}
              {resolveClauseText(clausula.descripcion, ctx)}
            </div>
          ))
        )}

        {/* ── FIRMA ── */}
        <table className="signatures-table">
          <tbody>
            <tr>
              <td className="signature-cell">
                <div className="signature-space-line" />
                <div className="signature-label">EL TRABAJADOR</div>
              </td>
              <td className="signature-gap" />
              <td className="signature-cell">
                <div className="signature-space-line" />
                <div className="signature-label">EL PATRONO</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── ACUSE DE RECIBO ── */}
        <div className="acuse-section">
          <div className="acuse-title">ACUSE DE RECIBO</div>
          <div className="contract-body">
            El ciudadano <B>{fullNameTrabajador}</B>, venezolano, mayor de edad,{" "}
            <B>{edadTexto}</B> de estado civil <B>{empleado.estado_civil || BLANK}</B>, titular de
            la cedula de identidad <B>{empleado.cedula || BLANK}</B>, y con domicilio en la Ciudad
            de <B>{empleado.direccion_habitacion || BLANK}</B>, deja expresa constancia que han
            suscrito un contrato de trabajo por tiempo determinado y recibe de parte de El Patrono
            un ejemplar fiel y exacto de dicho Contrato de Trabajo. De igual forma, declara que ha
            leído y entiende perfectamente los términos y condiciones del presente contrato de
            trabajo y está de acuerdo con todo y cada uno de los términos. en San Francisco,{" "}
            <B>{fechaInicioLetras}</B> (<B>{fechaInicioNum}</B>) a las 03:30 p.m.
          </div>

          <table className="signatures-table" style={{ marginTop: "40px" }}>
            <tbody>
              <tr>
                <td className="signature-cell">
                  <div className="signature-space-line" />
                  <div className="signature-label">Firma del TRABAJADOR</div>
                  <div className="huellas-label">Huellas Dactilares</div>
                </td>
                <td className="signature-gap" />
                <td className="signature-cell" />
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <style jsx global>{`
        .printable-contract {
          position: relative;
          background: white;
          color: black;
          padding: 48px 56px;
          max-width: 820px;
          margin: 0 auto;
          border-radius: 12px;
          font-family: "Times New Roman", Times, serif;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .contract-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(72%, 480px);
          max-height: 72%;
          object-fit: contain;
          opacity: 0.14;
          z-index: 0;
          pointer-events: none;
          user-select: none;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .contract-content {
          position: relative;
          z-index: 1;
        }
        .contract-header {
          margin-bottom: 16px;
        }
        .contract-title {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .contract-body {
          text-align: justify;
          margin: 0;
          padding: 0;
        }
        .signatures-table {
          width: 100%;
          margin-top: 40px;
          border-collapse: collapse;
        }
        .signature-cell {
          width: 45%;
          text-align: center;
          vertical-align: bottom;
        }
        .signature-gap {
          width: 10%;
        }
        .signature-space-line {
          border-top: 1px solid black;
          margin-bottom: 6px;
        }
        .signature-label {
          font-weight: bold;
          font-size: 13px;
          padding-top: 4px;
        }
        .huellas-label {
          font-size: 12px;
          margin-top: 4px;
          color: #444;
        }
        .acuse-section {
          margin-top: 40px;
          border-top: 1px solid black;
          padding-top: 10px;
        }
        .acuse-title {
          font-weight: bold;
          text-align: center;
          font-size: 14px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          .printable-contract {
            padding: 20mm 20mm;
            max-width: 100%;
            border-radius: 0;
            font-size: 12pt;
            overflow: visible !important;
          }
          .contract-watermark {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 16cm !important;
            max-width: 16cm !important;
            max-height: 16cm !important;
            height: auto !important;
            opacity: 0.18 !important;
            display: block !important;
            visibility: visible !important;
            z-index: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .contract-content {
            position: relative;
            z-index: 1;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}
