const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const BROKEN_TEXT_RE = new RegExp('[\\u00c3\\u00c2\\u00e2\\u00ef\\ufffd]');
const EXACT_WHATSAPP_TEXT = 'Vacunate a tiempo. Cuidarte también es cuidar a quienes querés. Turnos por WhatsApp al tres cuatro dos, cuatro cuatro nueve, siete dos ocho uno.';

async function loadModules() {
  const root = path.join(__dirname, '..');
  const [promptModule, stateModule, schemaModule] = await Promise.all([
    import(pathToFileURL(path.join(root, 'src', 'prompt', 'promptBuilder.js')).href),
    import(pathToFileURL(path.join(root, 'src', 'state', 'defaultState.js')).href),
    import(pathToFileURL(path.join(root, 'src', 'state', 'schema.js')).href)
  ]);
  return { ...promptModule, ...stateModule, ...schemaModule };
}

async function audioPrompt(overrides = {}) {
  const { buildPrompt, createDefaultState, PIECE_TYPES } = await loadModules();
  const state = createDefaultState();
  Object.assign(state.clinic, {
    name: 'Centro Médico Rincón',
    institutionalPhrase: 'Cuidamos tu salud, acompañamos tu vida',
    primaryPhone: '11 5555-5555',
    socialLinks: [{ type: 'Instagram', value: '@centromedicorincon' }]
  }, overrides.clinic || {});
  Object.assign(state.professional, {
    title: 'Dr.',
    fullName: 'Fernández'
  }, overrides.professional || {});
  Object.assign(state.specialty, {
    primaryProfessionalSpecialty: 'Clínica médica'
  }, overrides.specialty || {});
  Object.assign(state.services, {
    visibleServices: ['Diagnóstico por imágenes', 'Control clínico']
  }, overrides.services || {});
  Object.assign(state.promptOptions, {
    pieceType: PIECE_TYPES.jinglePromotional,
    jingleDuration: '15 segundos',
    jingleFinalMessage: 'Reservá por WhatsApp',
    ...overrides.promptOptions
  });
  if (overrides.attachments) Object.assign(state.attachments, overrides.attachments);
  return buildPrompt(state);
}

