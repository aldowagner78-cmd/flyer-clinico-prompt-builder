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
    if (path === 'services.specialty') applySpecialtyPreset(value);
    if (path === 'design.primaryColor') applyColorPreset(value);
    update(shouldRenderForm(path));
  },
  onRemoveService(index) {
    state.services.items.splice(index, 1);
    update(true);
  }
};

bindStaticActions();
update(true);

function createDefaultState() {
  return {
    clinic: { ...defaultClinic },
    doctor: { title: 'Dr.', name: '', specialty: '', license: '', showPhoto: true, roleNote: '' },
    services: { specialty: 'Cardiologia', featured: '', items: [], allowExpansion: false, expansionNotes: '' },
    care: { days: '', hours: '', insurance: true, privateCare: true, requiresAppointment: true, appointmentText: 'Solicitar turno por WhatsApp.', modality: 'presencial', adminNote: '' },
    design: { format: 'Historia Instagram 1080x1920', primaryColor: 'lila', secondaryColor: colorPresets.lila.secondary, customColor: '', visualStyle: 'moderno', typography: 'moderna sans serif', impact: 'medio', includeIcons: true, includeThemeBackground: true, autoTheme: true, usePinnedStyle: true },
    images: { logoName: '', doctorPhotoName: '', referenceName: '', themeName: '' },
    advanced: { suggestedPhrase: '', forbiddenPhrases: '', highlightData: '', smallData: '', freeInstructions: '', creativity: 'Si, moderada: permitir recursos visuales relacionados con la especialidad.' }
  };
}

function update(renderFields = false) {
  const validation = validateState(state);
  const prompt = buildPrompt(state);
  if (renderFields) renderForm(state, handlers);
  renderPreview(state, validation);
  renderResult(prompt, validation);
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
  if (!state.services.items.length) state.services.items = [...preset.services];
  if (!state.services.featured && preset.services[0]) state.services.featured = preset.services[0];
}

function applyColorPreset(key) {
  const preset = colorPresets[key] || colorPresets.lila;
  state.design.secondaryColor = preset.secondary;
}

function applyTheme() {
  const preset = colorPresets[state.design.primaryColor] || colorPresets.lila;
  const primary = state.design.primaryColor === 'personalizado' && state.design.customColor ? state.design.customColor : preset.primary;
  document.documentElement.style.setProperty('--accent', primary);
  document.documentElement.style.setProperty('--accent-soft', state.design.secondaryColor || preset.secondary);
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
  document.querySelectorAll('.field').forEach(field => field.classList.remove('has-warning'));
  if (validation.warnings.some(item => item.includes('Nombre del medico'))) markPath('doctor.name');
  if (validation.warnings.some(item => item.includes('Especialidad'))) markPath('services.specialty');
  if (validation.warnings.some(item => item.includes('Dia y horario'))) {
    markPath('care.days');
    markPath('care.hours');
  }
  if (validation.warnings.some(item => item.includes('Prestaciones'))) markPath('services.featured');
  if (validation.warnings.some(item => item.includes('Modalidad'))) markPath('care.modality');
  if (validation.warnings.some(item => item.includes('Color'))) markPath('design.primaryColor');
  if (validation.warnings.some(item => item.includes('contacto'))) markPath('clinic.phone');
}

function markPath(path) {
  const input = document.querySelector(`[data-path="${path}"]`);
  input?.closest('.field')?.classList.add('has-warning');
}

function shouldRenderForm(path) {
  return path === 'services.specialty'
    || path === 'services.allowExpansion'
    || path === 'design.primaryColor'
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
  return {
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
}

function showStatus(message) {
  const node = document.querySelector('#statusMessage');
  node.textContent = message;
  window.setTimeout(() => {
    if (node.textContent === message) node.textContent = '';
  }, 3000);
}
