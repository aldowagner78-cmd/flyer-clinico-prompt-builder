import { colorPresets } from '../data/designPresets.js';
import { PIECE_TYPES } from '../state/schema.js';

export function renderPreview(state, validation) {
  const summary = document.querySelector('#summaryPanel');
  summary.innerHTML = `
    <dl>
      <div><dt>Tipo de pieza</dt><dd>${escapeHtml(labelPieceType(state.promptOptions.pieceType))}</dd></div>
      <div><dt>Resultado</dt><dd>${state.promptOptions.pieceType === PIECE_TYPES.jinglePromotional ? 'Audio / jingle' : state.promptOptions.requestAnimation ? 'Animado' : 'Estático'}</dd></div>
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
  const attachmentFiles = collectAttachmentFiles(state).filter(item => item.fileName);
  const promptOutput = document.querySelector('#promptOutput');
  if (promptOutput) {
    promptOutput.value = prompt;
    promptOutput.textContent = prompt;
  }
  document.querySelector('#checklist').innerHTML = validation.checklist.map(item => `
    <li class="${item.ok ? 'ok' : 'missing'}"><span>${item.ok ? 'OK' : 'Revisar'}</span>${escapeHtml(item.label)}</li>
  `).join('');
  document.querySelector('#attachmentsChecklist').innerHTML = renderAttachmentsChecklist(state, attachmentFiles);
  document.querySelector('#warnings').innerHTML = renderIssues(validation);
  renderFinalReview(validation, attachmentFiles);
}

function renderFinalReview(validation, attachmentFiles = []) {
  const checklist = Array.isArray(validation?.checklist) ? validation.checklist : [];
  const issues = Array.isArray(validation?.issues) ? validation.issues : [];
  const completed = checklist.filter(item => item.ok).length;
  const total = checklist.length;
  const warningsCount = issues.filter(item => item.severity === 'warning' || item.severity === 'blocking').length;
  const suggestionsCount = issues.filter(item => item.severity === 'suggestion').length;
  const hasAttachments = attachmentFiles.length > 0;

  const title = document.querySelector('#finalReviewTitle');
  const summary = document.querySelector('#finalReviewSummary');
  const steps = document.querySelector('#finalReviewSteps');

  if (title) {
    title.textContent = warningsCount
      ? 'Revisá antes de copiar'
      : 'Listo para copiar con revisión final';
  }

  if (summary) {
    summary.textContent = warningsCount
      ? `Hay ${warningsCount} advertencia${warningsCount === 1 ? '' : 's'} para revisar. El prompt se puede copiar, pero conviene corregir o confirmar esos puntos.`
      : 'Los datos mínimos están completos. Revisá los adjuntos y copiá el prompt final cuando estés conforme.';
  }

  if (!steps) return;

  steps.innerHTML = [
    renderFinalReviewStep('Datos mínimos', `${completed}/${total || 0} puntos completos en el checklist principal.`, completed === total && total > 0 ? 'ok' : 'review'),
    renderFinalReviewStep(
      'Adjuntos',
      hasAttachments
        ? `${attachmentFiles.length} archivo${attachmentFiles.length === 1 ? '' : 's'} para adjuntar manualmente antes de pegar el prompt.`
        : 'No hay archivos seleccionados. Si el diseño necesita logos, fotos o referencias, agregalos antes de copiar.',
      hasAttachments ? 'review' : 'ok'
    ),
    renderFinalReviewStep(
      'Advertencias',
      warningsCount
        ? `${warningsCount} advertencia${warningsCount === 1 ? '' : 's'} y ${suggestionsCount} sugerencia${suggestionsCount === 1 ? '' : 's'} detectadas.`
        : suggestionsCount
          ? `${suggestionsCount} sugerencia${suggestionsCount === 1 ? '' : 's'} opcional${suggestionsCount === 1 ? '' : 'es'} para mejorar el resultado.`
          : 'Sin advertencias importantes.',
      warningsCount ? 'review' : 'ok'
    ),
    renderFinalReviewStep('Copiar y generar', 'Copiá el prompt revisado y pegalo en ChatGPT después de subir los adjuntos indicados.', 'next')
  ].join('');
}

function renderFinalReviewStep(title, text, status = 'ok') {
  const labels = {
    ok: 'OK',
    review: 'Revisar',
    next: 'Sigue'
  };

  return `
    <li class="${escapeHtml(status)}">
      <span>${escapeHtml(labels[status] || 'OK')}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(text)}</small>
      </div>
    </li>
  `;
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
    ...issues.map(issue => {
      const message = issue.message || issue;
      return `
        <li class="${className}">
          <span>${escapeHtml(badge)}</span>
          <div class="issue-copy">
            <strong>${escapeHtml(message)}</strong>
            ${issue.path ? `<small>Campo: ${escapeHtml(readableIssuePath(issue.path))}</small>` : ''}
          </div>
          ${issue.path ? `
            <button
              class="secondary-button compact-action issue-fix-button"
              type="button"
              data-fix-issue-path="${escapeHtml(issue.path)}"
              data-fix-issue-message="${escapeHtml(message)}">
              Corregir
            </button>
          ` : ''}
        </li>
      `;
    })
  ].join('');
}

function readableIssuePath(path = '') {
  const labels = {
    'clinic.name': 'Nombre de la institución',
    'clinic.primaryPhone': 'Datos de contacto',
    'promptOptions.pieceType': 'Tipo de pieza',
    'professional.fullName': 'Nombre del profesional',
    'professional.title': 'Título profesional',
    'professional.license': 'Matrícula',
    'specialty.primaryProfessionalSpecialty': 'Especialidad principal',
    'specialty.visibleSpecialtyText': 'Texto visible de especialidad',
    'specialty.communicationFocus': 'Enfoque comunicacional',
    'services.visibleServices': 'Prestaciones visibles',
    'schedule.modality': 'Modalidad de atención',
    'schedule.items': 'Horarios de atención',
    'design.primaryColor': 'Color principal',
    'design.secondaryColor': 'Color secundario',
    'design.customPrimaryColor': 'Color principal personalizado',
    'design.customSecondaryColor': 'Color secundario personalizado',
    'design.contentDensity': 'Densidad del contenido',
    'attachments.items': 'Adjuntos'
  };

  if (labels[path]) return labels[path];
  if (path.startsWith('clinic.socialLinks')) return 'Redes sociales';
  if (path.startsWith('schedule.items')) return 'Horarios de atención';
  if (path.startsWith('attachments.items')) return 'Adjuntos';
  if (path.startsWith('promptOptions.')) return 'Opciones de contenido';
  if (path.startsWith('design.')) return 'Diseño visual';
  return path || 'Campo sugerido';
}

function renderAttachmentsChecklist(state, precomputedFiles = null) {
  const files = Array.isArray(precomputedFiles)
    ? precomputedFiles
    : collectAttachmentFiles(state).filter(item => item.fileName);

  if (!files.length) {
    return '<li class="ok no-attachments"><span>Sin adjuntos</span>No hay archivos seleccionados. Si necesitás logo, foto o referencia visual, agregalos antes de copiar.</li>';
  }

  return [
    '<li class="missing attachment-reminder"><span>Importante</span>La app solo guarda nombres: no sube archivos. Adjuntá manualmente estos archivos en ChatGPT antes de pegar el prompt. Si falta alguno, pedilo por nombre exacto antes de generar.</li>',
    ...files.map((item, index) => `
      <li class="ok attachment-item">
        <span>${escapeHtml(String(index + 1).padStart(2, '0'))}</span>
        <div>
          <strong>${escapeHtml(labelAttachmentRole(item.role))}: ${escapeHtml(item.fileName)}</strong>
          ${item.instruction ? `<small>${escapeHtml(item.instruction)}</small>` : ''}
        </div>
      </li>
    `)
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
    promotionCampaign: 'Promoción / campaña',
    jinglePromotional: 'Jingle / canción promocional'
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
    videoBase: 'Video base',
    videoProfessionalPhoto: 'Foto del profesional',
    videoLogo: 'Logo institucional',
    videoSupportImage: 'Imagen de apoyo',
    videoVisualReference: 'Referencia visual para video',
    videoStyleReference: 'Referencia de estilo',
    videoOther: 'Otro material de video',
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
