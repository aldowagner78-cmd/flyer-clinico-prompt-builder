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
    return buildGeminiAudioPrompt({ clinic, professional, specialty, services, schedule, coverage, attachments, options });
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

function buildGeminiAudioPrompt({ clinic, professional, specialty, services, schedule, coverage, attachments, options }) {
  const audioType = resolveAudioType(options);
  if (audioType === 'Spot narrado con música de fondo') {
    return buildNarratedSpotPackage({ clinic, professional, schedule, coverage, options });
  }
  if (audioType === 'Instrumental / música de fondo') {
    return buildInstrumentalAudioPrompt({ attachments, options });
  }

  const durationRules = geminiAudioDurationRules('30 segundos');
  const voice = options.jingleVoices || 'Voz principal + coros';
  const instrumental = isJingleInstrumental(options);
  const contentMode = options.jingleContentMode || (instrumental ? 'Instrumental' : 'Usar datos/frase cargada');
  const textToSing = instrumental ? '' : resolveAudioTextToSing({ clinic, professional, options });
  const style = options.jingleStyle || 'Pop alegre promocional';
  const styleInstruction = audioStyleInstruction(style);
  const voiceInstruction = audioVoiceInstruction(voice, instrumental);
  const adminItems = resolveAllowedAdministrativeItems({ clinic, schedule, coverage, options });
  const administrativeRules = buildAdministrativeAudioRules({ textToSing, options, adminItems });
  const pronunciationRules = buildCompactPronunciationRules(textToSing, options);
  const referenceLine = buildAudioReferenceLine({ attachments, options });

  return cleanPrompt(`
TAREA:
Generá una única pista final de audio en Gemini Audio: un spot publicitario musical breve, no canción larga. No respondas con texto. No expliques. No crees alternativas. No des instrucciones visuales.

AUDIO A GENERAR:
Duración objetivo: 30 segundos. No superar 30 segundos.
Tipo: ${instrumental ? 'música instrumental publicitaria breve' : 'spot publicitario musical breve para redes'}.
Idioma: español argentino claro.
Estilo: ${styleInstruction}
Voz: ${voiceInstruction}
${referenceLine}

TEXTO A CANTAR:
${instrumental ? 'Sin texto a cantar. Instrumental únicamente.' : valueOrEmpty(textToSing)}
${instrumental ? 'No cantar. No hablar. No usar voces. No usar coros. No usar palabras. No usar vocalizaciones.' : 'Cantá únicamente el texto indicado. No agregues otras frases, datos, llamadas a la acción ni explicaciones.\nNo cantar ninguna otra frase.\nNo inventar palabras. No usar idioma inventado.'}

ESTILO Y VOZ:
Profesional, cálido, confiable, simple, apto para salud.
audio publicitario breve para redes, moderno y fácil de recordar.
No canción larga. No balada salvo que el estilo elegido lo indique claramente.
Sin intro larga, sin outro largo, sin repeticiones extensas.
${instrumental ? 'Crear solo música instrumental. No debe haber voz, letra, texto hablado, tarareo, vocalizaciones ni coros.' : ''}

DICCIÓN Y FRASEO:
Dicción clara pero compacta.
Fraseo unido, natural y fluido.
No hacer pausas largas entre palabras.
No separar exageradamente nombres, instituciones, profesionales, programas, campañas ni prestaciones.
Pronunciar nombres propios como una unidad fluida.
Pronunciar frases institucionales o de campaña como frases breves de publicidad.
No estirar palabras importantes.
No alargar vocales finales.
No cantar lento salvo que el estilo elegido lo pida explícitamente.

CIERRE FINAL:
El final debe tener un pequeño énfasis publicitario breve y recordable.
Puede repetir solo una parte breve del texto final si ayuda al cierre.
No agregar palabras nuevas.
No hacer cierre hablado.
No alargar el cierre.

PRONUNCIACIÓN:
${instrumental ? 'No aplica porque la pista debe ser instrumental.' : `Pronunciar exactamente:\n${valueOrEmpty(textToSing)}`}
${pronunciationRules}
${hasText(options.jinglePronunciationGuide) ? `Corrección manual: ${valueOrEmpty(options.jinglePronunciationGuide)}` : ''}

REGLAS:
${administrativeRules}
No prometer curas ni resultados médicos.
No inventar datos.
No superar 30 segundos.
`);
}

