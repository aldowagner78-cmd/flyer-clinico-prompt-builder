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
  const alternativesCount = Number(options.finalAlternativesCount) || 2;
  const primaryColor = colorName(design.primaryColor, design.customPrimaryColor);
  const secondaryColor = colorName(design.secondaryColor, design.customSecondaryColor);
  const outputName = outputLabel(pieceType);
  const storyRule = needsStoryRule(design.format)
    ? `
FORMATO HISTORIA / ESTADO:
- Debe verse completo en una sola pantalla de celular, sin necesidad de scroll.
- Respetar margenes seguros superiores e inferiores para historias de Instagram y estados de WhatsApp.
- Priorizar lectura inmediata, jerarquia clara y textos dentro de zonas seguras.`
    : '';

  return cleanPrompt(`
Comportate como experto en diseño de piezas visuales para clinicas, centros medicos y comunicacion sanitaria.

Necesito crear exactamente ${alternativesCount} ${outputName.plural} verticales finales para Instagram, WhatsApp y redes sociales.

TIPO DE PIEZA:
- Tipo: ${pieceTypeLabel(pieceType)}.
- Objetivo: ${valueOrEmpty(options.contentGoal)}
- Publico objetivo: ${valueOrEmpty(options.targetAudience)}
- Mensaje principal: ${valueOrEmpty(options.mainMessage)}
${pieceSpecificBrief(pieceType, options)}

SALIDA ESPERADA:
- Entregar ${alternativesCount} alternativas finales listas para usar.
- Cada alternativa debe ser una imagen separada e independiente.
- No colocar las alternativas dentro de una misma imagen.
- No hacer collage, comparativa, grilla, panel dividido ni mockup con varias opciones juntas.
- Las alternativas deben tener pequeñas variaciones de composicion, sin cambios arbitrarios de informacion.
- No quiero una propuesta conceptual: quiero imagenes finales listas para elegir.

ESTILO BASE:
- ${design.usePinnedConversationStyle ? 'Si corresponde, usar como referencia la estetica ya trabajada en la conversacion anclada "Diseño de flyer clinico": moderna, profesional, limpia y clinica.' : 'Usar una estetica moderna, profesional, limpia y clinica.'}
- Color principal: ${primaryColor}.
- Color secundario: ${secondaryColor}.
- Estilo visual: ${valueOrEmpty(design.visualStyle)}.
- Tipografia sugerida: ${valueOrEmpty(design.typography)}.
- Nivel de impacto visual: ${valueOrEmpty(design.visualImpact)}.
- Incluir iconos medicos: ${yesNo(design.includeMedicalIcons)}.
- Incluir fondo tematico relacionado: ${yesNo(design.includeThematicBackground)}.
- Usar tematica automatica segun especialidad/enfoque: ${yesNo(design.useAutomaticTheme)}.
- Densidad de contenido: ${contentDensityLabel(design.contentDensity)}.
${densityInstruction(design.contentDensity)}
${storyRule}

DATOS DE LA CLINICA:
- Nombre: ${valueOrEmpty(clinic.name)}
- Direccion: ${valueOrEmpty(clinic.address)}
- Telefono / WhatsApp principal: ${valueOrEmpty(clinic.primaryPhone)}
- Redes sociales y enlaces:
${buildSocialSection(clinic.socialLinks)}
- Frase institucional: ${valueOrEmpty(clinic.institutionalPhrase)}
- Mostrar datos de contacto: ${yesNo(clinic.showContactData)}
${buildProfessionalBlock(pieceType, professional)}
${buildSpecialtyBlock(pieceType, specialty)}
${buildServicesBlock(pieceType, services)}
${buildScheduleBlock(pieceType, schedule, coverage)}

USO DE ARCHIVOS ADJUNTOS:
El usuario adjuntara manualmente los archivos al chat antes de enviar este prompt. Usar cada archivo segun su rol y no confundir funciones entre ellos.
${buildAttachmentSection(attachments.items)}
Si falta una imagen, resolver el diseño con recursos graficos tematicos sobrios.

OBSERVACIONES:
- Frase sugerida: ${valueOrEmpty(options.suggestedPhrase)}
- Frases que NO deben usarse: ${valueOrEmpty(options.forbiddenPhrases)}
- Datos que deben destacarse: ${valueOrEmpty(options.highlightData)}
- Datos que deben ir pequeños: ${valueOrEmpty(options.smallData)}
- Instrucciones libres: ${valueOrEmpty(options.freeInstructions)}
- Creatividad visual permitida: ${creativityLabel(options)}

RESTRICCIONES CRITICAS:
- No inventes datos medicos, administrativos, horarios, telefonos, redes sociales ni matriculas.
- No inventes evidencia, estadisticas, beneficios, descuentos, condiciones ni promesas no informadas.
- No agregues informacion no informada salvo la ampliacion expresamente autorizada.
- No exageres prestaciones ni atribuyas practicas que no correspondan.
- Si la pieza es educativa o informativa, debe ser clara y prudente; no debe reemplazar la consulta medica.
- Si es promocion o campaña, evitar promesas de resultado, lenguaje engañoso o afirmaciones sanitarias no verificadas.
- Si usas creatividad visual, que sea solo grafica/estetica y compatible con la especialidad, el enfoque y el tipo de pieza.
- Respetar nombres, logo, foto profesional, proporciones y legibilidad.
- Priorizar lectura rapida en celular.
- El resultado debe ser apto para publicar en redes o enviar por WhatsApp.
`);
}

