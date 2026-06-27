import { colorPresets } from '../data/designPresets.js';
import { PIECE_TYPES } from '../state/schema.js';

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
  const animated = Boolean(options.requestAnimation);

  if (pieceType === PIECE_TYPES.jinglePromotional) {
    return buildJinglePrompt({ clinic, professional, specialty, services, schedule, coverage, options });
  }

  if (animated) {
    return buildVideoPrompt({ clinic, professional, specialty, services, schedule, coverage, design, attachments, options, pieceType });
  }

  return cleanPrompt(`
Comportate como experto en diseño de piezas visuales para clinicas, centros medicos y comunicacion sanitaria.

${buildOutputIntro(pieceType, animated)}

SALIDA ESPERADA:
${buildOutputRequirements(animated)}

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
- Tipo de resultado: ${animated ? 'pieza animada breve' : 'imagen estática'}
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

${animated ? buildAnimationSection() : ''}

ADJUNTOS:
La app solo copió nombres de archivo; no subió ni adjuntó archivos reales.
El usuario debe adjuntar manualmente estos archivos en ChatGPT antes de enviar el prompt, si fueron seleccionados.
${buildAttachmentSection(mergePromptAttachments(pieceType, clinic, professional, attachments.items))}
Regla obligatoria para archivos faltantes:
- Si esta lista menciona archivos y no están adjuntos en la conversación, pedilos por nombre exacto antes de generar.
- Respondé: "Para poder realizar la tarea necesito que subas los siguientes archivos:" y listá los archivos faltantes con el mismo nombre usado en este prompt.
- No generes la pieza hasta recibir esos archivos.
Si falta una imagen no obligatoria que no fue listada como adjunto, resolver con recursos gráficos sobrios. No inventar logos, fotos ni referencias.

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

function buildJinglePrompt({ clinic, professional, specialty, services, schedule, coverage, options }) {
  const hasBaseIdea = hasText(options.jingleBaseIdea);
  const includeSlogan = options.jingleIncludeSlogan !== false && hasText(clinic.institutionalPhrase);
  const duration = resolveJingleDuration(options.jingleDuration);
  const durationRules = jingleDurationRules(duration);
  const singableData = buildCompactList([
    clinic.name,
    includeSlogan ? clinic.institutionalPhrase : '',
    specialty.primaryProfessionalSpecialty,
    [professional.title, professional.fullName].filter(Boolean).join(' '),
    ...(services.visibleServices || [])
  ], 'No hay datos cantables suficientes; usar un mensaje institucional genérico de salud.');

  return cleanPrompt(`
Actuá como compositor y productor musical especializado en jingles breves para salud.

OBJETIVO:
- Crear una canción o jingle breve para: ${valueOrEmpty(options.jingleObjective || 'Promoción / campaña')}.
- Destino: ${valueOrEmpty(options.jingleDestination || 'Instagram / Reels / Stories')}.
- Duración obligatoria: ${durationRules.exact}.
- No hagas una versión larga ni excedas la duración elegida.
- Si no podés generar audio con duración exacta, entregá solo una letra corta y una dirección musical precisa.

DIRECCIÓN MUSICAL:
- Estilo musical elegido por el usuario: ${valueOrEmpty(options.jingleStyle || 'Pop alegre')}.
- Tipo de voces elegido: ${valueOrEmpty(options.jingleVoices || 'Voz principal + coros')}.
- Tempo / velocidad: ${valueOrEmpty(options.jinglePace || 'Media')}.
- Instrumentación: ${valueOrEmpty(options.jingleInstrumentation || 'Instrumental corporativo')}.
- Tono emocional: ${valueOrEmpty(options.jingleEmotionalTone || 'Profesional')}.
- Respetá estrictamente el estilo elegido. Si es infantil, corporativo, pop, acústico u otro, mantenelo sin mezclar estilos incompatibles.
- Respetá las voces elegidas. Si hay coros, dúo o grupo, usalos sin extender la duración con repeticiones.

IDIOMA Y PRONUNCIACIÓN:
- Idioma obligatorio: español argentino.
- Pronunciá correctamente cada palabra en español argentino.
- No deformes nombres propios, marcas, institución, especialidades ni términos médicos.
- Respetá exactamente el nombre de la institución: ${valueOrEmpty(clinic.name)}.

DATOS DE CONTEXTO:
- Nombre: ${valueOrEmpty(clinic.name)}
- Tipo de institución: ${valueOrEmpty(clinic.institutionType === 'Otro' ? clinic.otherInstitutionType : clinic.institutionType)}
- Frase institucional / slogan: ${valueOrEmpty(clinic.institutionalPhrase)}
- Incluir slogan institucional: ${yesNo(includeSlogan)}
- WhatsApp principal: ${valueOrEmpty(clinic.primaryPhone)}
- Redes sociales:
${buildSocialSection(clinic.socialLinks)}
- Área / especialidad: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Profesional: ${valueOrEmpty([professional.title, professional.fullName].filter(Boolean).join(' '))}
- Prestaciones visibles:
${buildList(services.visibleServices, '- No se cargaron prestaciones o datos visibles.')}
- Turnos / atención: ${valueOrEmpty(schedule.appointmentText || schedule.modality)}
- Obras sociales: ${yesNo(coverage.insurance)}
- Particulares: ${yesNo(coverage.privatePatients)}

DATOS CANTABLES PERMITIDOS:
${singableData}

LETRA:
${hasBaseIdea
  ? `- Idea base del usuario: "${valueOrEmpty(options.jingleBaseIdea)}".
- Convertí esa idea en una letra breve, cantable y simple.
- Respetala y pulila sin cambiar el mensaje principal.`
  : '- El usuario no escribió letra ni idea base. Creá una letra breve usando solo los datos cantables permitidos.'}
- Letra cantada: ${durationRules.lines}.
- Cada línea: ${durationRules.words}.
- Estructura sugerida: ${durationRules.structure}.
- Usá frases simples, memorables y fáciles de cantar.
- Mensaje final obligatorio: ${valueOrEmpty(options.jingleFinalMessage || 'Consultanos por WhatsApp')}.
- Versión con letra: ${yesNo(options.jingleWithLyrics !== false)}.
- Versión instrumental alternativa: ${yesNo(Boolean(options.jingleInstrumentalAlternative))}.

RESTRICCIONES:
- No inventar datos.
- No prometer curación.
- No prometas curación ni resultados garantizados.
- No uses urgencia falsa, presión comercial ni lenguaje agresivo.
- Mantener tono profesional y apto para salud.
- Si hay datos de institución, usarlos sin alterarlos.
- Si hay frase institucional, integrarla solo si corresponde.
- No cantes teléfonos, WhatsApp numéricos, direcciones, emails, redes sociales, matrículas, horarios, obras sociales ni números.
- Los datos administrativos sirven solo como contexto; no deben aparecer en la letra cantada.
- No deletrees ni cantes arrobas, puntos, guiones ni números.
- Evitar mencionar temas médicos sensibles: ${yesNo(options.jingleAvoidSensitiveTopics !== false)}.

SALIDA ESPERADA:
Entregá:
- Letra final.
- Descripción musical.
- Voz sugerida.
- Coros si aplica.
- Duración.
- Indicaciones breves para producirla o usarla en video/redes.
`);
}

function buildVideoPrompt({ clinic, professional, specialty, services, schedule, coverage, design, attachments, options, pieceType }) {
  const promptAttachments = mergePromptAttachments(pieceType, clinic, professional, attachments.items);
  const materialItems = promptAttachments.filter(item => isVideoMaterialRole(item.role) && hasText(item.fileName));
  const creationMode = options.videoCreationMode || 'Desde cero';
  const staticFlyerItems = promptAttachments.filter(item => item.role === 'videoStaticFlyer' && hasText(item.fileName));
  const duration = resolveVideoDuration(options.videoDuration, pieceType, creationMode);
  const destination = options.videoDestination || 'Instagram / WhatsApp vertical 9:16';
  const motionStyle = options.videoMotionStyle || 'Suave profesional';
  const music = options.videoMusic || 'Instrumental suave';
  const structure = options.videoStructure || defaultVideoStructure(pieceType);
  const finalMessage = options.videoFinalMessage || fallbackFinalMessage(pieceType, options);

  return cleanPrompt(`
Actuá como director creativo audiovisual especializado en videos médicos/promocionales para redes sociales.

MODO ANIMADO / VIDEO:
Necesito crear un video corto final real o pieza animada completa, listo para publicar, basado en ${articleForOutput(pieceType)} ${outputLabel(pieceType)}.
No quiero una imagen estática ni una propuesta conceptual: quiero un video completo.

TIPO DE CREACIÓN:
- Modo: ${valueOrEmpty(creationMode)}
- Si el modo usa material de apoyo, integrar los archivos indicados sin inventar archivos no adjuntos.
- Si el modo es híbrido, combinar el material subido con escenas generadas, textos animados y cierre profesional.
${creationMode === 'Desde flyer / imagen estática' ? buildStaticFlyerVideoRules(staticFlyerItems) : ''}

ESPECIFICACIÓN TÉCNICA OBLIGATORIA:
- Duración total: ${duration}.
- Formato/destino: ${valueOrEmpty(destination)}.
- Salida lista para Instagram, Reels, Stories, estados de WhatsApp o publicación equivalente.
- Mantener composición vertical segura, sin cortar textos ni logos.
- No generar un video más corto que la duración indicada.
- No cambiar el formato solicitado.

ESTILO AUDIOVISUAL:
- Estilo de movimiento: ${valueOrEmpty(motionStyle)}.
- Música / sonido: ${valueOrEmpty(music)}.
- Voz en off: ${valueOrEmpty(options.videoVoiceOver || 'Sin voz en off')}.
- Texto en pantalla: ${valueOrEmpty(options.videoTextAmount || 'Breve')}.
- Ritmo: ${valueOrEmpty(options.videoPace || 'Medio')}.
- Restricciones visuales: ${valueOrEmpty(options.videoRestrictions || 'Mantener tono profesional; no exagerar resultados; evitar saturación visual.')}
- La música no debe tapar ni competir con el mensaje visual.

ESTRUCTURA DEL VIDEO:
- Estructura narrativa: ${valueOrEmpty(structure)}.
- Mensaje final: ${valueOrEmpty(finalMessage)}
${buildTimedScenes(duration, structure, finalMessage)}

DIRECCIÓN VISUAL:
- Respetar identidad institucional y colores indicados.
- Color principal: ${colorName(design.primaryColor, design.customPrimaryColor)}.
- Color secundario: ${colorName(design.secondaryColor, design.customSecondaryColor)}.
- Estilo visual: ${valueOrEmpty(design.visualStyle)}.
- Tipografía sugerida: ${valueOrEmpty(design.typography)}.
- Usar textos grandes, breves y legibles.
- Mantener jerarquía clara: título, beneficio o dato principal, cierre.
- Evitar saturación visual, transiciones agresivas, parpadeos o efectos bruscos.

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
- Si no se adjunta logo institucional, usar el nombre del centro como marca textual sin inventar un logo oficial.

MATERIAL DE APOYO PARA VIDEO:
${materialItems.length ? buildAttachmentSection(materialItems) : '- No se seleccionó material de apoyo específico para video.'}

ADJUNTOS:
La app solo copió nombres de archivo; no subió ni adjuntó archivos reales.
El usuario debe adjuntar manualmente estos archivos en Gemini o ChatGPT antes de enviar el prompt, si fueron seleccionados.
${buildAttachmentSection(promptAttachments)}
Regla obligatoria para archivos faltantes:
- Si esta lista menciona archivos y no están adjuntos en la conversación, pedilos por nombre exacto antes de generar.
- Respondé: "Para poder realizar la tarea necesito que subas los siguientes archivos:" y listá los archivos faltantes con el mismo nombre usado en este prompt.
- No generes el video hasta recibir esos archivos.

RESTRICCIONES CRÍTICAS:
- No inventes datos médicos, administrativos, horarios, teléfonos, redes sociales, logos ni matrículas.
- No prometas curación ni resultados garantizados.
- No uses urgencia falsa, exageraciones ni afirmaciones sanitarias no verificadas.
- El video debe ser prudente, claro, profesional y apto para publicar.
- Cerrar con el mensaje final visible durante los últimos 3 a 5 segundos.
`);
}



function buildOutputIntro(pieceType, animated = false) {
  if (animated) {
    return `Necesito crear una única pieza animada vertical final, en formato de video corto o clip animado, basada en ${articleForOutput(pieceType)} ${outputLabel(pieceType)}, para Instagram, WhatsApp, historias, estados o reels breves.`;
  }
  return `Necesito crear una única ${outputLabel(pieceType)} vertical final para Instagram, WhatsApp y redes sociales.`;
}

function buildOutputRequirements(animated = false) {
  if (animated) {
    return `- Entregar una sola pieza animada final lista para usar.
- Crear un único video corto vertical o clip animado completo, apto para publicar.
- El resultado debe ser animado de verdad, no una imagen fija ni un póster estático.
- No entregar una imagen estática si la herramienta permite generar animación o video.
- No generar alternativas.
- No combinar varias piezas, versiones u opciones dentro de la misma composición.
- No incluir más de una pieza dentro del mismo lienzo o video.
- No quiero una propuesta conceptual: quiero una pieza animada final lista para usar.`;
  }

  return `- Entregar una sola pieza visual final lista para usar.
- Crear una única imagen vertical completa, apta para publicar.
- No generar alternativas.
- No combinar varias piezas, versiones u opciones dentro de la misma imagen.
- No incluir más de una pieza dentro del mismo lienzo.
- No quiero una propuesta conceptual: quiero una imagen final lista para usar.`;
}

function buildAnimationSection() {
  return `MODO ANIMADO:
- Crear una pieza animada breve, no una pieza estática.
- El resultado esperado es un video corto vertical o clip animado real, no una sola imagen fija.
- Duración sugerida: 5 a 8 segundos.
- Formato vertical 9:16, apto para historias, estados, reels cortos y WhatsApp.
- Animación suave, profesional y clínica.
- Usar entrada progresiva de textos, apariciones suaves, pequeños desplazamientos o fundidos.
- Mantener logo, datos de contacto y mensaje final legibles durante toda la animación.
- Usar movimiento sutil de fondo, íconos o recursos visuales relacionados con la especialidad.
- Evitar movimientos bruscos, efectos excesivos, parpadeos, transiciones agresivas o música sugerida.
- El cierre debe dejar visible el mensaje final y los datos de contacto.
- Si la herramienta permite exportar video o animación, priorizar ese formato final por encima de una imagen estática.`;
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
- Foto profesional esperada: ${professional.showPhoto ? valueOrEmpty(professional.photoFileName) : 'No corresponde'}

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
- Mensaje final: ${valueOrEmpty(options.campaignCallToAction)}
`;
  }

  return `
CONTENIDO DE LA PROMOCIÓN / CAMPAÑA:
- Área / especialidad: ${valueOrEmpty(specialty.primaryProfessionalSpecialty)}
- Tipo de campaña: ${valueOrEmpty(options.campaignType)}
- Público objetivo: ${valueOrEmpty(options.targetAudience)}
- Mensaje principal: ${valueOrEmpty(options.mainMessage)}
- Período de campaña: ${valueOrEmpty(campaignValidityText(options))}
- Condiciones o aclaración breve: ${valueOrEmpty(options.campaignConditions)}
- Puntos visibles sugeridos:
${buildList(services.visibleServices, '- No se cargaron puntos visibles.')}
- Mensaje final: ${valueOrEmpty(options.campaignCallToAction)}
- Nota prudente: ${valueOrEmpty(options.legalEthicalNote)}
`;
}

