import { colorPresets } from './data/designPresets.js';
import { specialties } from './data/specialties.js';
import { buildPrompt } from './prompt/promptBuilder.js';
import { createDefaultState } from './state/defaultState.js';
import { ATTACHMENT_ROLES, PIECE_TYPES } from './state/schema.js';
import { migrateState } from './state/migrations.js';
import { clearState, loadState, loadTemplate, saveState, saveTemplate } from './state/storage.js';
import { renderForm } from './ui/formRenderer.js';
import { renderPreview, renderResult } from './ui/previewRenderer.js';
import { validateState } from './ui/validation.js';

let state = loadState();
let currentStep = '';
const pieceWorkflows = {
  [PIECE_TYPES.professionalFlyer]: ['clinica', 'medico', 'prestaciones', 'atencion', 'diseno', 'imagenes', 'observaciones', 'resultado'],
  [PIECE_TYPES.clinicalInfographic]: ['clinica', 'prestaciones', 'diseno', 'imagenes', 'observaciones', 'resultado'],
  [PIECE_TYPES.informativeFlyer]: ['clinica', 'prestaciones', 'atencion', 'diseno', 'imagenes', 'observaciones', 'resultado'],
  [PIECE_TYPES.promotionCampaign]: ['clinica', 'prestaciones', 'atencion', 'diseno', 'imagenes', 'observaciones', 'resultado']
};

const resultStep = 'resultado';


const handlers = {
  onFieldChange(path, value) {
    setByPath(state, path, value);
    if (path === 'specialty.primaryProfessionalSpecialty') applySpecialtyPreset(value);
    if (path === 'design.primaryColor') applyPrimaryColorPreset(value);
    if (path === 'promptOptions.pieceType') currentStep = firstStepForPiece(value);
    update(shouldRenderForm(path));
  },
  onRemoveService(index) {
    state.services.visibleServices.splice(index, 1);
    update(true);
  },
  onAddContextService(value) {
    const normalized = value.trim();
    if (!normalized) return;
    state.services.contextServices.push(normalized);
    update(true);
  },
  onRemoveContextService(index) {
    state.services.contextServices.splice(index, 1);
    update(true);
  },
  onAddAdditionalSpecialty(value) {
    if (value && value !== state.specialty.primaryProfessionalSpecialty && !state.specialty.additionalSpecialties.includes(value)) {
      state.specialty.additionalSpecialties.push(value);
      update(true);
    }
  },
  onRemoveAdditionalSpecialty(index) {
    state.specialty.additionalSpecialties.splice(index, 1);
    update(true);
  },
  onAddSocialLink() {
    state.clinic.socialLinks.push({ id: `social_${Date.now()}`, type: 'Instagram', value: '' });
    update(true);
  },
  onRemoveSocialLink(index) {
    state.clinic.socialLinks.splice(index, 1);
    update(true);
  },
  onUpdateSocialLink(index, key, value) {
    state.clinic.socialLinks[index][key] = value;
    update(false);
  },
  onAddSchedule() {
    state.schedule.items.push({ id: `schedule_${Date.now()}`, days: '', from: '', to: '', note: '' });
    update(true);
  },
  onRemoveSchedule(index) {
    state.schedule.items.splice(index, 1);
    update(true);
  },
  onUpdateSchedule(index, key, value) {
    state.schedule.items[index][key] = value;
    update(false);
  },
  onAddAttachment() {
    state.attachments.items.push({
      id: `attachment_${Date.now()}`,
      role: ATTACHMENT_ROLES.other,
      fileName: '',
      mimeType: '',
      status: 'missing',
      instruction: ''
    });
    update(true);
  },
  onRemoveAttachment(index) {
    state.attachments.items.splice(index, 1);
    update(true);
  },
  onUpdateAttachment(index, key, value) {
    if (!state.attachments.items[index]) return;
    if (key === 'file') {
      state.attachments.items[index].fileName = value.fileName;
      state.attachments.items[index].mimeType = value.mimeType;
      state.attachments.items[index].status = value.fileName ? 'selected' : 'missing';
    } else {
      state.attachments.items[index][key] = value;
      if (key === 'fileName') state.attachments.items[index].status = value ? 'selected' : 'missing';
    }
    update(key === 'role' || key === 'file');
  }
};

bindStaticActions();
update(true);

function update(renderFields = false) {
  const validation = validateState(state);
  const prompt = buildPrompt(state);
  if (renderFields) renderForm(state, handlers);
  renderPreview(state, validation);
  renderResult(prompt, validation, state);
  markRecommendedFields(validation);
  applyTheme();
  if (!document.body.classList.contains('is-home')) showStep(currentStep || firstStepForPiece(state.promptOptions.pieceType));
  saveState(state);
}

