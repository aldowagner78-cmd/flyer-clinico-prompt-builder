import { colorPresets } from '../data/designPresets.js';

export function buildPrompt(state) {
  const clinic = state?.clinic || {};
  const professional = state?.professional || {};
  const specialty = state?.specialty || {};
  const services = state?.services || {};
  const schedule = state?.schedule || {};
  const coverage = state?.coverage || {};
  const design = state?.design || {};
  const attachments = state?.attachments || {};
  const options = state?.promptOptions || {};
  const pieceType = options.pieceType || 'professionalFlyer';

  return cleanPrompt(`
Comportate como experto en diseño de piezas visuales para clinicas, centros medicos y comunicacion sanitaria.

Necesito crear una única ${outputLabel(pieceType)} vertical final para Instagram, WhatsApp y redes sociales.

SALIDA ESPERADA:
- Entregar una sola pieza visual final lista para usar.
- Crear una única imagen vertical completa, apta para publicar.
- No generar alternativas.
- No combinar varias piezas, versiones u opciones dentro de la misma imagen.
- No incluir más de una pieza dentro del mismo lienzo.
- No quiero una propuesta conceptual: quiero una imagen final lista para usar.

TIPO DE PIEZA:
- Tipo: ${pieceTypeLabel(pieceType)}
${buildPieceContent(pieceType, { professional, specialty, services, schedule, coverage, options })}

DATOS DE LA INSTITUCIÓN:
- Nombre: ${valueOrEmpty(clinic.name)}
- Tipo de institución: ${valueOrEmpty(clinic.institutionType === 'Otro' ? clinic.otherInstitutionType : clinic.institutionType)}
- Dirección: ${valueOrEmpty(clinic.address)}
- WhatsApp principal: ${valueOrEmpty(clinic.primaryPhone)}
- Teléfono secundario: ${valueOrEmpty(clinic.secondaryPhone)}
- Email: ${valueOrEmpty(clinic.email)}
- Sitio web: ${valueOrEmpty(clinic.website)}
- Redes sociales:
${buildSocialSection(clinic.socialLinks)}
- Frase institucional: ${valueOrEmpty(clinic.institutionalPhrase)}
- Mostrar datos de contacto: ${yesNo(clinic.showContactData)}
- Logo institucional esperado: ${valueOrEmpty(clinic.logoFileName)}
- Instrucción para logo: ${valueOrEmpty(clinic.logoInstruction)}
- Si no se adjunta logo institucional, usar el nombre del centro como marca textual sin inventar un logo oficial.

DISEÑO VISUAL:
- Formato: ${valueOrEmpty(design.format)}
- Color principal: ${colorName(design.primaryColor, design.customPrimaryColor)}
- Color secundario: ${colorName(design.secondaryColor, design.customSecondaryColor)}
- Estilo visual: ${valueOrEmpty(design.visualStyle)}
- Tipografía sugerida: ${valueOrEmpty(design.typography)}
- Nivel de impacto visual: ${valueOrEmpty(design.visualImpact)}
- Densidad de contenido: ${contentDensityLabel(design.contentDensity)}
${densityInstruction(design.contentDensity)}
- Incluir iconos médicos: ${yesNo(design.includeMedicalIcons)}
- Incluir fondo temático: ${yesNo(design.includeThematicBackground)}
- Usar recursos relacionados con la especialidad/área: ${yesNo(design.useAutomaticTheme)}
- Priorizar impacto visual y lectura rápida. No llenar la imagen de texto.

${needsStoryRule(design.format) ? `FORMATO HISTORIA / ESTADO:
- Debe verse completo en una sola pantalla de celular, sin necesidad de scroll.
- Respetar margenes seguros superiores e inferiores para historias de Instagram y estados de WhatsApp.
- Mantener textos dentro de zonas seguras.` : ''}

ADJUNTOS:
El usuario adjuntará manualmente estos archivos en ChatGPT antes de enviar el prompt, si fueron seleccionados.
${buildAttachmentSection(attachments.items)}
Si falta una imagen no obligatoria, resolver con recursos gráficos sobrios. No inventar logos, fotos ni referencias.

RESTRICCIONES CRÍTICAS:
- No inventes datos médicos, administrativos, horarios, teléfonos, redes sociales, logos ni matrículas.
- No inventes evidencia, estadísticas, beneficios, descuentos, condiciones ni promesas no informadas.
- No prometas curación ni resultados garantizados.
- Si la pieza es educativa o informativa, debe ser clara y prudente; no debe reemplazar la consulta médica.
- Si es promoción o campaña, evitar lenguaje engañoso, urgencia falsa o afirmaciones sanitarias no verificadas.
- Usar poco texto por bloque, jerarquía clara y composición profesional.
- El resultado debe ser apto para publicar en redes o enviar por WhatsApp.
`);
}

