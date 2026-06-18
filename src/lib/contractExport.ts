import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  TableRow,
  TableCell,
  Table,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from "docx";
import { saveAs } from "file-saver";
import type { ContractData } from "@/infrastructure/repositories/SupabaseLegalRepository";
import {
  calcularEdad,
  edadEnLetras,
  fechaEnLetras,
  fechaNumerica,
} from "@/lib/contractUtils";
import { buildClauseContext, resolveClauseText } from "@/lib/contractClauses";

const BLANK = "________";

function bold(text: string): TextRun {
  return new TextRun({ text, bold: true });
}

function normal(text: string): TextRun {
  return new TextRun({ text });
}

function para(runs: TextRun[], opts?: { center?: boolean; bold?: boolean }): Paragraph {
  return new Paragraph({
    children: runs,
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: 140 },
  });
}

async function loadLogoImage(url: string): Promise<{ data: Uint8Array; type: "png" | "jpg" | "gif" | "bmp" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const buffer = new Uint8Array(await blob.arrayBuffer());
    const mime = blob.type;
    if (mime === "image/jpeg") return { data: buffer, type: "jpg" };
    if (mime === "image/gif") return { data: buffer, type: "gif" };
    if (mime === "image/bmp") return { data: buffer, type: "bmp" };
    return { data: buffer, type: "png" };
  } catch {
    return null;
  }
}

/** Build the full contract text as a docx Document */
async function buildDocument(data: ContractData): Promise<Document> {
  const { empleado, empresa, clausulas } = data;
  const rep = empresa?.representantes?.[0];

  const fullName =
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

  const nombreConstitucion = empresa?.fecha_constitucion
    ? new Date(empresa.fecha_constitucion + "T00:00:00").toLocaleString("es-VE", { month: "long" })
    : BLANK;
  const diaConstitucion = empresa?.fecha_constitucion
    ? String(new Date(empresa.fecha_constitucion + "T00:00:00").getDate())
    : BLANK;
  const anioConstitucion = empresa?.fecha_constitucion
    ? String(new Date(empresa.fecha_constitucion + "T00:00:00").getFullYear())
    : BLANK;

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.BOTTOM,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "EL TRABAJADOR", bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.BOTTOM,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "EL PATRONO", bold: true })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const logoSections: Paragraph[] = [];
  const logo = empresa?.logo_url ? await loadLogoImage(empresa.logo_url) : null;
  if (logo) {
    logoSections.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: logo.type,
            data: logo.data,
            transformation: { width: 140, height: 70 },
          }),
        ],
        spacing: { after: 200 },
      }),
    );
  }

  const sections: Paragraph[] = [
    ...logoSections,
    new Paragraph({
      children: [
        bold("CONTRATO DE TRABAJO POR TIEMPO DETERMINADO\n"),
        bold("LOTTT GACETA OFICIAL EXT 6.076 DEL 7-05-2012 ART 62"),
      ],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 280 },
    }),

    para([
      normal("Entre la Sociedad Mercantil, "),
      bold(empresa?.nombre || BLANK),
      normal(" Domiciliada en "),
      bold(empresa?.direccion_fiscal || BLANK),
      normal(", Signada con el Número de RIF; "),
      bold(empresa?.rif || BLANK),
      normal(`, debidamente registrada por ante el Registro Mercantil `),
      bold(empresa?.registro_mercantil || BLANK),
      normal(` de la Circunscripción Judicial del Estado Zulia, el Dia; `),
      bold(diaConstitucion),
      normal(", de "),
      bold(nombreConstitucion),
      normal(" de "),
      bold(anioConstitucion),
      normal(`, bajo el Nº `),
      bold(empresa?.numero_registro || BLANK),
      normal(" Tomo "),
      bold(empresa?.tomo_numero || BLANK),
      normal(`, representado en este acto por el ciudadano `),
      bold(`${prefijo} ${rep?.nombre_completo || BLANK}`),
      normal(`, Venezolano, mayor de edad, titular de la Cédula de Identidad N°. `),
      bold(rep?.cedula || BLANK),
      normal(`, SignadO con el Numero de RIF; ${BLANK}, domiciliado en esta ciudad y Municipio Autónomo de Maracaibo, de Estado Zulia, quien actúa con el carácter de `),
      bold(rep?.profesion_cargo || "Gerente de Recursos Humanos"),
      normal(`, quien en lo sucesivo y para todos los efectos derivados del presente contrato se denominará `),
      bold("EL PATRONO"),
      normal(`, por una parte y por la otra, El ciudadano `),
      bold(fullName),
      normal(`, venezolano, mayor de edad, `),
      bold(edadTexto),
      normal(` de estado civil `),
      bold(empleado.estado_civil || BLANK),
      normal(`, titular de la cedula de identidad `),
      bold(empleado.cedula || BLANK),
      normal(`, y con domicilio en `),
      bold(empleado.direccion_habitacion || BLANK),
      normal(`, Estado Zulia, quien en lo sucesivo y para todos los efectos legales derivados del presente contrato se denominará `),
      bold("EL TRABAJADOR"),
      normal(`, hemos convenido en celebrar como en efecto celebramos el siguiente `),
      bold("CONTRATO DE TRABAJO POR TIEMPO DETERMINADO"),
      normal(` de conformidad con lo establecido en El artículos 62 de la Ley Orgánica del Trabajo, de los Trabajadores y las Trabajadoras, el cual se regirá por las disposiciones de dicha Ley, por las demás normas laborales vigentes en el país y por las siguientes cláusulas:`),
    ]),

    // Cláusulas dinámicas
    ...clausulas.map((clausula) =>
      para([
        bold(clausula.titulo.toUpperCase() + ". "),
        normal(resolveClauseText(clausula.descripcion, ctx)),
      ])
    ),

    // Spacing before signatures
    new Paragraph({ children: [], spacing: { after: 600 } }),
  ];

  // Acuse de Recibo
  const acuseSections: Paragraph[] = [
    new Paragraph({
      children: [bold("ACUSE DE RECIBO")],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    para([
      normal("El ciudadano "),
      bold(fullName),
      normal(", venezolano, mayor de edad, "),
      bold(edadTexto),
      normal(" de estado civil "),
      bold(empleado.estado_civil || BLANK),
      normal(", titular de la cedula de identidad "),
      bold(empleado.cedula || BLANK),
      normal(", y con domicilio en la Ciudad de "),
      bold(empleado.direccion_habitacion || BLANK),
      normal(", deja expresa constancia que han suscrito un contrato de trabajo por tiempo determinado y recibe de parte de El Patrono un ejemplar fiel y exacto de dicho Contrato de Trabajo. De igual forma, declara que ha leído y entiende perfectamente los términos y condiciones del presente contrato de trabajo y está de acuerdo con todo y cada uno de los términos. en San Francisco, "),
      bold(fechaInicioLetras),
      normal(" ("),
      bold(fechaInicioNum),
      normal(") a las 03:30 p.m."),
    ]),
    new Paragraph({ children: [], spacing: { after: 600 } }),
  ];

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24,
          },
        },
      },
    },
    sections: [
      {
        children: [
          ...sections,
          signatureTable,
          ...acuseSections,
          signatureTable,
        ],
      },
    ],
  });
}

