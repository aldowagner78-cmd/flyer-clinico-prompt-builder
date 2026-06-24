import { colorPresets, formats, impactLevels, typographyOptions, visualStyles } from '../data/designPresets.js';
import { specialties } from '../data/specialties.js';
import { ATTACHMENT_ROLES, CONTENT_DENSITIES, PIECE_TYPES } from '../state/schema.js';

const titles = ['Dr.', 'Dra.', 'Lic.', 'Prof.', 'Equipo', 'Otro'];
const modalities = ['presencial', 'virtual', 'ambas'];
const institutionTypes = ['Centro médico', 'Clínica', 'Consultorio', 'Sanatorio', 'Laboratorio', 'Instituto', 'Centro odontológico', 'Centro de diagnóstico', 'Otro'];
const socialTypes = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'Sitio web', 'Email', 'WhatsApp', 'Otra'];
const contentDensityOptions = Object.values(CONTENT_DENSITIES);
const pieceTypeOptions = Object.values(PIECE_TYPES);
const attachmentRoles = Object.values(ATTACHMENT_ROLES);
const toneOptions = ['Educativo', 'Preventivo', 'Prudente', 'Comunitario', 'Institucional', 'Cercano'];
const noteOptions = [
  'Contenido informativo. No reemplaza la consulta médica.',
  'Consultá con un profesional ante dudas o síntomas.',
  'No indica diagnóstico ni tratamiento.',
  'Actividad sujeta a disponibilidad de turnos.',
  'Personalizar nota'
];
const ctaOptions = ['Solicitar turno por WhatsApp', 'Consultar disponibilidad', 'Escribinos para más información', 'Reservá tu turno', 'Consultá requisitos', 'Personalizar CTA'];
const informationTypes = ['Nuevo servicio', 'Nuevo estudio', 'Nueva prestación', 'Cambio de horario', 'Agenda abierta', 'Incorporación profesional', 'Información para pacientes', 'Comunicado institucional', 'Recordatorio', 'Otro'];
const campaignTypes = ['Agenda abierta', 'Turnos disponibles', 'Campaña preventiva', 'Jornada especial', 'Semana de controles', 'Chequeo general', 'Vacunación', 'Nuevo servicio', 'Promoción institucional', 'Otro'];

export function renderForm(state, handlers) {
  const specialtyNames = specialties.map(item => item.name);
  const colorKeys = Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key));
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;

  renderPieceStep(pieceType, handlers);
  renderInstitutionStep(state, handlers, colorKeys);
  renderContentStep(state, handlers, specialtyNames);
  renderDesignStep(state, handlers, colorKeys);
  renderAttachments(state, handlers);
  renderAttachmentList(state);
  renderVisibleServices(state, handlers);
}

function renderPieceStep(pieceType, handlers) {
  const target = document.querySelector('#pieceFields');
  if (!target) return;
  target.innerHTML = `
    <div class="smart-panel">
      <strong>Tipo seleccionado</strong>
      <p>${escapeHtml(labelPieceType(pieceType))}. Las tarjetas adaptan el formulario y el prompt final.</p>
    </div>
  `;
}

function renderInstitutionStep(state, handlers, colorKeys) {
  renderFields('#clinicFields', [
    text('Nombre de la institución', 'clinic.name', state.clinic.name, true),
    select('Tipo de institución', 'clinic.institutionType', state.clinic.institutionType, institutionTypes, true),
    text('Especificar tipo', 'clinic.otherInstitutionType', state.clinic.otherInstitutionType, false, state.clinic.institutionType !== 'Otro'),
    text('Dirección', 'clinic.address', state.clinic.address),
    text('WhatsApp principal', 'clinic.primaryPhone', state.clinic.primaryPhone),
    text('Teléfono secundario', 'clinic.secondaryPhone', state.clinic.secondaryPhone),
    text('Email', 'clinic.email', state.clinic.email),
    text('Sitio web', 'clinic.website', state.clinic.website),
    textarea('Frase institucional', 'clinic.institutionalPhrase', state.clinic.institutionalPhrase),
    select('Color principal institucional', 'clinic.defaultPrimaryColor', state.clinic.defaultPrimaryColor, colorKeys, false, key => colorPresets[key].label),
    select('Color secundario institucional', 'clinic.defaultSecondaryColor', state.clinic.defaultSecondaryColor, colorKeys, false, key => colorPresets[key].label),
    text('Logo institucional esperado', 'clinic.logoFileName', state.clinic.logoFileName),
    text('Instrucción para logo', 'clinic.logoInstruction', state.clinic.logoInstruction),
    toggle('Mostrar datos de contacto', 'clinic.showContactData', state.clinic.showContactData)
  ], handlers);

  renderSocialLinks(state, handlers);
}

