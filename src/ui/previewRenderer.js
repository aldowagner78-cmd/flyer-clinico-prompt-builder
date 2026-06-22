import { colorPresets } from '../data/designPresets.js';

export function renderPreview(state, validation) {
  const summary = document.querySelector('#summaryPanel');
  const colorLabel = colorPresets[state.design.primaryColor]?.label || state.design.customColor || 'Lila';
  summary.innerHTML = `
    <dl>
      <div><dt>Clinica</dt><dd>${escapeHtml(state.clinic.name) || 'Sin completar'}</dd></div>
      <div><dt>Profesional</dt><dd>${escapeHtml([state.doctor.title, state.doctor.name].filter(Boolean).join(' ')) || 'Sin completar'}</dd></div>
      <div><dt>Especialidad</dt><dd>${escapeHtml(state.services.specialty) || 'Sin completar'}</dd></div>
      <div><dt>Prestacion destacada</dt><dd>${escapeHtml(state.services.featured) || 'Sin completar'}</dd></div>
      <div><dt>Atencion</dt><dd>${escapeHtml([state.care.days, state.care.hours].filter(Boolean).join(' - ')) || 'Sin completar'}</dd></div>
      <div><dt>Color</dt><dd>${escapeHtml(colorLabel)}</dd></div>
      <div><dt>Estilo</dt><dd>${escapeHtml(state.design.visualStyle)}</dd></div>
    </dl>
  `;

  document.querySelector('#progressText').textContent = `${validation.percent}%`;
  document.querySelector('#progressBar').style.width = `${validation.percent}%`;
}

export function renderResult(prompt, validation) {
  document.querySelector('#promptOutput').value = prompt;
  document.querySelector('#checklist').innerHTML = validation.checklist.map(item => `
    <li class="${item.ok ? 'ok' : 'missing'}"><span>${item.ok ? 'OK' : 'Revisar'}</span>${escapeHtml(item.label)}</li>
  `).join('');
  document.querySelector('#warnings').innerHTML = validation.warnings.length
    ? validation.warnings.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No hay advertencias importantes.</li>';
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
