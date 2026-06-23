import { colorPresets, formats, impactLevels, typographyOptions, visualStyles } from '../data/designPresets.js';
import { specialties } from '../data/specialties.js';
import { ATTACHMENT_ROLES, CONTENT_DENSITIES, PIECE_TYPES, PROMPT_TYPES } from '../state/schema.js';

const titles = ['Dr.', 'Dra.', 'Lic.', 'Prof.', 'Otro'];
const modalities = ['presencial', 'virtual', 'ambas'];
const socialTypes = ['Instagram', 'Facebook', 'TikTok', 'Sitio web', 'WhatsApp', 'Otra'];
const contentDensityOptions = Object.values(CONTENT_DENSITIES);
const pieceTypeOptions = Object.values(PIECE_TYPES);
const creativityLevels = ['strict', 'moderate', 'broad'];
const attachmentRoles = Object.values(ATTACHMENT_ROLES);

export function renderForm(state, handlers) {
  const specialtyNames = specialties.map(item => item.name);
  const colorKeys = Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key));
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  const isInfographic = pieceType === PIECE_TYPES.clinicalInfographic;
  const isInformative = pieceType === PIECE_TYPES.informativeFlyer;
  const isCampaign = pieceType === PIECE_TYPES.promotionCampaign;
  const isProfessional = pieceType === PIECE_TYPES.professionalFlyer;

  renderFields('#pieceFields', [
    select('Que queres crear?', 'promptOptions.pieceType', pieceType, pieceTypeOptions, true, labelPieceType),
    textarea('Objetivo de la pieza', 'promptOptions.contentGoal', state.promptOptions.contentGoal),
    text('Publico objetivo', 'promptOptions.targetAudience', state.promptOptions.targetAudience),
    text('Tema educativo / informativo', 'promptOptions.educationalTopic', state.promptOptions.educationalTopic, false, !(isInfographic || isInformative)),
    textarea('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, false, false),
    textarea('Bloques o puntos informativos', 'promptOptions.infoBlocksText', state.promptOptions.infoBlocksText, false, !(isInfographic || isInformative)),
    text('Tipo de campaña o promoción', 'promptOptions.campaignType', state.promptOptions.campaignType, false, !isCampaign),
    text('Vigencia / fecha / periodo', 'promptOptions.campaignValidity', state.promptOptions.campaignValidity, false, !isCampaign),
    textarea('Condiciones o aclaraciones', 'promptOptions.campaignConditions', state.promptOptions.campaignConditions, false, !isCampaign),
    text('Llamada a la acción principal', 'promptOptions.campaignCallToAction', state.promptOptions.campaignCallToAction, false, !isCampaign),
    textarea('Nota legal, ética o aclaración sanitaria', 'promptOptions.legalEthicalNote', state.promptOptions.legalEthicalNote)
  ], handlers);

  renderFields('#clinicFields', [
    text('Nombre de clinica', 'clinic.name', state.clinic.name, true),
    text('Direccion', 'clinic.address', state.clinic.address),
    text('Telefono / WhatsApp principal', 'clinic.primaryPhone', state.clinic.primaryPhone, true),
    textarea('Frase institucional', 'clinic.institutionalPhrase', state.clinic.institutionalPhrase),
    toggle('Mostrar datos de contacto', 'clinic.showContactData', state.clinic.showContactData),
    toggle('Guardar estos datos como predeterminados', 'clinic.saveAsDefault', state.clinic.saveAsDefault)
  ], handlers);
  renderSocialLinks(state, handlers);

  renderFields('#doctorFields', [
    select('Titulo', 'professional.title', state.professional.title, titles),
    text('Nombre completo', 'professional.fullName', state.professional.fullName, true),
    text('Matricula opcional', 'professional.license', state.professional.license),
    textarea('Aclaracion o cargo opcional', 'professional.roleNote', state.professional.roleNote),
    toggle('Mostrar foto profesional', 'professional.showPhoto', state.professional.showPhoto)
  ], handlers);

  renderFields('#serviceFields', [
    select('Especialidad profesional principal', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
    text('Enfoque comunicacional del flyer', 'specialty.communicationFocus', state.specialty.communicationFocus),
    text('Texto visible recomendado para el flyer', 'specialty.visibleSpecialtyText', state.specialty.visibleSpecialtyText),
    text('Prestacion principal destacada', 'services.mainHighlightedService', state.services.mainHighlightedService, true),
    toggle('Permitir que ChatGPT amplie prestaciones generales razonables', 'services.allowServiceExpansion', state.services.allowServiceExpansion),
    textarea('Instrucciones para ampliacion', 'services.expansionInstructions', state.services.expansionInstructions, false, !state.services.allowServiceExpansion)
  ], handlers);
  renderAdditionalSpecialtiesAndContext(state, handlers, specialtyNames);

  renderFields('#careFields', [
    toggle('Atiende por obra social', 'coverage.insurance', state.coverage.insurance),
    toggle('Atiende particulares', 'coverage.privatePatients', state.coverage.privatePatients),
    toggle('Requiere turno previo', 'schedule.requiresAppointment', state.schedule.requiresAppointment),
    text('Texto personalizado para turnos', 'schedule.appointmentText', state.schedule.appointmentText),
    select('Modalidad', 'schedule.modality', state.schedule.modality, modalities, true),
    textarea('Observacion administrativa opcional', 'schedule.administrativeNote', state.schedule.administrativeNote)
  ], handlers);
  renderSchedules(state, handlers);

  renderFields('#designFields', [
    select('Formato', 'design.format', state.design.format, formats),
    select('Color principal', 'design.primaryColor', state.design.primaryColor, colorKeys, true, key => colorPresets[key].label),
    text('Otro color principal', 'design.customPrimaryColor', state.design.customPrimaryColor, false, !isOtherColor(state.design.primaryColor)),
    select('Color secundario', 'design.secondaryColor', state.design.secondaryColor, colorKeys, false, key => colorPresets[key].label),
    text('Otro color secundario', 'design.customSecondaryColor', state.design.customSecondaryColor, false, !isOtherColor(state.design.secondaryColor)),
    select('Estilo visual', 'design.visualStyle', state.design.visualStyle, visualStyles),
    select('Tipografia sugerida', 'design.typography', state.design.typography, typographyOptions),
    select('Nivel de impacto visual', 'design.visualImpact', state.design.visualImpact, impactLevels),
    select('Densidad del contenido', 'design.contentDensity', state.design.contentDensity, contentDensityOptions, false, labelContentDensity),
    toggle('Incluir iconos medicos', 'design.includeMedicalIcons', state.design.includeMedicalIcons),
    toggle('Incluir fondo tematico relacionado con la especialidad', 'design.includeThematicBackground', state.design.includeThematicBackground),
    toggle('Usar tematica automatica segun especialidad', 'design.useAutomaticTheme', state.design.useAutomaticTheme),
    toggle('Usar estetica ya aprendida en la conversacion anclada', 'design.usePinnedConversationStyle', state.design.usePinnedConversationStyle)
  ], handlers);
  renderAttachments(state, handlers);

  renderFields('#advancedFields', [
    select('Tipo técnico de salida', 'promptOptions.promptType', state.promptOptions.promptType, [PROMPT_TYPES.finalFlyer], false, labelPromptType),
    number('Cantidad de alternativas finales', 'promptOptions.finalAlternativesCount', state.promptOptions.finalAlternativesCount),
    toggle('Requerir imagenes separadas', 'promptOptions.requireSeparateImages', state.promptOptions.requireSeparateImages),
    toggle('Impedir collage, grilla o mockup multiple', 'promptOptions.preventCollage', state.promptOptions.preventCollage),
    toggle('Usar margenes seguros moviles', 'promptOptions.requireMobileSafeArea', state.promptOptions.requireMobileSafeArea),
    toggle('Permitir creatividad visual', 'promptOptions.allowVisualCreativity', state.promptOptions.allowVisualCreativity),
    select('Nivel de creatividad visual', 'promptOptions.visualCreativityLevel', state.promptOptions.visualCreativityLevel, creativityLevels, false, labelCreativityLevel),
    textarea('Frase sugerida para el flyer', 'promptOptions.suggestedPhrase', state.promptOptions.suggestedPhrase),
    textarea('Frases que NO deben usarse', 'promptOptions.forbiddenPhrases', state.promptOptions.forbiddenPhrases),
    textarea('Datos que deben destacarse', 'promptOptions.highlightData', state.promptOptions.highlightData),
    textarea('Datos que deben ir pequenos', 'promptOptions.smallData', state.promptOptions.smallData),
    textarea('Instrucciones libres del usuario', 'promptOptions.freeInstructions', state.promptOptions.freeInstructions)
  ], handlers);

  renderVisibleServices(state, handlers);
  renderAttachmentList(state);
}

function renderFields(target, fields, handlers) {
  document.querySelector(target).innerHTML = fields.map(field => renderField(field)).join('');
  document.querySelectorAll(`${target} [data-path]`).forEach(input => {
    input.addEventListener('input', event => handlers.onFieldChange(event.target.dataset.path, getValue(event.target)));
    input.addEventListener('change', event => {
      const path = event.target.dataset.path;
      if (event.target.type === 'file') {
        handlers.onFieldChange(path, event.target.files[0]?.name || '');
        event.target.value = '';
      } else {
        handlers.onFieldChange(path, getValue(event.target));
      }
    });
  });
}

function renderField(field) {
  const disabled = field.hidden ? ' hidden' : '';
  const required = field.recommended ? '<span class="recommended">Recomendado</span>' : '';
  if (field.type === 'toggle') {
    return `<label class="field toggle-field${disabled}"><input type="checkbox" data-path="${field.path}" ${field.value ? 'checked' : ''}><span>${field.label}</span></label>`;
  }
  if (field.type === 'textarea') {
    return `<label class="field${disabled}"><span>${field.label}${required}</span><textarea data-path="${field.path}" rows="3">${escapeHtml(field.value)}</textarea></label>`;
  }
  if (field.type === 'select') {
    return `<label class="field${disabled}"><span>${field.label}${required}</span><select data-path="${field.path}">${field.options.map(option => `<option value="${escapeHtml(option)}" ${option === field.value ? 'selected' : ''}>${escapeHtml(field.labeler ? field.labeler(option) : option)}</option>`).join('')}</select></label>`;
  }
  if (field.type === 'number') {
    return `<label class="field${disabled}"><span>${field.label}${required}</span><input type="number" min="1" data-path="${field.path}" value="${escapeHtml(field.value)}"></label>`;
  }
  if (field.type === 'file') {
    return `<label class="field file-field"><span>${field.label}</span><input type="file" data-path="${field.path}" accept="image/*"></label>`;
  }
  return `<label class="field${disabled}"><span>${field.label}${required}</span><input type="text" data-path="${field.path}" value="${escapeHtml(field.value)}"></label>`;
}

function renderSocialLinks(state, handlers) {
  const target = document.querySelector('#socialLinksEditor');
  target.innerHTML = `
    <div class="list-title">
      <label>Redes sociales</label>
      <button class="secondary-button" type="button" id="addSocialLinkButton">Agregar red</button>
    </div>
    <div class="repeatable-list">
      ${state.clinic.socialLinks.map((item, index) => `
        <div class="repeatable-row" data-warning-path="clinic.socialLinks.${index}">
          <label class="field"><span>Tipo de red</span><select data-social-index="${index}" data-social-key="type">${socialTypes.map(type => `<option value="${type}" ${type === item.type ? 'selected' : ''}>${type}</option>`).join('')}</select></label>
          <label class="field"><span>Usuario, texto o URL</span><input type="text" value="${escapeHtml(item.value)}" data-social-index="${index}" data-social-key="value"></label>
          <button type="button" class="icon-button" data-remove-social="${index}">Quitar</button>
        </div>
      `).join('')}
    </div>
  `;
  target.querySelector('#addSocialLinkButton').addEventListener('click', handlers.onAddSocialLink);
  target.querySelectorAll('[data-remove-social]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveSocialLink(Number(button.dataset.removeSocial)));
  });
  target.querySelectorAll('[data-social-index]').forEach(input => {
    input.addEventListener('input', () => handlers.onUpdateSocialLink(Number(input.dataset.socialIndex), input.dataset.socialKey, input.value));
    input.addEventListener('change', () => handlers.onUpdateSocialLink(Number(input.dataset.socialIndex), input.dataset.socialKey, input.value));
  });
}

