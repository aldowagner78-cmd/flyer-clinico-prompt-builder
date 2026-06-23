import { colorPresets } from './data/designPresets.js';
import { specialties } from './data/specialties.js';
import { buildPrompt } from './prompt/promptBuilder.js';
import { createDefaultState } from './state/defaultState.js';
import { ATTACHMENT_ROLES } from './state/schema.js';
import { migrateState } from './state/migrations.js';
import { clearState, loadState, loadTemplate, saveState, saveTemplate } from './state/storage.js';
import { renderForm } from './ui/formRenderer.js';
import { renderPreview, renderResult } from './ui/previewRenderer.js';
import { validateState } from './ui/validation.js';

let state = loadState();

const handlers = {
  onFieldChange(path, value) {
    setByPath(state, path, value);
    if (path === 'specialty.primaryProfessionalSpecialty') applySpecialtyPreset(value);
    if (path === 'design.primaryColor') applyPrimaryColorPreset(value);
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
  saveState(state);
}

function bindStaticActions() {
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
  document.querySelector('#loadDemoButton')?.addEventListener('click', loadDemoData);
  document.querySelector('#downloadPromptButton').addEventListener('click', downloadPrompt);
  document.querySelector('#saveTemplateButton').addEventListener('click', () => {
    saveTemplate(state);
    showStatus('Plantilla guardada en este navegador.');
  });
  document.querySelector('#loadTemplateButton').addEventListener('click', () => {
    const template = loadTemplate();
    if (!template) return showStatus('No hay plantilla guardada.');
    state = template;
    update(true);
    showStatus('Plantilla cargada.');
  });
  document.querySelector('#exportJsonButton').addEventListener('click', exportJson);
  document.querySelector('#importJsonInput').addEventListener('change', importJson);
  document.querySelector('#clearButton').addEventListener('click', () => {
    if (!confirm('Limpiar el formulario actual?')) return;
    clearState();
    state = createDefaultState();
    update(true);
    showStatus('Formulario limpio.');
  });
}

function loadDemoData() {
  state = createDemoState();
  update(true);
  showStatus('Datos demo cargados. Revisá el prompt de salida.');
}

function createDemoState() {
  const demo = createDefaultState();

  demo.clinic = {
    ...demo.clinic,
    name: 'Centro Médico Rincón',
    address: 'Av. San Martín 2450, San José del Rincón',
    primaryPhone: '342 555-2488',
    institutionalPhrase: 'Atención médica cercana, profesional y humana',
    showContactData: true,
    socialLinks: [
      { id: 'social_demo_instagram', type: 'Instagram', value: '@centromedicorincon' },
      { id: 'social_demo_facebook', type: 'Facebook', value: 'Centro Médico Rincón' },
      { id: 'social_demo_web', type: 'Sitio web', value: 'www.centromedicorincon.com.ar' }
    ]
  };

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

  demo.coverage = {
    ...demo.coverage,
    insurance: true,
    privatePatients: true
  };

  demo.design = {
    ...demo.design,
    format: 'Historia Instagram 1080x1920',
    primaryColor: 'lila',
    secondaryColor: 'lavanda',
    customPrimaryColor: '',
    customSecondaryColor: '',
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
        instruction: 'Usar como logo institucional superior o inferior, respetando proporciones.'
      },
      {
        id: 'attachment_demo_photo',
        role: ATTACHMENT_ROLES.professionalPhoto,
        fileName: 'dra-mariana-lopez.jpg',
        mimeType: 'image/jpeg',
        status: 'selected',
        instruction: 'Integrar como foto profesional sin deformar rostro ni alterar identidad.'
      },
      {
        id: 'attachment_demo_reference',
        role: ATTACHMENT_ROLES.referenceFlyer,
        fileName: 'referencia-flyer-clinico-lila.png',
        mimeType: 'image/png',
        status: 'selected',
        instruction: 'Tomar como referencia general de estilo, composición y paleta.'
      }
    ]
  };

  demo.promptOptions = {
    ...demo.promptOptions,
    promptType: 'finalFlyer',
    finalAlternativesCount: 2,
    requireSeparateImages: true,
    preventCollage: true,
    requireMobileSafeArea: true,
    allowVisualCreativity: true,
    visualCreativityLevel: 'moderada',
    suggestedPhrase: 'Cuidá tu salud, controlá tus factores de riesgo',
    forbiddenPhrases: 'No usar frases alarmistas ni promesas de curación',
    highlightData: 'Nombre de la médica, clínica médica y diabetología, días y horarios de atención, WhatsApp para turnos',
    smallData: 'Matrícula, dirección, redes sociales y nota administrativa',
    freeInstructions: 'Crear un flyer sobrio, moderno y claro. Puede incluir recursos visuales relacionados con clínica médica, diabetes, metabolismo, control de glucemia, corazón o signos vitales, sin sobrecargar el diseño.'
  };

  return demo;
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
  const preset = colorPresets[state.design.primaryColor] || colorPresets.lila;
  const uiAccent = ['blanco', 'grisClaro', 'beige', 'rosaSuave'].includes(state.design.primaryColor) ? '#475569' : preset.css;
  document.documentElement.style.setProperty('--accent', uiAccent);
  document.documentElement.style.setProperty('--accent-soft', colorPresets[state.design.secondaryColor]?.soft || preset.soft);
}

function showStep(step) {
  document.querySelectorAll('.form-section').forEach(section => section.classList.toggle('is-current', section.dataset.step === step));
  document.querySelectorAll('.step-button').forEach(button => button.classList.toggle('is-active', button.dataset.stepTarget === step));
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
      update(true);
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
  return path === 'specialty.primaryProfessionalSpecialty'
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

function showStatus(message) {
  const node = document.querySelector('#statusMessage');
  node.textContent = message;
  window.setTimeout(() => {
    if (node.textContent === message) node.textContent = '';
  }, 3000);
}