function bindStaticActions() {
  document.querySelectorAll('[data-piece-start]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      startNewPiece(button.dataset.pieceStart);
    });
  });

  document.querySelectorAll('[data-demo-piece]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      loadDemoData(button.dataset.demoPiece);
    });
  });

  document.querySelector('#continueCurrentButton')?.addEventListener('click', () => startPieceFlow(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer, false));
  document.querySelector('#backHomeButton')?.addEventListener('click', showHome);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-wizard-action]');
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.wizardAction;
    if (action === 'previous') previousStep();
    if (action === 'home') showHome();
    if (action === 'result') showStep(resultStep);
    if (action === 'next') nextStep();
  });

  document.querySelector('#addServiceButton').addEventListener('click', addService);
  document.querySelector('#newService').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addService();
    }
  });

  document.querySelectorAll('[data-step-target]').forEach(button => {
    button.addEventListener('click', () => showStep(button.dataset.stepTarget));
  });

  document.querySelector('#copyPromptButton').addEventListener('click', copyPrompt);
  document.querySelector('#copyAttachmentsButton').addEventListener('click', copyAttachmentsChecklist);
  document.querySelector('#loadDemoButton')?.addEventListener('click', () => loadDemoData(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer));
  document.querySelector('#downloadPromptButton').addEventListener('click', downloadPrompt);
  document.querySelector('#saveTemplateButton').addEventListener('click', () => {
    saveTemplate(state);
    showStatus('Plantilla guardada en este navegador.');
  });
  document.querySelector('#loadTemplateButton').addEventListener('click', () => {
    const template = loadTemplate();
    if (!template) return showStatus('No hay plantilla guardada.');
    state = template;
    startPieceFlow(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer, false);
    showStatus('Plantilla cargada.');
  });
  document.querySelector('#exportJsonButton').addEventListener('click', exportJson);
  document.querySelector('#importJsonInput').addEventListener('change', importJson);
  document.querySelector('#clearButton').addEventListener('click', () => {
    if (!confirm('Limpiar el formulario actual?')) return;
    clearState();
    state = createDefaultState();
    currentStep = firstStepForPiece(state.promptOptions.pieceType);
    update(true);
    showHome();
    showStatus('Formulario limpio.');
  });
}

function loadDemoData(pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer) {
  state = createDemoState(pieceType);
  currentStep = firstStepForPiece(state.promptOptions.pieceType);
  startPieceFlow(state.promptOptions.pieceType, false);
  showStatus(`Ejemplo cargado: ${labelPieceType(state.promptOptions.pieceType)}.`);
}

function createDemoState(pieceType = PIECE_TYPES.professionalFlyer) {
  const demo = createDefaultState();
  applyCommonDemoClinic(demo);

  switch (pieceType) {
    case PIECE_TYPES.clinicalInfographic:
      applyInfographicDemo(demo);
      break;
    case PIECE_TYPES.informativeFlyer:
      applyInformativeDemo(demo);
      break;
    case PIECE_TYPES.promotionCampaign:
      applyCampaignDemo(demo);
      break;
    default:
      applyProfessionalDemo(demo);
      break;
  }

  return demo;
}

function applyCommonDemoClinic(demo) {
  demo.clinic = {
    ...demo.clinic,
    name: 'Centro Médico Rincón',
    address: 'Av. San Martín 2450, San José del Rincón',
    primaryPhone: '342 555-2488',
    institutionalPhrase: 'Atención médica cercana, profesional y humana',
    showContactData: true,
    socialLinks: [
      { id: 'social_demo_instagram', type: 'Instagram', value: '@centromedicorincon' },
      { id: 'social_demo_whatsapp', type: 'WhatsApp', value: '342 555-2488' }
    ]
  };
}

function applyProfessionalDemo(demo) {
  demo.professional = {
    ...demo.professional,
    title: 'Dra.',
    fullName: 'Mariana López',
    license: 'MP 12345',
    roleNote: 'Clínica médica y diabetología',
    showPhoto: true
  };

  demo.specialty = {
    ...demo.specialty,
    primaryProfessionalSpecialty: 'Clínica médica',
    additionalSpecialties: ['Diabetología'],
    communicationFocus: 'Control metabólico y factores de riesgo',
    visibleSpecialtyText: 'Clínica médica y diabetología'
  };

  demo.services = {
    ...demo.services,
    mainHighlightedService: 'Atención clínica integral y control metabólico',
    visibleServices: [
      'Control clínico general',
      'Control de diabetes',
      'Control de hipertensión arterial',
      'Evaluación de riesgo cardiovascular',
      'Seguimiento de enfermedades crónicas'
    ],
    contextServices: [
      'Interpretación de estudios de laboratorio',
      'Educación sobre hábitos saludables',
      'Prevención de complicaciones metabólicas'
    ],
    allowServiceExpansion: true,
    expansionInstructions: 'Podés agregar solo actividades generales y razonables de consultorio clínico vinculadas con diabetes, hipertensión y control metabólico. No inventes procedimientos complejos ni prácticas no informadas.'
  };

  demo.schedule = {
    ...demo.schedule,
    items: [
      { id: 'schedule_demo_tuesday', days: 'Martes', from: '16:30', to: '18:30', note: 'Atención con turno previo' },
      { id: 'schedule_demo_thursday', days: 'Jueves', from: '09:00', to: '12:00', note: 'Consultorio clínico' }
    ],
    requiresAppointment: true,
    appointmentText: 'Solicitar turno por WhatsApp',
    modality: 'presencial',
    administrativeNote: 'Agenda sujeta a disponibilidad semanal'
  };

  demo.coverage = { ...demo.coverage, insurance: true, privatePatients: true };

  demo.design = {
    ...demo.design,
    format: 'Historia Instagram 1080x1920',
    primaryColor: 'lila',
    secondaryColor: 'lavanda',
    visualStyle: 'moderno',
    typography: 'moderna sans serif',
    visualImpact: 'medio',
    includeMedicalIcons: true,
    includeThematicBackground: true,
    useAutomaticTheme: true,
    usePinnedConversationStyle: true,
    contentDensity: 'balanced'
  };

  demo.attachments = {
    ...demo.attachments,
    items: [
      {
        id: 'attachment_demo_logo',
        role: ATTACHMENT_ROLES.clinicLogo,
        fileName: 'logo-centro-medico-rincon.png',
        mimeType: 'image/png',
        status: 'selected',
        instruction: 'Usar como logo institucional, respetando proporciones.'
      },
      {
        id: 'attachment_demo_photo',
        role: ATTACHMENT_ROLES.professionalPhoto,
        fileName: 'dra-mariana-lopez.jpg',
        mimeType: 'image/jpeg',
        status: 'selected',
        instruction: 'Integrar como foto profesional sin deformar rostro ni alterar identidad.'
      }
    ]
  };

  demo.promptOptions = {
    ...demo.promptOptions,
    pieceType: PIECE_TYPES.professionalFlyer,
    contentGoal: 'Anunciar la atención de una profesional con foco en control metabólico y factores de riesgo.',
    targetAudience: 'Pacientes adultos que necesitan control clínico, diabetes, hipertensión o seguimiento metabólico.',
    mainMessage: 'Control clínico y metabólico integral, con turnos disponibles.',
    campaignCallToAction: 'Solicitar turno por WhatsApp',
    legalEthicalNote: 'La información del flyer no reemplaza la consulta médica.',
    allowVisualCreativity: true,
    visualCreativityLevel: 'moderada',
    suggestedPhrase: 'Cuidá tu salud, controlá tus factores de riesgo',
    forbiddenPhrases: 'No usar frases alarmistas ni promesas de curación',
    highlightData: 'Nombre de la médica, clínica médica y diabetología, días y horarios de atención, WhatsApp para turnos',
    smallData: 'Matrícula, dirección y redes sociales',
    freeInstructions: 'Crear un flyer sobrio, moderno y claro, sin sobrecargar.'
  };
}

