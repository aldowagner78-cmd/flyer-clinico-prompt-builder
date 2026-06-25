import { colorPresets } from '../data/designPresets.js';
import { PIECE_TYPES } from '../state/schema.js';

export function renderPreview(state, validation) {
  const summary = document.querySelector('#summaryPanel');
  summary.innerHTML = `
    <dl>
      <div><dt>Tipo de pieza</dt><dd>${escapeHtml(labelPieceType(state.promptOptions.pieceType))}</dd></div>
      <div><dt>Resultado</dt><dd>${state.promptOptions.requestAnimation ? 'Animado' : 'Estático'}</dd></div>
      <div><dt>Objetivo</dt><dd>${escapeHtml(state.promptOptions.contentGoal) || 'Sin completar'}</dd></div>
      <div><dt>Institución</dt><dd>${escapeHtml(state.clinic.name) || 'Sin completar'}</dd></div>
      <div><dt>Tipo institución</dt><dd>${escapeHtml(state.clinic.institutionType) || 'Sin completar'}</dd></div>
      <div><dt>Profesional</dt><dd>${escapeHtml([state.professional.title, state.professional.fullName].filter(Boolean).join(' ')) || 'Sin completar'}</dd></div>
      <div><dt>Especialidad principal</dt><dd>${escapeHtml(state.specialty.primaryProfessionalSpecialty) || 'Sin completar'}</dd></div>
      <div><dt>Adicionales</dt><dd>${escapeHtml(listOrFallback(state.specialty.additionalSpecialties))}</dd></div>
      <div><dt>Enfoque</dt><dd>${escapeHtml(state.specialty.communicationFocus) || 'Sin completar'}</dd></div>
      <div><dt>Texto visible</dt><dd>${escapeHtml(state.specialty.visibleSpecialtyText) || 'Sin completar'}</dd></div>
      <div><dt>Prestaciones visibles</dt><dd>${escapeHtml(listOrFallback(state.services.visibleServices))}</dd></div>
      <div><dt>Atencion</dt><dd>${escapeHtml(formatSchedules(state.schedule.items))}</dd></div>
      <div><dt>Redes</dt><dd>${escapeHtml(formatSocialLinks(state.clinic.socialLinks))}</dd></div>
      <div><dt>Adjuntos</dt><dd>${escapeHtml(formatAttachments(state.attachments.items, state))}</dd></div>
      <div><dt>Densidad</dt><dd>${escapeHtml(labelContentDensity(state.design.contentDensity))}</dd></div>
      <div><dt>Color</dt><dd>${escapeHtml(getColorName(state.design.primaryColor, state.design.customPrimaryColor))}</dd></div>
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
  document.querySelector('#warnings').innerHTML = renderIssues(validation);
}

function renderIssues(validation) {
  const issues = Array.isArray(validation?.issues)
    ? validation.issues
    : (validation?.warnings || []).map(message => ({
        severity: 'warning',
        message
      }));

  if (!issues.length) {
    return '<li class="ok"><span>OK</span>No hay advertencias importantes.</li>';
  }

  const grouped = {
    blocking: issues.filter(item => item.severity === 'blocking'),
    warning: issues.filter(item => item.severity === 'warning'),
    suggestion: issues.filter(item => item.severity === 'suggestion'),
    other: issues.filter(item => !['blocking', 'warning', 'suggestion'].includes(item.severity))
  };

  return [
    renderIssueGroup('Bloqueantes', 'Bloqueante', grouped.blocking, 'missing'),
    renderIssueGroup('Advertencias', 'Advertencia', grouped.warning, 'missing'),
    renderIssueGroup('Sugerencias', 'Sugerencia', grouped.suggestion, 'ok'),
    renderIssueGroup('Otros avisos', 'Aviso', grouped.other, 'missing')
  ].filter(Boolean).join('');
}

function renderIssueGroup(title, badge, issues, className) {
  if (!issues.length) return '';

  return [
    `<li class="${className}"><span>${escapeHtml(title)}</span>${issues.length} ${issues.length === 1 ? 'punto detectado' : 'puntos detectados'}</li>`,
    ...issues.map(issue => `
      <li class="${className}">
        <span>${escapeHtml(badge)}</span>
        ${escapeHtml(issue.message || issue)}
        ${issue.path ? `<small>Campo: ${escapeHtml(issue.path)}</small>` : ''}
      </li>
    `)
  ].join('');
}

function renderAttachmentsChecklist(state) {
  const files = collectAttachmentFiles(state).filter(item => item.fileName);

  if (!files.length) return '<li class="missing"><span>Sin adjuntos</span>No hay archivos seleccionados.</li>';
  return [
    '<li class="ok"><span>Antes</span>Antes de pegar el prompt en ChatGPT, adjunta estos archivos:</li>',
    ...files.map(item => `<li class="ok"><span>Adjuntar</span>${escapeHtml(labelAttachmentRole(item.role))}: ${escapeHtml(item.fileName)}${item.instruction ? ` - ${escapeHtml(item.instruction)}` : ''}</li>`)
  ].join('');
}

function collectAttachmentFiles(state) {
  const pieceType = state?.promptOptions?.pieceType || PIECE_TYPES.professionalFlyer;
  const items = Array.isArray(state?.attachments?.items)
    ? state.attachments.items.filter(item => shouldKeepPreviewAttachmentForPiece(pieceType, item?.role)).map(item => ({ ...item }))
    : [];
  upsertAttachmentPreview(items, 'clinicLogo', state?.clinic?.logoFileName, state?.clinic?.logoInstruction || 'Usar como logo institucional, respetando proporciones.');
  if (shouldIncludePreviewProfessionalPhoto(pieceType, state?.professional)) {
    upsertAttachmentPreview(items, 'professionalPhoto', state?.professional?.photoFileName, 'Usar como foto profesional, sin deformar rostro ni alterar identidad.');
  }
  return items;
}

function shouldIncludePreviewProfessionalPhoto(pieceType, professional = {}) {
  return pieceType === PIECE_TYPES.professionalFlyer
    && Boolean(professional?.showPhoto)
    && String(professional?.photoFileName || '').trim().length > 0;
}

function shouldKeepPreviewAttachmentForPiece(pieceType, role) {
  if (role === 'professionalPhoto') return pieceType === PIECE_TYPES.professionalFlyer;
  return true;
}

function upsertAttachmentPreview(items, role, fileName, instruction = '') {
  const normalizedName = String(fileName || '').trim();
  if (!normalizedName) return;
  const existing = items.find(item => item?.role === role);
  if (existing) {
    existing.fileName = existing.fileName || normalizedName;
    existing.instruction = existing.instruction || instruction;
    return;
  }
  items.unshift({ role, fileName: normalizedName, instruction });
}

function formatSchedules(schedules) {
  const complete = schedules.filter(item => item.days && item.from && item.to);
  if (!complete.length) return 'Sin completar';
  return complete.map(item => `${item.days}: ${item.from} a ${item.to}${item.note ? ` (${item.note})` : ''}`).join(' / ');
}

function formatSocialLinks(socialLinks) {
  const filled = socialLinks.filter(item => item.value);
  if (!filled.length) return 'Sin completar';
  return filled.map(item => `${item.type}: ${item.value}`).join(' / ');
}

function formatAttachments(attachments, state = null) {
  const filled = state ? collectAttachmentFiles(state).filter(item => item.fileName) : attachments.filter(item => item.fileName);
  if (!filled.length) return 'Sin adjuntos';
  return filled.map(item => `${labelAttachmentRole(item.role)}: ${item.fileName}`).join(' / ');
}

function getColorName(key, custom) {
  if ((key === 'otro' || key === 'personalizado') && custom) return custom;
  return colorPresets[key]?.label || 'Lila';
}

function listOrFallback(values) {
  return values.length ? values.join(', ') : 'Sin adicionales';
}

function labelPieceType(value) {
  return {
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografia clinica',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promoción / campaña'
  }[value] || 'Flyer profesional';
}

function labelContentDensity(value) {
  return {
    brief: 'Breve',
    balanced: 'Equilibrado',
    detailed: 'Detallado'
  }[value] || value || 'Sin completar';
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

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
