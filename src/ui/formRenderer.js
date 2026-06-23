import { colorPresets, formats, impactLevels, typographyOptions, visualStyles } from '../data/designPresets.js';
import { specialties } from '../data/specialties.js';

const titles = ['Dr.', 'Dra.', 'Lic.', 'Prof.', 'Otro'];
const modalities = ['presencial', 'virtual', 'ambas'];
const socialTypes = ['Instagram', 'Facebook', 'TikTok', 'Sitio web', 'WhatsApp', 'Otra'];
const creativityOptions = [
  'No: respetar estrictamente los datos cargados.',
  'Si, moderada: permitir recursos visuales relacionados con la especialidad.',
  'Si, amplia: permitir imagenes o recursos graficos aleatorios relacionados con la especialidad, sin inventar datos medicos.'
];

export function renderForm(state, handlers) {
  const specialtyNames = specialties.map(item => item.name);
  const colorKeys = Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key));

  renderFields('#clinicFields', [
    text('Nombre de clinica', 'clinic.name', state.clinic.name, true),
    text('Direccion', 'clinic.address', state.clinic.address),
    text('Telefono / WhatsApp principal', 'clinic.phone', state.clinic.phone, true),
    textarea('Frase institucional', 'clinic.tagline', state.clinic.tagline),
    file('Logo de clinica opcional', 'images.logoName'),
    toggle('Mostrar datos de contacto', 'clinic.showContact', state.clinic.showContact),
    toggle('Guardar estos datos como predeterminados', 'clinic.saveAsDefault', state.clinic.saveAsDefault)
  ], handlers);
  renderSocialLinks(state, handlers);

  renderFields('#doctorFields', [
    select('Titulo', 'doctor.title', state.doctor.title, titles),
    text('Nombre completo del medico', 'doctor.name', state.doctor.name, true),
    text('Especialidad declarada del profesional', 'doctor.specialty', state.doctor.specialty),
    text('Matricula opcional', 'doctor.license', state.doctor.license),
    file('Foto del medico opcional', 'images.doctorPhotoName'),
    toggle('Mostrar foto del medico', 'doctor.showPhoto', state.doctor.showPhoto),
    textarea('Aclaracion o cargo opcional', 'doctor.roleNote', state.doctor.roleNote)
  ], handlers);

  renderFields('#serviceFields', [
    select('Especialidad principal', 'services.primarySpecialty', state.services.primarySpecialty, specialtyNames, true),
    text('Area destacada del flyer', 'services.highlightedArea', state.services.highlightedArea),
    text('Prestacion principal destacada', 'services.featured', state.services.featured, true),
    toggle('Permitir que ChatGPT agregue prestaciones generales razonables', 'services.allowExpansion', state.services.allowExpansion),
    textarea('Instrucciones sobre ampliacion de tareas', 'services.expansionNotes', state.services.expansionNotes, false, !state.services.allowExpansion)
  ], handlers);
  renderAdditionalSpecialties(state, handlers, specialtyNames);

  renderFields('#careFields', [
    toggle('Atiende por obra social', 'care.insurance', state.care.insurance),
    toggle('Atiende particulares', 'care.privateCare', state.care.privateCare),
    toggle('Requiere turno previo', 'care.requiresAppointment', state.care.requiresAppointment),
    text('Texto personalizado para turnos', 'care.appointmentText', state.care.appointmentText),
    select('Modalidad', 'care.modality', state.care.modality, modalities, true),
    textarea('Observacion administrativa opcional', 'care.adminNote', state.care.adminNote)
  ], handlers);
  renderSchedules(state, handlers);

  renderFields('#designFields', [
    select('Formato', 'design.format', state.design.format, formats),
    select('Color principal', 'design.primaryColor', state.design.primaryColor, colorKeys, true, key => colorPresets[key].label),
    text('Otro color principal', 'design.primaryCustomColor', state.design.primaryCustomColor, false, !isOtherColor(state.design.primaryColor)),
    select('Color secundario', 'design.secondaryColor', state.design.secondaryColor, colorKeys, false, key => colorPresets[key].label),
    text('Otro color secundario', 'design.secondaryCustomColor', state.design.secondaryCustomColor, false, !isOtherColor(state.design.secondaryColor)),
    select('Estilo visual', 'design.visualStyle', state.design.visualStyle, visualStyles),
    select('Tipografia sugerida', 'design.typography', state.design.typography, typographyOptions),
    select('Nivel de impacto visual', 'design.impact', state.design.impact, impactLevels),
    toggle('Incluir iconos medicos', 'design.includeIcons', state.design.includeIcons),
    toggle('Incluir fondo tematico relacionado con la especialidad', 'design.includeThemeBackground', state.design.includeThemeBackground),
    toggle('Usar tematica automatica segun especialidad', 'design.autoTheme', state.design.autoTheme),
    toggle('Usar estetica ya aprendida en la conversacion anclada', 'design.usePinnedStyle', state.design.usePinnedStyle)
  ], handlers);

  renderFields('#imageFields', [
    file('Logo de clinica', 'images.logoName'),
    file('Foto del medico', 'images.doctorPhotoName'),
    file('Imagen de referencia del flyer', 'images.referenceName'),
    file('Imagen tematica opcional', 'images.themeName')
  ], handlers);

  renderFields('#advancedFields', [
    textarea('Frase sugerida para el flyer', 'advanced.suggestedPhrase', state.advanced.suggestedPhrase),
    textarea('Frases que NO deben usarse', 'advanced.forbiddenPhrases', state.advanced.forbiddenPhrases),
    textarea('Datos que deben destacarse', 'advanced.highlightData', state.advanced.highlightData),
    textarea('Datos que deben ir pequenos', 'advanced.smallData', state.advanced.smallData),
    textarea('Instrucciones libres del usuario', 'advanced.freeInstructions', state.advanced.freeInstructions),
    select('Permitir creatividad adicional', 'advanced.creativity', state.advanced.creativity, creativityOptions)
  ], handlers);

  renderServices(state, handlers);
  renderImages(state);
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

