import { createDefaultState } from './defaultState.js';
import { migrateState } from './migrations.js';
import { ATTACHMENT_ROLES } from './schema.js';

const STORAGE_KEY = 'flyerClinicoPromptBuilder.state';
const TEMPLATE_KEY = 'flyerClinicoPromptBuilder.template';

export function loadState() {
  const stored = readJson(STORAGE_KEY);
  return sanitizePersistedState(stored ? migrateState(stored) : createDefaultState());
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizePersistedState(migrateState(state))));
}

export function saveTemplate(state) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(sanitizePersistedState(migrateState(state))));
}

export function loadTemplate() {
  const stored = readJson(TEMPLATE_KEY);
  return stored ? sanitizePersistedState(migrateState(stored)) : null;
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

function sanitizePersistedState(input) {
  const state = cloneJson(input || createDefaultState());

  const logoFileName = String(state?.clinic?.logoFileName || '').trim();
  state.attachments = state.attachments && typeof state.attachments === 'object' ? state.attachments : { items: [] };
  state.attachments.items = logoFileName
    ? [{
        id: 'attachment_clinicLogo',
        role: ATTACHMENT_ROLES.clinicLogo,
        fileName: logoFileName,
        mimeType: '',
        status: 'selected',
        instruction: state?.clinic?.logoInstruction || 'Usar como logo institucional, respetando proporciones.'
      }]
    : [];

  if (state.professional && typeof state.professional === 'object') {
    state.professional.photoFileName = '';
    state.professional.showPhoto = false;
  }

  return state;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