function applyInfographicDemo(demo) {
  demo.professional = { ...demo.professional, title: '', fullName: '', license: '', roleNote: '', showPhoto: false };
  demo.specialty = {
    ...demo.specialty,
    primaryProfessionalSpecialty: 'Clínica médica',
    additionalSpecialties: ['Cardiología'],
    communicationFocus: 'Prevención cardiovascular',
    visibleSpecialtyText: 'Prevención cardiovascular'
  };
  demo.services = {
    ...demo.services,
    mainHighlightedService: '',
    visibleServices: [],
    contextServices: ['Hipertensión arterial', 'Riesgo cardiovascular', 'Control médico periódico', 'Hábitos saludables'],
    allowServiceExpansion: false,
    expansionInstructions: ''
  };
  demo.schedule = { ...demo.schedule, items: [], requiresAppointment: false, appointmentText: '', modality: 'presencial', administrativeNote: '' };
  demo.coverage = { ...demo.coverage, insurance: false, privatePatients: false };
  demo.design = {
    ...demo.design,
    format: 'Historia Instagram 1080x1920',
    primaryColor: 'azul',
    secondaryColor: 'celeste',
    customPrimaryColor: 'Azul profundo',
    customSecondaryColor: 'Celeste claro',
    visualStyle: 'educativo, limpio, infografico, institucional',
    typography: 'moderna sans serif',
    visualImpact: 'medio',
    includeMedicalIcons: true,
    includeThematicBackground: true,
    useAutomaticTheme: true,
    usePinnedConversationStyle: false,
    contentDensity: 'balanced'
  };
  demo.attachments = { ...demo.attachments, items: [] };
  demo.promptOptions = {
    ...demo.promptOptions,
    pieceType: PIECE_TYPES.clinicalInfographic,
    contentGoal: 'Crear una infografía simple para explicar cuándo controlar la presión arterial y por qué es importante.',
    targetAudience: 'Adultos de la comunidad, especialmente personas con antecedentes de hipertensión, diabetes o riesgo cardiovascular.',
    educationalTopic: 'Control de presión arterial y prevención cardiovascular',
    mainMessage: 'Controlar la presión arterial ayuda a prevenir complicaciones y consultar a tiempo.',
    infoBlocksText: '1. ¿Qué es la presión arterial?\n2. ¿Cuándo conviene controlarla?\n3. Señales para consultar.\n4. Hábitos que ayudan.\n5. Recordatorio: el control médico orienta el tratamiento.',
    legalEthicalNote: 'Contenido informativo. No reemplaza la consulta médica ni indica tratamiento.',
    allowVisualCreativity: true,
    visualCreativityLevel: 'moderada',
    suggestedPhrase: 'Controlar tu presión también es cuidar tu corazón',
    forbiddenPhrases: 'No usar frases alarmistas ni indicar medicación.',
    highlightData: 'Tema educativo, mensaje principal, consulta médica y WhatsApp',
    smallData: 'Dirección, redes sociales y aclaración sanitaria',
    freeInstructions: 'Diseño tipo infografía con bloques claros, íconos simples y poco texto por bloque.'
  };
}