function renderAdditionalSpecialtiesAndContext(state, handlers, specialtyNames) {
  const target = document.querySelector('#additionalSpecialtiesEditor');
  target.innerHTML = `
    <div class="list-title">
      <label for="additionalSpecialtySelect">Especialidades u orientaciones adicionales</label>
      <button class="secondary-button" type="button" id="addSpecialtyButton">Agregar especialidad</button>
    </div>
    <div class="inline-entry">
      <select id="additionalSpecialtySelect">${specialtyNames.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}</select>
    </div>
    <ul class="editable-list">
      ${state.specialty.additionalSpecialties.map((item, index) => `
        <li><span>${escapeHtml(item)}</span><button type="button" class="icon-button" data-remove-specialty="${index}">Quitar</button></li>
      `).join('')}
    </ul>
    <div class="list-title">
      <label for="newContextService">Prestaciones o datos de contexto para orientar el diseno</label>
      <button class="secondary-button" type="button" id="addContextServiceButton">Agregar contexto</button>
    </div>
    <div class="inline-entry">
      <input id="newContextService" type="text" placeholder="Ej: Campana preventiva, chequeo anual, foco estetico">
    </div>
    <ul class="editable-list">
      ${state.services.contextServices.map((item, index) => `
        <li><span>${escapeHtml(item)}</span><button type="button" class="icon-button" data-remove-context-service="${index}">Quitar</button></li>
      `).join('')}
    </ul>
  `;
  target.querySelector('#addSpecialtyButton').addEventListener('click', () => {
    handlers.onAddAdditionalSpecialty(target.querySelector('#additionalSpecialtySelect').value);
  });
  target.querySelectorAll('[data-remove-specialty]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveAdditionalSpecialty(Number(button.dataset.removeSpecialty)));
  });
  target.querySelector('#addContextServiceButton').addEventListener('click', () => {
    handlers.onAddContextService(target.querySelector('#newContextService').value);
  });
  target.querySelector('#newContextService').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handlers.onAddContextService(event.target.value);
    }
  });
  target.querySelectorAll('[data-remove-context-service]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveContextService(Number(button.dataset.removeContextService)));
  });
}

