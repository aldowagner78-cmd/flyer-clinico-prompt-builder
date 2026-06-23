import { colorPresets } from '../data/designPresets.js';

export function buildPrompt(state) {
  const primaryColor = colorName(state.design.primaryColor, state.design.primaryCustomColor);
  const secondaryColor = colorName(state.design.secondaryColor, state.design.secondaryCustomColor);
  const services = state.services.items.length ? state.services.items.map(item => `- ${item}`).join('\n') : '- No se cargo lista de prestaciones.';
  const highlightedArea = getHighlightedArea(state);
  const socials = buildSocialSection(state);
  const schedules = buildScheduleSection(state);
  const images = buildImageSection(state);
  const storyRule = needsStoryRule(state.design.format)
    ? '\nREGLA AUTOMATICA PARA HISTORIA / ESTADO:\n- El flyer debe verse completo en una sola pantalla de celular.\n- Debe verse sin necesidad de scroll.\n- Usar margenes seguros para historias de Instagram y estados de WhatsApp.\n- Optimizar jerarquia, tamanos y espacios para lectura inmediata en pantalla vertical.\n'
    : '';

  return `Comportate como experto en diseno de flyers para clinicas y centros medicos.

Necesito crear un flyer vertical para Instagram, WhatsApp y redes sociales.

Este pedido pertenece a una serie de flyers clinicos con estetica previamente definida en esta conversacion anclada llamada "Diseno de flyer clinico". ${state.design.usePinnedStyle ? 'Usa como base el estilo ya trabajado: diseno moderno, profesional, limpio, clinico, con color lila como predeterminado salvo que se indique otro color.' : 'Usa una estetica moderna, profesional, limpia y clinica.'}

Entregame exactamente 2 alternativas finales listas para usar. Cada alternativa debe ser una imagen separada e independiente. No colocar dos flyers dentro de una misma imagen. No hacer collage, comparativa, grilla, panel dividido ni mockup con varias opciones juntas.

No quiero solo una propuesta conceptual. Quiero imagenes finales, comparables entre si, para poder elegir. Las 2 alternativas deben tener pequenas variaciones de composicion, no cambios arbitrarios de informacion.

DATOS DE LA CLINICA:
- Nombre: ${valueOrEmpty(state.clinic.name)}
- Direccion: ${valueOrEmpty(state.clinic.address)}
- Telefono / WhatsApp principal: ${valueOrEmpty(state.clinic.phone)}
- Redes sociales y enlaces:
${socials}
- Frase institucional: ${valueOrEmpty(state.clinic.tagline)}
- Mostrar datos de contacto: ${yesNo(state.clinic.showContact)}

DATOS DEL PROFESIONAL:
- Titulo: ${valueOrEmpty(state.doctor.title)}
- Nombre completo: ${valueOrEmpty(state.doctor.name)}
- Especialidad declarada del profesional: ${valueOrEmpty(state.doctor.specialty || state.services.primarySpecialty)}
- Matricula: ${valueOrEmpty(state.doctor.license)}
- Aclaracion o cargo: ${valueOrEmpty(state.doctor.roleNote)}
- Mostrar foto del profesional: ${yesNo(state.doctor.showPhoto)}

ESPECIALIDADES DEL FLYER:
- Especialidad principal: ${valueOrEmpty(state.services.primarySpecialty)}
- Especialidades adicionales: ${state.services.additionalSpecialties.length ? state.services.additionalSpecialties.join(', ') : 'No informado'}
- Area destacada del flyer: ${highlightedArea}
- Prestacion principal destacada: ${valueOrEmpty(state.services.featured)}

Coherencia: usa el area destacada como foco comunicacional del flyer, pero no contradigas la especialidad principal ni las especialidades adicionales cargadas. Si el area destacada es mas especifica que la especialidad, tratala como enfoque del flyer, no como nueva especialidad inventada.

PRESTACIONES:
${services}

AMPLIACION DE PRESTACIONES:
- Autorizo a ChatGPT a agregar prestaciones generales razonables de la especialidad: ${yesNo(state.services.allowExpansion)}
- Instrucciones sobre ampliacion: ${state.services.allowExpansion ? valueOrEmpty(state.services.expansionNotes) : 'No ampliar prestaciones.'}

HORARIOS DE ATENCION:
${schedules}

TURNOS Y MODALIDAD:
- Requiere turno previo: ${yesNo(state.care.requiresAppointment)}
- Texto personalizado para turnos: ${valueOrEmpty(state.care.appointmentText)}
- Modalidad: ${valueOrEmpty(state.care.modality)}
- Observacion administrativa: ${valueOrEmpty(state.care.adminNote)}

COBERTURA:
- Atiende por obra social: ${yesNo(state.care.insurance)}
- Atiende particulares: ${yesNo(state.care.privateCare)}

DISENO:
- Formato: ${valueOrEmpty(state.design.format)}
- Color principal: ${primaryColor}
- Color secundario: ${secondaryColor}
- Estilo visual: ${valueOrEmpty(state.design.visualStyle)}
- Tipografia sugerida: ${valueOrEmpty(state.design.typography)}
- Nivel de impacto visual: ${valueOrEmpty(state.design.impact)}
- Incluir iconos medicos: ${yesNo(state.design.includeIcons)}
- Incluir fondo tematico relacionado con la especialidad: ${yesNo(state.design.includeThemeBackground)}
- Usar tematica automatica segun especialidad: ${yesNo(state.design.autoTheme)}
- Usar estetica ya aprendida en la conversacion anclada: ${yesNo(state.design.usePinnedStyle)}
${storyRule}
IMAGENES Y ARCHIVOS ADJUNTOS:
El usuario adjuntara manualmente estos archivos en el chat antes de enviar este prompt. Tomar cada archivo adjunto como referencia visual correspondiente.
${images}
Si adjunto logo, foto del profesional o referencias, integrarlos respetando proporcion, identidad y legibilidad. Si falta una imagen, resolver el diseno con recursos graficos tematicos sobrios.

OBSERVACIONES:
- Frase sugerida para el flyer: ${valueOrEmpty(state.advanced.suggestedPhrase)}
- Frases que NO deben usarse: ${valueOrEmpty(state.advanced.forbiddenPhrases)}
- Datos que deben destacarse: ${valueOrEmpty(state.advanced.highlightData)}
- Datos que deben ir pequenos: ${valueOrEmpty(state.advanced.smallData)}
- Instrucciones libres: ${valueOrEmpty(state.advanced.freeInstructions)}
- Permitir creatividad adicional: ${valueOrEmpty(state.advanced.creativity)}

RESTRICCIONES IMPORTANTES:
- Entrega exactamente 2 alternativas finales listas para usar, como 2 imagenes separadas e independientes.
- No pongas las 2 alternativas dentro de una misma imagen.
- No hagas collage, comparativa, grilla, panel dividido ni mockup con varias opciones juntas.
- No inventes datos medicos.
- No agregues informacion no informada.
- No exageres prestaciones.
- No atribuyas practicas que no correspondan.
- Solo amplia prestaciones si fue autorizado expresamente y limitate a tareas generales razonables de consultorio.
- Si se autoriza creatividad visual, podes proponer recursos graficos relacionados con la especialidad, pero sin inventar datos clinicos ni administrativos.
- No cambies nombres, horarios, telefonos, redes sociales ni datos administrativos.
- Usa color lila por defecto salvo que se haya elegido otro color.
- Usa una tematica visual compatible con la especialidad principal, las adicionales y el area destacada.
- Prioriza lectura rapida y legibilidad en celular.
- Usa composicion vertical clara, moderna, profesional y compatible con redes sociales.
- Si hay foto del medico, integrala sin deformar rostro ni alterar identidad.
- Si hay logo, respeta su proporcion.
- El resultado debe ser apto para publicar en redes o enviar por WhatsApp.`;
}

