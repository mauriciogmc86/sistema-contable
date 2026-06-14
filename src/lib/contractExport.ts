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
  montoEnLetras,
  sumarMeses,
} from "@/lib/contractUtils";

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
  const { empleado, empresa } = data;
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
  const cargo = empleado.cargos?.nombre_cargo || BLANK;
  const salario = empleado.salario_base ?? 0;
  const salarioLetras = montoEnLetras(salario);

  const hoy = new Date();
  const fechaInicio = hoy;
  const fechaFin = sumarMeses(hoy, 6);
  const fechaInicioLetras = fechaEnLetras(fechaInicio);
  const fechaFinLetras = fechaEnLetras(fechaFin);
  const fechaInicioNum = fechaNumerica(fechaInicio);

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

    // Cláusula Primera
    para([
      bold("CLÁUSULA PRIMERA: DE LAS OBLIGACIONES DEL TRABAJADOR. "),
      normal("El trabajador o Trabajadora se Compromete a cumplir con las obligaciones inherentes al cargo Para el cual ha sido contratada, De Conformidad con lo previsto En la Ley Orgánica Del Trabajo, Los Trabajadores y las Trabajadoras, su Reglamento y demás disposiciones legales vigentes, así como con las instrucciones y lineamientos impartidos por el patrono o sus representantes Debidamente autorizados. Deberá realizar sus funciones con la Diligencia, cuidado, responsabilidad, honestidad y respeto exigidos por la naturaleza de sus actividades, manteniendo una conducta decorosa y cordial hacia sus superiores jerárquicos, compañeros de trabajo y demás personas que interactúen en el entorno laboral."),
    ]),

    // Cláusula Segunda
    para([
      bold("CLÁUSULA SEGUNDA: DEL CARGO Y FUNCIONES. "),
      normal("El Trabajador prestará sus servicios personales subordinados en calidad de "),
      bold(cargo),
      normal(", ejercerá bajo dependencia, supervisión y dirección de "),
      bold(empresa?.nombre || BLANK),
      normal(`. Comprometiéndose a ejecutar las tareas inherentes a dicha función con la debida diligencia, eficiencia, responsabilidad y disciplina, conforme a los procedimientos, normas internas y directrices que se le indiquen, así como a la normativa legal vigente. Las funciones inherentes al cargo de `),
      bold(cargo),
      normal(` comprenden, de manera enunciativa pero no limitativa, las siguientes: 1.) Estar de manera puntual en su puesto de trabajo, Cumplir con el horario de trabajo comprendido 08:00 am a 4:00 pm establecido por la administración. 2.) Presentarse en condiciones óptimas de aseo e higiene personal. 3.) Clasificar y ubicar la mercancía entrante según el sistema de inventario. 4.) Armar los pedidos (picking). 5.) Apoyar al Chofer en las labores de carga y descarga. 6.) Resguardar la imagen de la empresa. 7.) Mantener organizado y limpio su puesto de trabajo. 8.) Reportar de manera inmediata cualquier falla técnica o incidencia. 9.) Ejecutar cualquier otra actividad inherente al cargo. 10.) Queda terminantemente prohibido el uso de teléfonos móviles durante la jornada. 11.) Queda terminantemente prohibidas las relaciones amorosas e interpersonales en esta organización. `),
      bold("Parágrafo Único: "),
      normal("LA EMPRESA "),
      bold(empresa?.nombre || BLANK),
      normal(`, Se reserva el derecho de modificar, ampliar o reducir las funciones descritas, en atención a necesidades organizativas u operativas, siempre que no impliquen desmejoras en los derechos laborales adquiridos.`),
    ]),

    // Cláusula Tercera
    para([
      bold("CLÁUSULA TERCERA: NATURALEZA JURÍDICA DEL CONTRATO. "),
      normal("De conformidad con lo establecido en los artículos 59 y 62 de la Ley Orgánica del Trabajo, de los Trabajadores y las Trabajadoras, el Presente contrato de trabajo Se celebra a tiempo determinado y por un periodo de Seis (06) meses, por lo cual las partes Acuerdan que este contrato inicia Hoy "),
      bold(fechaInicioLetras),
      normal(" y finaliza el Día "),
      bold(fechaFinLetras),
      normal(". El trabajador prestará sus servicios en las Instalaciones de la sociedad mercantil "),
      bold(empresa?.nombre || BLANK),
      normal(" Domiciliada en "),
      bold(empresa?.direccion_fiscal || BLANK),
      normal("."),
    ]),

    // Cláusula Cuarta
    para([
      bold("CLÁUSULA CUARTA: JORNADA DE TRABAJO. "),
      normal("El trabajador desempeñará sus funciones en una jornada Diurna ordinaria de trabajo, comprendida desde las 08:00 am a 4:00 pm, de lunes a Viernes, con Dos (2) días de descanso rotativo a la semana. Esta jornada incluye una (1) hora de descanso diario para alimentación. Se deja constancia de que el horario establecido se encuentra dentro de los límites de la jornada diurna prevista en el artículo 173 de la LOTTT, sin exceder las ocho (8) horas diarias ni las cuarenta (40) horas semanales."),
    ]),

    // Cláusula Quinta
    para([
      bold("CLÁUSULA QUINTA: SALARIO. "),
      normal("El trabajador devengará un salario fijo mensual de "),
      bold(salarioLetras + " Art 129 LOTTT"),
      normal(", el cual será cancelado de forma quincenal Mediante transferencia bancaria a la cuenta personal del trabajador, conforme a lo previsto en la Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras. (Art 104), Este salario será la base para el cálculo de las prestaciones sociales, bonificaciones de ley y demás beneficios derivados de la relación laboral."),
    ]),

    // Cláusula Sexta
    para([
      bold("CLÁUSULA SEXTA: (Art 131 LOTTT) BENEFICIOS ECONÓMICOS Y SOCIALES. "),
      normal("El presente contrato garantiza Al trabajador todos los beneficios de carácter económico y social Establecidos en la Ley Orgánica del Trabajo, los Trabajadores y Las Trabajadoras, tales como: bono vacacional, utilidades, prestaciones sociales, horas extra, días feriados laborados, y los derivados de la seguridad social."),
    ]),

    // Cláusula Séptima
    para([
      bold("CLÁUSULA SÉPTIMA: BONO DE ALIMENTACIÓN. "),
      normal("La empresa "),
      bold(empresa?.nombre || BLANK),
      normal(` En cumplimiento del Decreto con Rango, Valor y Fuerza Según Gaceta Oficial N° 38.094 de fecha 27 de Diciembre de 2004 de Ley de Alimentación para los Trabajadores y las Trabajadoras, acuerda otorgar al trabajador un bono de alimentación de conformidad con lo siguiente: a) Será otorgado en dinero en efectivo, en forma no acumulativa, pagadero conjuntamente con la remuneración quincenal. b) El monto será equivalente al que establezca el Ejecutivo Nacional mediante decreto vigente, calculado por jornada efectivamente laborada, tomando como referencia el valor del Dólar indexado publicado por el BANCO CENTRAL DE VENEZUELA. c) Este beneficio no tiene carácter salarial conforme al Artículo 105 de la LOTTT y el artículo 7 de la Ley de Alimentación.`),
    ]),

    // Cláusula Octava
    para([
      bold("CLÁUSULA OCTAVA: DEDUCCIONES LEGALES. "),
      normal("El Patrono se reserva el derecho de efectuar Todas las deducciones legales correspondientes al salario del trabajador, tales como las relativas al Seguro Social Obligatorio (IVSS), Instituto Nacional de Capacitación y Educación Socialista (INCES), Fondo de Ahorro Obligatorio para la Vivienda (FAOV), Impuesto Sobre la Renta (ISLR) y cualquier otra contribución o carga prevista en la legislación vigente."),
    ]),

    // Cláusula Novena
    para([
      bold("CLÁUSULA NOVENA: TERMINACIÓN DEL CONTRATO DE TRABAJO. (Art 77-80 LOTTT) "),
      normal("La relación laboral podrá finalizar por: 9.1 Renuncia formal notificada con al menos cinco (5) días de antelación. 9.2 Por voluntad del patrono, con justa causa conforme a ley. 9.3 Por Acumular Tres (3) Amonestaciones Escritas. 9.4 Por mutuo consentimiento. 9.5 Por causas ajenas a la voluntad de las partes, incluyendo fuerza mayor, pandemias, disturbios, o cualquier circunstancia extraordinaria."),
    ]),

    // Cláusula Décima
    para([
      bold("CLÁUSULA DÉCIMA: RIESGOS LABORALES Y SEGURIDAD. "),
      normal("El Trabajador declara conocer los riesgos Inherentes a las labores que ejecutará, así como las normas de higiene y seguridad industrial aplicables, comprometiéndose a cumplir con las disposiciones establecidas por el INPSASEL y las políticas internas de la empresa. El patrono, por su parte, garantiza el cumplimiento de las normas de seguridad laboral y Proporcionará los equipos de protección personal requeridos."),
    ]),

    // Cláusula Décima Primera
    para([
      bold("CLÁUSULA DÉCIMA PRIMERA: PROGRAMA DE PROTECCIÓN PERSONAL. "),
      normal("La empresa pone a disposición de sus trabajadores un programa voluntario de protección mediante póliza de Salud. La participación en este beneficio es voluntaria; sin embargo, en caso de que el trabajador decida no adherirse al programa, deberá manifestarlo por escrito y asumir total Responsabilidad ante cualquier siniestro."),
    ]),

    // Cláusula Décima Segunda
    para([
      bold("CLÁUSULA DÉCIMA SEGUNDA: LUGAR DE CONTRATACIÓN. "),
      normal("A los fines legales Pertinentes, se deja constancia de que el presente contrato de trabajo ha sido celebrado en la sede Administrativa de la empresa, ubicada en "),
      bold(empresa?.direccion_fiscal || BLANK),
      normal("."),
    ]),

    // Cláusula Décima Tercera
    para([
      bold("CLÁUSULA DÉCIMA TERCERA: PROTECCIÓN DE DATOS PERSONALES. "),
      normal("La trabajadora autoriza expresamente al patrono para utilizar, almacenar y tratar sus datos personales, académicos y laborales con fines administrativos, fiscales, legales y de control interno, garantizando en todo momento el Derecho a la confidencialidad y protección de los mismos conforme a la legislación vigente."),
    ]),

    // Cláusula Décima Cuarta
    para([
      bold("CLÁUSULA DÉCIMA CUARTA: RÉGIMEN DISCIPLINARIO Y CONVIVENCIA. "),
      normal("El presente contrato está sujeto al cumplimiento de las normas de conducta y convivencia. Se consideran faltas disciplinarias: 14.1 Conductas irrespetuosas. 14.2 Acoso o bullying laboral. 14.3 Actos de indisciplina. 14.4 Desobediencia a instrucciones legítimas. 14.5 Falta contra la moral o negligencia. 14.6 Conducta que afecte negativamente el ambiente de trabajo. 14.7 Régimen progresivo: Primera falta: amonestación escrita. Segunda falta: segunda amonestación con advertencia formal. Tercera falta: causal de despido justificado conforme a la LOTTT."),
    ]),

    // Cláusula Décima Quinta
    para([
      bold("CLÁUSULA DÉCIMA QUINTA: USO DE IMAGEN PERSONAL Y CONSENTIMIENTO PARA FINES INSTITUCIONALES, RECREATIVOS, PUBLICITARIOS Y DIGITALES. "),
      normal("El (la) trabajador(a), mediante la suscripción del presente contrato; Acepta y autoriza De forma libre, voluntaria, expresa, informada, inequívoca y sin lugar a contraprestación Monetaria, a la empresa "),
      bold(empresa?.nombre || BLANK),
      normal(`, para que su imagen personal, voz, nombre, fotografía, grabación audiovisual, capturas de video, contenido testimonial, declaraciones, reseñas u opiniones que le sean tomadas durante el desarrollo de actividades laborales, institucionales, comerciales, sociales o promocionales, puedan ser utilizadas, publicadas, difundidas, editadas, reproducidas o adaptadas por la empresa en medios físicos, impresos, digitales, audiovisuales, electrónicos o tecnológicos, sin limitación territorial ni temporal alguna.`),
    ]),

    // Cláusula Décima Sexta
    para([
      bold("CLÁUSULA DÉCIMA SEXTA: CLÁUSULA FINAL. "),
      normal("Las partes declaran que han leído y comprendido en su totalidad el contenido del presente contrato, obligándose a cumplir fielmente con todas Las cláusulas aquí establecidas. Se firma el presente contrato en Dos (2) ejemplares de un mismo tenor y a un solo efecto legal, en San Francisco, "),
      bold(fechaInicioLetras),
      normal(" ("),
      bold(fechaInicioNum),
      normal(") a las 03:30 p.m."),
    ]),

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

export async function exportToPdf(elementId: string, filename: string): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Contract element not found");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let yOffset = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    if (yOffset > 0) pdf.addPage();
    const sliceHeight = Math.min(remainingHeight, pageHeight - margin * 2);

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin - yOffset,
      contentWidth,
      imgHeight,
    );

    yOffset += sliceHeight;
    remainingHeight -= sliceHeight;
  }

  pdf.save(filename);
}