function applyInformativeDemo(demo) {
  demo.professional = { ...demo.professional, title: '', fullName: '', license: '', roleNote: '', showPhoto: false };
  demo.specialty = {
    ...demo.specialty,
    primaryProfessionalSpecialty: 'Nutrición',
    additionalSpecialties: ['Clínica médica'],
    communicationFocus: 'Análisis de composición corporal',
    visibleSpecialtyText: 'Análisis de composición corporal'
  };
  demo.services = {
    ...demo.services,
    mainHighlightedService: 'Evaluación con balanza InBody',
    visibleServices: ['Medición de masa muscular', 'Estimación de grasa corporal', 'Análisis de agua corporal', 'Seguimiento de evolución'],
    contextServices: ['Evaluación nutricional', 'Control metabólico', 'Seguimiento de hábitos saludables'],
    allowServiceExpansion: false,
    expansionInstructions: ''
  };
  demo.schedule = {
    ...demo.schedule,
    items: [
      { id: 'inbody_lunes', days: 'Lunes', from: '08:00', to: '12:00', note: 'Con turno' },
      { id: 'inbody_jueves', days: 'Jueves', from: '16:00', to: '19:00', note: 'Consultas programadas' }
    ],
    requiresAppointment: true,
    appointmentText: 'Reservá tu turno por WhatsApp',
    modality: 'presencial',
    administrativeNote: 'Consultar requisitos previos al estudio'
  };
  demo.coverage = { ...demo.coverage, insurance: false, privatePatients: true };
  demo.design = {
    ...demo.design,
    format: 'Post vertical Instagram 1080x1350',
    primaryColor: 'verde',
    secondaryColor: 'grisClaro',
    customPrimaryColor: 'Verde esmeralda',
    customSecondaryColor: 'Blanco cálido',
    visualStyle: 'moderno, tecnológico, claro y saludable',
    typography: 'redondeada amigable',
    visualImpact: 'alto',
    includeMedicalIcons: true,
    includeThematicBackground: true,
    useAutomaticTheme: true,
    usePinnedConversationStyle: false,
    contentDensity: 'brief'
  };
  demo.attachments = { ...demo.attachments, items: [] };
  demo.promptOptions = {
    ...demo.promptOptions,
    pieceType: PIECE_TYPES.informativeFlyer,
    contentGoal: 'Crear un flyer informativo para explicar de forma rápida para qué sirve el análisis de composición corporal.',
    targetAudience: 'Pacientes que quieren mejorar hábitos, controlar peso, masa muscular o seguimiento nutricional.',
    educationalTopic: 'Uso del análisis de composición corporal con balanza InBody',
    mainMessage: 'Conocer tu composición corporal permite orientar mejor tus objetivos de salud y seguimiento.',
    infoBlocksText: '1. No es solo peso.\n2. Estima músculo, grasa y agua corporal.\n3. Ayuda a seguir cambios en el tiempo.\n4. Debe interpretarse junto a un profesional.',
    campaignCallToAction: 'Reservá tu turno por WhatsApp',
    legalEthicalNote: 'El resultado debe ser interpretado por profesionales. No reemplaza evaluación médica o nutricional.',
    allowVisualCreativity: true,
    visualCreativityLevel: 'moderada',
    suggestedPhrase: 'No es solo peso: conocé tu composición corporal',
    forbiddenPhrases: 'No prometer descenso de peso ni resultados garantizados.',
    highlightData: 'Análisis de composición corporal, InBody, turno por WhatsApp',
    smallData: 'Dirección, redes, requisitos y nota profesional',
    freeInstructions: 'Hacerlo claro, con poco texto, lectura rápida y estética tecnológica/saludable.'
  };
}

function applyCampaignDemo(demo) {
  demo.professional = { ...demo.professional, title: 'Equipo', fullName: 'Centro Médico Rincón', license: '', roleNote: 'Equipo médico', showPhoto: false };
  demo.specialty = {
    ...demo.specialty,
    primaryProfessionalSpecialty: 'Clínica médica',
    additionalSpecialties: ['Cardiología', 'Nutrición'],
    communicationFocus: 'Semana de controles preventivos',
    visibleSpecialtyText: 'Controles preventivos'
  };
  demo.services = {
    ...demo.services,
    mainHighlightedService: 'Semana de control clínico y cardiovascular',
    visibleServices: ['Control de presión arterial', 'Evaluación clínica', 'Orientación sobre factores de riesgo', 'Turnos para control preventivo'],
    contextServices: ['Prevención', 'Hábitos saludables', 'Riesgo cardiovascular', 'Control anual'],
    allowServiceExpansion: false,
    expansionInstructions: ''
  };
  demo.schedule = {
    ...demo.schedule,
    items: [
      { id: 'camp_martes', days: 'Martes', from: '09:00', to: '13:00', note: 'Cupos limitados' },
      { id: 'camp_viernes', days: 'Viernes', from: '15:00', to: '19:00', note: 'Con turno previo' }
    ],
    requiresAppointment: true,
    appointmentText: 'Solicitá tu turno por WhatsApp',
    modality: 'presencial',
    administrativeNote: 'Cupos limitados por agenda'
  };
  demo.coverage = { ...demo.coverage, insurance: true, privatePatients: true };
  demo.design = {
    ...demo.design,
    format: 'Historia Instagram 1080x1920',
    primaryColor: 'rojo',
    secondaryColor: 'beige',
    customPrimaryColor: 'Rojo coral',
    customSecondaryColor: 'Crema',
    visualStyle: 'promocional, directo, moderno, cálido y de alto impacto',
    typography: 'moderna sans serif',
    visualImpact: 'alto',
    includeMedicalIcons: true,
    includeThematicBackground: true,
    useAutomaticTheme: true,
    usePinnedConversationStyle: false,
    contentDensity: 'balanced'
  };
  demo.attachments = { ...demo.attachments, items: [] };
  demo.promptOptions = {
    ...demo.promptOptions,
    pieceType: PIECE_TYPES.promotionCampaign,
    contentGoal: 'Crear una pieza promocional institucional para comunicar agenda de controles preventivos.',
    targetAudience: 'Pacientes adultos que necesitan control preventivo o seguimiento de factores de riesgo.',
    mainMessage: 'Agenda abierta para controles preventivos con cupos limitados.',
    campaignType: 'Agenda abierta / campaña preventiva',
    campaignValidity: 'Semana del 15 al 19 de julio',
    campaignConditions: 'Cupos limitados. Atención con turno previo. La disponibilidad depende de agenda.',
    campaignCallToAction: 'Solicitá tu turno por WhatsApp',
    legalEthicalNote: 'No prometer resultados ni diagnóstico inmediato. La atención queda sujeta a evaluación profesional.',
    allowVisualCreativity: true,
    visualCreativityLevel: 'amplia',
    suggestedPhrase: 'Agenda abierta para cuidar tu salud',
    forbiddenPhrases: 'No usar descuentos, promociones engañosas ni promesas de resultados.',
    highlightData: 'Agenda abierta, semana de control, cupos limitados, WhatsApp',
    smallData: 'Dirección, redes sociales y aclaración de disponibilidad',
    freeInstructions: 'Diseño llamativo, claro, con CTA fuerte, sin parecer publicidad agresiva.'
  };
}

