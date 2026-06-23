import { defaultClinic } from './data/defaultClinic.js';
import { colorPresets } from './data/designPresets.js';
import { specialties } from './data/specialties.js';
import { buildPrompt } from './prompt/promptBuilder.js';
import { clearState, loadState, loadTemplate, saveState, saveTemplate } from './state/storage.js';
import { renderForm } from './ui/formRenderer.js';
import { renderPreview, renderResult } from './ui/previewRenderer.js';
import { validateState } from './ui/validation.js';

let state = mergeState(createDefaultState(), loadState());

const handlers = {
  onFieldChange(path, value) {
    setByPath(state, path, value);
    if (path === 'services.primarySpecialty') applySpecialtyPreset(value);
    if (path === 'design.primaryColor') applyPrimaryColorPreset(value);
    update(shouldRenderForm(path));
  },
  onRemoveService(index) {
    state.services.items.splice(index, 1);
    update(true);
  },
  onAddAdditionalSpecialty(value) {
    if (value && value !== state.services.primarySpecialty && !state.services.additionalSpecialties.includes(value)) {
      state.services.additionalSpecialties.push(value);
      update(true);
    }
  },
  onRemoveAdditionalSpecialty(index) {
    state.services.additionalSpecialties.splice(index, 1);
    update(true);
  },
  onAddSocialLink() {
    state.clinic.socialLinks.push({ type: 'Instagram', value: '' });
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
    state.care.schedules.push({ days: '', from: '', to: '', note: '' });
    update(true);
  },
  onRemoveSchedule(index) {
    state.care.schedules.splice(index, 1);
    update(true);
  },
  onUpdateSchedule(index, key, value) {
    state.care.schedules[index][key] = value;
    update(false);
  }
};

bindStaticActions();
update(true);

