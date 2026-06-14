"use client";

import {
  calcularEdad,
  edadEnLetras,
  fechaEnLetras,
  fechaNumerica,
  montoEnLetras,
  sumarMeses,
} from "@/lib/contractUtils";
import type { ContractData } from "@/infrastructure/repositories/SupabaseLegalRepository";

interface ContractPreviewProps {
  data: ContractData;
}

const B = ({ children }: { children: React.ReactNode }) => (
  <strong>{children}</strong>
);

const BLANK = "________";

export function ContractPreview({ data }: ContractPreviewProps) {
  const { empleado, empresa } = data;
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

  const cargo = empleado.cargos?.nombre_cargo || BLANK;
  const salario = empleado.salario_base ?? 0;

  const hoy = new Date();
  const fechaInicio = hoy;
  const fechaFin = sumarMeses(hoy, 6);

  const fechaInicioLetras = fechaEnLetras(fechaInicio);
  const fechaFinLetras = fechaEnLetras(fechaFin);
  const fechaInicioNum = fechaNumerica(fechaInicio);

  const salarioLetras = montoEnLetras(salario);

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
        <div className="contract-content">
        {/* ── LOGO + TÍTULO ── */}
        <div className="contract-header">
          {empresa?.logo_url && (
            <img
              src={empresa.logo_url}
              alt={`Logo ${empresa.nombre ?? "empresa"}`}
              className="contract-logo"
              crossOrigin="anonymous"
            />
          )}
          <div className="contract-title">
            CONTRATO DE TRABAJO POR TIEMPO DETERMINADO
            <br />
            LOTTT GACETA OFICIAL EXT 6.076 DEL 7-05-2012 ART 62
          </div>
        </div>

        {/* ── CUERPO: todo el texto en un solo bloque continuo ── */}
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
          vigentes en el país y por las siguientes cláusulas:{" "}
          <B>CLÁUSULA PRIMERA: DE LAS OBLIGACIONES DEL TRABAJADOR.</B> El trabajador o Trabajadora
          se Compromete a cumplir con las obligaciones inherentes al cargo Para el cual ha sido
          contratada, De Conformidad con lo previsto En la Ley Orgánica Del Trabajo, Los
          Trabajadores y las Trabajadoras, su Reglamento y demás disposiciones legales vigentes,
          así como con las instrucciones y lineamientos impartidos por el patrono o sus
          representantes Debidamente autorizados. Deberá realizar sus funciones con la Diligencia,
          cuidado, responsabilidad, honestidad y respeto exigidos por la naturaleza de sus
          actividades, manteniendo una conducta decorosa y cordial hacia sus superiores jerárquicos,
          compañeros de trabajo y demás personas que interactúen en el entorno laboral.{" "}
          <B>CLÁUSULA SEGUNDA: DEL CARGO Y FUNCIONES.</B> El Trabajador prestará sus servicios
          personales subordinados en calidad de <B>{cargo}</B>, ejercerá bajo dependencia,
          supervisión y dirección de <B>{empresa?.nombre || BLANK}</B>. Comprometiéndose a ejecutar
          las tareas inherentes a dicha función con la debida diligencia, eficiencia,
          responsabilidad y disciplina, conforme a los procedimientos, normas internas y
          directrices que se le indiquen, así como a la normativa legal vigente. Las funciones
          inherentes al cargo de <B>{cargo}</B> comprenden, de manera enunciativa pero no
          limitativa, las siguientes: 1.) Estar de manera puntual en su puesto de trabajo, Cumplir
          con el horario de trabajo comprendido 08:00 am a 4:00 pm establecido por la
          administración el cual podrá ser sometido a variación según políticas internas y su
          incumplimiento estará sujeto a medidas de disciplina, control y organización de LA
          EMPRESA. 2.) Presentarse en su puesto de trabajo en condiciones óptimas de aseo e higiene
          personal (Bañado, Afeitado), usando obligatoriamente su uniforme en perfectas condiciones
          sin ningún tipo de perjuicio. 3.) Clasificar y ubicar la mercancía entrante según el
          sistema de inventario. 4.) Armar los pedidos (picking) asegurando que coincidan con la
          nota de entrega. 5.) Apoyar al Chofer en las labores de carga y descarga cuando sea
          requerido. 6.) Resguardar la imagen de la empresa. 7.) Mantener organizado y limpio su
          puesto de trabajo antes, durante y después de la jornada laboral. 8.) Reportar de manera
          inmediata cualquier falla técnica, irregularidad o incidencia que afecte la producción.
          9.) Ejecutar cualquier otra actividad conexa o complementaria inherente al cargo que le
          sea razonablemente asignada por su superior inmediato, dentro del marco legal vigente.
          10.) Queda terminantemente prohibido el uso de teléfonos móviles dentro de los horarios
          establecidos como jornadas de trabajo. 11.) Queda terminantemente prohibidas las
          relaciones amorosas e interpersonales en esta organización, además de{" "}
          <B>Parágrafo Único:</B> LA EMPRESA <B>{empresa?.nombre || BLANK}</B>, Se reserva el
          derecho de modificar, ampliar o reducir las funciones Anteriormente descritas, en
          atención a necesidades organizativas, operativas o de servicio, siempre que dichas
          modificaciones no impliquen desmejoras en los derechos laborales adquiridos ni cambios
          sustanciales en la naturaleza del cargo.{" "}
          <B>CLÁUSULA TERCERA: NATURALEZA JURÍDICA DEL CONTRATO.</B> de conformidad con lo
          establecido en los artículos 59 en concordancia con lo dispuesto en el artículo 62 de la
          Ley Orgánica del Trabajo, de los Trabajadores y las Trabajadoras, el Presente contrato
          de trabajo Se celebra a tiempo determinado y por un periodo de Seis (06) meses, por lo
          cual las partes Acuerdan que este contrato inicia Hoy <B>{fechaInicioLetras}</B> y
          finaliza el Dia <B>{fechaFinLetras}</B>, este contrato no está Limitado a una obra
          específica. El trabajador prestará sus servicios personales, subordinados y remunerados
          en las Instalaciones de la sociedad mercantil <B>{empresa?.nombre || BLANK}</B>{" "}
          Domiciliada en <B>{empresa?.direccion_fiscal || BLANK}</B>, Venezuela.{" "}
          <B>CLÁUSULA CUARTA: JORNADA DE TRABAJO.</B> El trabajador desempeñará sus funciones en
          una jornada Diurna ordinaria de trabajo, comprendida desde las 08:00 am a 4:00 pm, de
          lunes a Viernes, con Dos (2) días de descanso rotativo a la semana. Esta jornada incluye
          una (1) hora de descanso diario para alimentación. Se deja constancia de que el horario
          establecido se encuentra dentro de los límites de la jornada diurna prevista en el
          artículo 173 de la Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras, sin
          exceder las ocho (8) horas diarias ni las cuarenta (40) horas semanales. Cualquier
          modificación de esta jornada o su extensión por causa justificada deberá ser convenida
          entre las partes, respetando siempre los límites legales establecidos.{" "}
          <B>CLÁUSULA QUINTA: SALARIO.</B> El trabajador devengará un salario fijo mensual de{" "}
          <B>{salarioLetras} Art 129 LOTTT</B>, el cual será cancelado de forma quincenal Mediante
          transferencia bancaria a la cuenta personal del trabajador, conforme a lo previsto en la
          Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras. (Art 104), Este salario
          será la base para el cálculo de las prestaciones sociales, bonificaciones de ley y demás
          beneficios derivados de la relación laboral. El Ejecutivo podrá decretar aumentos de
          salarios según el Artículo 111 de la presente ley, la cual nos comprometemos a acatar.{" "}
          <B>CLÁUSULA SEXTA: (Art 131 LOTTT) BENEFICIOS ECONÓMICOS Y SOCIALES.</B> El presente
          contrato garantiza Al trabajador todos los beneficios de carácter económico y social
          Establecidos en la Ley Orgánica del Trabajo, los Trabajadores y Las Trabajadoras, tales
          como: bono vacacional, utilidades, prestaciones sociales, horas extra, días feriados
          laborados, y los derivados de la seguridad social. Estos beneficios serán liquidados
          conforme a los parámetros legales y a la normativa administrativa vigente.{" "}
          <B>CLÁUSULA SÉPTIMA: BONO DE ALIMENTACIÓN.</B> La empresa{" "}
          <B>{empresa?.nombre || BLANK}</B> En cumplimiento del Decreto con Rango, Valor y Fuerza
          Según Gaceta Oficial N° 38.094 de fecha 27 de Diciembre de 2004 de Ley de Alimentación
          para los Trabajadores y las Trabajadoras, especialmente conforme a lo previsto en el
          Artículo 2 y 4, numeral 3, acuerda otorgar al trabajador un bono de alimentación de
          conformidad con lo siguiente: a) Modalidad de otorgamiento: El beneficio será otorgado
          en dinero en efectivo, en forma no acumulativa, pagadero conjuntamente con la remuneración
          quincenal, según corresponda. b) Monto del beneficio: El monto del bono de alimentación
          será equivalente al que establezca el Ejecutivo Nacional mediante decreto vigente,
          calculado por jornada efectivamente laborada, tomando como referencia el valor del Dólar
          indexado publicado por el BANCO CENTRAL DE VENEZUELA tasa Del día vigente al momento del
          cálculo, o cualquier otro mecanismo que lo sustituya o Complemente. c) No constituye
          salario: Este beneficio no tiene carácter salarial, conforme a lo dispuesto en el
          Artículo 105 de la Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)
          y el artículo 7 de la Ley de Alimentación, y por tanto, no se computará para efectos de
          cálculo de prestaciones sociales ni demás beneficios laborales. d) Condición: El
          trabajador deberá cumplir con la jornada de trabajo asignada para percibir dicho
          beneficio, salvo en casos de inasistencias justificadas, debidamente comprobadas,
          conforme a Lo previsto en el Reglamento Interno de Trabajo.{" "}
          <B>CLÁUSULA OCTAVA: DEDUCCIONES LEGALES.</B> El Patrono se reserva el derecho de
          efectuar Todas las deducciones legales correspondientes al salario del trabajador, tales
          como las relativas al Seguro Social Obligatorio (IVSS), Instituto Nacional de
          Capacitación y Educación Socialista (INCES), Fondo de Ahorro Obligatorio para la Vivienda
          (FAOV), Impuesto Sobre la Renta (ISLR) y cualquier otra contribución o carga prevista en
          la legislación vigente, siempre que tales deducciones estén debidamente autorizadas por
          ley.{" "}
          <B>CLÁUSULA NOVENA: TERMINACIÓN DEL CONTRATO DE TRABAJO. (Art 77-80 LOTTT)</B> La
          relación laboral podrá finalizar por las causas contempladas en la Ley Orgánica del
          Trabajo, los Trabajadores y las Trabajadoras. En especial, las partes convienen en las
          siguientes: 9.1 Por Voluntad del trabajador, mediante renuncia formal notificada con al
          menos cinco (5) días de antelación. 9.2 Por voluntad del patrono, con justa causa
          conforme a lo previsto en la ley. 9.3 Por Acumular Tres (3) Tres Amonestaciones Escrita
          y detalladas en el expediente del trabajador. 9.4 Por mutuo consentimiento entre las
          partes. 9.5 Por causas ajenas a la voluntad de las partes, incluyendo, entre otras:
          fuerza mayor, actos de la naturaleza, guerra, insurrección, pandemias, disturbios, huelgas
          ilegales, disposiciones de la autoridad competente o cualquier otra circunstancia
          extraordinaria que imposibilite la prestación del servicio.{" "}
          <B>CLÁUSULA DÉCIMA: RIESGOS LABORALES Y SEGURIDAD.</B> El Trabajador declara conocer los
          riesgos Inherentes a las labores que ejecutará, así como las normas de higiene y seguridad
          industrial aplicables. Asimismo, se Compromete a cumplir con las disposiciones
          establecidas por el Instituto Nacional de Prevención, Salud y Seguridad Laborales
          (INPSASEL) y las políticas internas de la empresa para la prevención de accidentes y
          enfermedades ocupacionales. El patrono, por su parte, garantiza el cumplimiento de las
          normas de seguridad laboral y Proporcionará los equipos de protección personal que sean
          requeridos.{" "}
          <B>CLÁUSULA DÉCIMA PRIMERA: PROGRAMA DE PROTECCIÓN PERSONAL.</B> La empresa pone a
          disposición de sus trabajadores un programa voluntario de protección mediante póliza de
          Salud personales. La participación en este beneficio es voluntaria; sin embargo, en caso
          de que el trabajador decida no adherirse al programa, deberá manifestarlo por escrito y
          asumir total Responsabilidad ante cualquier siniestro. La empresa no será responsable por
          daños o perjuicios derivados de la negativa del trabajador a participar en esta póliza.{" "}
          <B>CLÁUSULA DÉCIMA SEGUNDA: LUGAR DE CONTRATACIÓN.</B> A los fines legales Pertinentes,
          se deja constancia de que el presente contrato de trabajo ha sido celebrado en la sede
          Administrativa de la empresa, ubicada en{" "}
          <B>{empresa?.direccion_fiscal || BLANK}</B>.{" "}
          <B>CLÁUSULA DÉCIMA TERCERA: PROTECCIÓN DE DATOS PERSONALES.</B> La trabajadora autoriza
          expresamente al patrono para utilizar, almacenar y tratar sus datos personales, académicos
          y laborales con fines administrativos, fiscales, legales y de control interno,
          garantizando en todo momento el Derecho a la confidencialidad y protección de los mismos
          conforme a la legislación vigente sobre protección de datos.{" "}
          <B>CLÁUSULA DÉCIMA CUARTA: RÉGIMEN DISCIPLINARIO Y CONVIVENCIA.</B> El presente contrato
          está sujeto al cumplimiento de las normas de conducta, convivencia y respeto que Rigen
          las relaciones laborales dentro de la empresa. Se consideran faltas disciplinarias: 14.1
          Conductas irrespetuosas. 14.2 Acoso o bullying laboral. 14.3 Actos de indisciplina. 14.4
          Desobediencia a instrucciones legítimas. 14.5 Falta contra la moral, negligencia o
          Incumplimiento de tareas asignadas. 14.6 Conducta que afecte negativamente el ambiente de
          trabajo. 14.7 El régimen Sancionatorio será progresivo: Primera falta: amonestación
          escrita y archivada en expediente. Segunda falta: segunda amonestación escrita con
          advertencia formal. Tercera falta: tercera amonestación, constitutiva de causal de despido
          justificado, conforme a la LOTTT.{" "}
          <B>CLÁUSULA DÉCIMA QUINTA: USO DE IMAGEN PERSONAL Y CONSENTIMIENTO PARA FINES
          INSTITUCIONALES, RECREATIVOS, PUBLICITARIOS Y DIGITALES.</B> El (la) trabajador(a),
          mediante la suscripción del presente contrato; Acepta y autoriza De forma libre,
          voluntaria, expresa, informada, inequívoca y sin lugar a contraprestación Monetaria y/o
          en especie adicional alguna, a la empresa <B>{empresa?.nombre || BLANK}</B> (o la
          denominación que corresponda), para que su imagen personal, voz, nombre, fotografía,
          grabación audiovisual, capturas de video, contenido testimonial, declaraciones, reseñas u
          opiniones que le sean tomadas, recolectadas, registradas o generadas durante el desarrollo
          de actividades laborales, institucionales, comerciales, sociales o promocionales, puedan
          ser utilizadas, publicadas, difundidas, editadas, reproducidas, transformadas o adaptadas
          por la empresa en medios físicos, impresos, digitales, audiovisuales, electrónicos o
          tecnológicos, sin limitación territorial ni temporal alguna. Esta autorización comprende,
          sin que la enumeración sea limitativa, su utilización en campañas de marketing comercial
          o institucional, publicaciones en redes sociales, páginas web, blogs corporativos, medios
          publicitarios, presentaciones internas y externas, material POP, newsletters, catálogos,
          portales digitales, aplicaciones móviles, y en general, en cualquier plataforma análoga o
          sucesora que surja por innovación tecnológica o evolución comunicacional sin ninguna
          limitación.{" "}
          <B>CLÁUSULA DÉCIMA SEXTA: CLÁUSULA FINAL.</B> Las partes declaran que han leído y
          comprendido en su totalidad el contenido del presente contrato, obligándose a cumplir
          fielmente con todas Las cláusulas aquí establecidas. Cualquier aspecto no previsto
          expresamente en este documento será resuelto conforme a la Ley Orgánica del Trabajo, los
          Trabajadores y las Trabajadoras y demás normativa aplicable. Se firma el presente contrato
          en Dos (2) ejemplares de un mismo tenor y a un solo efecto legal, en San Francisco,{" "}
          <B>{fechaInicioLetras}</B> (<B>{fechaInicioNum}</B>) a las 03:30 p.m.
        </div>

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
        .contract-content {
          position: relative;
          z-index: 1;
        }
        .contract-header {
          position: relative;
          min-height: 72px;
          margin-bottom: 16px;
        }
        .contract-logo {
          position: absolute;
          top: 0;
          left: 0;
          max-height: 72px;
          max-width: 180px;
          object-fit: contain;
          z-index: 2;
          opacity: 0.45;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .contract-title {
          text-align: center;
          font-weight: bold;
          padding-top: 8px;
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
          }
          .contract-logo {
            opacity: 0.45;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </>
  );
}