function buildProfessionalBlock(pieceType, professional) {
  const hasProfessional = [
    professional.title,
    professional.fullName,
    professional.license,
    professional.roleNote
  ].some(hasText);

  if (!hasProfessional && pieceType !== 'professionalFlyer') {
    return '';
  }

  return `
DATOS DEL PROFESIONAL:
- Titulo: ${valueOrEmpty(professional.title)}
- Nombre completo: ${valueOrEmpty(professional.fullName)}
- Matricula: ${valueOrEmpty(professional.license)}
- Aclaracion o cargo: ${valueOrEmpty(professional.roleNote)}
- Mostrar foto del profesional: ${yesNo(professional.showPhoto)}`;
}

function buildSpecialtyBlock(pieceType, specialty) {
  return `
ESPECIALIDAD, TEMA Y ENFOQUE:
- Especialidad profesional principal: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Especialidades u orientaciones adicionales: ${listOrFallback(specialty.additionalSpecialties, 'No informado')}
- Enfoque comunicacional: ${valueOrEmpty(specialty.communicationFocus)}
- Texto visible recomendado para titulo/subtitulo: ${valueOrEmpty(specialty.visibleSpecialtyText)}

Usar el texto visible recomendado como referencia preferente para el titulo o subtitulo principal. El enfoque comunicacional puede orientar la composicion, pero no debe presentarse como una nueva especialidad si no corresponde.`;
}

function buildServicesBlock(pieceType, services) {
  const label = pieceType === 'clinicalInfographic' || pieceType === 'informativeFlyer'
    ? 'CONTENIDO / PUNTOS INFORMATIVOS'
    : 'PRESTACIONES VISIBLES EN LA PIEZA';

  return `
PRESTACION O TEMA PRINCIPAL:
- ${valueOrEmpty(services.mainHighlightedService)}

${label}:
${buildList(services.visibleServices, '- No se cargaron prestaciones o puntos visibles.')}

DATOS DE CONTEXTO:
Estos no necesariamente deben mostrarse todos. Sirven para orientar la tematica, el enfoque visual y la seleccion de contenido.
${buildList(services.contextServices, '- No se cargaron datos de contexto.')}

AMPLIACION DE CONTENIDO:
- Autorizo a ChatGPT a agregar contenido general razonable: ${yesNo(services.allowServiceExpansion)}
- Instrucciones sobre ampliacion: ${services.allowServiceExpansion ? valueOrEmpty(services.expansionInstructions) : 'No ampliar contenido.'}`;
}

