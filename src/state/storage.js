const STORAGE_KEY = 'flyerClinicoPromptBuilder.state';
const TEMPLATE_KEY = 'flyerClinicoPromptBuilder.template';

export function loadState() {
  return readJson(STORAGE_KEY);
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveTemplate(state) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(state));
}

export function loadTemplate() {
  return readJson(TEMPLATE_KEY);
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
