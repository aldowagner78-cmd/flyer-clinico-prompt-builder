import { colorPresets } from '../data/designPresets.js';

export function buildPrompt(state) {
  const colorPreset = colorPresets[state.design.primaryColor] || colorPresets.lila;
  const primaryColor = state.design.primaryColor === 'personalizado'
    ? state.design.customColor || 'lila personalizado'
    : colorPreset.label;
  const secondaryColor = state.design.secondaryColor || colorPreset.secondary;
  const services = state.services.items.length ? state.services.items.map(item => `- ${item}`).join('\n') : '- No se cargo lista de prestaciones.';
  const images = buildImageSection(state);

  return `Comportate como experto en diseno de flyers para clinicas y centros medicos.

Necesito crear un flyer vertical para Instagram, WhatsApp y redes sociales.

Este pedido pertenece a una serie de flyers clinicos con estetica previamente definida en esta conversacion anclada llamada "Diseno de flyer clinico". ${state.design.usePinnedStyle ? 'Usa como base el estilo ya trabajado: diseno moderno, profesional, limpio, clinico, con color lila como predeterminado salvo que se indique otro color.' : 'Usa una estetica moderna, profesional, limpia y clinica.'}

Necesito que generes al menos 2 alternativas finales listas para usar. No quiero solo una propuesta conceptual. Quiero imagenes finales, comparables entre si, para poder elegir. Las alternativas deben tener pequenas variaciones de composicion, no cambios arbitrarios de informacion.

DATOS DE LA CLINICA:
- Nombre: ${valueOrEmpty(state.clinic.name)}
- Direccion: ${valueOrEmpty(state.clinic.address)}
- Telefono / WhatsApp: ${valueOrEmpty(state.clinic.phone)}
- Instagram / redes: ${valueOrEmpty(state.clinic.social)}
- Frase institucional: ${valueOrEmpty(state.clinic.tagline)}
- Mostrar datos de contacto: ${yesNo(state.clinic.showContact)}

DATOS DEL PROFESIONAL:
- Titulo: ${valueOrEmpty(state.doctor.title)}
- Nombre completo: ${valueOrEmpty(state.doctor.name)}
- Especialidad: ${valueOrEmpty(state.doctor.specialty || state.services.specialty)}
- Matricula: ${valueOrEmpty(state.doctor.license)}
- Aclaracion o cargo: ${valueOrEmpty(state.doctor.roleNote)}
- Mostrar foto del profesional: ${yesNo(state.doctor.showPhoto)}

ESPECIALIDAD:
- Especialidad principal: ${valueOrEmpty(state.services.specialty)}
- Prestacion principal destacada: ${valueOrEmpty(state.services.featured)}

PRESTACIONES:
${services}

AMPLIACION DE PRESTACIONES:
- Autorizo a ChatGPT a agregar prestaciones generales razonables de la especialidad: ${yesNo(state.services.allowExpansion)}
- Instrucciones sobre ampliacion: ${state.services.allowExpansion ? valueOrEmpty(state.services.expansionNotes) : 'No ampliar prestaciones.'}

DIA Y HORARIO:
- Dias de atencion: ${valueOrEmpty(state.care.days)}
- Horario: ${valueOrEmpty(state.care.hours)}
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

IMAGENES:
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
- No inventes datos medicos.
- No agregues informacion no informada.
- No exageres prestaciones.
- No atribuyas practicas que no correspondan.
- Solo amplia prestaciones si fue autorizado expresamente y limitate a tareas generales razonables de consultorio.
- Si se autoriza creatividad visual, podes proponer recursos graficos relacionados con la especialidad, pero sin inventar datos clinicos ni administrativos.
- No cambies nombres, horarios, telefonos ni datos administrativos.
- Usa color lila por defecto salvo que se haya elegido otro color.
- Usa una tematica visual compatible con la especialidad.
- Prioriza lectura rapida y legibilidad en celular.
- Usa composicion vertical clara, moderna, profesional y compatible con redes sociales.
- Si hay foto del medico, integrala sin deformar rostro ni alterar identidad.
- Si hay logo, respeta su proporcion.
- El resultado debe ser apto para publicar en redes o enviar por WhatsApp.
- Entrega al menos 2 alternativas finales listas para elegir.`;
}

function buildImageSection(state) {
  const rows = [
    ['Logo de clinica', state.images.logoName],
    ['Foto del medico', state.images.doctorPhotoName],
    ['Imagen de referencia del flyer', state.images.referenceName],
    ['Imagen tematica opcional', state.images.themeName]
  ];
  const filled = rows.filter(([, value]) => value);
  if (!filled.length) return '- No se seleccionaron imagenes locales para adjuntar.';
  return filled.map(([label, value]) => `- ${label}: ${value} (adjuntar manualmente en ChatGPT)`).join('\n');
}

function valueOrEmpty(value) {
  return value && String(value).trim() ? String(value).trim() : 'No informado';
}

function yesNo(value) {
  return value ? 'si' : 'no';
}