function renderAdditionalSpecialties(state, handlers, specialtyNames) {
  const target = document.querySelector('#additionalSpecialtiesEditor');
  target.innerHTML = `
    <div class="list-title">
      <label for="additionalSpecialtySelect">Especialidades adicionales</label>
      <button class="secondary-button" type="button" id="addSpecialtyButton">Agregar especialidad</button>
    </div>
    <div class="inline-entry">
      <select id="additionalSpecialtySelect">${specialtyNames.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}</select>
    </div>
    <ul class="editable-list">
      ${state.services.additionalSpecialties.map((item, index) => `
        <li><span>${escapeHtml(item)}</span><button type="button" class="icon-button" data-remove-specialty="${index}">Quitar</button></li>
      `).join('')}
    </ul>
  `;
  target.querySelector('#addSpecialtyButton').addEventListener('click', () => {
    handlers.onAddAdditionalSpecialty(target.querySelector('#additionalSpecialtySelect').value);
  });
  target.querySelectorAll('[data-remove-specialty]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveAdditionalSpecialty(Number(button.dataset.removeSpecialty)));
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
      ${state.care.schedules.map((item, index) => `
        <div class="repeatable-row schedule-row" data-warning-path="care.schedules.${index}">
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

function renderServices(state, handlers) {
  const list = document.querySelector('#servicesList');
  list.innerHTML = state.services.items.map((item, index) => `
    <li>
      <span>${escapeHtml(item)}</span>
      <button type="button" class="icon-button" data-remove-service="${index}" aria-label="Eliminar ${escapeHtml(item)}">Quitar</button>
    </li>
  `).join('');
  list.querySelectorAll('[data-remove-service]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveService(Number(button.dataset.removeService)));
  });
}

function renderImages(state) {
  const imageNames = [
    ['Logo de clinica', state.images.logoName],
    ['Foto del medico', state.images.doctorPhotoName],
    ['Imagen de referencia', state.images.referenceName],
    ['Imagen tematica', state.images.themeName]
  ].filter(([, name]) => name);

  document.querySelector('#imageList').innerHTML = imageNames.length
    ? imageNames.map(([label, name]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(name)}</li>`).join('')
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

function toggle(label, path, value) {
  return { type: 'toggle', label, path, value };
}

function file(label, path) {
  return { type: 'file', label, path };
}

function getValue(input) {
  return input.type === 'checkbox' ? input.checked : input.value;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
