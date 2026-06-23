import { colorPresets } from './data/designPresets.js';
import { specialties } from './data/specialties.js';
import { buildPrompt } from './prompt/promptBuilder.js';
import { createDefaultState } from './state/defaultState.js';
import { getLegacyAttachmentFiles, toLegacyState, updateFromLegacyPath } from './state/legacyAdapter.js';
import { migrateState } from './state/migrations.js';
import { clearState, loadState, loadTemplate, saveState, saveTemplate } from './state/storage.js';
import { renderForm } from './ui/formRenderer.js';
import { renderPreview, renderResult } from './ui/previewRenderer.js';
import { validateState } from './ui/validation.js';

let state = loadState();

const handlers = {
  onFieldChange(path, value) {
    updateFromLegacyPath(state, path, value);
    if (path === 'services.primarySpecialty') applySpecialtyPreset(value);
    if (path === 'design.primaryColor') applyPrimaryColorPreset(value);
    update(shouldRenderForm(path));
  },
  onRemoveService(index) {
    state.services.visibleServices.splice(index, 1);
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
  }
};

bindStaticActions();
update(true);

function update(renderFields = false) {
  const legacyState = toLegacyState(state);
  const validation = validateState(legacyState);
  const prompt = buildPrompt(legacyState);
  if (renderFields) renderForm(legacyState, handlers);
  renderPreview(legacyState, validation);
  renderResult(prompt, validation, legacyState);
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

function buildAttachmentsChecklistText() {
  const files = getLegacyAttachmentFiles(state);
  if (!files.length) return 'No hay archivos seleccionados para adjuntar antes de pegar el prompt.';
  return ['Antes de pegar el prompt en ChatGPT, adjunta estos archivos:']
    .concat(files.map(([label, value]) => `- ${label}: ${value}`))
    .join('\n');
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
