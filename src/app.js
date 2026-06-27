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

const DEFAULT_ATTACHMENT_INSTRUCTION = 'Usar como referencia visual.';

let state = loadState();
let currentStep = '';
const pieceWorkflows = {
  [PIECE_TYPES.professionalFlyer]: ['clinica', 'tipo', 'prestaciones', 'diseno', 'resultado'],
  [PIECE_TYPES.clinicalInfographic]: ['clinica', 'tipo', 'prestaciones', 'diseno', 'resultado'],
  [PIECE_TYPES.informativeFlyer]: ['clinica', 'tipo', 'prestaciones', 'diseno', 'resultado'],
  [PIECE_TYPES.promotionCampaign]: ['clinica', 'tipo', 'prestaciones', 'diseno', 'resultado']
};

const resultStep = 'resultado';
const INSTITUTIONS_KEY = 'flyerClinicoPromptBuilder.institutions';
const INSTITUTION_PHRASES_KEY = 'flyerClinicoPromptBuilder.institutionPhrases';
const MAX_INSTITUTIONS = 10;
const MAX_PHRASES = 10;
let institutionActionsPanelOpen = false;
let institutionManagePointerHandled = false;
let institutionActionPointerHandled = false;
let statusClearTimer = null;
let institutionEditorOpen = false;
let institutionEditorMode = 'create';
const GENERIC_SPECIALTY_WORDS = new Set(['consulta', 'control', 'controles', 'seguimiento', 'evaluacion', 'estudios', 'profesional', 'profesionales', 'prevencion', 'pacientes', 'salud', 'turnos', 'cuidar', 'orientar', 'periodico', 'periodicos', 'informacion', 'cuando', 'habitos']);