function resolveVideoDuration(value, pieceType, creationMode) {
  const selected = String(value || '').trim();
  if (selected && selected !== 'Automático recomendado') return selected;
  if (pieceType === PIECE_TYPES.promotionCampaign) return '15 segundos';
  if (pieceType === PIECE_TYPES.clinicalInfographic) return '20 a 25 segundos';
  if (creationMode === 'Basado en material') return '20 segundos';
  return '20 segundos';
}

function resolveJingleDuration(value) {
  const selected = String(value || '').trim();
  if (selected && selected !== 'Automático recomendado') return selected;
  return '15 segundos';
}

function jingleDurationRules(duration) {
  const selected = String(duration || '').trim();
  if (selected.startsWith('10')) {
    return {
      exact: '10 segundos exactos',
      lines: '2 líneas cantadas como máximo',
      words: 'máximo 5 palabras por línea',
      structure: 'gancho breve + nombre o mensaje final'
    };
  }
  if (selected.startsWith('20')) {
    return {
      exact: '20 segundos exactos',
      lines: '4 líneas cantadas como máximo',
      words: 'máximo 7 palabras por línea',
      structure: 'gancho + servicio/beneficio + nombre + cierre'
    };
  }
  if (selected.startsWith('30')) {
    return {
      exact: '30 segundos exactos',
      lines: '5 líneas cantadas como máximo',
      words: 'máximo 7 palabras por línea',
      structure: 'intro breve + mensaje + refuerzo + nombre + cierre'
    };
  }
  return {
    exact: '15 segundos exactos',
    lines: '3 líneas cantadas como máximo',
    words: 'máximo 6 palabras por línea',
    structure: 'gancho + nombre/servicio + mensaje final'
  };
}

