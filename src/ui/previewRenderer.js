import { colorPresets } from '../data/designPresets.js';

export function renderPreview(state, validation) {
  const summary = document.querySelector('#summaryPanel');
  summary.innerHTML = `
    <dl>
      <div><dt>Clinica</dt><dd>${escapeHtml(state.clinic.name) || 'Sin completar'}</dd></div>
      <div><dt>Profesional</dt><dd>${escapeHtml([state.doctor.title, state.doctor.name].filter(Boolean).join(' ')) || 'Sin completar'}</dd></div>
      <div><dt>Especialidad principal</dt><dd>${escapeHtml(state.services.primarySpecialty) || 'Sin completar'}</dd></div>
      <div><dt>Especialidades adicionales</dt><dd>${escapeHtml(listOrFallback(state.services.additionalSpecialties))}</dd></div>
      <div><dt>Area destacada</dt><dd>${escapeHtml(getHighlightedArea(state))}</dd></div>
      <div><dt>Prestacion destacada</dt><dd>${escapeHtml(state.services.featured) || 'Sin completar'}</dd></div>
      <div><dt>Atencion</dt><dd>${escapeHtml(formatSchedules(state.care.schedules))}</dd></div>
      <div><dt>Color</dt><dd>${escapeHtml(getColorName(state.design.primaryColor, state.design.primaryCustomColor))}</dd></div>
      <div><dt>Estilo</dt><dd>${escapeHtml(state.design.visualStyle)}</dd></div>
    </dl>
  `;

  document.querySelector('#progressText').textContent = `${validation.percent}%`;
  document.querySelector('#progressBar').style.width = `${validation.percent}%`;
}

export function renderResult(prompt, validation, state) {
  document.querySelector('#promptOutput').value = prompt;
  document.querySelector('#checklist').innerHTML = validation.checklist.map(item => `
    <li class="${item.ok ? 'ok' : 'missing'}"><span>${item.ok ? 'OK' : 'Revisar'}</span>${escapeHtml(item.label)}</li>
  `).join('');
  document.querySelector('#attachmentsChecklist').innerHTML = renderAttachmentsChecklist(state);
  document.querySelector('#warnings').innerHTML = validation.warnings.length
    ? validation.warnings.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No hay advertencias importantes.</li>';
}

function renderAttachmentsChecklist(state) {
  const files = [
    ['Logo de clinica', state.images.logoName],
    ['Foto del medico', state.images.doctorPhotoName],
    ['Imagen de referencia del flyer', state.images.referenceName],
    ['Imagen tematica opcional', state.images.themeName]
  ].filter(([, value]) => value);

  if (!files.length) return '<li class="missing"><span>Sin adjuntos</span>No hay archivos seleccionados.</li>';
  return [
    '<li class="ok"><span>Antes</span>Antes de pegar el prompt en ChatGPT, adjunta estos archivos:</li>',
    ...files.map(([label, value]) => `<li class="ok"><span>Adjuntar</span>${escapeHtml(label)}: ${escapeHtml(value)}</li>`)
  ].join('');
}

function getHighlightedArea(state) {
  if (state.services.highlightedArea.trim()) return state.services.highlightedArea.trim();
  const specialties = [state.services.primarySpecialty, ...state.services.additionalSpecialties].filter(Boolean);
  return specialties.length > 1 ? joinReadable(specialties) : specialties[0] || 'Sin completar';
}

function formatSchedules(schedules) {
  const complete = schedules.filter(item => item.days && item.from && item.to);
  if (!complete.length) return 'Sin completar';
  return complete.map(item => `${item.days}: ${item.from} a ${item.to}${item.note ? ` (${item.note})` : ''}`).join(' / ');
}

function getColorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado') && custom) return custom;
  return colorPresets[key]?.label || 'Lila';
}

function listOrFallback(values) {
  return values.length ? values.join(', ') : 'Sin adicionales';
}

function joinReadable(values) {
  if (values.length <= 2) return values.join(' y ');
  return `${values.slice(0, -1).join(', ')} y ${values.at(-1)}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