function createDefaultState() {
  return {
    clinic: { ...defaultClinic, socialLinks: [] },
    doctor: { title: 'Dr.', name: '', specialty: '', license: '', showPhoto: true, roleNote: '' },
    services: { primarySpecialty: 'Cardiologia', additionalSpecialties: [], highlightedArea: '', specialty: 'Cardiologia', featured: '', items: [], allowExpansion: false, expansionNotes: '' },
    care: { schedules: [], days: '', hours: '', insurance: true, privateCare: true, requiresAppointment: true, appointmentText: 'Solicitar turno por WhatsApp.', modality: 'presencial', adminNote: '' },
    design: { format: 'Historia Instagram 1080x1920', primaryColor: 'lila', primaryCustomColor: '', secondaryColor: 'lavanda', secondaryCustomColor: '', customColor: '', visualStyle: 'moderno', typography: 'moderna sans serif', impact: 'medio', includeIcons: true, includeThemeBackground: true, autoTheme: true, usePinnedStyle: true },
    images: { logoName: '', doctorPhotoName: '', referenceName: '', themeName: '' },
    advanced: { suggestedPhrase: '', forbiddenPhrases: '', highlightData: '', smallData: '', freeInstructions: '', creativity: 'Si, moderada: permitir recursos visuales relacionados con la especialidad.' }
  };
}

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
  document.querySelector('#downloadPromptButton').addEventListener('click', downloadPrompt);
  document.querySelector('#saveTemplateButton').addEventListener('click', () => {
    saveTemplate(state);
    showStatus('Plantilla guardada en este navegador.');
  });
  document.querySelector('#loadTemplateButton').addEventListener('click', () => {
    const template = loadTemplate();
    if (!template) return showStatus('No hay plantilla guardada.');
    state = mergeState(createDefaultState(), template);
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

function addService() {
  const input = document.querySelector('#newService');
  const value = input.value.trim();
  if (!value) return;
  state.services.items.push(value);
  input.value = '';
  update(true);
}

function applySpecialtyPreset(name) {
  const preset = specialties.find(item => item.name === name);
  if (!preset) return;
  state.doctor.specialty = state.doctor.specialty || name;
  state.services.specialty = name;
  if (!state.services.items.length) state.services.items = [...preset.services];
  if (!state.services.featured && preset.services[0]) state.services.featured = preset.services[0];
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
      state = mergeState(createDefaultState(), JSON.parse(reader.result));
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
  validation.fieldPaths.forEach(markPath);
}

function markPath(path) {
  const input = document.querySelector(`[data-path="${path}"]`);
  const row = document.querySelector(`[data-warning-path="${path}"]`);
  input?.closest('.field')?.classList.add('has-warning');
  row?.classList.add('has-warning');
}

function shouldRenderForm(path) {
  return path === 'services.primarySpecialty'
    || path === 'services.allowExpansion'
    || path === 'design.primaryColor'
    || path === 'design.secondaryColor'
    || path.startsWith('images.');
}

function setByPath(target, path, value) {
  const parts = path.split('.');
  const key = parts.pop();
  const owner = parts.reduce((object, part) => object[part], target);
  owner[key] = value;
}

function mergeState(base, saved) {
  if (!saved) return base;
  const merged = {
    ...base,
    ...saved,
    clinic: { ...base.clinic, ...saved.clinic },
    doctor: { ...base.doctor, ...saved.doctor },
    services: { ...base.services, ...saved.services, items: Array.isArray(saved.services?.items) ? saved.services.items : base.services.items },
    care: { ...base.care, ...saved.care },
    design: { ...base.design, ...saved.design },
    images: { ...base.images, ...saved.images },
    advanced: { ...base.advanced, ...saved.advanced }
  };
  return migrateState(merged, saved);
}

function migrateState(merged, saved) {
  const legacySocial = saved?.clinic?.social || '';
  if (!Array.isArray(merged.clinic.socialLinks)) merged.clinic.socialLinks = [];
  if (legacySocial && !merged.clinic.socialLinks.length) {
    merged.clinic.socialLinks = [{ type: 'Instagram', value: legacySocial }];
  }

  if (!merged.services.primarySpecialty) merged.services.primarySpecialty = merged.services.specialty || 'Cardiologia';
  merged.services.specialty = merged.services.primarySpecialty;
  if (!Array.isArray(merged.services.additionalSpecialties)) merged.services.additionalSpecialties = [];

  if (!Array.isArray(merged.care.schedules)) merged.care.schedules = [];
  if (!merged.care.schedules.length && (merged.care.days || merged.care.hours)) {
    merged.care.schedules = [{ days: merged.care.days || '', from: '', to: '', note: merged.care.hours || '' }];
  }

  if (isLegacyColorValue(merged.design.primaryColor)) {
    merged.design.primaryCustomColor = merged.design.primaryColor;
    merged.design.primaryColor = 'otro';
  }
  if (isLegacyColorValue(merged.design.secondaryColor)) {
    merged.design.secondaryCustomColor = merged.design.secondaryColor;
    merged.design.secondaryColor = 'otro';
  }
  if (merged.design.customColor && !merged.design.primaryCustomColor) merged.design.primaryCustomColor = merged.design.customColor;
  if (merged.design.primaryColor === 'personalizado') merged.design.primaryColor = 'otro';
  if (merged.design.secondaryColor === 'personalizado') merged.design.secondaryColor = 'otro';
  if (merged.design.primaryColor === 'gris') merged.design.primaryColor = 'grisInstitucional';
  if (merged.design.secondaryColor === 'gris') merged.design.secondaryColor = 'grisInstitucional';
  if (merged.design.primaryColor === 'naranja') merged.design.primaryColor = 'naranjaSuave';
  if (merged.design.secondaryColor === 'naranja') merged.design.secondaryColor = 'naranjaSuave';
  if (!colorPresets[merged.design.primaryColor]) merged.design.primaryColor = 'lila';
  if (!colorPresets[merged.design.secondaryColor]) merged.design.secondaryColor = 'lavanda';
  return merged;
}

function buildAttachmentsChecklistText() {
  const files = [
    ['Logo de clinica', state.images.logoName],
    ['Foto del medico', state.images.doctorPhotoName],
    ['Imagen de referencia del flyer', state.images.referenceName],
    ['Imagen tematica opcional', state.images.themeName]
  ].filter(([, value]) => value);
  if (!files.length) return 'No hay archivos seleccionados para adjuntar antes de pegar el prompt.';
  return ['Antes de pegar el prompt en ChatGPT, adjunta estos archivos:']
    .concat(files.map(([label, value]) => `- ${label}: ${value}`))
    .join('\n');
}

function isOtherColor(value) {
  return value === 'otro' || value === 'personalizado';
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