function buildPieceContent(pieceType, data) {
  const { professional, specialty, services, schedule, coverage, options } = data;

  if (pieceType === 'professionalFlyer') {
    return `
DATOS DEL PROFESIONAL:
- Título: ${valueOrEmpty(professional.title)}
- Nombre completo: ${valueOrEmpty(professional.fullName)}
- Matrícula: ${valueOrEmpty(professional.license)}
- Mostrar foto profesional: ${yesNo(professional.showPhoto)}

ESPECIALIDADES / ÁREAS:
- Especialidad o área: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Cómo se verá en el flyer: ${valueOrEmpty(specialty.visibleSpecialtyText || specialty.primaryProfessionalSpecialty)}

PRESTACIONES O DATOS VISIBLES:
${buildList(services.visibleServices, '- No se cargaron prestaciones visibles.')}
- Frase breve opcional: ${valueOrEmpty(options.suggestedPhrase)}

ATENCIÓN:
${buildScheduleSection(schedule.items)}
- Requiere turno previo: ${yesNo(schedule.requiresAppointment)}
- Texto para turnos: ${valueOrEmpty(schedule.appointmentText)}
- Modalidad: ${valueOrEmpty(schedule.modality)}
- Observación administrativa: ${valueOrEmpty(schedule.administrativeNote)}
- Obras sociales: ${yesNo(coverage.insurance)}
- Particulares: ${yesNo(coverage.privatePatients)}
`;
  }

  if (pieceType === 'clinicalInfographic') {
    return `
CONTENIDO DE LA INFOGRAFÍA:
- Especialidad / área sanitaria: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Tema educativo: ${valueOrEmpty(options.educationalTopic)}
- Público objetivo: ${valueOrEmpty(options.targetAudience)}
- Mensaje principal: ${valueOrEmpty(options.mainMessage)}
- Bloques informativos sugeridos:
${formatMultiline(options.infoBlocksText)}
- Nota sanitaria: ${valueOrEmpty(options.legalEthicalNote)}
`;
  }

  if (pieceType === 'informativeFlyer') {
    return `
CONTENIDO DEL FLYER INFORMATIVO:
- Área / servicio relacionado: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Tipo de información: ${valueOrEmpty(options.contentGoal)}
- Título visible: ${valueOrEmpty(options.educationalTopic)}
- Mensaje principal: ${valueOrEmpty(options.mainMessage)}
- Datos visibles sugeridos:
${buildList(services.visibleServices, '- No se cargaron datos visibles.')}
- Llamada a la acción: ${valueOrEmpty(options.campaignCallToAction)}
`;
  }

  return `
CONTENIDO DE LA PROMOCIÓN / CAMPAÑA:
- Área / especialidad: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Tipo de campaña: ${valueOrEmpty(options.campaignType)}
- Público objetivo: ${valueOrEmpty(options.targetAudience)}
- Mensaje principal: ${valueOrEmpty(options.mainMessage)}
- Fecha o período: ${valueOrEmpty(options.campaignValidity)}
- Condiciones o aclaración breve: ${valueOrEmpty(options.campaignConditions)}
- Puntos visibles sugeridos:
${buildList(services.visibleServices, '- No se cargaron puntos visibles.')}
- Llamada a la acción: ${valueOrEmpty(options.campaignCallToAction)}
- Nota prudente: ${valueOrEmpty(options.legalEthicalNote)}
`;
}

