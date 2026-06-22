import { colorPresets, formats, impactLevels, typographyOptions, visualStyles } from '../data/designPresets.js';
import { specialties } from '../data/specialties.js';

const titles = ['Dr.', 'Dra.', 'Lic.', 'Prof.', 'Otro'];
const modalities = ['presencial', 'virtual', 'ambas'];
const creativityOptions = [
  'No: respetar estrictamente los datos cargados.',
  'Si, moderada: permitir recursos visuales relacionados con la especialidad.',
  'Si, amplia: permitir imagenes o recursos graficos aleatorios relacionados con la especialidad, sin inventar datos medicos.'
];

export function renderForm(state, handlers) {
  renderFields('#clinicFields', [
    text('Nombre de clinica', 'clinic.name', state.clinic.name, true),
    text('Direccion', 'clinic.address', state.clinic.address),
    text('Telefono / WhatsApp', 'clinic.phone', state.clinic.phone, true),
    text('Instagram / redes', 'clinic.social', state.clinic.social),
    textarea('Frase institucional', 'clinic.tagline', state.clinic.tagline),
    file('Logo de clinica opcional', 'images.logoName'),
    toggle('Mostrar datos de contacto', 'clinic.showContact', state.clinic.showContact),
    toggle('Guardar estos datos como predeterminados', 'clinic.saveAsDefault', state.clinic.saveAsDefault)
  ], handlers);

  renderFields('#doctorFields', [
    select('Titulo', 'doctor.title', state.doctor.title, titles),
    text('Nombre completo del medico', 'doctor.name', state.doctor.name, true),
    text('Especialidad', 'doctor.specialty', state.doctor.specialty),
    text('Matricula opcional', 'doctor.license', state.doctor.license),
    file('Foto del medico opcional', 'images.doctorPhotoName'),
    toggle('Mostrar foto del medico', 'doctor.showPhoto', state.doctor.showPhoto),
    textarea('Aclaracion o cargo opcional', 'doctor.roleNote', state.doctor.roleNote)
  ], handlers);

  renderFields('#serviceFields', [
    select('Especialidad principal', 'services.specialty', state.services.specialty, specialties.map(item => item.name), true),
    text('Prestacion principal destacada', 'services.featured', state.services.featured, true),
    toggle('Permitir que ChatGPT agregue prestaciones generales razonables', 'services.allowExpansion', state.services.allowExpansion),
    textarea('Instrucciones sobre ampliacion de tareas', 'services.expansionNotes', state.services.expansionNotes, false, !state.services.allowExpansion)
  ], handlers);

  renderFields('#careFields', [
    text('Dia o dias de atencion', 'care.days', state.care.days, true),
    text('Horario', 'care.hours', state.care.hours, true),
    toggle('Atiende por obra social', 'care.insurance', state.care.insurance),
    toggle('Atiende particulares', 'care.privateCare', state.care.privateCare),
    toggle('Requiere turno previo', 'care.requiresAppointment', state.care.requiresAppointment),
    text('Texto personalizado para turnos', 'care.appointmentText', state.care.appointmentText),
    select('Modalidad', 'care.modality', state.care.modality, modalities, true),
    textarea('Observacion administrativa opcional', 'care.adminNote', state.care.adminNote)
  ], handlers);

  renderFields('#designFields', [
    select('Formato', 'design.format', state.design.format, formats),
    select('Color principal', 'design.primaryColor', state.design.primaryColor, Object.keys(colorPresets), true, key => colorPresets[key].label),
    text('Color secundario', 'design.secondaryColor', state.design.secondaryColor),
    text('Color personalizado', 'design.customColor', state.design.customColor, false, state.design.primaryColor !== 'personalizado'),
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