export async function exportToDocx(data: ContractData, filename: string): Promise<void> {
  const doc = await buildDocument(data);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

async function buildWatermarkDataUrl(img: HTMLImageElement, opacity = 0.18): Promise<string | null> {
  if (!img.naturalWidth) return null;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.globalAlpha = opacity;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export async function exportToPdf(elementId: string, filename: string): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Contract element not found");

  const watermarkImg = element.querySelector<HTMLImageElement>(".contract-watermark");
  let watermarkDataUrl: string | null = null;
  let watermarkAspect = 1;

  if (watermarkImg?.src) {
    watermarkImg.classList.add("pdf-export-hide");
    await new Promise<void>((resolve) => {
      if (watermarkImg.complete) resolve();
      else {
        watermarkImg.onload = () => resolve();
        watermarkImg.onerror = () => resolve();
      }
    });
    watermarkDataUrl = await buildWatermarkDataUrl(watermarkImg);
    if (watermarkImg.naturalWidth > 0) {
      watermarkAspect = watermarkImg.naturalHeight / watermarkImg.naturalWidth;
    }
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  watermarkImg?.classList.remove("pdf-export-hide");

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = element.classList.contains("payroll-letter-document") ? 0 : 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let yOffset = 0;
  let remainingHeight = imgHeight;
  let pageIndex = 0;

  while (remainingHeight > 0) {
    if (pageIndex > 0) pdf.addPage();

    if (watermarkDataUrl) {
      const wmWidth = 120;
      const wmHeight = wmWidth * watermarkAspect;
      pdf.addImage(
        watermarkDataUrl,
        "PNG",
        (pageWidth - wmWidth) / 2,
        (pageHeight - wmHeight) / 2,
        wmWidth,
        wmHeight,
      );
    }

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin - yOffset,
      contentWidth,
      imgHeight,
    );

    yOffset += pageHeight - margin * 2;
    remainingHeight -= pageHeight - margin * 2;
    pageIndex += 1;
  }

  pdf.save(filename);
}