function buildCompactList(values, fallback, maxItems = 3) {
  const uniqueValues = values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .slice(0, maxItems);

  if (!uniqueValues.length) return fallback;
  return uniqueValues.map(value => `- ${value}`).join('\n');
}

function buildStaticFlyerVideoRules(staticFlyerItems = []) {
  return `
VIDEO DESDE FLYER / IMAGEN ESTÁTICA:
Usá el flyer o imagen adjunta como base principal.
Animá la pieza sin rediseñarla.
No cambies textos.
No cambies colores.
No cambies logo.
No cambies composición.
No inventes contenido.
No rehagas el diseño desde cero.
Convertí esa imagen en una pieza animada o video breve listo para redes.
Archivos requeridos para este modo:
${staticFlyerItems.length ? buildAttachmentSection(staticFlyerItems) : '- No se seleccionó flyer o imagen estática base.'}
Si el archivo no está adjunto, debe responder exactamente:
Para poder realizar la tarea necesito que subas los siguientes archivos:
y listar los nombres exactos.
No debe generar el video hasta recibir el archivo.`;
}

function defaultVideoStructure(pieceType) {
  if (pieceType === PIECE_TYPES.promotionCampaign) return 'Beneficio → Servicio → Mensaje final';
  if (pieceType === PIECE_TYPES.clinicalInfographic) return 'Dato educativo → Recomendación → Mensaje final';
  if (pieceType === PIECE_TYPES.professionalFlyer) return 'Presentación → Prestaciones → Mensaje final';
  return 'Problema → Solución → Mensaje final';
}