function buildNarratedSpotPackage({ clinic, professional, schedule, coverage, options }) {
  const script = resolveNarratedSpotScript({ clinic, professional, options });
  const adminItems = resolveAllowedAdministrativeItems({ clinic, schedule, coverage, options });
  const administrativeRules = buildAdministrativeAudioRules({ textToSing: script, options, adminItems, contentLabel: 'guion para voz' });
  const voice = narratedVoiceSuggestion(options.jingleVoices);
  const music = narratedMusicSuggestion(options.jingleStyle);

  return cleanPrompt(`
GUION PARA VOZ:
${valueOrEmpty(script)}

VOZ SUGERIDA:
${voice}
Tono medio, cálido, natural, moderno, profesional y cercano.
No cantar.
No sonar robótica.
No exagerar énfasis.
No pausar dentro de frases.
Leer números de corrido, sin pausas extras ni énfasis artificial.

MUSICA DE FONDO:
${music}
Debe acompañar toda la locución.
No tapar la voz.
Evitar música dramática, infantil, épica o estridente salvo pedido explícito del usuario.

MEZCLA:
Voz al frente.
Música al 15% a 25% de volumen aproximado.
Fade in breve.
Fade out breve.
Duración final recomendada: 30 segundos.
Exportar como MP3 o usar en video/flyer.

HERRAMIENTAS SUGERIDAS:
- Generar voz con una herramienta TTS natural.
- Mezclar con Clipchamp, Audacity u otro editor simple.
- Usar música libre, stock o creada aparte.
- Para locución natural, usar el guion en una herramienta TTS y mezclar la música en un editor simple.

CHECKLIST DE PRODUCCION:
- La voz suena natural.
- No parece robot.
- La música se escucha sin tapar la voz.
- El número está correcto.
- No hay datos inventados.
- El audio dura cerca de 30 segundos.
- ${administrativeRules}
- No prometer curas ni resultados médicos.
`);
}