test.describe('prompt de audio / jingle / música', () => {
  test('genera un prompt minimalista sin contexto largo ni datos no pedidos', async () => {
    const prompt = await audioPrompt();

    expect(prompt).toContain('TAREA:');
    expect(prompt).toContain('AUDIO A GENERAR:');
    expect(prompt).toContain('TEXTO A CANTAR:');
    expect(prompt).toContain('ESTILO Y VOZ:');
    expect(prompt).toContain('DICCIÓN Y FRASEO:');
    expect(prompt).toContain('CIERRE FINAL:');
    expect(prompt).toContain('PRONUNCIACIÓN:');
    expect(prompt).toContain('REGLAS:');
    expect(prompt).toContain('Duración objetivo: 30 segundos');
    expect(prompt).not.toContain('Duración exacta: 15 segundos');
    expect(prompt).not.toContain('DATOS DE CONTEXTO');
    expect(prompt).not.toContain('CONTENIDO AUDIBLE PERMITIDO');
    expect(prompt).not.toContain('Profesional: Dr.');
    expect(prompt).not.toContain('Diagnóstico por imágenes');
    expect(prompt).not.toContain('Control clínico');
    expect(prompt).not.toContain('WhatsApp');
    expect(prompt).not.toContain('Instagram');
    expect(prompt).not.toContain('obras sociales');
    expect(prompt).not.toContain('Letra final');
    expect(prompt).not.toContain('Descripción musical');
    expect(prompt).not.toContain('Indicaciones visuales');
    expect(prompt).not.toContain('Versión alternativa');
    expect(prompt).not.toContain('Explicación escrita');
  });

  test('pide spot publicitario musical breve y no canción larga', async () => {
    const prompt = await audioPrompt();

    expect(prompt).toContain('spot publicitario musical breve');
    expect(prompt).toContain('audio publicitario breve para redes');
    expect(prompt).toContain('no canción larga');
    expect(prompt).toContain('No superar 30 segundos');
  });

  test('fraseo compacto y cierre final publicitario', async () => {
    const prompt = await audioPrompt();

    expect(prompt).toContain('Dicción clara pero compacta');
    expect(prompt).toContain('Fraseo unido, natural y fluido');
    expect(prompt).toContain('No hacer pausas largas entre palabras');
    expect(prompt).toContain('No separar exageradamente nombres, instituciones, profesionales, programas, campañas ni prestaciones');
    expect(prompt).toContain('No estirar palabras importantes');
    expect(prompt).toContain('No alargar vocales finales');
    expect(prompt).toContain('énfasis publicitario breve y recordable');
    expect(prompt).toContain('No agregar palabras nuevas');
    expect(prompt).toContain('No hacer cierre hablado');
    expect(prompt).toContain('No alargar el cierre');
  });

  test('texto exacto restrictivo limita lo que se canta', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleContentMode: 'Texto exacto opcional',
        jingleBaseIdea: 'Centro Médico Rincón. Cuidamos tu salud, acompañamos tu vida.',
        jingleDuration: '15 segundos'
      }
    });

    expect(prompt).toContain('Cantá únicamente el texto indicado');
    expect(prompt).toContain('No agregues otras frases');
    expect(prompt).toContain('No cantar ninguna otra frase');
    expect(prompt).toContain('No inventar palabras');
    expect(prompt).toContain('No usar idioma inventado');
    expect(prompt).toContain('Duración objetivo: 30 segundos');
    expect(prompt).toContain('No superar 30 segundos');
    expect(prompt).toContain('Centro Médico Rincón. Cuidamos tu salud, acompañamos tu vida.');
  });

  test('pronunciación acotada solo usa el texto cantado', async () => {
    const prompt = await audioPrompt();

    expect(prompt).toContain('Centro Médico Rincón');
    expect(prompt).toContain('Cuidamos tu salud, acompañamos tu vida');
    expect(prompt).toContain('VI-da, no vidá');
    expect(prompt).toContain('Respetar acentos escritos, ñ y sílabas tónicas');
    expect(prompt).not.toContain('Dr. Fernández');
    expect(prompt).not.toContain('Diagnóstico por imágenes');
    expect(prompt).not.toMatch(BROKEN_TEXT_RE);
  });

  test('excluye datos administrativos cantados por defecto', async () => {
    const prompt = await audioPrompt();

    expect(prompt).not.toContain('WhatsApp');
    expect(prompt).not.toContain('Instagram');
    expect(prompt).not.toContain('Facebook');
    expect(prompt).not.toContain('El usuario habilitó cantar datos administrativos');
  });

  test('permite solo los datos administrativos seleccionados', async () => {
    const prompt = await audioPrompt({
      clinic: {
        socialLinks: [
          { type: 'Instagram', value: '@centromedicorincon' },
          { type: 'Facebook', value: 'Centro Médico Rincón' }
        ]
      },
      promptOptions: {
        jingleAllowAdministrativeData: true,
        jingleAdministrativeDataAllowed: 'WhatsApp'
      }
    });

    expect(prompt).toContain('WhatsApp');
    expect(prompt).not.toContain('Instagram');
    expect(prompt).not.toContain('Facebook');
    expect(prompt).not.toContain('Email');
    expect(prompt).not.toContain('Dirección');
    expect(prompt).not.toContain('Horarios');
    expect(prompt).toContain('No superar 30 segundos');
    expect(prompt).toContain('No agregar otros datos administrativos');
  });

  test('texto exacto con WhatsApp no genera reglas contradictorias', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleContentMode: 'Texto exacto opcional',
        jingleBaseIdea: EXACT_WHATSAPP_TEXT
      }
    });

    expect(prompt).toContain(EXACT_WHATSAPP_TEXT);
    expect(prompt).not.toContain('No mencionar mensajería');
    expect(prompt).not.toContain('No mencionar WhatsApp');
    expect(prompt).toContain('El texto exacto incluye WhatsApp');
    expect(prompt).toContain('No agregar otros datos administrativos fuera del texto exacto');
    expect(prompt).not.toContain('Instagram');
    expect(prompt).not.toContain('Facebook');
  });

  test('números escritos en palabras se conservan exactamente', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleContentMode: 'Texto exacto opcional',
        jingleBaseIdea: EXACT_WHATSAPP_TEXT
      }
    });

    expect(prompt).toContain('tres cuatro dos, cuatro cuatro nueve, siete dos ocho uno');
    expect(prompt).not.toContain('3424497281');
    expect(prompt).toContain('Si hay números escritos en palabras, cantarlos exactamente como están escritos.');
  });

  test('spot narrado entrega paquete de producción y no prompt Gemini Audio', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleAudioType: 'Spot narrado con música de fondo',
        jingleContentMode: 'Texto exacto opcional',
        jingleBaseIdea: 'En Centro Médico Rincón te acompañamos con atención cercana y profesional.'
      }
    });

    expect(prompt).toContain('GUION PARA VOZ:');
    expect(prompt).toContain('VOZ SUGERIDA:');
    expect(prompt).toContain('MUSICA DE FONDO:');
    expect(prompt).toContain('MEZCLA:');
    expect(prompt).toContain('HERRAMIENTAS SUGERIDAS:');
    expect(prompt).toContain('CHECKLIST DE PRODUCCION:');
    expect(prompt).toContain('Generar voz con una herramienta TTS natural.');
    expect(prompt).toContain('Mezclar con Clipchamp, Audacity u otro editor simple.');
    expect(prompt).toContain('No cantar.');
    expect(prompt).toContain('Duración final recomendada: 30 segundos.');
    expect(prompt).toContain('En Centro Médico Rincón te acompañamos con atención cercana y profesional.');
    expect(prompt).not.toContain('Gemini Audio');
    expect(prompt).not.toContain('TEXTO A CANTAR:');
    expect(prompt).not.toContain('spot publicitario musical breve');
  });

  test('spot narrado respeta texto exacto con WhatsApp sin contradicciones', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleAudioType: 'Spot narrado con música de fondo',
        jingleContentMode: 'Texto exacto opcional',
        jingleBaseIdea: EXACT_WHATSAPP_TEXT
      }
    });

    expect(prompt).toContain(EXACT_WHATSAPP_TEXT);
    expect(prompt).toContain('Respetar exactamente el guion para voz.');
    expect(prompt).toContain('El texto exacto incluye WhatsApp');
    expect(prompt).toContain('Si hay números escritos en palabras, leerlos exactamente como están escritos.');
    expect(prompt).not.toContain('No mencionar mensajería');
    expect(prompt).not.toContain('No mencionar WhatsApp');
    expect(prompt).not.toContain('Instagram');
    expect(prompt).not.toContain('Facebook');
    expect(prompt).not.toContain('Dirección');
  });

  test('estilo Infantil puro controla instrumentación y tono', async () => {
    const prompt = await audioPrompt({
      promptOptions: { jingleStyle: 'Infantil puro' }
    });

    expect(prompt).toContain('infantil puro, alegre, dulce, luminoso');
    expect(prompt).toContain('Instrumentación infantil');
    expect(prompt).toContain('campanillas suaves');
    expect(prompt).toContain('No usar voces exageradas ni caricaturescas');
    expect(prompt).toContain('Mantener tono apto para salud');
  });

  test('voces infantiles se piden explícitamente sin prometer garantía', async () => {
    const prompt = await audioPrompt({
      promptOptions: { jingleVoices: 'Voces infantiles' }
    });

    expect(prompt).toContain('La voz principal cantada debe ser de niñas o niños');
    expect(prompt).toContain('No usar voz adulta como voz principal');
    expect(prompt).toContain('No usar voz femenina adulta');
    expect(prompt).toContain('No usar voz masculina adulta');
    expect(prompt).toContain('No usar locutor adulto');
    expect(prompt).toContain('Si no se logra voz infantil clara');
  });

  test('instrumental prohíbe voz, letra y texto hablado', async () => {
    const prompt = await audioPrompt({
      promptOptions: {
        jingleAudioType: 'Instrumental / música de fondo',
        jingleVoices: 'Instrumental',
        jingleContentMode: 'Instrumental',
        jingleWithLyrics: false,
        jingleDuration: '20 segundos'
      }
    });

    expect(prompt).toContain('Generar música instrumental de fondo');
    expect(prompt).toContain('Tipo: instrumental / música de fondo.');
    expect(prompt).toContain('No texto a cantar.');
    expect(prompt).toContain('No locución.');
    expect(prompt).toContain('No voces.');
    expect(prompt).toContain('No coros.');
    expect(prompt).toContain('No palabras.');
    expect(prompt).toContain('No tarareo.');
    expect(prompt).toContain('No vocalizaciones.');
    expect(prompt).toContain('Duración objetivo: 30 segundos');
    expect(prompt).toContain('No superar 30 segundos');
    expect(prompt).not.toContain('GUION PARA VOZ:');
    expect(prompt).not.toContain('TEXTO A CANTAR:');
  });

  test('mantiene generación básica de prompts no musicales', async () => {
    const { buildPrompt, createDefaultState, PIECE_TYPES } = await loadModules();
    const state = createDefaultState();
    state.promptOptions.pieceType = PIECE_TYPES.professionalFlyer;
    state.clinic.name = 'Centro Médico Rincón';

    const prompt = buildPrompt(state);

    expect(prompt).toContain('SALIDA ESPERADA');
    expect(prompt).toContain('DATOS DE LA INSTITUCIÓN');
    expect(prompt).not.toContain('Generar una única pista de audio final');
  });
});