function buildSocialSection(socialLinks = []) {
  const filled = socialLinks.filter(item => hasText(item?.type) || hasText(item?.value));
  if (!filled.length) return '- No se cargaron redes sociales.';
  return filled.map(item => `- ${valueOrEmpty(item.type)}: ${valueOrEmpty(item.value)}`).join('\n');
}

function buildScheduleSection(items = []) {
  const filled = items.filter(item => hasText(item?.days) || hasText(item?.from) || hasText(item?.to) || hasText(item?.note));
  if (!filled.length) return '- No se cargaron horarios de atención.';
  return filled.map(item => {
    const time = hasText(item.from) || hasText(item.to) ? `${valueOrEmpty(item.from)} a ${valueOrEmpty(item.to)}` : 'horario no informado';
    const note = hasText(item.note) ? ` (${item.note})` : '';
    return `- ${valueOrEmpty(item.days)}: ${time}${note}`;
  }).join('\n');
}

function buildAttachmentSection(items = []) {
  const filled = items.filter(item => hasText(item?.fileName));
  if (!filled.length) return '- No se seleccionaron archivos locales para adjuntar.';
  return filled.map(item => {
    const instruction = hasText(item.instruction) ? ` Instrucción: ${item.instruction}` : '';
    return `- ${labelAttachmentRole(item.role)}: ${item.fileName}.${instruction}`;
  }).join('\n');
}

function buildList(values = [], fallback) {
  const filled = values.filter(hasText);
  if (!filled.length) return fallback;
  return filled.map(item => `- ${item}`).join('\n');
}

function formatMultiline(value = '') {
  const items = String(value || '').split(/\n|;/).map(item => item.trim()).filter(Boolean);
  if (!items.length) return '- No se cargaron bloques.';
  return items.map(item => `- ${item}`).join('\n');
}

function colorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado') && hasText(custom)) return custom.trim();
  return colorPresets[key]?.label || key || 'Lila';
}

function needsStoryRule(format = '') {
  const normalized = normalize(format);
  return normalized.includes('historia') || normalized.includes('estado') || normalized.includes('whatsapp');
}

function contentDensityLabel(value) {
  return {
    brief: 'Breve',
    balanced: 'Equilibrado',
    detailed: 'Detallado'
  }[value] || 'Equilibrado';
}

function densityInstruction(value) {
  return {
    brief: '- Densidad breve: muy poco texto, mucho aire visual, impacto visual fuerte.',
    balanced: '- Densidad equilibrada: información justa, buena lectura, sin saturar.',
    detailed: '- Densidad detallada: más información, pero manteniendo legibilidad en celular.'
  }[value] || '- Densidad equilibrada: información justa, buena lectura, sin saturar.';
}

function outputLabel(pieceType) {
  return {
    professionalFlyer: 'flyer profesional',
    clinicalInfographic: 'infografía clínica educativa',
    informativeFlyer: 'flyer informativo',
    promotionCampaign: 'flyer de promoción o campaña'
  }[pieceType] || 'pieza visual';
}

function pieceTypeLabel(pieceType) {
  return {
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografía clínica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promoción / campaña'
  }[pieceType] || 'Pieza visual';
}

function labelAttachmentRole(value) {
  return {
    clinicLogo: 'Logo de clínica',
    professionalPhoto: 'Foto profesional',
    referenceFlyer: 'Referencia visual',
    thematicImage: 'Imagen temática',
    other: 'Otro archivo'
  }[value] || valueOrEmpty(value);
}

function valueOrEmpty(value) {
  return hasText(value) ? String(value).trim() : 'No informado';
}

function yesNo(value) {
  return value ? 'sí' : 'no';
}

function hasText(value = '') {
  return String(value ?? '').trim().length > 0;
}

function normalize(value = '') {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanPrompt(value = '') {
  return value
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