function renderContentStep(state, handlers, specialtyNames) {
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  const preset = getSpecialtyPreset(state.specialty.primaryProfessionalSpecialty);

  if (pieceType === PIECE_TYPES.professionalFlyer) {
    renderProfessionalContent(state, handlers, specialtyNames, preset);
    return;
  }

  if (pieceType === PIECE_TYPES.clinicalInfographic) {
    renderInfographicContent(state, handlers, specialtyNames, preset);
    return;
  }

  if (pieceType === PIECE_TYPES.informativeFlyer) {
    renderInformativeContent(state, handlers, specialtyNames, preset);
    return;
  }

  renderCampaignContent(state, handlers, specialtyNames, preset);
}

function renderProfessionalContent(state, handlers, specialtyNames, preset) {
  renderFields('#serviceFields', [
    select('Título', 'professional.title', state.professional.title, titles),
    text('Nombre completo del profesional', 'professional.fullName', state.professional.fullName, true),
    text('Matrícula', 'professional.license', state.professional.license),
    toggle('Mostrar foto profesional', 'professional.showPhoto', state.professional.showPhoto),
    select('Especialidad o área', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
    text('Cómo se verá la especialidad', 'specialty.visibleSpecialtyText', state.specialty.visibleSpecialtyText || smartSpecialtyText(state)),
    text('Frase breve opcional', 'promptOptions.suggestedPhrase', state.promptOptions.suggestedPhrase)
  ], handlers);

  renderSmartServiceSelector({
    state,
    handlers,
    preset,
    title: 'Prestaciones sugeridas por especialidad',
    help: 'Marcá 3 a 5 prestaciones. Podés agregar otra si no aparece en la lista.'
  });

  renderCareInsideContent(state, handlers, true);
}

function renderInfographicContent(state, handlers, specialtyNames, preset) {
  renderFields('#serviceFields', [
    select('Especialidad / área sanitaria', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
    selectWithCustom('Tema educativo', 'promptOptions.educationalTopic', state.promptOptions.educationalTopic, preset.infographicTopics || preset.topics || [], true),
    selectWithCustom('Público objetivo', 'promptOptions.targetAudience', state.promptOptions.targetAudience, preset.audiences || defaultAudiences(), true),
    selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.messages || [], true),
    selectWithCustom('Nota sanitaria', 'promptOptions.legalEthicalNote', state.promptOptions.legalEthicalNote, noteOptions, false)
  ], handlers);

  renderSmartBlockSelector({
    state,
    handlers,
    preset,
    title: 'Bloques sugeridos',
    help: 'Marcá 3 a 5 bloques. La infografía debe ser visual y con poco texto.'
  });
}

function renderInformativeContent(state, handlers, specialtyNames, preset) {
  renderFields('#serviceFields', [
    select('Área / servicio relacionado', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
    selectWithCustom('Tipo de información', 'promptOptions.contentGoal', state.promptOptions.contentGoal, preset.informativeTypes || informationTypes, true),
    selectWithCustom('Título visible', 'promptOptions.educationalTopic', state.promptOptions.educationalTopic, preset.informativeTitles || preset.topics || [], true),
    selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.informativeMessages || preset.messages || [], true),
    selectWithCustom('Llamada a la acción', 'promptOptions.campaignCallToAction', state.promptOptions.campaignCallToAction, ctaOptions, false)
  ], handlers);

  renderSmartServiceSelector({
    state,
    handlers,
    preset,
    title: 'Datos visibles sugeridos',
    help: 'Marcá solo lo esencial para que el flyer sea claro en redes.'
  });
}

function renderCampaignContent(state, handlers, specialtyNames, preset) {
  renderFields('#serviceFields', [
    select('Área / especialidad', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
    selectWithCustom('Tipo de campaña', 'promptOptions.campaignType', state.promptOptions.campaignType, preset.campaignTypes || campaignTypes, true),
    selectWithCustom('Público objetivo', 'promptOptions.targetAudience', state.promptOptions.targetAudience, preset.audiences || defaultAudiences(), false),
    selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.campaignMessages || preset.messages || [], true),
    text('Fecha o período', 'promptOptions.campaignValidity', state.promptOptions.campaignValidity),
    textarea('Condiciones o aclaración breve', 'promptOptions.campaignConditions', state.promptOptions.campaignConditions),
    selectWithCustom('Llamada a la acción', 'promptOptions.campaignCallToAction', state.promptOptions.campaignCallToAction, ctaOptions, false),
    selectWithCustom('Nota prudente', 'promptOptions.legalEthicalNote', state.promptOptions.legalEthicalNote, noteOptions, false)
  ], handlers);

  renderSmartServiceSelector({
    state,
    handlers,
    preset,
    title: 'Puntos visibles de la campaña',
    help: 'Marcá pocos puntos. Evitá promesas, urgencia falsa o lenguaje engañoso.'
  });
}

function renderSmartServiceSelector({ state, handlers, preset, title, help }) {
  const target = document.querySelector('#additionalSpecialtiesEditor');
  const suggestions = (preset.services || []).slice(0, 8);
  target.innerHTML = `
    <div class="smart-panel">
      <div class="list-title">
        <label>${escapeHtml(title)}</label>
        <small>${escapeHtml(help)}</small>
      </div>
      <div class="chip-grid">
        ${suggestions.map(item => `
          <label class="chip-check">
            <input type="checkbox" value="${escapeHtml(item)}" ${state.services.visibleServices.includes(item) ? 'checked' : ''} data-service-suggestion>
            <span>${escapeHtml(item)}</span>
          </label>
        `).join('')}
      </div>
      <p class="helper-text">${state.services.visibleServices.length > 5 ? 'Hay muchos datos visibles. Para redes conviene mostrar hasta 5 y usar el resto como contexto.' : 'Sugerencia: 3 a 5 opciones visibles.'}</p>
    </div>
  `;

  target.querySelectorAll('[data-service-suggestion]').forEach(input => {
    input.addEventListener('change', () => handlers.onToggleServiceOption(input.value, input.checked));
  });
}

function renderSmartBlockSelector({ state, handlers, preset, title, help }) {
  const target = document.querySelector('#additionalSpecialtiesEditor');
  const suggestions = (preset.blocks || preset.services || []).slice(0, 8);
  const selected = parseLines(state.promptOptions.infoBlocksText);
  target.innerHTML = `
    <div class="smart-panel">
      <div class="list-title">
        <label>${escapeHtml(title)}</label>
        <small>${escapeHtml(help)}</small>
      </div>
      <div class="chip-grid">
        ${suggestions.map(item => `
          <label class="chip-check">
            <input type="checkbox" value="${escapeHtml(item)}" ${selected.includes(item) ? 'checked' : ''} data-block-suggestion>
            <span>${escapeHtml(item)}</span>
          </label>
        `).join('')}
      </div>
      <label class="field full-width"><span>Bloques elegidos / personalizados</span><textarea data-path="promptOptions.infoBlocksText" rows="4">${escapeHtml(state.promptOptions.infoBlocksText)}</textarea></label>
    </div>
  `;

  target.querySelectorAll('[data-block-suggestion]').forEach(input => {
    input.addEventListener('change', () => {
      const current = parseLines(state.promptOptions.infoBlocksText);
      const value = input.value;
      const next = input.checked
        ? [...new Set([...current, value])]
        : current.filter(item => item !== value);
      handlers.onFieldChange('promptOptions.infoBlocksText', next.join('\n'));
    });
  });
  target.querySelector('[data-path="promptOptions.infoBlocksText"]')?.addEventListener('input', event => {
    handlers.onFieldChange('promptOptions.infoBlocksText', event.target.value);
  });
}

function renderCareInsideContent(state, handlers, showCoverage = false) {
  const target = document.querySelector('#additionalSpecialtiesEditor');
  if (!target) return;
  target.insertAdjacentHTML('beforeend', `
    <div class="smart-panel care-inline-panel">
      <div class="list-title">
        <label>Atención y contacto</label>
        <small>Días, horarios, turno previo, modalidad y cobertura.</small>
      </div>
      <div id="inlineCareFields" class="field-grid"></div>
      <div id="inlineSchedulesEditor" class="list-editor"></div>
    </div>
  `);

  renderFields('#inlineCareFields', [
    toggle('Requiere turno previo', 'schedule.requiresAppointment', state.schedule.requiresAppointment),
    text('Texto para turnos', 'schedule.appointmentText', state.schedule.appointmentText),
    select('Modalidad', 'schedule.modality', state.schedule.modality, modalities),
    toggle('Obras sociales', 'coverage.insurance', state.coverage.insurance),
    toggle('Particulares', 'coverage.privatePatients', state.coverage.privatePatients),
    textarea('Observación administrativa', 'schedule.administrativeNote', state.schedule.administrativeNote)
  ], handlers);

  renderSchedulesInTarget('#inlineSchedulesEditor', state, handlers);
}

function renderDesignStep(state, handlers, colorKeys) {
  const useInstitutionalColors = Boolean(state.design.useInstitutionalColors);
  renderFields('#designFields', [
    toggle('Usar colores institucionales', 'design.useInstitutionalColors', useInstitutionalColors),
    select('Color principal', 'design.primaryColor', state.design.primaryColor, colorKeys, true, key => colorPresets[key].label),
    text('Otro color principal', 'design.customPrimaryColor', state.design.customPrimaryColor, false, !isOtherColor(state.design.primaryColor)),
    select('Color secundario', 'design.secondaryColor', state.design.secondaryColor, colorKeys, false, key => colorPresets[key].label),
    text('Otro color secundario', 'design.customSecondaryColor', state.design.customSecondaryColor, false, !isOtherColor(state.design.secondaryColor)),
    select('Estilo visual', 'design.visualStyle', state.design.visualStyle, visualStyles),
    select('Formato', 'design.format', state.design.format, formats),
    select('Densidad del contenido', 'design.contentDensity', state.design.contentDensity, contentDensityOptions, false, labelContentDensity),
    select('Nivel de impacto visual', 'design.visualImpact', state.design.visualImpact, impactLevels),
    select('Tipografía sugerida', 'design.typography', state.design.typography, typographyOptions),
    toggle('Incluir iconos medicos', 'design.includeMedicalIcons', state.design.includeMedicalIcons),
    toggle('Incluir fondo tematico', 'design.includeThematicBackground', state.design.includeThematicBackground),
    toggle('Usar recursos segun especialidad', 'design.useAutomaticTheme', state.design.useAutomaticTheme)
  ], handlers);
}

function renderFields(target, fields, handlers) {
  const node = document.querySelector(target);
  if (!node) return;
  node.innerHTML = fields.map(field => renderField(field)).join('');
  node.querySelectorAll('[data-path]').forEach(input => {
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
  const hidden = field.hidden ? ' hidden' : '';
  const required = field.recommended ? '<span class="recommended">Recomendado</span>' : '';
  if (field.type === 'toggle') {
    return `<label class="field toggle-field${hidden}"><input type="checkbox" data-path="${field.path}" ${field.value ? 'checked' : ''}><span>${field.label}</span></label>`;
  }
  if (field.type === 'textarea') {
    return `<label class="field${hidden}"><span>${field.label}${required}</span><textarea data-path="${field.path}" rows="3">${escapeHtml(field.value)}</textarea></label>`;
  }
  if (field.type === 'select') {
    return `<label class="field${hidden}"><span>${field.label}${required}</span><select data-path="${field.path}">${field.options.map(option => `<option value="${escapeHtml(option)}" ${option === field.value ? 'selected' : ''}>${escapeHtml(field.labeler ? field.labeler(option) : option)}</option>`).join('')}</select></label>`;
  }
  return `<label class="field${hidden}"><span>${field.label}${required}</span><input type="text" data-path="${field.path}" value="${escapeHtml(field.value)}"></label>`;
}

function renderSocialLinks(state, handlers) {
  const target = document.querySelector('#socialLinksEditor');
  if (!target) return;
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
  target.querySelector('#addSocialLinkButton')?.addEventListener('click', handlers.onAddSocialLink);
  target.querySelectorAll('[data-remove-social]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveSocialLink(Number(button.dataset.removeSocial)));
  });
  target.querySelectorAll('[data-social-index]').forEach(input => {
    input.addEventListener('input', () => handlers.onUpdateSocialLink(Number(input.dataset.socialIndex), input.dataset.socialKey, input.value));
    input.addEventListener('change', () => handlers.onUpdateSocialLink(Number(input.dataset.socialIndex), input.dataset.socialKey, input.value));
  });
}

function renderSchedulesInTarget(targetSelector, state, handlers) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.innerHTML = `
    <div class="list-title">
      <label>Horarios de atencion</label>
      <button class="secondary-button" type="button" id="addScheduleButtonInline">Agregar horario</button>
    </div>
    <div class="repeatable-list">
      ${state.schedule.items.map((item, index) => `
        <div class="repeatable-row schedule-row" data-warning-path="schedule.items.${index}">
          <label class="field"><span>Día o días</span><input type="text" value="${escapeHtml(item.days)}" data-schedule-index="${index}" data-schedule-key="days"></label>
          <label class="field"><span>Desde</span><input type="time" value="${escapeHtml(item.from)}" data-schedule-index="${index}" data-schedule-key="from"></label>
          <label class="field"><span>Hasta</span><input type="time" value="${escapeHtml(item.to)}" data-schedule-index="${index}" data-schedule-key="to"></label>
          <label class="field"><span>Observación</span><input type="text" value="${escapeHtml(item.note)}" data-schedule-index="${index}" data-schedule-key="note"></label>
          <button type="button" class="icon-button" data-remove-schedule="${index}">Quitar</button>
        </div>
      `).join('')}
    </div>
  `;
  target.querySelector('#addScheduleButtonInline')?.addEventListener('click', handlers.onAddSchedule);
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
  if (!list) return;
  list.innerHTML = state.services.visibleServices.map((item, index) => `
    <li>
      <span>${escapeHtml(item)}</span>
      <button type="button" class="icon-button" data-remove-service="${index}" aria-label="Eliminar ${escapeHtml(item)}">Quitar</button>
    </li>
  `).join('');
  list.querySelectorAll('[data-remove-service]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveService(Number(button.dataset.removeService)));
  });
  const addButton = document.querySelector('#addServiceButton');
  const input = document.querySelector('#newService');
  if (addButton) addButton.textContent = 'Agregar dato';
  if (input) input.placeholder = 'Agregar dato visible personalizado';
}