const handlers = {
  onFieldChange(path, value) {
    setByPath(state, path, value);
    if (path === 'promptOptions.campaignStartDate' || path === 'promptOptions.campaignEndDate') syncCampaignValidity();
    if (path === 'clinic.logoFileName') syncSingleAttachment(ATTACHMENT_ROLES.clinicLogo, value, state.clinic.logoInstruction || 'Usar como logo institucional, respetando proporciones.');
    if (path === 'clinic.logoInstruction') syncAttachmentInstruction(ATTACHMENT_ROLES.clinicLogo, value);
    if (path === 'professional.photoFileName') syncSingleAttachment(ATTACHMENT_ROLES.professionalPhoto, value, 'Usar como foto profesional, sin deformar rostro ni alterar identidad.');
    if (path === 'professional.showPhoto') {
      if (value && state.professional.photoFileName) {
        syncSingleAttachment(ATTACHMENT_ROLES.professionalPhoto, state.professional.photoFileName, 'Usar como foto profesional, sin deformar rostro ni alterar identidad.');
      }
      if (!value) syncSingleAttachment(ATTACHMENT_ROLES.professionalPhoto, '', '');
    }
    if (path === 'promptOptions.suggestedPhrase') {
      state.promptOptions.suggestedPhraseSource = 'manual';
      state.promptOptions.suggestedPhraseSourceSpecialty = state.specialty.primaryProfessionalSpecialty || '';
    }
    if (path === 'specialty.primaryProfessionalSpecialty') applySpecialtyPreset(value, true);
    if (path === 'design.primaryColor') applyPrimaryColorPreset(value);
    if (path === 'design.useInstitutionalColors' && value) applyInstitutionalColors();
    if (path === 'promptOptions.pieceType') {
      currentStep = 'tipo';
      applySpecialtyPreset(state.specialty.primaryProfessionalSpecialty, true);
    }
    update(shouldRenderForm(path));
  },
  onRemoveService(index) {
    state.services.visibleServices.splice(index, 1);
    update(true);
  },
  onMoveService(index, direction) {
    const from = Number(index);
    const offset = Number(direction);
    const to = from + offset;
    if (!Number.isInteger(from) || !Number.isInteger(to)) return;
    if (from < 0 || to < 0 || from >= state.services.visibleServices.length || to >= state.services.visibleServices.length) return;
    const [item] = state.services.visibleServices.splice(from, 1);
    state.services.visibleServices.splice(to, 0, item);
    update(true);
  },
  onReorderServices(fromIndex, toIndex) {
    const from = Number(fromIndex);
    const to = Number(toIndex);
    if (!Number.isInteger(from) || !Number.isInteger(to)) return;
    if (from < 0 || to < 0 || from >= state.services.visibleServices.length || to >= state.services.visibleServices.length || from === to) return;
    const [item] = state.services.visibleServices.splice(from, 1);
    state.services.visibleServices.splice(to, 0, item);
    update(true);
  },
  onToggleServiceOption(value, checked) {
    const item = String(value || '').trim();
    if (!item) return;
    const exists = state.services.visibleServices.includes(item);
    if (checked && !exists) state.services.visibleServices.push(item);
    if (!checked && exists) state.services.visibleServices = state.services.visibleServices.filter(service => service !== item);
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
    addAttachmentItem(ATTACHMENT_ROLES.other);
    update(true);
  },
  onAddAttachmentWithRole(role) {
    addAttachmentItem(role || ATTACHMENT_ROLES.other);
    update(true);
  },
  onAddMultipleAttachments(role, files, instruction = DEFAULT_ATTACHMENT_INSTRUCTION) {
    const normalizedFiles = normalizeAttachmentFiles(files);
    if (!normalizedFiles.length) return;
    normalizedFiles.forEach(file => {
      addAttachmentItem(role || ATTACHMENT_ROLES.other, file.fileName, instruction, file.mimeType);
    });
    update(true);
  },
  onUpdateAttachmentFiles(index, files, roleOverride = '') {
    const item = state.attachments.items[index];
    if (!item) return;
    const normalizedFiles = normalizeAttachmentFiles(files);
    if (!normalizedFiles.length) {
      item.fileName = '';
      item.mimeType = '';
      item.status = 'missing';
      update(true);
      return;
    }

    const [firstFile, ...extraFiles] = normalizedFiles;
    const role = roleOverride || item.role || ATTACHMENT_ROLES.other;
    item.role = role;
    item.fileName = firstFile.fileName;
    item.mimeType = firstFile.mimeType;
    item.status = 'selected';
    if (!item.instruction) item.instruction = DEFAULT_ATTACHMENT_INSTRUCTION;
    extraFiles.forEach(file => addAttachmentItem(role, file.fileName, item.instruction || DEFAULT_ATTACHMENT_INSTRUCTION, file.mimeType));
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
  renderInstitutionManager();
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

  document.querySelectorAll('[data-piece-select]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      selectPieceType(button.dataset.pieceSelect);
    });
  });

  document.querySelectorAll('[data-demo-piece]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      loadDemoData(button.dataset.demoPiece);
    });
  });

  document.querySelector('#startAssistantButton')?.addEventListener('click', () => {
    currentStep = 'clinica';
    startPieceFlow(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer, false, 'Asistente iniciado. Primero cargá la institución.');
  });
  document.querySelector('#continueCurrentButton')?.addEventListener('click', () => {
    currentStep = currentStep || 'clinica';
    startPieceFlow(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer, false, 'Trabajo guardado cargado.');
  });
  document.querySelector('#backHomeButton')?.addEventListener('click', showHome);
  document.querySelector('#closeAssistantButton')?.addEventListener('click', showHome);
  document.addEventListener('pointerdown', event => {
    const manageButton = event.target.closest?.('#manageInstitutionButton');
    if (!manageButton) return;
    event.preventDefault();
    event.stopPropagation();
    institutionManagePointerHandled = true;
    toggleInstitutionActionsPanel();
    window.setTimeout(() => {
      institutionManagePointerHandled = false;
    }, 500);
  }, true);

  document.addEventListener('pointerdown', event => {
    const institutionAction = event.target.closest?.('#saveInstitutionButton, #loadInstitutionButton, #useSavedInstitutionButton, #createInstitutionButton, #editCurrentInstitutionButton, #cancelInstitutionEditButton, #saveInstitutionAndContinueButton, #continueInstitutionWithoutSavingButton, #updateInstitutionButton, #deleteInstitutionButton, #exportInstitutionButton, #savePhraseButton');
    if (!institutionAction) return;
    event.preventDefault();
    event.stopPropagation();
    institutionActionPointerHandled = true;
    runInstitutionPanelAction(institutionAction.id);
    window.setTimeout(() => {
      institutionActionPointerHandled = false;
    }, 500);
  }, true);

  document.addEventListener('click', event => {
    const manageButton = event.target.closest?.('#manageInstitutionButton');
    if (manageButton) {
      event.preventDefault();
      event.stopPropagation();
      if (institutionManagePointerHandled) {
        institutionManagePointerHandled = false;
        return;
      }
      toggleInstitutionActionsPanel();
      return;
    }

    const institutionAction = event.target.closest?.('#saveInstitutionButton, #loadInstitutionButton, #useSavedInstitutionButton, #createInstitutionButton, #editCurrentInstitutionButton, #cancelInstitutionEditButton, #saveInstitutionAndContinueButton, #continueInstitutionWithoutSavingButton, #updateInstitutionButton, #deleteInstitutionButton, #exportInstitutionButton, #savePhraseButton');
    if (institutionAction) {
      event.preventDefault();
      event.stopPropagation();
      if (institutionActionPointerHandled) {
        institutionActionPointerHandled = false;
        return;
      }
      runInstitutionPanelAction(institutionAction.id);
      return;
    }

    const button = event.target.closest('[data-wizard-action]');
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.wizardAction;
    if (action === 'previous') {
      if (currentStep === 'clinica' && institutionEditorOpen) {
        const handled = window.__handleInstitutionPrevious?.();
        if (!handled) cancelInstitutionEditor();
      } else {
        previousStep();
      }
    }
    if (action === 'home') showHome();
    if (action === 'result') showStep(resultStep);
    if (action === 'next') {
      if (currentStep === 'clinica' && institutionEditorOpen) {
        window.__handleInstitutionNext?.();
      } else {
        nextStep();
      }
    }
  }, true);

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

  document.querySelectorAll('[data-copy-prompt-action]').forEach(button => {
    button.addEventListener('click', copyPrompt);
  });
  document.querySelectorAll('[data-open-platform]').forEach(button => {
    button.addEventListener('click', copyPromptAndOpenPlatform);
  });
  document.querySelector('#copyAttachmentsButton')?.addEventListener('click', copyAttachmentsChecklist);
  document.querySelector('#loadDemoButton')?.addEventListener('click', () => loadDemoData(state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer));
  document.querySelector('#downloadPromptButton')?.addEventListener('click', downloadPrompt);
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
  demo.promptOptions.pieceType = pieceType;
  demo.promptOptions.pieceTypeConfirmed = true;
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
    freeInstructions: 'Diseño llamativo, claro, con mensaje final fuerte, sin parecer publicidad agresiva.'
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