function addService() {
  const input = document.querySelector('#newService');
  const value = input.value.trim();
  if (!value) return;
  state.services.visibleServices.push(value);
  input.value = '';
  update(true);
}

function applySpecialtyPreset(name) {
  const preset = specialties.find(item => item.name === name);
  if (!preset) return;
  state.specialty.primaryProfessionalSpecialty = name;
  if (!state.services.visibleServices.length) state.services.visibleServices = [...preset.services];
  if (!state.services.mainHighlightedService && preset.services[0]) state.services.mainHighlightedService = preset.services[0];
}

function applyPrimaryColorPreset(key) {
  const preset = colorPresets[key] || colorPresets.lila;
  if (!state.design.secondaryColor || isLegacyColorValue(state.design.secondaryColor)) {
    state.design.secondaryColor = preset.label === 'Blanco' ? 'grisClaro' : 'lavanda';
  }
}

function applyTheme() {
  // La interfaz usa el selector global de tema. No sobrescribir variables desde el diseño del flyer.
}



function setupThemeSelector() {
  const colorSelector = document.querySelector('#themeColorSelector');
  const modeToggle = document.querySelector('#themeModeToggle');

  const savedColor = localStorage.getItem('fcpb-ui-theme-color') || 'violet';
  const savedMode = localStorage.getItem('fcpb-ui-theme-mode') || 'light';

  applyInterfaceTheme(savedColor, savedMode);

  if (colorSelector) {
    colorSelector.value = savedColor;
    colorSelector.addEventListener('change', () => {
      const color = colorSelector.value || 'violet';
      const mode = localStorage.getItem('fcpb-ui-theme-mode') || 'light';
      applyInterfaceTheme(color, mode);
      localStorage.setItem('fcpb-ui-theme-color', color);
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      const currentMode = localStorage.getItem('fcpb-ui-theme-mode') || 'light';
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';
      const color = colorSelector?.value || localStorage.getItem('fcpb-ui-theme-color') || 'violet';
      applyInterfaceTheme(color, nextMode);
      localStorage.setItem('fcpb-ui-theme-color', color);
      localStorage.setItem('fcpb-ui-theme-mode', nextMode);
    });
  }
}