function renderAttachments(state, handlers) {
  const target = document.querySelector('#imageFields');
  if (!target) return;
  target.innerHTML = `
    <div class="list-title">
      <label>Adjuntos manuales para ChatGPT</label>
      <button class="secondary-button" type="button" id="addAttachmentButton">Agregar adjunto</button>
    </div>
    <p class="helper-text">Los archivos no se envían solos. Adjuntalos manualmente en ChatGPT antes de pegar el prompt.</p>
    <div class="repeatable-list">
      ${state.attachments.items.map((item, index) => `
        <div class="repeatable-row" data-warning-path="attachments.items.${index}">
          <label class="field"><span>Rol</span><select data-attachment-index="${index}" data-attachment-key="role">${attachmentRoles.map(role => `<option value="${escapeHtml(role)}" ${role === item.role ? 'selected' : ''}>${escapeHtml(labelAttachmentRole(role))}</option>`).join('')}</select></label>
          <label class="field file-field"><span>Archivo</span><input type="file" accept="image/*" data-attachment-file="${index}"></label>
          <label class="field"><span>Nombre de archivo</span><input type="text" value="${escapeHtml(item.fileName)}" data-attachment-index="${index}" data-attachment-key="fileName"></label>
          <label class="field"><span>Instrucción opcional</span><input type="text" value="${escapeHtml(item.instruction)}" data-attachment-index="${index}" data-attachment-key="instruction"></label>
          <button type="button" class="icon-button" data-remove-attachment="${index}">Quitar</button>
        </div>
      `).join('')}
    </div>
  `;
  target.querySelector('#addAttachmentButton')?.addEventListener('click', handlers.onAddAttachment);
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
  const target = document.querySelector('#imageList');
  if (!target) return;
  const imageNames = state.attachments.items.filter(item => item.fileName);
  target.innerHTML = imageNames.length
    ? imageNames.map(item => `<li><strong>${escapeHtml(labelAttachmentRole(item.role))}:</strong> ${escapeHtml(item.fileName)}${item.instruction ? ` - ${escapeHtml(item.instruction)}` : ''}</li>`).join('')
    : '<li>No hay imágenes seleccionadas.</li>';
}

