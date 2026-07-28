import {
  Document,
  Header,
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
  TableLayoutType,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  TextWrappingType,
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
import { sortClausulas } from "@/lib/clausulaOrdering";

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

const CONTENT_WIDTH_DXA = 9026;
const SIG_COL_WIDTHS = [4062, 902, 4062] as const;

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

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

/** Reduce opacidad del logo para marca de agua (solo en navegador). */
async function fadeLogoToPng(
  logo: { data: Uint8Array; type: "png" | "jpg" | "gif" | "bmp" },
  opacity: number,
): Promise<Uint8Array | null> {
  if (typeof document === "undefined") return logo.data;

  const mime =
    logo.type === "jpg"
      ? "image/jpeg"
      : logo.type === "gif"
      ? "image/gif"
      : logo.type === "bmp"
      ? "image/bmp"
      : "image/png";

  return new Promise((resolve) => {
    const blob = new Blob([Uint8Array.from(logo.data)], { type: mime });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (png) => {
        URL.revokeObjectURL(url);
        if (!png) {
          resolve(null);
          return;
        }
        resolve(new Uint8Array(await png.arrayBuffer()));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function signatureLine(): Paragraph {
  return new Paragraph({
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 },
    },
    spacing: { before: 720, after: 80 },
  });
}

function signatureLabel(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true })],
    alignment: AlignmentType.CENTER,
  });
}

function buildMainSignatureTable(): Table {
  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [...SIG_COL_WIDTHS],
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [signatureLine(), signatureLabel("EL TRABAJADOR")],
          }),
          new TableCell({
            borders: noBorder,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            borders: noBorder,
            children: [signatureLine(), signatureLabel("EL PATRONO")],
          }),
        ],
      }),
    ],
  });
}

function buildAcuseSignatureTable(): Table {
  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [...SIG_COL_WIDTHS],
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [
              signatureLine(),
              signatureLabel("Firma del TRABAJADOR"),
              new Paragraph({
                children: [new TextRun({ text: "Huellas Dactilares", size: 22 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 60 },
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            borders: noBorder,
            children: [new Paragraph({ children: [] })],
          }),
        ],
      }),
    ],
  });
}

function buildWatermarkHeader(watermarkData: Uint8Array): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: watermarkData,
            transformation: { width: 360, height: 360 },
            floating: {
              horizontalPosition: {
                relative: HorizontalPositionRelativeFrom.PAGE,
                align: HorizontalPositionAlign.CENTER,
              },
              verticalPosition: {
                relative: VerticalPositionRelativeFrom.PAGE,
                align: VerticalPositionAlign.CENTER,
              },
              behindDocument: true,
              allowOverlap: true,
              wrap: { type: TextWrappingType.NONE },
            },
          }),
        ],
      }),
    ],
  });
}

/** Build the full contract text as a docx Document */
async function buildDocument(data: ContractData): Promise<Document> {
  const { empleado, empresa, clausulas: rawClausulas } = data;
  const clausulas = sortClausulas(rawClausulas);
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

  const logo = empresa?.logo_url ? await loadLogoImage(empresa.logo_url) : null;
  const watermarkPng =
    logo != null ? await fadeLogoToPng(logo, 0.18) : null;
  const headerLogoPng =
    logo != null ? await fadeLogoToPng(logo, 0.35) : null;

  const titleParagraphs = [
    new Paragraph({
      children: [bold("CONTRATO DE TRABAJO POR TIEMPO DETERMINADO")],
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [bold("LOTTT GACETA OFICIAL EXT 6.076 DEL 7-05-2012 ART 62")],
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
    }),
  ];

  const headerBlock =
    headerLogoPng != null
      ? new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          columnWidths: [1625, 7401],
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  verticalAlign: VerticalAlign.CENTER,
                  borders: noBorder,
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          type: "png",
                          data: headerLogoPng,
                          transformation: { width: 52, height: 52 },
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  verticalAlign: VerticalAlign.CENTER,
                  borders: noBorder,
                  children: titleParagraphs,
                }),
              ],
            }),
          ],
        })
      : titleParagraphs;

  const sections: Paragraph[] = [
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
    ...(clausulas.length === 0
      ? [
          para([
            normal("(Sin cláusulas configuradas para este cargo)"),
          ]),
        ]
      : clausulas.map((clausula) =>
          para([
            bold(clausula.titulo.toUpperCase() + ". "),
            normal(resolveClauseText(clausula.descripcion, ctx)),
          ]),
        )),

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

  const headerChildren = Array.isArray(headerBlock) ? headerBlock : [headerBlock];

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
        headers: watermarkPng
          ? { default: buildWatermarkHeader(watermarkPng) }
          : undefined,
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: [
          ...headerChildren,
          ...sections,
          buildMainSignatureTable(),
          ...acuseSections,
          buildAcuseSignatureTable(),
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
  const isPayrollLetter = element.classList.contains("payroll-letter-document");
  const margin = isPayrollLetter ? 0 : 10;
  const contentWidth = pageWidth - margin * 2;
  let imgHeight = (canvas.height * contentWidth) / canvas.width;
  let renderWidth = contentWidth;
  let renderHeight = imgHeight;
  let xOffset = margin;
  let yOffset = margin;

  // Cartas laborales (amonestación, constancia): siempre una sola hoja A4
  if (isPayrollLetter && imgHeight > pageHeight) {
    const scale = pageHeight / imgHeight;
    renderWidth = contentWidth * scale;
    renderHeight = pageHeight;
    xOffset = (pageWidth - renderWidth) / 2;
    yOffset = 0;
  }

  const addWatermark = () => {
    if (!watermarkDataUrl) return;
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
  };

  if (isPayrollLetter) {
    addWatermark();
    pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight);
  } else {
    let sliceOffset = 0;
    let remainingHeight = imgHeight;
    let pageIndex = 0;

    while (remainingHeight > 0) {
      if (pageIndex > 0) pdf.addPage();
      addWatermark();
      pdf.addImage(imgData, "PNG", margin, margin - sliceOffset, contentWidth, imgHeight);

      sliceOffset += pageHeight - margin * 2;
      remainingHeight -= pageHeight - margin * 2;
      pageIndex += 1;
    }
  }

  pdf.save(filename);
}