function renderSchedules(state, handlers) {
  const target = document.querySelector('#schedulesEditor');
  target.innerHTML = `
    <div class="list-title">
      <label>Horarios de atencion</label>
      <button class="secondary-button" type="button" id="addScheduleButton">Agregar horario</button>
    </div>
    <div class="repeatable-list">
      ${state.schedule.items.map((item, index) => `
        <div class="repeatable-row schedule-row" data-warning-path="schedule.items.${index}">
          <label class="field"><span>Dia o dias</span><input type="text" value="${escapeHtml(item.days)}" data-schedule-index="${index}" data-schedule-key="days"></label>
          <label class="field"><span>Hora desde</span><input type="time" value="${escapeHtml(item.from)}" data-schedule-index="${index}" data-schedule-key="from"></label>
          <label class="field"><span>Hora hasta</span><input type="time" value="${escapeHtml(item.to)}" data-schedule-index="${index}" data-schedule-key="to"></label>
          <label class="field"><span>Observacion</span><input type="text" value="${escapeHtml(item.note)}" data-schedule-index="${index}" data-schedule-key="note"></label>
          <button type="button" class="icon-button" data-remove-schedule="${index}">Quitar</button>
        </div>
      `).join('')}
    </div>
  `;
  target.querySelector('#addScheduleButton').addEventListener('click', handlers.onAddSchedule);
  target.querySelectorAll('[data-remove-schedule]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveSchedule(Number(button.dataset.removeSchedule)));
  });
  target.querySelectorAll('[data-schedule-index]').forEach(input => {
    input.addEventListener('input', () => handlers.onUpdateSchedule(Number(input.dataset.scheduleIndex), input.dataset.scheduleKey, input.value));
    input.addEventListener('change', () => handlers.onUpdateSchedule(Number(input.dataset.scheduleIndex), input.dataset.scheduleKey, input.value));
  });
}