function selectWithCustom(label, path, value, options, recommended = false) {
  const choices = [...new Set([...(options || []), value].filter(Boolean))];
  return select(label, path, value || choices[0] || '', choices.length ? choices : [''], recommended);
}

function parseLines(value = '') {
  return String(value || '').split(/\n|;/).map(item => item.trim()).filter(Boolean);
}

function smartSpecialtyText(state) {
  return [state.specialty.primaryProfessionalSpecialty, ...state.specialty.additionalSpecialties].filter(Boolean).join(' y ');
}

function defaultAudiences() {
  return ['Comunidad general', 'Adultos', 'Adultos mayores', 'Niños y familias', 'Adolescentes', 'Pacientes con factores de riesgo', 'Pacientes con enfermedad crónica', 'Embarazadas', 'Cuidadores / familiares', 'Personal de salud', 'Otro'];
}

function getSpecialtyPreset(name) {
  return specialties.find(item => item.name === name) || specialties[0] || { services: [] };
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

function toggle(label, path, value) {
  return { type: 'toggle', label, path, value };
}

function getValue(input) {
  if (input.type === 'checkbox') return input.checked;
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
    professionalFlyer: 'Flyer profesional',
    clinicalInfographic: 'Infografia clinica educativa',
    informativeFlyer: 'Flyer informativo',
    promotionCampaign: 'Promocion / campaña'
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
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