function buildScheduleBlock(pieceType, schedule, coverage) {
  if (pieceType === 'clinicalInfographic' || pieceType === 'informativeFlyer') {
    return `
CONTACTO / CIERRE:
- Puede incluir una llamada a consultar o solicitar turno si corresponde.
- Requiere turno previo: ${yesNo(schedule.requiresAppointment)}
- Texto personalizado para turnos: ${valueOrEmpty(schedule.appointmentText)}
- Modalidad: ${valueOrEmpty(schedule.modality)}
- Observacion administrativa: ${valueOrEmpty(schedule.administrativeNote)}`;
  }

  return `
HORARIOS DE ATENCION:
${buildScheduleSection(schedule.items)}

TURNOS Y MODALIDAD:
- Requiere turno previo: ${yesNo(schedule.requiresAppointment)}
- Texto personalizado para turnos: ${valueOrEmpty(schedule.appointmentText)}
- Modalidad: ${valueOrEmpty(schedule.modality)}
- Observacion administrativa: ${valueOrEmpty(schedule.administrativeNote)}

COBERTURA:
- Atiende por obra social: ${yesNo(coverage.insurance)}
- Atiende particulares: ${yesNo(coverage.privatePatients)}`;
}

function pieceSpecificBrief(pieceType, options) {
  if (pieceType === 'clinicalInfographic') {
    return `- Tema educativo: ${valueOrEmpty(options.educationalTopic)}
- Bloques sugeridos: ${formatMultiline(options.infoBlocksText)}
- Enfoque: pieza educativa clara, visual y prudente. No reemplaza la consulta medica.
- Nota sanitaria: ${valueOrEmpty(options.legalEthicalNote)}`;
  }

  if (pieceType === 'informativeFlyer') {
    return `- Tema informativo: ${valueOrEmpty(options.educationalTopic)}
- Bloques sugeridos: ${formatMultiline(options.infoBlocksText)}
- Enfoque: flyer informativo simple, con lectura rapida y mensaje central claro.
- Nota sanitaria: ${valueOrEmpty(options.legalEthicalNote)}`;
  }

  if (pieceType === 'promotionCampaign') {
    return `- Tipo de campaña/promocion: ${valueOrEmpty(options.campaignType)}
- Vigencia / fecha / periodo: ${valueOrEmpty(options.campaignValidity)}
- Condiciones o aclaraciones: ${valueOrEmpty(options.campaignConditions)}
- Llamada a la accion: ${valueOrEmpty(options.campaignCallToAction)}
- Nota sanitaria/etica: ${valueOrEmpty(options.legalEthicalNote)}`;
  }

  return `- Enfoque: flyer de profesional, especialidad o servicio clinico.`;
}

function buildSocialSection(socialLinks = []) {
  const filled = socialLinks.filter(item => hasText(item?.type) || hasText(item?.value));
  if (!filled.length) return '- No se cargaron redes sociales.';
  return filled
    .map(item => `- ${valueOrEmpty(item.type)}: ${valueOrEmpty(item.value)}`)
    .join('\n');
}

function buildScheduleSection(items = []) {
  const filled = items.filter(item => hasText(item?.days) || hasText(item?.from) || hasText(item?.to) || hasText(item?.note));
  if (!filled.length) return '- No se cargaron horarios de atencion.';
  return filled.map(item => {
    const time = item.from && item.to ? `${item.from} a ${item.to}` : valueOrEmpty([item.from, item.to].filter(Boolean).join(' a '));
    return `- ${valueOrEmpty(item.days)}: ${time}${item.note ? ` (${item.note})` : ''}`;
  }).join('\n');
}

