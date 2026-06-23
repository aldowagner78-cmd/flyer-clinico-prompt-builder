import { createDefaultState } from './defaultState.js';
import { migrateState } from './migrations.js';

const STORAGE_KEY = 'flyerClinicoPromptBuilder.state';
const TEMPLATE_KEY = 'flyerClinicoPromptBuilder.template';

export function loadState() {
  const stored = readJson(STORAGE_KEY);
  return stored ? migrateState(stored) : createDefaultState();
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(migrateState(state)));
}

export function saveTemplate(state) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(migrateState(state)));
}

export function loadTemplate() {
  const stored = readJson(TEMPLATE_KEY);
  return stored ? migrateState(stored) : null;
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