function applyInterfaceTheme(color = 'violet', mode = 'light') {
  const normalizedColor = ['violet', 'blue', 'green', 'orange', 'red', 'pink'].includes(color) ? color : 'violet';
  const normalizedMode = mode === 'dark' ? 'dark' : 'light';
  document.body.dataset.theme = `${normalizedColor}-${normalizedMode}`;

  const modeToggle = document.querySelector('#themeModeToggle');
  if (modeToggle) {
    modeToggle.textContent = normalizedMode === 'dark' ? '☀️' : '🌙';
    modeToggle.setAttribute('aria-label', normalizedMode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    modeToggle.title = normalizedMode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }
}


function startNewPiece(pieceType = PIECE_TYPES.professionalFlyer) {
  state = createDefaultState();
  state.promptOptions.pieceType = pieceType || PIECE_TYPES.professionalFlyer;
  currentStep = firstStepForPiece(state.promptOptions.pieceType);
  startPieceFlow(state.promptOptions.pieceType, false);
}

function startPieceFlow(pieceType, resetCurrentStep = true) {
  state.promptOptions.pieceType = pieceType || PIECE_TYPES.professionalFlyer;
  document.body.classList.remove('is-home');
  document.body.dataset.pieceType = state.promptOptions.pieceType;
  if (resetCurrentStep || !currentStep) currentStep = firstStepForPiece(state.promptOptions.pieceType);
  update(true);
  showStep(currentStep);
  document.querySelector('.app-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showStatus(`${labelPieceType(state.promptOptions.pieceType)} iniciado.`);
}

function showHome() {
  document.body.classList.add('is-home');
  document.querySelector('#pieceHome')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showStatus('Inicio.');
}

function showStep(step) {
  const steps = availableSteps();
  const resolvedStep = steps.includes(step) ? step : steps[0];
  currentStep = resolvedStep;

  document.querySelectorAll('.form-section').forEach(section => {
    const isCurrent = section.dataset.step === resolvedStep;
    section.classList.toggle('is-current', isCurrent);
  });

  document.querySelectorAll('.step-button').forEach(button => {
    const isAvailable = steps.includes(button.dataset.stepTarget);
    button.hidden = !isAvailable;
    button.classList.toggle('is-active', button.dataset.stepTarget === resolvedStep);
  });

  updateWorkflowChrome();
}

function nextStep() {
  const steps = availableSteps();
  const index = steps.indexOf(currentStep);
  if (index >= steps.length - 1) return;
  const next = steps[Math.min(index + 1, steps.length - 1)] || steps[0];
  showStep(next);
}

function previousStep() {
  const steps = availableSteps();
  const index = steps.indexOf(currentStep);
  const previous = steps[Math.max(index - 1, 0)] || steps[0];
  showStep(previous);
}

function firstStepForPiece(pieceType) {
  return (pieceWorkflows[pieceType] || pieceWorkflows[PIECE_TYPES.professionalFlyer])[0];
}

function availableSteps() {
  return pieceWorkflows[state.promptOptions.pieceType] || pieceWorkflows[PIECE_TYPES.professionalFlyer];
}

function updateWorkflowChrome() {
  const steps = availableSteps();
  const index = Math.max(steps.indexOf(currentStep), 0);
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  const title = document.querySelector('#workflowTitle');
  const subtitle = document.querySelector('#workflowSubtitle');
  const previousButtons = document.querySelectorAll('[data-wizard-action="previous"], #prevStepButton');
  const nextButtons = document.querySelectorAll('[data-wizard-action="next"], #nextStepButton');
  const resultButtons = document.querySelectorAll('[data-wizard-action="result"], #resultStepButton');

  document.body.dataset.pieceType = pieceType;

  if (title) title.textContent = labelPieceType(pieceType);
  if (subtitle) subtitle.textContent = `Paso ${index + 1} de ${steps.length}: ${labelStepForPiece(currentStep, pieceType)}`;
  previousButtons.forEach(button => {
    button.disabled = index <= 0;
  });
  nextButtons.forEach(button => {
    button.disabled = index >= steps.length - 1;
    button.textContent = index >= steps.length - 2 ? 'Ver resultado →' : 'Siguiente →';
  });
  resultButtons.forEach(button => {
    button.hidden = currentStep === resultStep;
  });

  updateSectionHeadings(pieceType);
  updateActionLabels(pieceType);
}

async function copyPrompt() {
  const prompt = document.querySelector('#promptOutput').value;
  try {
    await navigator.clipboard.writeText(prompt);
    showStatus('Prompt copiado.');
  } catch {
    document.querySelector('#promptOutput').select();
    document.execCommand('copy');
    showStatus('Prompt copiado.');
  }
}

async function copyAttachmentsChecklist() {
  const text = buildAttachmentsChecklistText();
  try {
    await navigator.clipboard.writeText(text);
    showStatus('Checklist de adjuntos copiado.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showStatus('Checklist de adjuntos copiado.');
  }
}

function downloadPrompt() {
  downloadFile('prompt-flyer-clinico.txt', document.querySelector('#promptOutput').value, 'text/plain');
}

function exportJson() {
  downloadFile('flyer-clinico-config.json', JSON.stringify(state, null, 2), 'application/json');
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = migrateState(JSON.parse(reader.result));
      currentStep = firstStepForPiece(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer);
      startPieceFlow(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer, false);
      showStatus('Configuracion importada.');
    } catch {
      showStatus('No se pudo importar el JSON.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function markRecommendedFields(validation) {
  document.querySelectorAll('.field, .repeatable-row').forEach(field => field.classList.remove('has-warning'));
  validation.fieldPaths.map(mapLegacyWarningPath).forEach(markPath);
}

function markPath(path) {
  const input = document.querySelector(`[data-path="${path}"]`);
  const row = document.querySelector(`[data-warning-path="${path}"]`);
  input?.closest('.field')?.classList.add('has-warning');
  row?.classList.add('has-warning');
}

function shouldRenderForm(path) {
  return path === 'promptOptions.pieceType'
    || path === 'specialty.primaryProfessionalSpecialty'
    || path === 'services.allowServiceExpansion'
    || path === 'design.primaryColor'
    || path === 'design.secondaryColor'
    || path === 'promptOptions.allowVisualCreativity'
    || path.startsWith('attachments.');
}

function mapLegacyWarningPath(path) {
  const exactPaths = {
    'clinic.phone': 'clinic.primaryPhone',
    'doctor.name': 'professional.fullName',
    'services.primarySpecialty': 'specialty.primaryProfessionalSpecialty',
    'services.highlightedArea': 'specialty.communicationFocus',
    'services.featured': 'services.mainHighlightedService',
    'care.modality': 'schedule.modality',
    'design.primaryCustomColor': 'design.customPrimaryColor',
    'design.secondaryCustomColor': 'design.customSecondaryColor'
  };
  if (exactPaths[path]) return exactPaths[path];
  if (path.startsWith('clinic.socialLinks.')) return path;
  if (path.startsWith('care.schedules.')) return path.replace('care.schedules.', 'schedule.items.');
  return path;
}

function buildAttachmentsChecklistText() {
  const files = state.attachments.items
    .filter(item => item.fileName)
    .map(item => [labelAttachmentRole(item.role), item.fileName]);
  if (!files.length) return 'No hay archivos seleccionados para adjuntar antes de pegar el prompt.';
  return ['Antes de pegar el prompt en ChatGPT, adjunta estos archivos:']
    .concat(files.map(([label, value]) => `- ${label}: ${value}`))
    .join('\n');
}

function setByPath(target, path, value) {
  const parts = path.split('.');
  const key = parts.pop();
  const owner = parts.reduce((object, part) => object[part], target);
  owner[key] = value;
}

function labelAttachmentRole(value) {
  return {
    clinicLogo: 'Logo de clinica',
    professionalPhoto: 'Foto profesional',
    referenceFlyer: 'Flyer de referencia',
    thematicImage: 'Imagen tematica',
    other: 'Otro'
  }[value] || value;
}

function isLegacyColorValue(value) {
  return typeof value === 'string' && (value.startsWith('#') || value.includes('rgb('));
}



function updateSectionHeadings(pieceType) {
  const contentTitle = document.querySelector('#prestaciones .section-heading h2');
  const contentDescription = document.querySelector('#prestaciones .section-heading p');
  const careTitle = document.querySelector('#atencion .section-heading h2');
  const careDescription = document.querySelector('#atencion .section-heading p');
  const promptTitle = document.querySelector('#observaciones .section-heading h2');
  const promptDescription = document.querySelector('#observaciones .section-heading p');
  const resultTitle = document.querySelector('#resultado .section-heading h2');
  const resultDescription = document.querySelector('#resultado .section-heading p');
  const visibleServicesLabel = document.querySelector('label[for="newService"]');

  const contentLabels = {
    [PIECE_TYPES.professionalFlyer]: ['Especialidad y prestaciones', 'Servicios principales, orientación profesional y alcance autorizado.', 'Prestaciones visibles en el flyer'],
    [PIECE_TYPES.clinicalInfographic]: ['Tema y contenido educativo', 'Tema, mensaje principal, bloques informativos y aclaración sanitaria.', 'Puntos o ideas educativas visibles'],
    [PIECE_TYPES.informativeFlyer]: ['Servicio o información a comunicar', 'Servicio, prestación, mensaje principal y datos visibles.', 'Datos o beneficios visibles'],
    [PIECE_TYPES.promotionCampaign]: ['Campaña y mensaje principal', 'Tipo de campaña, mensaje, servicios incluidos y condiciones.', 'Puntos visibles de la campaña']
  };

  const careLabels = {
    [PIECE_TYPES.professionalFlyer]: ['Atención', 'Días, horarios, cobertura y modalidad de atención.'],
    [PIECE_TYPES.clinicalInfographic]: ['Datos opcionales de contacto', 'Podés omitir horarios si la pieza es solo educativa.'],
    [PIECE_TYPES.informativeFlyer]: ['Disponibilidad y contacto', 'Horarios, modalidad o requisitos si aplican al servicio informado.'],
    [PIECE_TYPES.promotionCampaign]: ['Vigencia, cupos y contacto', 'Fechas, condiciones, turnos y llamado a la acción.']
  };

  const [mainTitle, mainDescription, serviceLabel] = contentLabels[pieceType] || contentLabels[PIECE_TYPES.professionalFlyer];
  const [attentionTitle, attentionDescription] = careLabels[pieceType] || careLabels[PIECE_TYPES.professionalFlyer];

  if (contentTitle) contentTitle.textContent = mainTitle;
  if (contentDescription) contentDescription.textContent = mainDescription;
  if (visibleServicesLabel) visibleServicesLabel.textContent = serviceLabel;
  if (careTitle) careTitle.textContent = attentionTitle;
  if (careDescription) careDescription.textContent = attentionDescription;
  if (promptTitle) promptTitle.textContent = 'Ajustes finales del prompt';
  if (promptDescription) promptDescription.textContent = 'Frases, restricciones, creatividad visual y datos a destacar.';
  if (resultTitle) resultTitle.textContent = `Resultado: ${labelPieceType(pieceType)}`;
  if (resultDescription) resultDescription.textContent = 'Prompt completo, checklist, advertencias y acciones finales.';
}

function updateActionLabels(pieceType) {
  const actionTitle = document.querySelector('#primaryActionTitle');
  const secondaryTitle = document.querySelector('#secondaryActionTitle');
  const copyButton = document.querySelector('#copyPromptButton');
  const downloadButton = document.querySelector('#downloadPromptButton');
  const demoButton = document.querySelector('#loadDemoButton');

  const labels = {
    [PIECE_TYPES.professionalFlyer]: ['Acción principal', 'Copiar prompt de flyer', 'Descargar prompt de flyer', 'Cargar ejemplo de flyer'],
    [PIECE_TYPES.clinicalInfographic]: ['Acción principal', 'Copiar prompt de infografía', 'Descargar prompt de infografía', 'Cargar ejemplo de infografía'],
    [PIECE_TYPES.informativeFlyer]: ['Acción principal', 'Copiar prompt informativo', 'Descargar prompt informativo', 'Cargar ejemplo informativo'],
    [PIECE_TYPES.promotionCampaign]: ['Acción principal', 'Copiar prompt de campaña', 'Descargar prompt de campaña', 'Cargar ejemplo de campaña']
  };

  const [, copyLabel, downloadLabel, demoLabel] = labels[pieceType] || labels[PIECE_TYPES.professionalFlyer];

  if (actionTitle) actionTitle.textContent = 'Acción principal';
  if (secondaryTitle) secondaryTitle.textContent = 'Enviar a ChatGPT';
  if (copyButton) copyButton.textContent = copyLabel;
  if (downloadButton) downloadButton.textContent = downloadLabel;
  if (demoButton) demoButton.textContent = demoLabel;
}

function labelStepForPiece(step, pieceType) {
  const labels = {
    [PIECE_TYPES.professionalFlyer]: {
      clinica: 'Clínica',
      medico: 'Profesional',
      prestaciones: 'Especialidad y prestaciones',
      atencion: 'Atención',
      diseno: 'Diseño',
      imagenes: 'Adjuntos',
      observaciones: 'Ajustes finales',
      resultado: 'Resultado'
    },
    [PIECE_TYPES.clinicalInfographic]: {
      clinica: 'Clínica',
      prestaciones: 'Contenido educativo',
      diseno: 'Diseño',
      imagenes: 'Adjuntos',
      observaciones: 'Ajustes finales',
      resultado: 'Resultado'
    },
    [PIECE_TYPES.informativeFlyer]: {
      clinica: 'Clínica',
      prestaciones: 'Información',
      atencion: 'Disponibilidad',
      diseno: 'Diseño',
      imagenes: 'Adjuntos',
      observaciones: 'Ajustes finales',
      resultado: 'Resultado'
    },
    [PIECE_TYPES.promotionCampaign]: {
      clinica: 'Clínica',
      prestaciones: 'Campaña',
      atencion: 'Vigencia y contacto',
      diseno: 'Diseño',
      imagenes: 'Adjuntos',
      observaciones: 'Ajustes finales',
      resultado: 'Resultado'
    }
  };

  return labels[pieceType]?.[step] || labelStep(step);
}

function labelPieceType(value) {
  return {
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografía clínica',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promoción / campaña'
  }[value] || 'Flyer profesional';
}

function labelStep(value) {
  return {
    clinica: 'Clínica',
    medico: 'Profesional',
    prestaciones: 'Contenido',
    atencion: 'Atención',
    diseno: 'Diseño',
    imagenes: 'Adjuntos',
    observaciones: 'Opciones del prompt',
    resultado: 'Resultado final'
  }[value] || value;
}

function showStatus(message) {
  const node = document.querySelector('#statusMessage');
  node.textContent = message;
  window.setTimeout(() => {
    if (node.textContent === message) node.textContent = '';
  }, 3000);
}


/* Etapa 9A.5: fix robusto de selector color + modo claro/oscuro */
(function initThemeControlsRobustly() {
  const COLORS = ['violet', 'blue', 'green', 'orange', 'red', 'pink'];

  function normalizeColor(value) {
    return COLORS.includes(value) ? value : 'violet';
  }

  function normalizeMode(value) {
    return value === 'dark' ? 'dark' : 'light';
  }

  function getStoredColor() {
    return normalizeColor(localStorage.getItem('fcpb-ui-theme-color') || 'violet');
  }

  function getStoredMode() {
    return normalizeMode(localStorage.getItem('fcpb-ui-theme-mode') || 'light');
  }

  function setTheme(color, mode) {
    const safeColor = normalizeColor(color);
    const safeMode = normalizeMode(mode);

    document.body.dataset.theme = `${safeColor}-${safeMode}`;
    localStorage.setItem('fcpb-ui-theme-color', safeColor);
    localStorage.setItem('fcpb-ui-theme-mode', safeMode);

    const colorSelector = document.querySelector('#themeColorSelector');
    const modeToggle = document.querySelector('#themeModeToggle');

    if (colorSelector) colorSelector.value = safeColor;

    if (modeToggle) {
      modeToggle.textContent = safeMode === 'dark' ? '☀️' : '🌙';
      modeToggle.setAttribute('aria-label', safeMode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      modeToggle.setAttribute('title', safeMode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      modeToggle.dataset.mode = safeMode;
    }
  }

  function bindThemeControls() {
    const colorSelector = document.querySelector('#themeColorSelector');
    const modeToggle = document.querySelector('#themeModeToggle');

    setTheme(getStoredColor(), getStoredMode());

    if (colorSelector && !colorSelector.dataset.themeBound) {
      colorSelector.dataset.themeBound = 'true';
      colorSelector.addEventListener('change', () => {
        setTheme(colorSelector.value, getStoredMode());
      });
    }

    if (modeToggle && !modeToggle.dataset.themeBound) {
      modeToggle.dataset.themeBound = 'true';
      modeToggle.addEventListener('click', () => {
        const nextMode = getStoredMode() === 'dark' ? 'light' : 'dark';
        setTheme(getStoredColor(), nextMode);
      });
    }
  }

  bindThemeControls();
  window.addEventListener('DOMContentLoaded', bindThemeControls);
  window.addEventListener('pageshow', bindThemeControls);
})();

