import { createDefaultState } from './defaultState.js';
import { migrateState } from './migrations.js';
import { ATTACHMENT_ROLES } from './schema.js';

const STORAGE_KEY = 'flyerClinicoPromptBuilder.state';
const TEMPLATE_KEY = 'flyerClinicoPromptBuilder.template';

export function loadState() {
  const stored = readJson(STORAGE_KEY);
  return hydrateStartupState(stored ? migrateState(stored) : createDefaultState());
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrateStartupState(migrateState(state))));
}

export function saveTemplate(state) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(sanitizeTemplateState(migrateState(state))));
}

export function loadTemplate() {
  const stored = readJson(TEMPLATE_KEY);
  return stored ? sanitizeTemplateState(migrateState(stored)) : null;
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hydrateStartupState(input) {
  const source = cloneJson(input || createDefaultState());
  const state = createDefaultState();
  state.clinic = cloneJson(source.clinic || state.clinic);

  const logoFileName = String(state?.clinic?.logoFileName || '').trim();
  state.attachments.items = logoFileName
    ? [clinicLogoAttachment(state.clinic)]
    : [];

  return state;
}

function sanitizeTemplateState(input) {
  const state = cloneJson(input || createDefaultState());

  const logoFileName = String(state?.clinic?.logoFileName || '').trim();
  state.attachments = state.attachments && typeof state.attachments === 'object' ? state.attachments : { items: [] };
  state.attachments.items = logoFileName
    ? [clinicLogoAttachment(state.clinic)]
    : [];

  if (state.professional && typeof state.professional === 'object') {
    state.professional.photoFileName = '';
    state.professional.showPhoto = false;
  }

  return state;
}

function clinicLogoAttachment(clinic = {}) {
  return {
    id: 'attachment_clinicLogo',
    role: ATTACHMENT_ROLES.clinicLogo,
    fileName: String(clinic.logoFileName || '').trim(),
    mimeType: '',
    status: 'selected',
    instruction: clinic.logoInstruction || 'Usar como logo institucional, respetando proporciones.'
  };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