function renderVisibleServices(state, handlers) {
  const list = document.querySelector('#servicesList');
  list.innerHTML = state.services.visibleServices.map((item, index) => `
    <li>
      <span>${escapeHtml(item)}</span>
      <button type="button" class="icon-button" data-remove-service="${index}" aria-label="Eliminar ${escapeHtml(item)}">Quitar</button>
    </li>
  `).join('');
  list.querySelectorAll('[data-remove-service]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveService(Number(button.dataset.removeService)));
  });
}

function renderAttachments(state, handlers) {
  const target = document.querySelector('#imageFields');
  target.innerHTML = `
    <div class="list-title">
      <label>Adjuntos locales</label>
      <button class="secondary-button" type="button" id="addAttachmentButton">Agregar adjunto</button>
    </div>
    <div class="repeatable-list">
      ${state.attachments.items.map((item, index) => `
        <div class="repeatable-row" data-warning-path="attachments.items.${index}">
          <label class="field"><span>Rol</span><select data-attachment-index="${index}" data-attachment-key="role">${attachmentRoles.map(role => `<option value="${escapeHtml(role)}" ${role === item.role ? 'selected' : ''}>${escapeHtml(labelAttachmentRole(role))}</option>`).join('')}</select></label>
          <label class="field file-field"><span>Archivo</span><input type="file" accept="image/*" data-attachment-file="${index}"></label>
          <label class="field"><span>Nombre de archivo</span><input type="text" value="${escapeHtml(item.fileName)}" data-attachment-index="${index}" data-attachment-key="fileName"></label>
          <label class="field"><span>Instruccion opcional</span><input type="text" value="${escapeHtml(item.instruction)}" data-attachment-index="${index}" data-attachment-key="instruction"></label>
          <button type="button" class="icon-button" data-remove-attachment="${index}">Quitar</button>
        </div>
      `).join('')}
    </div>
  `;
  target.querySelector('#addAttachmentButton').addEventListener('click', handlers.onAddAttachment);
  target.querySelectorAll('[data-remove-attachment]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveAttachment(Number(button.dataset.removeAttachment)));
  });
  target.querySelectorAll('[data-attachment-index]').forEach(input => {
    input.addEventListener('input', () => handlers.onUpdateAttachment(Number(input.dataset.attachmentIndex), input.dataset.attachmentKey, input.value));
    input.addEventListener('change', () => handlers.onUpdateAttachment(Number(input.dataset.attachmentIndex), input.dataset.attachmentKey, input.value));
  });
  target.querySelectorAll('[data-attachment-file]').forEach(input => {
    input.addEventListener('change', event => {
      const index = Number(event.target.dataset.attachmentFile);
      const file = event.target.files[0];
      handlers.onUpdateAttachment(index, 'file', file ? { fileName: file.name, mimeType: file.type } : { fileName: '', mimeType: '' });
      event.target.value = '';
    });
  });
}