function buildSocialSection(state) {
  const socials = state.clinic.socialLinks.filter(item => item.type || item.value);
  if (!socials.length) return '- No se cargaron redes sociales.';
  return socials.map(item => `- ${valueOrEmpty(item.type)}: ${valueOrEmpty(item.value)}`).join('\n');
}

function buildScheduleSection(state) {
  if (!state.care.schedules.length) return '- No se cargaron horarios de atencion.';
  return state.care.schedules.map(item => {
    const time = item.from && item.to ? `${item.from} a ${item.to}` : valueOrEmpty([item.from, item.to].filter(Boolean).join(' a '));
    return `- ${valueOrEmpty(item.days)}: ${time}${item.note ? ` (${item.note})` : ''}`;
  }).join('\n');
}

function buildImageSection(state) {
  const rows = [
    ['Logo de clinica', state.images.logoName],
    ['Foto del medico', state.images.doctorPhotoName],
    ['Imagen de referencia del flyer', state.images.referenceName],
    ['Imagen tematica opcional', state.images.themeName]
  ];
  const filled = rows.filter(([, value]) => value);
  if (!filled.length) return '- No se seleccionaron archivos locales para adjuntar.';
  return filled.map(([label, value]) => `- ${label}: ${value} (adjuntar manualmente en ChatGPT antes de enviar el prompt)`).join('\n');
}

function getHighlightedArea(state) {
  if (state.services.highlightedArea.trim()) return state.services.highlightedArea.trim();
  const specialties = [state.services.primarySpecialty, ...state.services.additionalSpecialties].filter(Boolean);
  if (!specialties.length) return 'No informado';
  return specialties.length === 1 ? specialties[0] : joinReadable(specialties);
}

function colorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado') && custom?.trim()) return custom.trim();
  return colorPresets[key]?.label || 'Lila';
}

function needsStoryRule(format = '') {
  const normalized = format.toLowerCase();
  return normalized.includes('historia') || normalized.includes('estado') || normalized.includes('whatsapp');
}

function joinReadable(values) {
  if (values.length <= 2) return values.join(' y ');
  return `${values.slice(0, -1).join(', ')} y ${values.at(-1)}`;
}

function valueOrEmpty(value) {
  return value && String(value).trim() ? String(value).trim() : 'No informado';
}

function yesNo(value) {
  return value ? 'si' : 'no';
}