function buildInstrumentalAudioPrompt({ attachments, options }) {
  const style = audioStyleInstruction(options.jingleStyle || 'Instrumental corporativo');
  const referenceLine = buildAudioReferenceLine({ attachments, options });
  return cleanPrompt(`
TAREA:
Generar música instrumental de fondo para una pieza de salud o comunicación institucional.

AUDIO A GENERAR:
Duración objetivo: 30 segundos. No superar 30 segundos.
Tipo: instrumental / música de fondo.
Estilo: ${style}
Uso previsto: redes sociales, video breve, flyer animado o fondo institucional.
Tono: profesional, cálido, confiable y sobrio.
${referenceLine}

REGLAS:
No texto a cantar.
No locución.
No voces.
No coros.
No palabras.
No tarareo.
No vocalizaciones.
No prometer curas ni resultados médicos.
No inventar datos.
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
- Alternativa instrumental heredada: ${yesNo(Boolean(options.jingleInstrumentalAlternative))}.

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
Entregá una pista final de audio si la herramienta lo permite.
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

function geminiAudioDurationRules(duration) {
  return {
    seconds: 30,
    exact: '30 segundos exactos',
    limit: '30 segundos: spot publicitario musical breve, con fraseo compacto.'
  };
}

function isJingleInstrumental(options = {}) {
  if (options.jingleAudioType === 'Instrumental / música de fondo') return true;
  const voice = normalizeForInternalMatch(options.jingleVoices);
  const mode = normalizeForInternalMatch(options.jingleContentMode);
  return voice.includes('instrumental') || mode === 'instrumental' || options.jingleWithLyrics === false;
}

function resolveAudioType(options = {}) {
  if (options.jingleAudioType === 'Spot narrado con música de fondo') return 'Spot narrado con música de fondo';
  if (options.jingleAudioType === 'Instrumental / música de fondo') return 'Instrumental / música de fondo';
  if (isJingleInstrumental(options)) return 'Instrumental / música de fondo';
  return 'Jingle cantado';
}

function resolveJinglePhrase({ clinic, options }) {
  const mode = options.jingleContentMode || '';
  if (mode === 'Usar frase editada por el usuario' && hasText(options.jingleCustomPhrase)) return options.jingleCustomPhrase;
  if (mode === 'Texto exacto opcional' && hasText(options.jingleBaseIdea)) return options.jingleBaseIdea;
  if (hasText(options.jingleCustomPhrase)) return options.jingleCustomPhrase;
  if (options.jingleIncludeSlogan !== false && hasText(clinic.institutionalPhrase)) return clinic.institutionalPhrase;
  if (hasText(options.mainMessage)) return options.mainMessage;
  if (hasText(options.campaignCallToAction)) return options.campaignCallToAction;
  return '';
}

function resolveAudioTextToSing({ clinic, professional, options }) {
  const mode = options.jingleContentMode || '';
  if ((mode === 'Texto exacto opcional' || hasText(options.jingleBaseIdea)) && hasText(options.jingleBaseIdea)) {
    return compactAudioText(options.jingleBaseIdea);
  }
  if ((mode === 'Usar frase editada por el usuario' || hasText(options.jingleCustomPhrase)) && hasText(options.jingleCustomPhrase)) {
    return compactAudioText(options.jingleCustomPhrase, clinic.name);
  }
  if (hasText(clinic.name) && options.jingleIncludeSlogan !== false && hasText(clinic.institutionalPhrase)) {
    return compactAudioText(`${clinic.name}. ${clinic.institutionalPhrase}`);
  }
  if (hasText(clinic.name)) return compactAudioText(`${clinic.name}. Cuidado cercano y profesional.`);
  const professionalName = [professional.title, professional.fullName].filter(Boolean).join(' ').trim();
  if (hasText(professional.fullName)) return compactAudioText(`${professionalName}. Atención cercana y profesional.`);
  return 'Audio institucional breve.';
}

function resolveNarratedSpotScript({ clinic, professional, options }) {
  if (hasText(options.jingleBaseIdea)) return compactAudioText(options.jingleBaseIdea);
  if (hasText(options.jingleCustomPhrase)) return compactAudioText(options.jingleCustomPhrase, clinic.name);
  if (hasText(clinic.name) && hasText(clinic.institutionalPhrase)) return compactAudioText(`${clinic.name}. ${clinic.institutionalPhrase}`);
  if (hasText(clinic.name)) return compactAudioText(`En ${clinic.name} queremos acompañarte. Cuidá tu salud con información clara y atención profesional.`);
  if (hasText(professional.fullName)) return compactAudioText(`${professional.fullName}. Comunicación clara, cercana y profesional.`);
  return 'Guion breve institucional para voz.';
}

function narratedVoiceSuggestion(voice = '') {
  if (voice === 'Voz masculina') return 'Locutor masculino adulto argentino. Tono barítono medio, natural, moderno, profesional y cercano.';
  if (voice === 'Dúo femenino/masculino') return 'Locutora femenina adulta argentina o locutor masculino adulto argentino. Elegir una sola voz principal para mayor naturalidad.';
  return 'Locutora femenina adulta argentina.';
}

function narratedMusicSuggestion(style = '') {
  const normalized = normalizeForInternalMatch(style);
  if (normalized.includes('cumbia')) return 'Cumbia suave profesional, cálida, moderada y optimista.';
  if (normalized.includes('infantil')) return 'Música cálida y luminosa, sin tono caricaturesco.';
  if (normalized.includes('instrumental')) return 'Instrumental corporativa suave, moderna, cálida y optimista.';
  return 'Corporativa suave, moderna, cálida y optimista.';
}

function compactAudioText(text, prefix = '') {
  const raw = [prefix, text].filter(hasText).join('. ');
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\.+/g, '.')
    .replace(/\.\s*\./g, '.')
    .trim();
}

function resolveAllowedAdministrativeItems({ clinic, schedule, coverage, options }) {
  if (!options.jingleAllowAdministrativeData) return [];
  const selected = parseLines(options.jingleAdministrativeDataAllowed);
  if (!selected.length) return [];
  return selected.filter(hasText);
}

function buildAdministrativeAudioRules({ textToSing = '', options = {}, adminItems = [], contentLabel = 'texto a cantar' }) {
  const exactTextMode = hasText(options.jingleBaseIdea);
  const detectedItems = exactTextMode ? detectAdministrativeItemsInText(textToSing) : [];
  const allowedItems = uniqueFilled([...adminItems, ...detectedItems]);
  const hasNumberWords = containsNumberWords(textToSing);
  const numberWordsAction = contentLabel === 'texto a cantar' ? 'cantarlos' : 'leerlos';

  if (!allowedItems.length) {
    return 'No mencionar mensajería, teléfonos, redes, direcciones, horarios, coberturas, precios ni matrículas.';
  }

  return [
    `Respetar exactamente el ${contentLabel}.`,
    exactTextMode && detectedItems.length ? `El texto exacto incluye ${detectedItems.join(', ')} por decisión del usuario.` : '',
    adminItems.length ? `Dato administrativo permitido: ${adminItems.join(', ')}. Usarlo solo si está en el ${contentLabel} o si el usuario lo pidió explícitamente. Mantenerlo breve.` : '',
    'No agregar otros datos administrativos fuera del texto exacto o de los datos permitidos.',
    'No agregar llamadas a la acción nuevas.',
    hasNumberWords ? `Si hay números escritos en palabras, ${numberWordsAction} exactamente como están escritos.` : ''
  ].filter(Boolean).join('\n');
}

function detectAdministrativeItemsInText(text = '') {
  const normalized = normalizeForInternalMatch(text);
  const found = [];
  if (normalized.includes('whatsapp')) found.push('WhatsApp');
  if (normalized.includes('instagram') || normalized.includes('@')) found.push('Instagram');
  if (normalized.includes('facebook')) found.push('Facebook');
  if (/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text)) found.push('Email');
  if (normalized.includes('direccion') || normalized.includes('calle') || normalized.includes('avenida') || normalized.includes('av.')) found.push('Dirección');
  if (normalized.includes('horario') || normalized.includes('lunes') || normalized.includes('viernes') || normalized.includes('sabado')) found.push('Horarios');
  if (normalized.includes('obra social') || normalized.includes('obras sociales')) found.push('Obras sociales');
  if (/\d{2,}/.test(text) || containsNumberWords(text)) found.push('Teléfono');
  return uniqueFilled(found);
}

function containsNumberWords(text = '') {
  const normalized = normalizeForInternalMatch(text);
  const numberWords = ['cero', 'uno', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  return numberWords.filter(word => new RegExp(`\\b${word}\\b`, 'i').test(normalized)).length >= 2;
}

function buildCompactPronunciationRules(text = '', options = {}) {
  const rules = [];
  if (hasText(text)) {
    if (/[áéíóúÁÉÍÓÚñÑ]/.test(text)) rules.push('Respetar acentos escritos, ñ y sílabas tónicas.');
    if (/\bvida\b/i.test(text)) rules.push('Pronunciar "vida" como VI-da, no vidá.');
    if (hasLikelyProperName(text)) rules.push('No deformar nombres propios.');
  }
  return rules.length ? rules.join('\n') : 'Pronunciación natural y clara.';
}

function audioStyleInstruction(style = '') {
  const normalized = normalizeForInternalMatch(style);
  if (normalized.includes('infantil puro')) {
    return 'infantil puro, alegre, dulce, luminoso y fácil de recordar. Instrumentación infantil: campanillas suaves, palmas livianas, percusión simple, guitarra o piano alegre. No usar voces exageradas ni caricaturescas. Mantener tono apto para salud.';
  }
  if (normalized.includes('pop alegre promocional')) {
    return 'pop alegre promocional, moderno, luminoso y fácil de recordar.';
  }
  if (normalized.includes('folklore') || normalized.includes('argentino')) {
    return 'folklore/pop argentino suave, cálido, claro y publicitario.';
  }
  if (normalized.includes('cumbia')) {
    return 'cumbia suave profesional, alegre, sobria y apta para salud.';
  }
  if (normalized.includes('motivador')) {
    return 'motivador moderno, dinámico, optimista y publicitario.';
  }
  if (normalized.includes('instrumental')) {
    return 'instrumental corporativo, breve, limpio y recordable.';
  }
  return style || 'pop alegre promocional, moderno, luminoso y fácil de recordar.';
}

function audioVoiceInstruction(voice = '', instrumental = false) {
  if (instrumental) return 'sin voz, sin coros y sin palabras.';
  if (voice === 'Voces infantiles') {
    return 'Voces infantiles. La voz principal cantada debe ser de niñas o niños. No usar voz adulta como voz principal. No usar voz femenina adulta. No usar voz masculina adulta. No usar locutor adulto. No usar voz adulta con estilo infantil. Si no se logra voz infantil clara, priorizar estilo infantil limpio y dicción clara.';
  }
  if (voice === 'Otro / personalizar' || voice === 'Otro / Personalizar') return 'usar exactamente la indicación personalizada del usuario, sin inventar voces adicionales.';
  return voice || 'Voz principal + coros';
}

function hasLikelyProperName(text = '') {
  return String(text).split(/\s+/).some(word => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/.test(word));
}

function buildAudioReferenceLine({ attachments, options }) {
  const mode = options.jingleCreationMode || 'Desde cero';
  if (mode !== 'Basado en flyer / imagen' && mode !== 'Híbrido') return '';
  const firstReference = (attachments?.items || []).find(item => hasText(item.fileName));
  if (!firstReference) return 'Referencia: si se adjunta un flyer o imagen, mantener coherencia general sin describirlo.';
  return `Referencia: usar solo como guía de clima visual el archivo "${firstReference.fileName}".`;
}

function buildPronunciationTerms({ clinic, professional, specialty, services, options, phrase }) {
  return uniqueFilled([
    clinic.name,
    [professional.title, professional.fullName].filter(Boolean).join(' '),
    professional.title,
    professional.fullName,
    specialty.visibleSpecialtyText,
    specialty.primaryProfessionalSpecialty,
    phrase,
    clinic.institutionalPhrase,
    options.campaignType,
    options.mainMessage,
    ...(services.visibleServices || [])
  ]).slice(0, 12);
}

function uniqueFilled(values = []) {
  return values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
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

function parseLines(value = '') {
  return String(value || '')
    .split(/\n|;/)
    .map(item => item.trim())
    .filter(Boolean);
}

function colorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado') && hasText(custom)) return custom.trim();
  return colorPresets[key]?.label || key || 'Lila';
}

function needsStoryRule(format = '') {
  const normalized = normalizeForInternalMatch(format);
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
    jinglePromotional: 'audio, jingle o música'
  }[pieceType] || 'pieza visual';
}

function pieceTypeLabel(pieceType) {
  return {
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografía clínica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promoción / campaña',
    jinglePromotional: 'Audio / jingle / música'
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

function normalizeForInternalMatch(value = '') {
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