function renderAttachmentList(state) {
  const imageNames = state.attachments.items.filter(item => item.fileName);

  document.querySelector('#imageList').innerHTML = imageNames.length
    ? imageNames.map(item => `<li><strong>${escapeHtml(labelAttachmentRole(item.role))}:</strong> ${escapeHtml(item.fileName)}${item.instruction ? ` - ${escapeHtml(item.instruction)}` : ''}</li>`).join('')
    : '<li>No hay imagenes seleccionadas.</li>';
}

function isOtherColor(value) {
  return value === 'otro' || value === 'personalizado';
}

function text(label, path, value, recommended = false, hidden = false) {
  return { type: 'text', label, path, value, recommended, hidden };
}

function textarea(label, path, value, recommended = false, hidden = false) {
  return { type: 'textarea', label, path, value, recommended, hidden };
}

function select(label, path, value, options, recommended = false, labeler = null) {
  return { type: 'select', label, path, value, options, recommended, labeler };
}

function number(label, path, value, recommended = false, hidden = false) {
  return { type: 'number', label, path, value, recommended, hidden };
}

function toggle(label, path, value) {
  return { type: 'toggle', label, path, value };
}

function file(label, path) {
  return { type: 'file', label, path };
}

function getValue(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'number') return Number(input.value);
  return input.value;
}

function labelContentDensity(value) {
  return {
    brief: 'Breve',
    balanced: 'Equilibrado',
    detailed: 'Detallado'
  }[value] || value;
}

function labelPieceType(value) {
  return {
    professionalFlyer: 'Flyer de profesional / especialidad',
    clinicalInfographic: 'Infografia clinica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promocion / campaña / agenda'
  }[value] || value;
}

function labelPromptType(value) {
  return {
    finalFlyer: 'Flyer final'
  }[value] || value;
}

function labelCreativityLevel(value) {
  return {
    strict: 'Estricta',
    moderate: 'Moderada',
    broad: 'Amplia'
  }[value] || value;
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