function buildAttachmentSection(items = []) {
  const filled = items.filter(item => hasText(item?.fileName));
  if (!filled.length) return '- No se seleccionaron archivos locales para adjuntar.';

  return filled.map(item => {
    const instruction = hasText(item.instruction) ? ` Instruccion: ${item.instruction}` : '';
    return `- ${labelAttachmentRole(item.role)}: ${item.fileName}.${instruction}`;
  }).join('\n');
}

function buildList(values = [], fallback) {
  const filled = values.filter(hasText);
  if (!filled.length) return fallback;
  return filled.map(item => `- ${item}`).join('\n');
}

function formatMultiline(value = '') {
  const items = String(value || '')
    .split(/\n|;/)
    .map(item => item.trim())
    .filter(Boolean);
  if (!items.length) return 'No informado';
  return items.map(item => `\n  - ${item}`).join('');
}

function colorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado' || key === 'other' || key === 'custom') && hasText(custom)) {
    return custom.trim();
  }
  return colorPresets[key]?.label || key || 'Lila';
}

function needsStoryRule(format = '') {
  const normalized = normalize(format);
  return normalized.includes('historia') || normalized.includes('story') || normalized.includes('estado') || normalized.includes('whatsapp');
}

function contentDensityLabel(value) {
  return {
    brief: 'Breve',
    balanced: 'Equilibrado',
    detailed: 'Detallado'
  }[value] || 'Equilibrado';
}

function densityInstruction(value) {
  const instructions = {
    brief: '- Densidad breve: usar pocos textos, mucho aire visual y priorizar mensaje principal, marca/contacto y CTA.',
    balanced: '- Densidad equilibrada: balancear informacion y limpieza visual; no sobrecargar la pieza.',
    detailed: '- Densidad detallada: permitir mas informacion visible, pero mantener lectura clara y jerarquia en celular.'
  };
  return instructions[value] || instructions.balanced;
}

function creativityLabel(options = {}) {
  if (!options.allowVisualCreativity || options.visualCreativityLevel === 'strict') {
    return 'No: respetar estrictamente los datos cargados.';
  }
  if (options.visualCreativityLevel === 'broad' || options.visualCreativityLevel === 'amplia') {
    return 'Si, amplia: permitir recursos graficos relacionados con el tema, sin inventar datos clinicos ni administrativos.';
  }
  return 'Si, moderada: permitir recursos visuales relacionados con el tema, sin inventar datos clinicos ni administrativos.';
}

function outputLabel(pieceType) {
  return {
    professionalFlyer: { singular: 'flyer clinico', plural: 'flyers clinicos' },
    clinicalInfographic: { singular: 'infografia clinica', plural: 'infografias clinicas' },
    informativeFlyer: { singular: 'flyer informativo', plural: 'flyers informativos' },
    promotionCampaign: { singular: 'flyer de promocion o campaña', plural: 'flyers de promocion o campaña' }
  }[pieceType] || { singular: 'pieza visual', plural: 'piezas visuales' };
}

function pieceTypeLabel(pieceType) {
  return {
    professionalFlyer: 'Flyer de profesional / especialidad',
    clinicalInfographic: 'Infografia clinica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promocion / campaña / agenda'
  }[pieceType] || 'Flyer de profesional / especialidad';
}

function listOrFallback(values = [], fallback = 'No informado') {
  const filled = values.filter(hasText);
  if (!filled.length) return fallback;
  return filled.length <= 2 ? filled.join(' y ') : `${filled.slice(0, -1).join(', ')} y ${filled.at(-1)}`;
}

function labelAttachmentRole(value) {
  return {
    clinicLogo: 'Logo de clinica',
    professionalPhoto: 'Foto del profesional',
    referenceFlyer: 'Referencia visual',
    thematicImage: 'Imagen tematica',
    other: 'Otro archivo'
  }[value] || valueOrEmpty(value);
}

function valueOrEmpty(value) {
  return hasText(value) ? String(value).trim() : 'No informado';
}

function yesNo(value) {
  return value ? 'si' : 'no';
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

function cleanPrompt(value) {
  return String(value)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