function applySpecialtyPreset(name, force = false) {
  const preset = specialties.find(item => item.name === name);
  if (!preset) return;

  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  state.specialty.primaryProfessionalSpecialty = name;
  state.specialty.communicationFocus = preset.focus || name;
  // Campo manual: no se completa automaticamente.
  // La especialidad elegida queda como desplegable y se usa como fallback en el prompt.
  state.specialty.visibleSpecialtyText = state.specialty.visibleSpecialtyText || '';

  const suggestedServices = Array.isArray(preset.services) ? preset.services.slice(0, 5) : [];
  if (force || !state.services.visibleServices.length) {
    state.services.visibleServices = [...suggestedServices];
  }
  if (force || !state.services.mainHighlightedService) {
    state.services.mainHighlightedService = suggestedServices[0] || name;
  }

  if (pieceType === PIECE_TYPES.professionalFlyer) {
    syncSuggestedPhraseWithSpecialty(preset, name);
  }

  if (pieceType === PIECE_TYPES.clinicalInfographic) {
    const topics = preset.infographicTopics || preset.topics || [];
    const audiences = preset.audiences || [];
    const messages = preset.messages || [];
    const blocks = preset.blocks || suggestedServices;
    state.promptOptions.educationalTopic = topics[0] || name;
    state.promptOptions.targetAudience = audiences[0] || 'Comunidad general';
    state.promptOptions.mainMessage = messages[0] || `${name}: información clara para cuidar la salud.`;
    state.promptOptions.infoBlocksText = blocks.slice(0, 5).join('\n');
    state.promptOptions.legalEthicalNote = state.promptOptions.legalEthicalNote || 'Contenido informativo. No reemplaza la consulta médica.';
  }

  if (pieceType === PIECE_TYPES.informativeFlyer) {
    const infoTypes = preset.informativeTypes || ['Nuevo servicio', 'Información para pacientes', 'Turnos disponibles'];
    const titles = preset.informativeTitles || preset.topics || [name];
    const messages = preset.informativeMessages || preset.messages || [];
    state.promptOptions.contentGoal = infoTypes[0] || 'Información para pacientes';
    state.promptOptions.educationalTopic = titles[0] || name;
    state.promptOptions.targetAudience = (preset.audiences || ['Comunidad general'])[0];
    state.promptOptions.mainMessage = messages[0] || `Información sobre ${name} para pacientes.`;
    state.promptOptions.campaignCallToAction = state.promptOptions.campaignCallToAction || 'Consultar por WhatsApp';
    state.promptOptions.infoBlocksText = suggestedServices.slice(0, 5).join('\n');
  }

  if (pieceType === PIECE_TYPES.promotionCampaign) {
    const campaigns = preset.campaignTypes || ['Agenda abierta', 'Campaña preventiva', 'Turnos disponibles'];
    const messages = preset.campaignMessages || preset.messages || [];
    state.promptOptions.campaignType = campaigns[0] || 'Campaña preventiva';
    state.promptOptions.targetAudience = (preset.audiences || ['Comunidad general'])[0];
    state.promptOptions.mainMessage = messages[0] || `Agenda disponible para ${name}.`;
    state.promptOptions.campaignCallToAction = state.promptOptions.campaignCallToAction || 'Solicitar turno por WhatsApp';
    state.promptOptions.legalEthicalNote = state.promptOptions.legalEthicalNote || 'Actividad sujeta a disponibilidad de turnos.';
  }

  if (preset.design && state.design.useAutomaticTheme) {
    state.design.primaryColor = preset.design.primaryColor || state.design.primaryColor;
    state.design.secondaryColor = preset.design.secondaryColor || state.design.secondaryColor;
    state.design.visualStyle = preset.design.visualStyle || state.design.visualStyle;
    state.design.typography = preset.design.typography || state.design.typography;
  }
}


function syncSuggestedPhraseWithSpecialty(preset, specialtyName) {
  const nextPhrase = suggestedPhraseForPreset(preset, specialtyName);
  const currentPhrase = String(state.promptOptions.suggestedPhrase || '').trim();
  const currentSource = state.promptOptions.suggestedPhraseSource || '';
  const currentSourceSpecialty = state.promptOptions.suggestedPhraseSourceSpecialty || '';
  const detectedSpecialty = detectSpecialtyMention(currentPhrase);

  const shouldReplace = !currentPhrase
    || currentSource === 'preset'
    || (!currentSource && !currentSourceSpecialty)
    || (currentSourceSpecialty && currentSourceSpecialty !== specialtyName && currentSource !== 'manual')
    || (detectedSpecialty && detectedSpecialty !== specialtyName);

  if (!shouldReplace) return;
  state.promptOptions.suggestedPhrase = nextPhrase;
  state.promptOptions.suggestedPhraseSource = 'preset';
  state.promptOptions.suggestedPhraseSourceSpecialty = specialtyName;
}

function suggestedPhraseForPreset(preset, specialtyName) {
  const messages = Array.isArray(preset?.messages) ? preset.messages.filter(Boolean) : [];
  if (messages[0]) return messages[0];
  const focus = String(preset?.focus || specialtyName || '').trim();
  return focus ? `Cuidar ${focus.toLowerCase()} empieza con una consulta profesional.` : 'Consultar a tiempo ayuda a cuidar la salud.';
}

function detectSpecialtyMention(value = '') {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return '';

  for (const specialty of specialties) {
    const keywords = specialtyKeywords(specialty);
    if (keywords.some(keyword => normalizedValue.includes(keyword))) return specialty.name;
  }

  return '';
}

function specialtyKeywords(specialty = {}) {
  const rawKeywords = [
    specialty.name,
    specialty.focus,
    ...(specialty.services || []),
    ...(specialty.infographicTopics || []),
    ...(specialty.informativeTitles || []),
    ...(specialty.messages || []),
    ...(specialty.blocks || [])
  ];

  const words = rawKeywords
    .flatMap(item => normalizeText(item).split(' '))
    .filter(word => word.length >= 6 && !GENERIC_SPECIALTY_WORDS.has(word));

  return [...new Set([
    ...rawKeywords.map(normalizeText).filter(item => item.length >= 8),
    ...words
  ])];
}

function normalizeText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildVisibleSpecialtyText(values = []) {
  const filled = values.map(value => String(value || '').trim()).filter(Boolean);
  if (!filled.length) return '';
  return filled.length <= 2 ? filled.join(' y ') : `${filled.slice(0, -1).join(', ')} y ${filled.at(-1)}`;
}