function fallbackFinalMessage(pieceType, options = {}) {
  if (hasText(options.videoFinalMessage)) return options.videoFinalMessage;
  if (hasText(options.campaignCallToAction)) return options.campaignCallToAction;
  if (pieceType === PIECE_TYPES.clinicalInfographic) return 'Consultá con tu equipo de salud';
  return 'Pedí tu turno';
}

function buildTimedScenes(duration, structure, finalMessage) {
  return `
Escenas temporizadas obligatorias:
- Escena 1 (0-5 s): apertura clara con gancho visual, marca institucional y tema principal.
- Escena 2 (5-10 s): mostrar beneficio, dato o servicio principal con texto breve y movimiento suave.
- Escena 3 (10-15 s): reforzar información clave, material de apoyo o prestación destacada.
- Escena 4 (15-20/25 s): cierre con mensaje final visible: "${valueOrEmpty(finalMessage)}".
- Si la duración elegida es 15 segundos, compactar en 3 escenas sin perder mensaje final.
- Si la duración elegida es 25 segundos, extender lectura y respiración visual sin agregar datos inventados.`;
}

function isVideoMaterialRole(role) {
  return ['videoBase', 'videoStaticFlyer', 'videoProfessionalPhoto', 'videoLogo', 'videoSupportImage', 'videoVisualReference', 'videoStyleReference', 'videoOther'].includes(role);
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

function mergePromptAttachments(pieceType, clinic = {}, professional = {}, items = []) {
  const next = Array.isArray(items)
    ? items.filter(item => shouldKeepAttachmentForPiece(pieceType, item?.role)).map(item => ({ ...item }))
    : [];
  upsertPromptAttachment(next, 'clinicLogo', clinic.logoFileName, clinic.logoInstruction || 'Usar como logo institucional, respetando proporciones.');
  if (shouldIncludeProfessionalPhoto(pieceType, professional)) {
    upsertPromptAttachment(next, 'professionalPhoto', professional.photoFileName, 'Usar como foto profesional, sin deformar rostro ni alterar identidad.');
  }
  return next;
}

function shouldIncludeProfessionalPhoto(pieceType, professional = {}) {
  return pieceType === PIECE_TYPES.professionalFlyer
    && Boolean(professional.showPhoto)
    && hasText(professional.photoFileName);
}

function shouldKeepAttachmentForPiece(pieceType, role) {
  if (role === 'professionalPhoto') return pieceType === PIECE_TYPES.professionalFlyer;
  return true;
}

function upsertPromptAttachment(items, role, fileName, instruction = '') {
  const normalizedName = String(fileName || '').trim();
  if (!normalizedName) return;
  const existing = items.find(item => item?.role === role);
  if (existing) {
    existing.fileName = existing.fileName || normalizedName;
    existing.instruction = existing.instruction || instruction;
    return;
  }
  items.unshift({ role, fileName: normalizedName, instruction });
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


function articleForOutput(pieceType) {
  return pieceType === PIECE_TYPES.clinicalInfographic ? 'una' : 'un';
}

function outputLabel(pieceType) {
  return {
    professionalFlyer: 'flyer profesional',
    clinicalInfographic: 'infografía clínica educativa',
    informativeFlyer: 'flyer informativo',
    promotionCampaign: 'flyer de promoción o campaña',
    jinglePromotional: 'jingle o canción promocional'
  }[pieceType] || 'pieza visual';
}

function pieceTypeLabel(pieceType) {
  return {
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografía clínica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promoción / campaña',
    jinglePromotional: 'Jingle / canción promocional'
  }[pieceType] || 'Pieza visual';
}

function labelAttachmentRole(value) {
  return {
    clinicLogo: 'Logo de clínica',
    professionalPhoto: 'Foto profesional',
    referenceFlyer: 'Referencia visual',
    thematicImage: 'Imagen temática',
    videoBase: 'Video base',
    videoStaticFlyer: 'Flyer / imagen estática',
    videoProfessionalPhoto: 'Foto del profesional',
    videoLogo: 'Logo institucional',
    videoSupportImage: 'Imagen de apoyo',
    videoVisualReference: 'Referencia visual para video',
    videoStyleReference: 'Referencia de estilo',
    videoOther: 'Otro material de video',
    other: 'Otro archivo'
  }[value] || valueOrEmpty(value);
}

function campaignValidityText(options = {}) {
  const start = String(options.campaignStartDate || '').trim();
  const end = String(options.campaignEndDate || '').trim();
  if (start && end) return `desde ${start} hasta ${end}`;
  if (start) return `desde ${start}`;
  if (end) return `hasta ${end}`;
  return options.campaignValidity || '';
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