function applyInstitutionalColors() {
  if (state.clinic.defaultPrimaryColor) state.design.primaryColor = state.clinic.defaultPrimaryColor;
  if (state.clinic.defaultSecondaryColor) state.design.secondaryColor = state.clinic.defaultSecondaryColor;
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



function selectPieceType(pieceType) {
  state.promptOptions.pieceType = pieceType || PIECE_TYPES.professionalFlyer;
  state.promptOptions.pieceTypeConfirmed = true;
  applySpecialtyPreset(state.specialty.primaryProfessionalSpecialty, true);
  currentStep = 'tipo';
  update(true);
  showStep('tipo');
  showStatus(`${labelPieceType(state.promptOptions.pieceType)} seleccionado. Tocá Siguiente para continuar.`);
}



function addAttachmentItem(role = ATTACHMENT_ROLES.other, fileName = '', instruction = '', mimeType = '') {
  state.attachments.items.push({
    id: `attachment_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    fileName,
    mimeType,
    status: fileName ? 'selected' : 'missing',
    instruction
  });
}

function normalizeAttachmentFiles(files = []) {
  return Array.from(files || [])
    .map(file => ({
      fileName: String(file?.fileName || file?.name || '').trim(),
      mimeType: String(file?.mimeType || file?.type || '').trim()
    }))
    .filter(file => file.fileName);
}

function syncSingleAttachment(role, fileName, instruction = '') {
  const normalizedName = String(fileName || '').trim();
  state.attachments.items = Array.isArray(state.attachments.items) ? state.attachments.items : [];
  const index = state.attachments.items.findIndex(item => item.role === role);

  if (!normalizedName) {
    if (index !== -1) state.attachments.items.splice(index, 1);
    return;
  }

  const next = {
    id: index !== -1 ? state.attachments.items[index].id : `attachment_${role}`,
    role,
    fileName: normalizedName,
    mimeType: index !== -1 ? state.attachments.items[index].mimeType || '' : '',
    status: 'selected',
    instruction: instruction || (index !== -1 ? state.attachments.items[index].instruction || '' : '')
  };

  if (index === -1) {
    state.attachments.items.unshift(next);
  } else {
    state.attachments.items[index] = { ...state.attachments.items[index], ...next };
  }
}

function syncAttachmentInstruction(role, instruction = '') {
  const item = state.attachments.items.find(attachment => attachment.role === role);
  if (item) item.instruction = instruction;
}

function runInstitutionPanelAction(actionId) {
  const selectedInstitutionId = document.querySelector('#savedInstitutionSelect')?.value || '';

  if (actionId === 'saveInstitutionButton') saveCurrentInstitutionAsNew();
  if (actionId === 'loadInstitutionButton' || actionId === 'useSavedInstitutionButton') useSelectedInstitutionAndContinue(selectedInstitutionId);
  if (actionId === 'createInstitutionButton') startCreateInstitution();
  if (actionId === 'editCurrentInstitutionButton') startEditCurrentInstitution();
  if (actionId === 'cancelInstitutionEditButton') cancelInstitutionEditor();
  if (actionId === 'saveInstitutionAndContinueButton') saveInstitutionAndContinue();
  if (actionId === 'continueInstitutionWithoutSavingButton') continueInstitutionWithoutSaving();
  if (actionId === 'updateInstitutionButton') updateSelectedInstitution(selectedInstitutionId);
  if (actionId === 'deleteInstitutionButton') deleteSelectedInstitution(selectedInstitutionId);
  if (actionId === 'exportInstitutionButton') exportInstitution(selectedInstitutionId);
  if (actionId === 'savePhraseButton') saveCurrentPhrase();
}


function syncCampaignValidity() {
  const start = String(state?.promptOptions?.campaignStartDate || '').trim();
  const end = String(state?.promptOptions?.campaignEndDate || '').trim();
  if (start && end) state.promptOptions.campaignValidity = `Desde ${start} hasta ${end}`;
  else if (start) state.promptOptions.campaignValidity = `Desde ${start}`;
  else if (end) state.promptOptions.campaignValidity = `Hasta ${end}`;
  else state.promptOptions.campaignValidity = '';
}

function syncCurrentClinicFieldsFromDom() {
  document.querySelectorAll('[data-path^="clinic."]').forEach(field => {
    const path = field.dataset.path;
    if (!path || field.type === 'file' || field.hidden) return;
    if (field.type === 'checkbox') {
      setByPath(state, path, field.checked);
      return;
    }
    setByPath(state, path, field.value ?? '');
  });
}
function syncInstitutionActionsPanel() {
  const actionsPanel = document.querySelector('#institutionActionsPanel');
  const manageButton = document.querySelector('#manageInstitutionButton');
  if (!actionsPanel || !manageButton) return;

  actionsPanel.hidden = !institutionActionsPanelOpen;
  manageButton.setAttribute('aria-expanded', String(institutionActionsPanelOpen));
  manageButton.textContent = institutionActionsPanelOpen ? 'Ocultar gestión' : 'Gestionar instituciones';
}

function toggleInstitutionActionsPanel() {
  institutionActionsPanelOpen = !institutionActionsPanelOpen;
  syncInstitutionActionsPanel();
}

function renderInstitutionManager() {
  const target = document.querySelector('#institutionManager');
  if (!target) return;

  const institutions = loadInstitutions();
  const phrases = loadInstitutionPhrases();
  const currentName = state?.clinic?.name || '';

  document.body.classList.toggle('is-institution-editor-open', institutionEditorOpen);

  if (institutionEditorOpen) {
    target.innerHTML = '';
    return;
  }

  target.innerHTML = `
    <div class="institution-panel institution-panel-compact institution-choice-panel">
      <div class="institution-choice-head">
        <div>
          <strong>Elegí la institución</strong>
          <p>Usá una institución guardada o creá una nueva antes de elegir el tipo de pieza.</p>
        </div>
      </div>

      ${institutions.length ? `
        <div class="saved-institution-box">
          <label class="field compact-field">
            <span>Institución guardada</span>
            <select id="savedInstitutionSelect">
              <option value="">Seleccionar institución...</option>
              ${institutions.map(item => `<option value="${escapeHtmlAttr(item.id)}">${escapeHtml(item.clinic?.name || 'Sin nombre')}</option>`).join('')}
            </select>
          </label>

          <div class="saved-institution-summary" id="savedInstitutionSummary" hidden>
            <strong>Resumen</strong>
            <dl id="savedInstitutionSummaryList"></dl>
          </div>

          <button class="primary-button saved-institution-use-button" type="button" id="loadInstitutionButton" disabled hidden>
            Usar esta institución →
          </button>
        </div>
      ` : `
        <div class="institution-empty-choice">
          <strong>No hay instituciones guardadas.</strong>
          <p>Creá una institución para reutilizar sus datos en futuros prompts.</p>
        </div>
      `}

      <div class="institution-primary-actions">
        <button class="secondary-button institution-create-button" type="button" id="createInstitutionButton">Crear nueva institución</button>
        ${currentName ? `<button class="secondary-button" type="button" id="editCurrentInstitutionButton">Editar datos actuales</button>` : ''}
        <button class="secondary-button institution-manage-toggle" type="button" id="manageInstitutionButton" aria-expanded="${institutionActionsPanelOpen ? 'true' : 'false'}" aria-controls="institutionActionsPanel">
          ${institutionActionsPanelOpen ? 'Ocultar administración' : 'Administrar instituciones'}
        </button>
      </div>

      <div class="institution-actions-panel" id="institutionActionsPanel"${institutionActionsPanelOpen ? '' : ' hidden'}>
        <div class="institution-actions">
          <button class="secondary-button" type="button" id="saveInstitutionButton">Guardar actual como nueva</button>
          <button class="secondary-button" type="button" id="updateInstitutionButton" ${institutions.length ? '' : 'disabled'}>Actualizar guardada</button>
          <button class="danger-button" type="button" id="deleteInstitutionButton" ${institutions.length ? '' : 'disabled'}>Eliminar guardada</button>
          <button class="secondary-button" type="button" id="exportInstitutionButton">Exportar institución</button>
          <label class="file-action compact-file-action">
            Importar institución
            <input type="file" id="importInstitutionInput" accept="application/json,.json">
          </label>
          <label class="field compact-field phrase-field">
            <span>Frase guardada</span>
            <select id="savedPhraseSelect">
              <option value="">Cargar frase...</option>
              ${phrases.map(phrase => `<option value="${escapeHtmlAttr(phrase)}">${escapeHtml(phrase)}</option>`).join('')}
            </select>
          </label>
          <button class="secondary-button" type="button" id="savePhraseButton">Guardar frase</button>
        </div>
      </div>

      <p class="institution-note">${institutions.length ? `${institutions.length}/${MAX_INSTITUTIONS} instituciones guardadas.` : 'Podés guardar hasta 10 instituciones.'}</p>
    </div>
  `;

  const select = target.querySelector('#savedInstitutionSelect');

  syncInstitutionActionsPanel();
  updateSavedInstitutionSummary(select?.value || '', institutions);

  select?.addEventListener('change', event => {
    updateSavedInstitutionSummary(event.target.value || '', institutions);
  });

  target.querySelector('#loadInstitutionButton')?.addEventListener('click', () => useSelectedInstitutionAndContinue(select?.value || ''));
  target.querySelector('#createInstitutionButton')?.addEventListener('click', startCreateInstitution);
  target.querySelector('#editCurrentInstitutionButton')?.addEventListener('click', startEditCurrentInstitution);
  target.querySelector('#saveInstitutionButton')?.addEventListener('click', saveCurrentInstitutionAsNew);
  target.querySelector('#updateInstitutionButton')?.addEventListener('click', () => updateSelectedInstitution(select?.value || ''));
  target.querySelector('#deleteInstitutionButton')?.addEventListener('click', () => deleteSelectedInstitution(select?.value || ''));
  target.querySelector('#exportInstitutionButton')?.addEventListener('click', () => exportInstitution(select?.value || ''));
  target.querySelector('#importInstitutionInput')?.addEventListener('change', importInstitution);
  target.querySelector('#savedPhraseSelect')?.addEventListener('change', event => {
    if (!event.target.value) return;
    state.clinic.institutionalPhrase = event.target.value;
    update(true);
    showStatus('Frase institucional cargada.');
  });
  target.querySelector('#savePhraseButton')?.addEventListener('click', saveCurrentPhrase);
}

function updateSavedInstitutionSummary(id, institutions = loadInstitutions()) {
  const button = document.querySelector('#loadInstitutionButton');
  const summary = document.querySelector('#savedInstitutionSummary');
  const list = document.querySelector('#savedInstitutionSummaryList');
  const institution = institutions.find(item => item.id === id);

  if (button) {
    button.disabled = !institution;
    button.hidden = !institution;
  }
  if (!summary || !list) return;

  if (!institution) {
    summary.hidden = true;
    list.innerHTML = '';
    return;
  }

  const clinic = institution.clinic || {};
  const instagram = findSocialValue(clinic.socialLinks, 'Instagram');
  const whatsappSocial = findSocialValue(clinic.socialLinks, 'WhatsApp');
  summary.hidden = false;
  list.innerHTML = `
    <div><dt>Nombre</dt><dd>${escapeHtml(clinic.name || 'Sin nombre')}</dd></div>
    <div><dt>Tipo</dt><dd>${escapeHtml(clinic.institutionType || 'Sin tipo')}</dd></div>
    <div><dt>Dirección</dt><dd>${escapeHtml(clinic.address || 'Sin dirección')}</dd></div>
    <div><dt>WhatsApp</dt><dd>${escapeHtml(clinic.primaryPhone || whatsappSocial || 'Sin WhatsApp')}</dd></div>
    <div><dt>Instagram</dt><dd>${escapeHtml(instagram || 'Sin Instagram')}</dd></div>
    <div><dt>Logo</dt><dd>${escapeHtml(clinic.logoFileName || 'Sin logo seleccionado')}</dd></div>
    <div><dt>Frase</dt><dd>${escapeHtml(clinic.institutionalPhrase || 'Sin frase institucional')}</dd></div>
  `;
}

function findSocialValue(socialLinks = [], type = '') {
  const normalizedType = normalizeText(type);
  const item = Array.isArray(socialLinks)
    ? socialLinks.find(link => normalizeText(link?.type) === normalizedType && String(link?.value || '').trim())
    : null;
  return item?.value || '';
}



function clinicSnapshot() {
  return structuredCloneSafe(state.clinic || {});
}

function startCreateInstitution() {
  const defaults = createDefaultState();
  state.clinic = structuredCloneSafe(defaults.clinic);
  syncSingleAttachment(ATTACHMENT_ROLES.clinicLogo, '', '');
  institutionActionsPanelOpen = false;
  institutionEditorOpen = true;
  institutionEditorMode = 'create';
  window.__setInstitutionViewMode?.('choice');
  update(true);
  showStatus('Nueva institución. Completá los datos y continuá.');
}

function startEditCurrentInstitution() {
  institutionActionsPanelOpen = false;
  institutionEditorOpen = true;
  institutionEditorMode = 'edit';
  window.__setInstitutionViewMode?.('choice');
  update(true);
  showStatus('Editando institución actual.');
}

function cancelInstitutionEditor() {
  institutionEditorOpen = false;
  window.__setInstitutionViewMode?.('choice');
  update(true);
  showStatus('Edición de institución cerrada.');
}

function continueInstitutionWithoutSaving() {
  syncCurrentClinicFieldsFromDom();
  institutionEditorOpen = false;
  update(true);
  showStep('tipo');
  showStatus('Institución cargada sin guardar. Ahora elegí el tipo de pieza.');
}

function saveInstitutionAndContinue() {
  syncCurrentClinicFieldsFromDom();
  const name = state?.clinic?.name?.trim();
  if (!name) return showStatus('Primero completá el nombre de la institución.');
  const institutions = loadInstitutions();
  const id = `institution_${Date.now()}`;
  const next = [{ id, clinic: clinicSnapshot(), updatedAt: new Date().toISOString() }, ...institutions.filter(item => item.clinic?.name !== name)].slice(0, MAX_INSTITUTIONS);
  saveInstitutions(next);
  institutionEditorOpen = false;
  update(true);
  showStep('tipo');
  showStatus('Institución guardada. Ahora elegí el tipo de pieza.');
}


function loadInstitutions() {
  return readLocalJson(INSTITUTIONS_KEY, []);
}

function saveInstitutions(items) {
  localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(items.slice(0, MAX_INSTITUTIONS)));
}

function loadInstitutionPhrases() {
  return readLocalJson(INSTITUTION_PHRASES_KEY, []);
}

function saveInstitutionPhrases(items) {
  localStorage.setItem(INSTITUTION_PHRASES_KEY, JSON.stringify(items.slice(0, MAX_PHRASES)));
}

function saveCurrentInstitutionAsNew() {
  syncCurrentClinicFieldsFromDom();
  const name = state?.clinic?.name?.trim();
  if (!name) return showStatus('Primero completá el nombre de la institución.');
  const institutions = loadInstitutions();
  const id = `institution_${Date.now()}`;
  const next = [{ id, clinic: clinicSnapshot(), updatedAt: new Date().toISOString() }, ...institutions.filter(item => item.clinic?.name !== name)].slice(0, MAX_INSTITUTIONS);
  saveInstitutions(next);
  renderInstitutionManager();
  showStatus('Institución guardada.');
}

function loadSelectedInstitution(id) {
  const institution = loadInstitutions().find(item => item.id === id);
  if (!institution) return showStatus('Seleccioná una institución guardada.');
  state.clinic = migrateState({ clinic: institution.clinic }).clinic;
  update(true);
  showStatus('Institución cargada.');
}

function useSelectedInstitutionAndContinue(id) {
  const institution = loadInstitutions().find(item => item.id === id);
  if (!institution) return showStatus('Seleccioná una institución guardada.');
  state.clinic = migrateState({ clinic: institution.clinic }).clinic;
  institutionEditorOpen = false;
  update(true);
  showStep('tipo');
  showStatus('Institución cargada. Ahora elegí el tipo de pieza.');
}

function updateSelectedInstitution(id) {
  const name = state?.clinic?.name?.trim();
  if (!name) return showStatus('Primero completá el nombre de la institución.');
  const institutions = loadInstitutions();
  const index = institutions.findIndex(item => item.id === id);
  if (index === -1) return saveCurrentInstitutionAsNew();
  institutions[index] = { id, clinic: clinicSnapshot(), updatedAt: new Date().toISOString() };
  saveInstitutions(institutions);
  renderInstitutionManager();
  showStatus('Institución actualizada.');
}

function deleteSelectedInstitution(id) {
  if (!id) return showStatus('Seleccioná una institución para eliminar.');
  const institutions = loadInstitutions();
  const institution = institutions.find(item => item.id === id);
  if (!institution) return showStatus('No se encontró la institución.');
  if (!confirm(`Eliminar institución guardada "${institution.clinic?.name || 'sin nombre'}"?`)) return;
  saveInstitutions(institutions.filter(item => item.id !== id));
  renderInstitutionManager();
  showStatus('Institución eliminada.');
}

function exportInstitution(id) {
  const selected = loadInstitutions().find(item => item.id === id);
  const payload = selected || { id: `institution_${Date.now()}`, clinic: clinicSnapshot(), updatedAt: new Date().toISOString() };
  const safeName = (payload.clinic?.name || 'institucion').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  downloadFile(`institucion-${safeName || 'datos'}.json`, JSON.stringify({ type: 'institution', version: 1, ...payload }, null, 2), 'application/json');
  showStatus('Institución exportada.');
}

function importInstitution(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const clinic = parsed.clinic || parsed;
      if (!clinic?.name) throw new Error('missing-name');
      const institutions = loadInstitutions();
      const id = parsed.id || `institution_${Date.now()}`;
      const next = [{ id, clinic: migrateState({ clinic }).clinic, updatedAt: new Date().toISOString() }, ...institutions.filter(item => item.id !== id && item.clinic?.name !== clinic.name)].slice(0, MAX_INSTITUTIONS);
      saveInstitutions(next);
      state.clinic = next[0].clinic;
      update(true);
      showStatus('Institución importada y cargada.');
    } catch {
      showStatus('No se pudo importar la institución.');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function saveCurrentPhrase() {
  const phrase = state?.clinic?.institutionalPhrase?.trim();
  if (!phrase) return showStatus('Primero escribí una frase institucional.');
  const phrases = loadInstitutionPhrases();
  saveInstitutionPhrases([phrase, ...phrases.filter(item => item !== phrase)].slice(0, MAX_PHRASES));
  renderInstitutionManager();
  showStatus('Frase guardada.');
}

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function structuredCloneSafe(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeHtmlAttr(value = '') {
  return escapeHtml(value);
}


function startNewPiece(pieceType = PIECE_TYPES.professionalFlyer) {
  const preservedClinic = state?.clinic ? structuredCloneSafe(state.clinic) : null;
  state = createDefaultState();
  if (preservedClinic?.name) state.clinic = preservedClinic;
  state.promptOptions.pieceType = pieceType || PIECE_TYPES.professionalFlyer;
  state.promptOptions.pieceTypeConfirmed = false;
  currentStep = 'clinica';
  startPieceFlow(state.promptOptions.pieceType, false);
}

function startPieceFlow(pieceType, resetCurrentStep = true, statusMessage = '') {
  state.promptOptions.pieceType = pieceType || PIECE_TYPES.professionalFlyer;
  document.body.classList.remove('is-home');
  document.body.classList.add('is-wizard-open');
  document.body.dataset.pieceType = state.promptOptions.pieceType;
  if (resetCurrentStep || !currentStep) currentStep = firstStepForPiece(state.promptOptions.pieceType);
  if (state.design.useInstitutionalColors) applyInstitutionalColors();
  applySpecialtyPreset(state.specialty.primaryProfessionalSpecialty, !state.services.visibleServices.length);
  update(true);
  showStep(currentStep);
  showStatus(statusMessage || `${labelStepForPiece(currentStep, state.promptOptions.pieceType)} abierto.`);
}

function showHome() {
  institutionEditorOpen = false;
  document.body.classList.add('is-home');
  document.body.classList.remove('is-wizard-open');
  document.body.classList.remove('is-institution-editor-open');
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


function syncStepFooterControls(steps = availableSteps()) {
  document.querySelectorAll('.form-section').forEach(section => {
    const step = section.dataset.step;
    let footer = section.querySelector(':scope > .step-footer-controls');

    if (step === 'clinica') {
      footer?.remove();
      return;
    }

    const isAvailable = steps.includes(step);
    if (!isAvailable) {
      footer?.remove();
      return;
    }

    const hasGuidedCardNavigation = section.classList.contains('has-guided-card-navigation') || section.querySelector('.content-guided-card, .design-guided-card');
    if (hasGuidedCardNavigation) {
      footer?.remove();
      return;
    }

    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'step-footer-controls';
      footer.setAttribute('aria-label', 'Navegación del paso');
      section.appendChild(footer);
    }

    const isResult = step === resultStep;
    const needsPieceSelection = step === 'tipo' && !state.promptOptions.pieceTypeConfirmed;
    footer.innerHTML = `
      <button class="secondary-button" type="button" data-wizard-action="previous">← Anterior</button>
      ${isResult ? '' : `<button class="primary-button" type="button" data-wizard-action="next" ${needsPieceSelection ? 'disabled' : ''}>${step === 'diseno' ? 'Ver resultado →' : 'Siguiente →'}</button>`}
    `;
  });
}

function updateWorkflowChrome() {
  const steps = availableSteps();
  const index = Math.max(steps.indexOf(currentStep), 0);
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  document.body.dataset.pieceType = pieceType;
  syncStepFooterControls(steps);

  const title = document.querySelector('#workflowTitle');
  const subtitle = document.querySelector('#workflowSubtitle');
  const previousButtons = document.querySelectorAll('[data-wizard-action="previous"], #prevStepButton');
  const nextButtons = document.querySelectorAll('[data-wizard-action="next"], #nextStepButton');
  const resultButtons = document.querySelectorAll('[data-wizard-action="result"], #resultStepButton');

  if (title) title.textContent = `Paso ${index + 1} de ${steps.length} — ${labelStepForPiece(currentStep, pieceType)}`;
  if (subtitle) subtitle.textContent = workflowSubtitleForStep(currentStep);
  previousButtons.forEach(button => {
    button.disabled = index <= 0;
  });
  nextButtons.forEach(button => {
    const isTypeStepBlocked = currentStep === 'tipo' && !state.promptOptions.pieceTypeConfirmed;
    button.disabled = index >= steps.length - 1 || isTypeStepBlocked;
    button.textContent = index >= steps.length - 2 ? 'Ver resultado →' : 'Siguiente →';
  });
  resultButtons.forEach(button => {
    button.hidden = currentStep === resultStep;
  });

  updateSectionHeadings(pieceType);
  updateActionLabels(pieceType);
}

async function writePromptToClipboard(prompt) {
  try {
    await navigator.clipboard.writeText(prompt);
    return true;
  } catch {
    const promptOutput = document.querySelector('#promptOutput');
    promptOutput.select();
    document.execCommand('copy');
    return false;
  }
}

async function copyPrompt() {
  const prompt = document.querySelector('#promptOutput').value;
  await writePromptToClipboard(prompt);
  showStatus('Prompt revisado copiado. Ahora adjuntá los archivos indicados en ChatGPT si corresponde.');
}

async function copyPromptAndOpenPlatform(event) {
  const button = event.currentTarget;
  const platformName = button.dataset.platformName || 'la plataforma';
  const platformUrl = button.dataset.platformUrl || '';
  const promptOutput = document.querySelector('#promptOutput');
  const prompt = promptOutput?.value || '';

  if (!prompt.trim()) {
    showStatus('No hay prompt para copiar todavía. Revisá el resultado antes de abrir una plataforma.');
    return;
  }

  button.disabled = true;

  try {
    await writePromptToClipboard(prompt);
    showStatus(`Prompt copiado. Se abrirá ${platformName}; pegalo allí con Ctrl+V o desde el menú Pegar.`);

    const openedWindow = platformUrl ? window.open(platformUrl, '_blank', 'noopener,noreferrer') : null;

    if (!openedWindow) {
      showStatus(`Prompt copiado. ${platformName} no se abrió automáticamente; permití ventanas emergentes o abrilo manualmente.`);
    }
  } catch {
    showStatus('No se pudo copiar automáticamente. Usá el botón “Copiar prompt” y luego abrí la plataforma.');
  } finally {
    button.disabled = false;
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
    || path === 'clinic.institutionType'
    || path === 'specialty.primaryProfessionalSpecialty'
    || path === 'promptOptions.contentGoal'
    || path === 'promptOptions.educationalTopic'
    || path === 'professional.showPhoto'
    || path === 'services.allowServiceExpansion'
    || path === 'design.useInstitutionalColors'
    || path === 'design.primaryColor'
    || path === 'design.secondaryColor'
    || path === 'promptOptions.allowVisualCreativity'
    || path === 'promptOptions.requestAnimation'
    || path === 'promptOptions.videoCreationMode'
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
  const pieceType = state?.promptOptions?.pieceType || PIECE_TYPES.professionalFlyer;
  const files = state.attachments.items
    .filter(item => item.fileName)
    .filter(item => item.role !== ATTACHMENT_ROLES.professionalPhoto || pieceType === PIECE_TYPES.professionalFlyer)
    .map(item => [labelAttachmentRole(item.role), item.fileName]);
  if (!files.length) return 'No hay archivos seleccionados para adjuntar antes de pegar el prompt.';
  return ['Antes de pegar el prompt en ChatGPT, adjunta estos archivos:']
    .concat(files.map(([label, value]) => `- ${label}: ${value}`))
    .concat('Si falta algún archivo de esta lista en ChatGPT, pedilo por nombre exacto y no generes la pieza hasta recibirlo.')
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
    videoBase: 'Video base',
    videoProfessionalPhoto: 'Foto del profesional',
    videoLogo: 'Logo institucional',
    videoSupportImage: 'Imagen de apoyo',
    videoVisualReference: 'Referencia visual para video',
    videoStyleReference: 'Referencia de estilo',
    videoOther: 'Otro material de video',
    other: 'Otro'
  }[value] || value;
}

function isLegacyColorValue(value) {
  return typeof value === 'string' && (value.startsWith('#') || value.includes('rgb('));
}




function workflowSubtitleForStep(step) {
  return {
    clinica: 'Primero cargá los datos institucionales. Después elegís qué pieza querés crear.',
    tipo: 'Elegí flyer, infografía, campaña o flyer informativo.',
    prestaciones: 'Completá el contenido visible y las sugerencias según la especialidad.',
    diseno: 'Definí formato, colores, estilo, adjuntos y modo animado si corresponde.',
    resultado: 'Revisá el prompt final y el checklist de archivos para adjuntar manualmente.'
  }[step] || 'Completá los pasos y generá el prompt final.';
}

function updateSectionHeadings(pieceType) {
  const contentTitle = document.querySelector('#prestaciones .section-heading h2');
  const contentDescription = document.querySelector('#prestaciones .section-heading p');
  const resultTitle = document.querySelector('#resultado .section-heading h2');
  const resultDescription = document.querySelector('#resultado .section-heading p');

  const contentLabels = {
    [PIECE_TYPES.professionalFlyer]: ['Contenido del flyer profesional', 'Profesional, especialidades, prestaciones sugeridas, atención y cobertura.'],
    [PIECE_TYPES.clinicalInfographic]: ['Contenido de la infografía', 'Área sanitaria, tema, público, mensaje y bloques sugeridos.'],
    [PIECE_TYPES.informativeFlyer]: ['Contenido del flyer informativo', 'Área, tipo de información, título, mensaje, datos visibles y mensaje final.'],
    [PIECE_TYPES.promotionCampaign]: ['Contenido de la campaña', 'Área, tipo de campaña, público, vigencia, condiciones y mensaje final.']
  };

  const [mainTitle, mainDescription] = contentLabels[pieceType] || contentLabels[PIECE_TYPES.professionalFlyer];

  if (contentTitle) contentTitle.textContent = mainTitle;
  if (contentDescription) contentDescription.textContent = mainDescription;
  if (resultTitle) resultTitle.textContent = `Resultado: ${labelPieceType(pieceType)}`;
  if (resultDescription) resultDescription.textContent = 'Prompt final, checklist de adjuntos, advertencias y acciones.';
}

function updateActionLabels(pieceType) {
  const actionTitle = document.querySelector('#primaryActionTitle');
  const secondaryTitle = document.querySelector('#secondaryActionTitle');
  const copyButton = document.querySelector('#copyPromptButton');
  const downloadButton = document.querySelector('#downloadPromptButton');
  const demoButton = document.querySelector('#loadDemoButton');

  const labels = {
    [PIECE_TYPES.professionalFlyer]: ['Acción principal', 'Copiar prompt', 'Descargar prompt de flyer', 'Cargar ejemplo de flyer'],
    [PIECE_TYPES.clinicalInfographic]: ['Acción principal', 'Copiar prompt', 'Descargar prompt de infografía', 'Cargar ejemplo de infografía'],
    [PIECE_TYPES.informativeFlyer]: ['Acción principal', 'Copiar prompt informativo revisado', 'Descargar prompt informativo', 'Cargar ejemplo informativo'],
    [PIECE_TYPES.promotionCampaign]: ['Acción principal', 'Copiar prompt', 'Descargar prompt de campaña', 'Cargar ejemplo de campaña']
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
    clinica: 'Institución',
    tipo: 'Tipo de pieza',
    prestaciones: 'Contenido',
    diseno: 'Diseño',
    resultado: 'Resultado'
  };
  return labels[step] || labelStep(step);
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
    clinica: 'Institución',
    tipo: 'Tipo de pieza',
    prestaciones: 'Contenido',
    diseno: 'Diseño',
    resultado: 'Resultado final'
  }[value] || value;
}

function showStatus(message) {
  const node = document.querySelector('#statusMessage');
  if (!node) return;
  if (statusClearTimer) window.clearTimeout(statusClearTimer);
  node.textContent = message;
  statusClearTimer = window.setTimeout(() => {
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

