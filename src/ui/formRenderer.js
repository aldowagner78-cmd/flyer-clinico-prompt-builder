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
const customAttachmentRoles = [ATTACHMENT_ROLES.thematicImage, ATTACHMENT_ROLES.referenceFlyer, ATTACHMENT_ROLES.other];
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
const institutionalPhraseOptions = [
  'Cuidamos tu salud, acompañamos tu vida',
  'Tu salud, cerca de vos',
  'Atención médica cercana y profesional',
  'Cuidarte es nuestro compromiso',
  'Salud integral para toda la familia',
  'Acompañamos cada etapa de tu salud',
  'Comprometidos con tu bienestar',
  'Atención humana, profesional y cercana',
  'Más cerca de tu salud',
  'Cuidamos lo más importante: tu bienestar',
  'Otro / Personalizar'
];

let institutionViewMode = 'choice';
let institutionGuidedIndex = 0;
let contentViewMode = 'guided';
let contentGuidedIndex = 0;
let lastContentPieceType = '';
let designViewMode = 'guided';
let designGuidedIndex = 0;

if (typeof window !== 'undefined') {
  window.__setInstitutionViewMode = mode => {
    institutionViewMode = ['choice', 'guided', 'full'].includes(mode) ? mode : 'choice';
    if (institutionViewMode === 'choice') institutionGuidedIndex = 0;
  };
  window.__handleInstitutionPrevious = () => {
    if (institutionViewMode === 'guided') {
      if (institutionGuidedIndex > 0) {
        institutionGuidedIndex -= 1;
      } else {
        institutionViewMode = 'choice';
      }
      const state = window.__currentFormState;
      const handlers = window.__currentFormHandlers;
      if (state && handlers) renderForm(state, handlers);
      return true;
    }
    if (institutionViewMode === 'full') {
      institutionViewMode = 'choice';
      const state = window.__currentFormState;
      const handlers = window.__currentFormHandlers;
      if (state && handlers) renderForm(state, handlers);
      return true;
    }
    return false;
  };
  window.__handleInstitutionNext = () => {
    if (institutionViewMode === 'guided') {
      const state = window.__currentFormState;
      const steps = institutionGuidedSteps(institutionFields(state || {}, Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key))));
      if (institutionGuidedIndex < steps.length - 1) {
        institutionGuidedIndex += 1;
        const handlers = window.__currentFormHandlers;
        if (state && handlers) renderForm(state, handlers);
      }
      return true;
    }
    if (institutionViewMode === 'choice' || institutionViewMode === 'full') return true;
    return false;
  };
}


export function renderForm(state, handlers) {
  window.__currentFormState = state;
  window.__currentFormHandlers = handlers;
  const specialtyNames = specialties.map(item => item.name);
  const colorKeys = Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key));
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  if (lastContentPieceType !== pieceType) {
    contentGuidedIndex = 0;
    lastContentPieceType = pieceType;
  }

  renderPieceStep(pieceType, handlers, Boolean(state.promptOptions.pieceTypeConfirmed));
  renderInstitutionStep(state, handlers, colorKeys);
  renderContentStep(state, handlers, specialtyNames);
  renderDesignStep(state, handlers, colorKeys);
  renderAttachments(state, handlers);
  renderAttachmentList(state);
  renderVisibleServices(state, handlers);
}

function renderPieceStep(pieceType, handlers, confirmed = false) {
  const target = document.querySelector('#pieceFields');
  if (!target) return;

  updatePieceOptionCards(pieceType, confirmed);

  target.innerHTML = confirmed
    ? `
      <div class="piece-selection-summary">
        <span class="guided-kicker">Tipo seleccionado</span>
        <h3>${escapeHtml(labelPieceType(pieceType))}</h3>
        <p>${escapeHtml(pieceTypeDescription(pieceType))}</p>
        <small>Podés tocar otra tarjeta para cambiar la selección antes de continuar.</small>
      </div>
    `
    : `
      <div class="smart-panel">
        <strong>Elegí el tipo de pieza</strong>
        <p>Seleccioná una tarjeta para adaptar el contenido, el diseño y el prompt final. Después tocá Siguiente para continuar.</p>
      </div>
    `;
}

function updatePieceOptionCards(pieceType, confirmed = false) {
  document.querySelectorAll('[data-piece-select]').forEach(button => {
    const selected = confirmed && button.dataset.pieceSelect === pieceType;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

function pieceTypeDescription(pieceType) {
  return {
    professionalFlyer: 'Para profesionales, especialidades, horarios, prestaciones, turnos y datos de contacto.',
    clinicalInfographic: 'Para educación sanitaria, prevención, pasos, recomendaciones y contenidos explicativos.',
    informativeFlyer: 'Para comunicar servicios, estudios, prestaciones, novedades o información institucional.',
    promotionCampaign: 'Para agenda abierta, jornadas, campañas preventivas, vigencias y llamados a la acción.'
  }[pieceType] || 'Tipo de pieza seleccionado para adaptar el contenido y el prompt final.';
}

function renderInstitutionStep(state, handlers, colorKeys) {
  const fields = institutionFields(state, colorKeys);
  const totalSteps = institutionGuidedSteps(fields).length;
  institutionGuidedIndex = Math.max(0, Math.min(institutionGuidedIndex, totalSteps - 1));

  const target = document.querySelector('#clinicFields');
  if (!target) return;

  if (institutionViewMode === 'choice') {
    target.innerHTML = renderInstitutionLoadModeChoice();
    bindInstitutionModeControls(target, state, handlers, colorKeys);
    socialEditorShow(false);
    return;
  }

  if (institutionViewMode === 'full') {
    target.innerHTML = `
      <div class="institution-full-fields field-grid" id="clinicFullFields"></div>
      <div id="clinicSocialLinksEditor" class="list-editor institution-inline-social-editor"></div>
      <div class="institution-final-actions">
        <button class="primary-button" type="button" id="saveInstitutionAndContinueButton">Guardar y continuar →</button>
        <button class="secondary-button" type="button" id="continueInstitutionWithoutSavingButton">Continuar sin guardar</button>
        <button class="secondary-button" type="button" data-institution-mode="choice">Volver</button>
      </div>
    `;
    renderFields('#clinicFullFields', fields, handlers);
    bindInstitutionModeControls(target, state, handlers, colorKeys);
    renderSocialLinks(state, handlers, '#clinicSocialLinksEditor');
    socialEditorShow(false);
    return;
  }

  target.innerHTML = `
    <div id="institutionGuidedPanel" class="institution-guided-panel">
      ${renderInstitutionGuidedPanel(state, fields, colorKeys)}
    </div>
  `;

  bindInstitutionGuidedControls(target, state, handlers, fields, colorKeys);
  bindInstitutionModeControls(target, state, handlers, colorKeys);

  if (institutionGuidedSteps(fields)[institutionGuidedIndex]?.key === 'social') {
    renderSocialLinks(state, handlers, '#clinicSocialLinksEditor');
  }
  updateSocialEditorVisibility();
}

function renderInstitutionLoadModeChoice() {
  return `
    <div class="institution-method-card">
      <span class="guided-kicker">Crear nueva institución</span>
      <h3>¿Cómo querés cargar los datos?</h3>
      <p>Elegí una forma de carga. Los botones para guardar aparecen al final, cuando revises la institución.</p>
      <div class="institution-method-actions">
        <button class="primary-button" type="button" data-institution-mode="guided">Guiado paso a paso</button>
        <button class="secondary-button" type="button" data-institution-mode="full">Formulario completo</button>
        <button class="secondary-button" type="button" id="cancelInstitutionEditButton">Cancelar</button>
      </div>
    </div>
  `;
}

function institutionFields(state, colorKeys) {
  return [
    text('Nombre de la institución', 'clinic.name', state.clinic.name, true),
    select('Tipo de institución', 'clinic.institutionType', state.clinic.institutionType, institutionTypes, true),
    text('Especificar tipo', 'clinic.otherInstitutionType', state.clinic.otherInstitutionType, false, state.clinic.institutionType !== 'Otro'),
    text('Dirección', 'clinic.address', state.clinic.address),
    text('WhatsApp principal', 'clinic.primaryPhone', state.clinic.primaryPhone),
    text('Teléfono secundario', 'clinic.secondaryPhone', state.clinic.secondaryPhone),
    text('Email', 'clinic.email', state.clinic.email),
    text('Sitio web', 'clinic.website', state.clinic.website),
    selectWithCustom('Frase institucional', 'clinic.institutionalPhrase', state.clinic.institutionalPhrase, institutionalPhraseOptions),
    select('Color principal institucional', 'clinic.defaultPrimaryColor', state.clinic.defaultPrimaryColor, colorKeys, false, key => colorPresets[key].label),
    select('Color secundario institucional', 'clinic.defaultSecondaryColor', state.clinic.defaultSecondaryColor, colorKeys, false, key => colorPresets[key].label),
    fileText('Logo institucional esperado', 'clinic.logoFileName', state.clinic.logoFileName, 'image/*', false, false, 'Elegí el archivo del logo para completar el nombre. Luego adjuntalo manualmente en ChatGPT.'),
    toggle('Mostrar datos de contacto', 'clinic.showContactData', state.clinic.showContactData)
  ];
}

function institutionGuidedSteps(fields) {
  const byPath = new Map(fields.map(field => [field.path, field]));
  const visible = (...paths) => paths.map(path => byPath.get(path)).filter(field => field && !field.hidden);

  return [
    {
      key: 'name',
      title: 'Nombre de la institución',
      help: 'Ingresá cómo debe aparecer el centro o clínica en el flyer.',
      fields: visible('clinic.name')
    },
    {
      key: 'type',
      title: 'Tipo de institución',
      help: 'Seleccioná la categoría más cercana. Si elegís Otro, especificá el tipo.',
      fields: visible('clinic.institutionType', 'clinic.otherInstitutionType')
    },
    {
      key: 'address',
      title: 'Dirección',
      help: 'Completá la dirección visible para el paciente. Podés dejarla vacía si no querés mostrarla.',
      fields: visible('clinic.address')
    },
    {
      key: 'phones',
      title: 'Teléfonos y contacto directo',
      help: 'Cargá el WhatsApp principal y, si corresponde, un teléfono secundario.',
      fields: visible('clinic.primaryPhone', 'clinic.secondaryPhone')
    },
    {
      key: 'digital',
      title: 'Contacto digital',
      help: 'Email y sitio web son opcionales. Solo se incluirán si están completos.',
      fields: visible('clinic.email', 'clinic.website')
    },
    {
      key: 'social',
      title: 'Redes sociales',
      help: 'Agregá Instagram, WhatsApp u otras redes. Podés sumar, editar o quitar redes en esta tarjeta.',
      fields: []
    },
    {
      key: 'phrase',
      title: 'Frase institucional',
      help: 'Una frase breve ayuda a reforzar la identidad del centro.',
      fields: visible('clinic.institutionalPhrase')
    },
    {
      key: 'colors',
      title: 'Colores institucionales',
      help: 'Estos colores pueden reutilizarse en Diseño si activás colores institucionales.',
      fields: visible('clinic.defaultPrimaryColor', 'clinic.defaultSecondaryColor')
    },
    {
      key: 'logo',
      title: 'Logo institucional',
      help: 'Elegí el archivo para completar el nombre. Luego deberás adjuntarlo manualmente en ChatGPT.',
      fields: visible('clinic.logoFileName')
    },
    {
      key: 'contact-data',
      title: 'Datos visibles de contacto',
      help: 'Definí si el flyer debe mostrar datos de contacto institucionales.',
      fields: visible('clinic.showContactData')
    },
    {
      key: 'summary',
      title: 'Revisión de institución',
      help: 'Confirmá que los datos principales estén bien antes de pasar al tipo de pieza.',
      fields: []
    }
  ];
}

function renderInstitutionGuidedPanel(state, fields) {
  const steps = institutionGuidedSteps(fields);
  const step = steps[institutionGuidedIndex] || steps[0];
  const current = institutionGuidedIndex + 1;
  const progress = Math.round((current / steps.length) * 100);
  const isSummary = step.key === 'summary';

  return `
    <div class="guided-card" data-guided-key="${escapeHtml(step.key)}">
      <div class="guided-card-head">
        <div>
          <span class="guided-kicker">Institución · Campo ${current} de ${steps.length}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.help)}</p>
        </div>
        <div class="guided-progress" aria-label="Progreso dentro de institución">
          <span>${progress}%</span>
          <div><i style="width:${progress}%"></i></div>
        </div>
      </div>
      <div class="guided-card-body">
        ${renderInstitutionGuidedBody(state, step)}
      </div>
      <div class="guided-card-actions">
        <button class="secondary-button" type="button" data-institution-guided="previous">← Anterior</button>
        ${isSummary ? `
          <button class="primary-button" type="button" id="saveInstitutionAndContinueButton">Guardar y continuar →</button>
          <button class="secondary-button" type="button" id="continueInstitutionWithoutSavingButton">Continuar sin guardar</button>
          <button class="secondary-button" type="button" data-institution-mode="full">Editar en formulario completo</button>
        ` : `
          <button class="secondary-button" type="button" data-institution-mode="full">Formulario completo</button>
          <button class="primary-button" type="button" data-institution-guided="next">Siguiente →</button>
        `}
      </div>
    </div>
  `;
}

function renderInstitutionGuidedBody(state, step) {
  if (step.key === 'social') {
    return `<div id="clinicSocialLinksEditor" class="list-editor guided-social-editor"></div>`;
  }

  if (step.key === 'summary') {
    return `<div class="guided-summary">
      <dl>
        <div><dt>Nombre</dt><dd>${escapeHtml(state.clinic.name || 'Sin completar')}</dd></div>
        <div><dt>Tipo</dt><dd>${escapeHtml(state.clinic.institutionType || 'Sin completar')}</dd></div>
        <div><dt>Dirección</dt><dd>${escapeHtml(state.clinic.address || 'Sin completar')}</dd></div>
        <div><dt>WhatsApp</dt><dd>${escapeHtml(state.clinic.primaryPhone || 'Sin completar')}</dd></div>
        <div><dt>Logo</dt><dd>${escapeHtml(state.clinic.logoFileName || 'Sin logo seleccionado')}</dd></div>
      </dl>
      <p class="helper-text">Si necesitás corregir algo, usá Anterior o cambiá a formulario completo.</p>
    </div>`;
  }

  return step.fields.length
    ? `<div class="guided-field-grid">${step.fields.map(field => renderField(field)).join('')}</div>`
    : '<p class="institution-empty-state">No hay campos para completar en esta tarjeta.</p>';
}

function bindInstitutionGuidedControls(target, state, handlers, fields, colorKeys) {
  const panel = target.querySelector('#institutionGuidedPanel');
  if (!panel) return;
  bindFieldControls(panel, handlers);

  panel.querySelectorAll('[data-institution-guided]').forEach(button => {
    button.addEventListener('click', () => {
      const steps = institutionGuidedSteps(fields);
      if (button.dataset.institutionGuided === 'previous') {
        if (institutionGuidedIndex === 0) {
          institutionViewMode = 'choice';
        } else {
          institutionGuidedIndex = Math.max(0, institutionGuidedIndex - 1);
        }
      }
      if (button.dataset.institutionGuided === 'next') institutionGuidedIndex = Math.min(steps.length - 1, institutionGuidedIndex + 1);
      renderInstitutionStep(state, handlers, colorKeys);
    });
  });

  panel.querySelectorAll('input[data-path], select[data-path]').forEach(input => {
    input.addEventListener('keydown', event => {
      if (event.key !== 'Enter' || event.target.tagName === 'TEXTAREA') return;
      event.preventDefault();
      const steps = institutionGuidedSteps(fields);
      institutionGuidedIndex = Math.min(steps.length - 1, institutionGuidedIndex + 1);
      renderInstitutionStep(state, handlers, colorKeys);
    });
  });
}

function bindInstitutionModeControls(target, state, handlers, colorKeys) {
  target.querySelectorAll('[data-institution-mode]').forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.dataset.institutionMode;
      institutionViewMode = ['choice', 'guided', 'full'].includes(mode) ? mode : 'choice';
      if (institutionViewMode === 'guided') institutionGuidedIndex = 0;
      renderInstitutionStep(state, handlers, colorKeys);
    });
  });
}

function updateSocialEditorVisibility() {
  const steps = institutionGuidedSteps([]);
  const guidedKey = steps[institutionGuidedIndex]?.key;
  socialEditorShow(institutionViewMode === 'guided' && guidedKey === 'social');
}

function socialEditorShow(visible) {
  document.querySelectorAll('#socialLinksEditor').forEach(socialEditor => {
    socialEditor.hidden = !visible;
  });
}


function renderContentStep(state, handlers, specialtyNames) {
  const pieceType = state.promptOptions.pieceType || PIECE_TYPES.professionalFlyer;
  const preset = getSpecialtyPreset(state.specialty.primaryProfessionalSpecialty);

  if (contentViewMode === 'full') {
    renderFullContentStep(state, handlers, specialtyNames, preset, pieceType);
    return;
  }

  renderGuidedContentStep(state, handlers, specialtyNames, preset, pieceType);
}

function renderFullContentStep(state, handlers, specialtyNames, preset, pieceType) {
  if (pieceType === PIECE_TYPES.professionalFlyer) {
    renderProfessionalContent(state, handlers, specialtyNames, preset);
  } else if (pieceType === PIECE_TYPES.clinicalInfographic) {
    renderInfographicContent(state, handlers, specialtyNames, preset);
  } else if (pieceType === PIECE_TYPES.informativeFlyer) {
    renderInformativeContent(state, handlers, specialtyNames, preset);
  } else {
    renderCampaignContent(state, handlers, specialtyNames, preset);
  }

  const target = document.querySelector('#serviceFields');
  if (!target) return;
  target.insertAdjacentHTML('afterbegin', renderContentModeBanner(pieceType));
  bindContentModeControls(target, state, handlers, specialtyNames, preset, pieceType);
}

function renderGuidedContentStep(state, handlers, specialtyNames, preset, pieceType) {
  const target = document.querySelector('#serviceFields');
  const secondaryTarget = document.querySelector('#additionalSpecialtiesEditor');
  if (!target) return;
  if (secondaryTarget) secondaryTarget.innerHTML = '';

  const steps = contentGuidedSteps(state, specialtyNames, preset, pieceType);
  contentGuidedIndex = Math.max(0, Math.min(contentGuidedIndex, steps.length - 1));

  const step = steps[contentGuidedIndex] || steps[0];
  const current = contentGuidedIndex + 1;
  const progress = Math.round((current / steps.length) * 100);
  const isLast = contentGuidedIndex >= steps.length - 1;

  target.innerHTML = `
    <div class="guided-card content-guided-card" data-content-guided-key="${escapeHtml(step.key)}">
      <div class="guided-card-head">
        <div>
          <span class="guided-kicker">Contenido guiado · Tarjeta ${current} de ${steps.length}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.help)}</p>
        </div>
        <div class="guided-progress" aria-label="Progreso dentro de contenido">
          <span>${progress}%</span>
          <div><i style="width:${progress}%"></i></div>
        </div>
      </div>
      <div class="guided-card-body">
        ${renderContentGuidedBody(state, step, handlers)}
      </div>
      <div class="guided-card-actions">
        <button class="secondary-button" type="button" data-content-guided="previous">← Anterior</button>
        <button class="secondary-button" type="button" data-content-mode="full">Formulario completo</button>
        ${isLast ? '<span class="helper-text content-guided-finish-note">Listo. Tocá Siguiente → para pasar a Diseño.</span>' : '<button class="primary-button" type="button" data-content-guided="next">Siguiente tarjeta →</button>'}
      </div>
    </div>
  `;

  bindFieldControls(target, handlers);
  bindContentModeControls(target, state, handlers, specialtyNames, preset, pieceType);
  bindContentGuidedControls(target, state, handlers, specialtyNames, preset, pieceType);
  bindInlineServiceSelector(target, state, handlers);
  bindInlineBlockSelector(target, state, handlers);
  bindInlineScheduleControls(target, handlers);
}

function renderContentModeBanner(pieceType) {
  return `
    <div class="smart-panel content-mode-panel">
      <div class="list-title">
        <label>Formulario completo</label>
        <small>${escapeHtml(labelPieceType(pieceType))}. Editá todos los campos en una sola pantalla.</small>
      </div>
      <p class="helper-text">También podés volver al flujo guiado por tarjetas para completar el contenido paso a paso.</p>
      <div class="institution-method-actions">
        <button class="secondary-button" type="button" data-content-mode="guided">Volver a contenido guiado</button>
      </div>
    </div>
  `;
}

function contentGuidedSteps(state, specialtyNames, preset, pieceType) {
  const builders = {
    [PIECE_TYPES.professionalFlyer]: professionalContentSteps,
    [PIECE_TYPES.clinicalInfographic]: infographicContentSteps,
    [PIECE_TYPES.informativeFlyer]: informativeContentSteps,
    [PIECE_TYPES.promotionCampaign]: campaignContentSteps
  };
  const builder = builders[pieceType] || builders[PIECE_TYPES.professionalFlyer];
  return builder(state, specialtyNames, preset);
}

function professionalContentSteps(state, specialtyNames, preset) {
  return [
    {
      key: 'professional',
      title: 'Profesional',
      help: 'Completá nombre, matrícula y foto solo si debe aparecer en el flyer.',
      fields: [
        select('Título', 'professional.title', state.professional.title, titles),
        text('Nombre completo del profesional', 'professional.fullName', state.professional.fullName, true),
        text('Matrícula', 'professional.license', state.professional.license),
        select('Especialidad o área', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
        toggle('Mostrar foto profesional', 'professional.showPhoto', state.professional.showPhoto),
        fileText('Foto profesional esperada', 'professional.photoFileName', state.professional.photoFileName || '', 'image/*', false, !state.professional.showPhoto, 'Elegí la foto para completar el nombre. Luego adjuntala manualmente en ChatGPT.')
      ]
    },
    {
      key: 'specialty',
      title: 'Especialidad visible y frase',
      help: 'Definí cómo se verá la especialidad y una frase breve opcional.',
      fields: [
        text('Cómo se verá la especialidad', 'specialty.visibleSpecialtyText', state.specialty.visibleSpecialtyText || smartSpecialtyText(state)),
        text('Frase breve opcional', 'promptOptions.suggestedPhrase', state.promptOptions.suggestedPhrase)
      ]
    },
    {
      key: 'services',
      title: 'Prestaciones visibles',
      help: 'Elegí 3 a 5 prestaciones o datos visibles. El orden actual se respeta en el prompt.',
      html: () => renderInlineServiceSelectorHtml(state, preset, 'Prestaciones sugeridas por especialidad', 'Marcá lo esencial y agregá datos personalizados debajo si hace falta.')
    },
    {
      key: 'care',
      title: 'Atención',
      help: 'Completá turnos, modalidad, horarios y cobertura visible para pacientes.',
      fields: careFields(state),
      html: () => renderInlineSchedulesHtml(state)
    },
    {
      key: 'summary',
      title: 'Revisión del contenido',
      help: 'Revisá los datos principales antes de pasar al diseño.',
      html: () => renderContentSummaryHtml(state, PIECE_TYPES.professionalFlyer)
    }
  ];
}

function infographicContentSteps(state, specialtyNames, preset) {
  return [
    {
      key: 'topic',
      title: 'Tema de la infografía',
      help: 'Elegí el área sanitaria y el tema educativo principal.',
      fields: [
        select('Especialidad / área sanitaria', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
        selectWithCustom('Tema educativo', 'promptOptions.educationalTopic', state.promptOptions.educationalTopic, preset.infographicTopics || preset.topics || [], true)
      ]
    },
    {
      key: 'audience-message',
      title: 'Público y mensaje',
      help: 'Indicá a quién va dirigida y cuál es la idea central que debe quedar clara.',
      fields: [
        selectWithCustom('Público objetivo', 'promptOptions.targetAudience', state.promptOptions.targetAudience, preset.audiences || defaultAudiences(), true),
        selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.messages || [], true),
        selectWithCustom('Nota sanitaria', 'promptOptions.legalEthicalNote', state.promptOptions.legalEthicalNote, noteOptions, false)
      ]
    },
    {
      key: 'blocks',
      title: 'Bloques de contenido',
      help: 'Armá los bloques de la infografía con poco texto y enfoque prudente.',
      html: () => renderInlineBlockSelectorHtml(state, preset, 'Bloques sugeridos', 'Marcá 3 a 5 bloques. La infografía debe ser visual y fácil de leer.')
    },
    {
      key: 'summary',
      title: 'Revisión de infografía',
      help: 'Confirmá tema, público, mensaje y bloques antes de diseñar.',
      html: () => renderContentSummaryHtml(state, PIECE_TYPES.clinicalInfographic)
    }
  ];
}

function informativeContentSteps(state, specialtyNames, preset) {
  return [
    {
      key: 'info-type',
      title: 'Tipo de información',
      help: 'Definí qué información se comunica y el título visible.',
      fields: [
        select('Área / servicio relacionado', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
        selectWithCustom('Tipo de información', 'promptOptions.contentGoal', state.promptOptions.contentGoal, preset.informativeTypes || informationTypes, true),
        selectWithCustom('Título visible', 'promptOptions.educationalTopic', state.promptOptions.educationalTopic, preset.informativeTitles || preset.topics || [], true)
      ]
    },
    {
      key: 'message-cta',
      title: 'Mensaje y llamada a la acción',
      help: 'Completá el mensaje central y qué debe hacer el paciente.',
      fields: [
        selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.informativeMessages || preset.messages || [], true),
        selectWithCustom('Llamada a la acción', 'promptOptions.campaignCallToAction', state.promptOptions.campaignCallToAction, ctaOptions, false)
      ]
    },
    {
      key: 'visible-data',
      title: 'Datos visibles',
      help: 'Elegí solo lo esencial para no sobrecargar el flyer.',
      html: () => renderInlineServiceSelectorHtml(state, preset, 'Datos visibles sugeridos', 'Marcá pocos datos para que el flyer sea claro en redes.')
    },
    {
      key: 'summary',
      title: 'Revisión del flyer informativo',
      help: 'Confirmá tipo de información, título, datos visibles y CTA.',
      html: () => renderContentSummaryHtml(state, PIECE_TYPES.informativeFlyer)
    }
  ];
}

function campaignContentSteps(state, specialtyNames, preset) {
  return [
    {
      key: 'campaign-type',
      title: 'Tipo de campaña',
      help: 'Elegí el área, tipo de campaña y rango visible con fecha desde y hasta.',
      fields: [
        select('Área / especialidad', 'specialty.primaryProfessionalSpecialty', state.specialty.primaryProfessionalSpecialty, specialtyNames, true),
        selectWithCustom('Tipo de campaña', 'promptOptions.campaignType', state.promptOptions.campaignType, preset.campaignTypes || campaignTypes, true),
        date('Desde', 'promptOptions.campaignStartDate', state.promptOptions.campaignStartDate),
        date('Hasta', 'promptOptions.campaignEndDate', state.promptOptions.campaignEndDate)
      ]
    },
    {
      key: 'campaign-message',
      title: 'Público y mensaje',
      help: 'Definí a quién se dirige y qué mensaje principal debe comunicar.',
      fields: [
        selectWithCustom('Público objetivo', 'promptOptions.targetAudience', state.promptOptions.targetAudience, preset.audiences || defaultAudiences(), false),
        selectWithCustom('Mensaje principal', 'promptOptions.mainMessage', state.promptOptions.mainMessage, preset.campaignMessages || preset.messages || [], true)
      ]
    },
    {
      key: 'conditions-cta',
      title: 'Condiciones y CTA',
      help: 'Aclaración breve, llamado a la acción y nota prudente para evitar promesas.',
      fields: [
        textarea('Condiciones o aclaración breve', 'promptOptions.campaignConditions', state.promptOptions.campaignConditions),
        selectWithCustom('Llamada a la acción', 'promptOptions.campaignCallToAction', state.promptOptions.campaignCallToAction, ctaOptions, false),
        selectWithCustom('Nota prudente', 'promptOptions.legalEthicalNote', state.promptOptions.legalEthicalNote, noteOptions, false)
      ]
    },
    {
      key: 'campaign-points',
      title: 'Puntos visibles',
      help: 'Elegí pocos puntos concretos. Evitá urgencia falsa o lenguaje engañoso.',
      html: () => renderInlineServiceSelectorHtml(state, preset, 'Puntos visibles de la campaña', 'Marcá pocos puntos para mantener una pieza clara y prudente.')
    },
    {
      key: 'summary',
      title: 'Revisión de campaña',
      help: 'Confirmá campaña, fecha, condiciones, puntos visibles y CTA.',
      html: () => renderContentSummaryHtml(state, PIECE_TYPES.promotionCampaign)
    }
  ];
}

function renderContentGuidedBody(state, step) {
  const fields = step.fields || [];
  const fieldsHtml = fields.length
    ? `<div class="guided-field-grid">${fields.map(field => renderField(field)).join('')}</div>`
    : '';

  const customHtml = typeof step.html === 'function' ? step.html(state) : '';
  return fieldsHtml || customHtml
    ? `${fieldsHtml}${customHtml}`
    : '<p class="institution-empty-state">No hay campos para completar en esta tarjeta.</p>';
}

function careFields(state) {
  return [
    toggle('Requiere turno previo', 'schedule.requiresAppointment', state.schedule.requiresAppointment),
    text('Texto para turnos', 'schedule.appointmentText', state.schedule.appointmentText),
    select('Modalidad', 'schedule.modality', state.schedule.modality, modalities),
    toggle('Obras sociales', 'coverage.insurance', state.coverage.insurance),
    toggle('Particulares', 'coverage.privatePatients', state.coverage.privatePatients),
    textarea('Observación administrativa', 'schedule.administrativeNote', state.schedule.administrativeNote)
  ];
}

function renderInlineServiceSelectorHtml(state, preset, title, help) {
  const suggestions = (preset.services || []).slice(0, 8);
  return `
    <div class="smart-panel content-inline-panel">
      <div class="list-title">
        <label>${escapeHtml(title)}</label>
        <small>${escapeHtml(help)}</small>
      </div>
      ${suggestions.length ? `
        <div class="chip-grid">
          ${suggestions.map(item => `
            <label class="chip-check">
              <input type="checkbox" value="${escapeHtml(item)}" ${state.services.visibleServices.includes(item) ? 'checked' : ''} data-content-service-suggestion>
              <span>${escapeHtml(item)}</span>
            </label>
          `).join('')}
        </div>
      ` : '<p class="helper-text">No hay sugerencias automáticas para esta especialidad. Agregá datos visibles personalizados debajo.</p>'}
      <div class="inline-visible-services-editor">
        <div class="list-title">
          <label for="newServiceGuided">Datos visibles elegidos</label>
          <button class="secondary-button" type="button" data-content-add-service>Agregar dato</button>
        </div>
        <div class="inline-entry">
          <input id="newServiceGuided" type="text" data-content-new-service placeholder="Agregar dato visible personalizado">
        </div>
        <ul class="editable-list inline-visible-services-list">
          ${state.services.visibleServices.length ? state.services.visibleServices.map((item, index) => `
            <li>
              <span>${escapeHtml(item)}</span>
              <button type="button" class="icon-button" data-content-remove-service="${index}" aria-label="Eliminar ${escapeHtml(item)}">Quitar</button>
            </li>
          `).join('') : '<li class="empty-inline-item">Todavía no seleccionaste datos visibles.</li>'}
        </ul>
      </div>
      <p class="helper-text">${state.services.visibleServices.length > 5 ? 'Hay muchos datos visibles. Para redes conviene mostrar hasta 5.' : 'Sugerencia: 3 a 5 opciones visibles.'}</p>
    </div>
  `;
}

function renderInlineBlockSelectorHtml(state, preset, title, help) {
  const suggestions = (preset.blocks || preset.services || []).slice(0, 8);
  const selected = parseLines(state.promptOptions.infoBlocksText);
  return `
    <div class="smart-panel content-inline-panel">
      <div class="list-title">
        <label>${escapeHtml(title)}</label>
        <small>${escapeHtml(help)}</small>
      </div>
      ${suggestions.length ? `
        <div class="chip-grid">
          ${suggestions.map(item => `
            <label class="chip-check">
              <input type="checkbox" value="${escapeHtml(item)}" ${selected.includes(item) ? 'checked' : ''} data-content-block-suggestion>
              <span>${escapeHtml(item)}</span>
            </label>
          `).join('')}
        </div>
      ` : '<p class="helper-text">No hay bloques sugeridos para esta especialidad. Escribilos manualmente.</p>'}
      <label class="field full-width">
        <span>Bloques elegidos / personalizados</span>
        <textarea data-path="promptOptions.infoBlocksText" rows="4">${escapeHtml(state.promptOptions.infoBlocksText)}</textarea>
      </label>
    </div>
  `;
}

function renderInlineSchedulesHtml(state) {
  return `
    <div class="smart-panel content-inline-panel">
      <div class="list-title">
        <label>Horarios de atención</label>
        <button class="secondary-button" type="button" id="addScheduleButtonContent">Agregar horario</button>
      </div>
      <div class="repeatable-list">
        ${state.schedule.items.length ? state.schedule.items.map((item, index) => `
          <div class="repeatable-row schedule-row" data-warning-path="schedule.items.${index}">
            <label class="field"><span>Día o días</span><input type="text" value="${escapeHtml(item.days)}" data-content-schedule-index="${index}" data-content-schedule-key="days"></label>
            <label class="field"><span>Desde</span><input type="time" value="${escapeHtml(item.from)}" data-content-schedule-index="${index}" data-content-schedule-key="from"></label>
            <label class="field"><span>Hasta</span><input type="time" value="${escapeHtml(item.to)}" data-content-schedule-index="${index}" data-content-schedule-key="to"></label>
            <label class="field"><span>Observación</span><input type="text" value="${escapeHtml(item.note)}" data-content-schedule-index="${index}" data-content-schedule-key="note"></label>
            <button type="button" class="icon-button" data-content-remove-schedule="${index}">Quitar</button>
          </div>
        `).join('') : '<p class="institution-empty-state">No hay horarios cargados. Agregá uno si debe verse en el flyer.</p>'}
      </div>
    </div>
  `;
}

function renderContentSummaryHtml(state, pieceType) {
  const visibleServices = state.services.visibleServices.filter(Boolean).join(', ') || 'Sin datos visibles cargados';
  const blocks = parseLines(state.promptOptions.infoBlocksText).join(', ') || 'Sin bloques cargados';
  const common = `
    <div><dt>Área</dt><dd>${escapeHtml(state.specialty.primaryProfessionalSpecialty || 'Sin completar')}</dd></div>
    <div><dt>Mensaje</dt><dd>${escapeHtml(state.promptOptions.mainMessage || state.promptOptions.suggestedPhrase || 'Sin completar')}</dd></div>
  `;

  const byPiece = {
    [PIECE_TYPES.professionalFlyer]: `
      <div><dt>Profesional</dt><dd>${escapeHtml([state.professional.title, state.professional.fullName].filter(Boolean).join(' ') || 'Sin completar')}</dd></div>
      <div><dt>Especialidad visible</dt><dd>${escapeHtml(state.specialty.visibleSpecialtyText || 'Sin completar')}</dd></div>
      <div><dt>Prestaciones</dt><dd>${escapeHtml(visibleServices)}</dd></div>
      <div><dt>Atención</dt><dd>${escapeHtml(state.schedule.appointmentText || state.schedule.modality || 'Sin completar')}</dd></div>
    `,
    [PIECE_TYPES.clinicalInfographic]: `
      <div><dt>Tema</dt><dd>${escapeHtml(state.promptOptions.educationalTopic || 'Sin completar')}</dd></div>
      <div><dt>Público</dt><dd>${escapeHtml(state.promptOptions.targetAudience || 'Sin completar')}</dd></div>
      ${common}
      <div><dt>Bloques</dt><dd>${escapeHtml(blocks)}</dd></div>
    `,
    [PIECE_TYPES.informativeFlyer]: `
      <div><dt>Tipo</dt><dd>${escapeHtml(state.promptOptions.contentGoal || 'Sin completar')}</dd></div>
      <div><dt>Título</dt><dd>${escapeHtml(state.promptOptions.educationalTopic || 'Sin completar')}</dd></div>
      ${common}
      <div><dt>CTA</dt><dd>${escapeHtml(state.promptOptions.campaignCallToAction || 'Sin completar')}</dd></div>
      <div><dt>Datos visibles</dt><dd>${escapeHtml(visibleServices)}</dd></div>
    `,
    [PIECE_TYPES.promotionCampaign]: `
      <div><dt>Tipo</dt><dd>${escapeHtml(state.promptOptions.campaignType || 'Sin completar')}</dd></div>
      <div><dt>Período</dt><dd>${escapeHtml(campaignValidityText(state.promptOptions) || 'Sin completar')}</dd></div>
      ${common}
      <div><dt>CTA</dt><dd>${escapeHtml(state.promptOptions.campaignCallToAction || 'Sin completar')}</dd></div>
      <div><dt>Puntos visibles</dt><dd>${escapeHtml(visibleServices)}</dd></div>
    `
  };

  return `<div class="guided-summary"><dl>${byPiece[pieceType] || byPiece[PIECE_TYPES.professionalFlyer]}</dl><p class="helper-text">Usá Formulario completo si necesitás revisar todos los campos juntos.</p></div>`;
}

function bindContentModeControls(target, state, handlers, specialtyNames, preset, pieceType) {
  target.querySelectorAll('[data-content-mode]').forEach(button => {
    button.addEventListener('click', () => {
      contentViewMode = button.dataset.contentMode === 'full' ? 'full' : 'guided';
      if (contentViewMode === 'guided') contentGuidedIndex = Math.min(contentGuidedIndex, contentGuidedSteps(state, specialtyNames, preset, pieceType).length - 1);
      renderContentStep(state, handlers, specialtyNames);
      renderVisibleServices(state, handlers);
    });
  });
}

function bindContentGuidedControls(target, state, handlers, specialtyNames, preset, pieceType) {
  target.querySelectorAll('[data-content-guided]').forEach(button => {
    button.addEventListener('click', () => {
      const steps = contentGuidedSteps(state, specialtyNames, preset, pieceType);
      if (button.dataset.contentGuided === 'previous') contentGuidedIndex = Math.max(0, contentGuidedIndex - 1);
      if (button.dataset.contentGuided === 'next') contentGuidedIndex = Math.min(steps.length - 1, contentGuidedIndex + 1);
      renderContentStep(state, handlers, specialtyNames);
      renderVisibleServices(state, handlers);
    });
  });
}

function bindInlineServiceSelector(target, state, handlers) {
  target.querySelectorAll('[data-content-service-suggestion]').forEach(input => {
    input.addEventListener('change', () => handlers.onToggleServiceOption(input.value, input.checked));
  });

  const input = target.querySelector('[data-content-new-service]');
  const addButton = target.querySelector('[data-content-add-service]');
  const addVisibleService = () => {
    const value = String(input?.value || '').trim();
    if (!value) return;
    handlers.onToggleServiceOption(value, true);
    if (input) input.value = '';
  };

  addButton?.addEventListener('click', addVisibleService);
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addVisibleService();
    }
  });

  target.querySelectorAll('[data-content-remove-service]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveService(Number(button.dataset.contentRemoveService)));
  });
}

function bindInlineBlockSelector(target, state, handlers) {
  target.querySelectorAll('[data-content-block-suggestion]').forEach(input => {
    input.addEventListener('change', () => {
      const current = parseLines(state.promptOptions.infoBlocksText);
      const value = input.value;
      const next = input.checked
        ? [...new Set([...current, value])]
        : current.filter(item => item !== value);
      handlers.onFieldChange('promptOptions.infoBlocksText', next.join('\n'));
    });
  });
}

function bindInlineScheduleControls(target, handlers) {
  target.querySelector('#addScheduleButtonContent')?.addEventListener('click', handlers.onAddSchedule);
  target.querySelectorAll('[data-content-remove-schedule]').forEach(button => {
    button.addEventListener('click', () => handlers.onRemoveSchedule(Number(button.dataset.contentRemoveSchedule)));
  });
  target.querySelectorAll('[data-content-schedule-index]').forEach(input => {
    const updateSchedule = () => handlers.onUpdateSchedule(Number(input.dataset.contentScheduleIndex), input.dataset.contentScheduleKey, input.value);
    input.addEventListener('input', updateSchedule);
    input.addEventListener('change', updateSchedule);
  });
}

function renderProfessionalContent(state, handlers, specialtyNames, preset) {
  renderFields('#serviceFields', [
    select('Título', 'professional.title', state.professional.title, titles),
    text('Nombre completo del profesional', 'professional.fullName', state.professional.fullName, true),
    text('Matrícula', 'professional.license', state.professional.license),
    toggle('Mostrar foto profesional', 'professional.showPhoto', state.professional.showPhoto),
    fileText('Foto profesional esperada', 'professional.photoFileName', state.professional.photoFileName || '', 'image/*', false, !state.professional.showPhoto, 'Elegí la foto para completar el nombre. Luego adjuntala manualmente en ChatGPT.'),
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
    date('Desde', 'promptOptions.campaignStartDate', state.promptOptions.campaignStartDate),
    date('Hasta', 'promptOptions.campaignEndDate', state.promptOptions.campaignEndDate),
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
  const fields = designFields(state, colorKeys);

  if (designViewMode === 'full') {
    renderFullDesignStep(state, handlers, fields);
    return;
  }

  renderGuidedDesignStep(state, handlers, fields);
}

function designFields(state, colorKeys) {
  const useInstitutionalColors = Boolean(state.design.useInstitutionalColors);
  return [
    toggle('Usar colores institucionales', 'design.useInstitutionalColors', useInstitutionalColors),
    ...(!useInstitutionalColors ? [
      select('Color principal', 'design.primaryColor', state.design.primaryColor, colorKeys, true, key => colorPresets[key].label),
      text('Otro color principal', 'design.customPrimaryColor', state.design.customPrimaryColor, false, !isOtherColor(state.design.primaryColor)),
      select('Color secundario', 'design.secondaryColor', state.design.secondaryColor, colorKeys, false, key => colorPresets[key].label),
      text('Otro color secundario', 'design.customSecondaryColor', state.design.customSecondaryColor, false, !isOtherColor(state.design.secondaryColor))
    ] : []),
    selectWithCustom('Estilo visual', 'design.visualStyle', state.design.visualStyle, visualStyles),
    selectWithCustom('Formato', 'design.format', state.design.format, formats),
    select('Densidad del contenido', 'design.contentDensity', state.design.contentDensity, contentDensityOptions, false, labelContentDensity),
    select('Nivel de impacto visual', 'design.visualImpact', state.design.visualImpact, impactLevels),
    selectWithCustom('Tipografía sugerida', 'design.typography', state.design.typography, typographyOptions),
    toggle('Solicitar pieza animada', 'promptOptions.requestAnimation', state.promptOptions.requestAnimation),
    toggle('Incluir iconos médicos', 'design.includeMedicalIcons', state.design.includeMedicalIcons),
    toggle('Incluir fondo temático', 'design.includeThematicBackground', state.design.includeThematicBackground),
    toggle('Usar recursos según especialidad', 'design.useAutomaticTheme', state.design.useAutomaticTheme)
  ];
}

function renderFullDesignStep(state, handlers, fields) {
  renderFields('#designFields', fields, handlers);

  const target = document.querySelector('#designFields');
  if (!target) return;
  target.insertAdjacentHTML('afterbegin', renderDesignModeBanner());
  bindDesignModeControls(target, state, handlers, fields);
  renderCustomImageAttachments(state, handlers);
}

function renderGuidedDesignStep(state, handlers, fields) {
  const target = document.querySelector('#designFields');
  if (!target) return;

  const steps = designGuidedSteps(state, fields);
  designGuidedIndex = Math.max(0, Math.min(designGuidedIndex, steps.length - 1));

  const step = steps[designGuidedIndex] || steps[0];
  const current = designGuidedIndex + 1;
  const progress = Math.round((current / steps.length) * 100);
  const isLast = designGuidedIndex >= steps.length - 1;

  target.innerHTML = `
    <div class="guided-card design-guided-card" data-design-guided-key="${escapeHtml(step.key)}">
      <div class="guided-card-head">
        <div>
          <span class="guided-kicker">Diseño guiado · Tarjeta ${current} de ${steps.length}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.help)}</p>
        </div>
        <div class="guided-progress" aria-label="Progreso dentro de diseño">
          <span>${progress}%</span>
          <div><i style="width:${progress}%"></i></div>
        </div>
      </div>
      <div class="guided-card-body">
        ${renderDesignGuidedBody(state, step)}
      </div>
      <div class="guided-card-actions">
        <button class="secondary-button" type="button" data-design-guided="previous">← Anterior</button>
        <button class="secondary-button" type="button" data-design-mode="full">Formulario completo</button>
        ${isLast ? '<span class="helper-text design-guided-finish-note">Listo. Tocá Siguiente → para revisar el resultado.</span>' : '<button class="primary-button" type="button" data-design-guided="next">Siguiente tarjeta →</button>'}
      </div>
    </div>
  `;

  bindFieldControls(target, handlers);
  bindDesignModeControls(target, state, handlers, fields);
  bindDesignGuidedControls(target, state, handlers, fields);
  bindCustomImageAttachmentControls(target, handlers);
}

function renderDesignModeBanner() {
  return `
    <div class="smart-panel design-mode-panel">
      <div class="list-title">
        <label>Formulario completo</label>
        <small>Editá formato, colores, estilo, tipografía, densidad, recursos visuales, animación e imágenes en una sola pantalla.</small>
      </div>
      <p class="helper-text">También podés volver al flujo guiado por tarjetas para revisar el diseño paso a paso.</p>
      <div class="institution-method-actions">
        <button class="secondary-button" type="button" data-design-mode="guided">Volver a diseño guiado</button>
      </div>
    </div>
  `;
}

function designGuidedSteps(state, fields) {
  const byPath = new Map(fields.map(field => [field.path, field]));
  const visible = (...paths) => paths.map(path => byPath.get(path)).filter(field => field && !field.hidden);

  return [
    {
      key: 'format',
      title: 'Formato',
      help: 'Elegí el tamaño de salida según dónde se va a publicar.',
      fields: visible('design.format')
    },
    {
      key: 'colors',
      title: 'Colores',
      help: 'Usá colores institucionales o personalizá una paleta sobria y legible.',
      fields: visible('design.useInstitutionalColors', 'design.primaryColor', 'design.customPrimaryColor', 'design.secondaryColor', 'design.customSecondaryColor')
    },
    {
      key: 'style',
      title: 'Estilo visual',
      help: 'Definí el estilo y el nivel de impacto visual de la pieza.',
      fields: visible('design.visualStyle', 'design.visualImpact')
    },
    {
      key: 'typography-density',
      title: 'Tipografía y densidad',
      help: 'Elegí una tipografía sugerida y cuánto texto debe verse en la imagen.',
      fields: visible('design.typography', 'design.contentDensity')
    },
    {
      key: 'resources',
      title: 'Iconos, fondo y recursos',
      help: 'Indicá si debe usar iconos médicos, fondo temático y recursos relacionados con la especialidad.',
      fields: visible('design.includeMedicalIcons', 'design.includeThematicBackground', 'design.useAutomaticTheme')
    },
    {
      key: 'animation',
      title: 'Modo animado',
      help: 'Activá esta opción solo si querés pedir un video corto o clip animado en vez de imagen estática.',
      fields: visible('promptOptions.requestAnimation')
    },
    {
      key: 'images',
      title: 'Imágenes personalizadas',
      help: 'Agregá nombres de fotos, referencias o imágenes temáticas. Después adjuntalas manualmente en ChatGPT.',
      html: () => renderCustomImageAttachmentsHtml(state)
    }
  ];
}

function renderDesignGuidedBody(state, step) {
  const fields = step.fields || [];
  const fieldsHtml = fields.length
    ? `<div class="guided-field-grid">${fields.map(field => renderField(field)).join('')}</div>`
    : '';

  const customHtml = typeof step.html === 'function' ? step.html(state) : '';
  return fieldsHtml || customHtml
    ? `${fieldsHtml}${customHtml}`
    : '<p class="institution-empty-state">No hay campos para completar en esta tarjeta.</p>';
}

function bindDesignModeControls(target, state, handlers, fields) {
  target.querySelectorAll('[data-design-mode]').forEach(button => {
    button.addEventListener('click', () => {
      designViewMode = button.dataset.designMode === 'full' ? 'full' : 'guided';
      if (designViewMode === 'guided') designGuidedIndex = Math.min(designGuidedIndex, designGuidedSteps(state, fields).length - 1);
      renderDesignStep(state, handlers, Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key)));
    });
  });
}

function bindDesignGuidedControls(target, state, handlers, fields) {
  target.querySelectorAll('[data-design-guided]').forEach(button => {
    button.addEventListener('click', () => {
      const steps = designGuidedSteps(state, fields);
      if (button.dataset.designGuided === 'previous') designGuidedIndex = Math.max(0, designGuidedIndex - 1);
      if (button.dataset.designGuided === 'next') designGuidedIndex = Math.min(steps.length - 1, designGuidedIndex + 1);
      renderDesignStep(state, handlers, Object.keys(colorPresets).filter(key => !['naranja', 'gris', 'personalizado'].includes(key)));
    });
  });
}


function renderFields(target, fields, handlers) {
  const node = document.querySelector(target);
  if (!node) return;
  node.innerHTML = fields.map(field => renderField(field)).join('');
  bindFieldControls(node, handlers);
}

function bindFieldControls(node, handlers) {
  node.querySelectorAll('[data-path]').forEach(input => {
    input.addEventListener('input', event => handlers.onFieldChange(event.target.dataset.path, getValue(event.target)));
    input.addEventListener('change', event => {
      const path = event.target.dataset.path;
      if (event.target.type === 'file') {
        handlers.onFieldChange(path, event.target.files[0]?.name || '');
        event.target.value = '';
      } else {
        const value = getValue(event.target);
        if (event.target.dataset.customSelect === 'true') {
          const customInput = event.target.parentElement?.querySelector('input[data-path]');
          if (customInput) customInput.hidden = value !== 'Otro / Personalizar' && !customInput.value;
        }
        handlers.onFieldChange(path, value);
      }
    });
  });
  node.querySelectorAll('[data-file-target]').forEach(input => {
    input.addEventListener('change', event => {
      const file = event.target.files?.[0];
      const path = event.target.dataset.fileTarget;
      const fileName = file?.name || '';
      const textInput = path ? node.querySelector(`[data-path="${cssEscape(path)}"]`) : null;
      if (textInput) textInput.value = fileName;
      if (path) handlers.onFieldChange(path, fileName);
      event.target.value = '';
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
  if (field.type === 'date') {
    return `<label class="field${hidden}"><span>${field.label}${required}</span><input type="date" data-path="${field.path}" value="${escapeHtml(field.value)}"></label>`;
  }
  if (field.type === 'selectCustom') {
    const selected = field.options.includes(field.value) ? field.value : field.value ? field.value : 'Otro / Personalizar';
    const customValue = field.options.includes(field.value) ? '' : field.value;
    return `<label class="field${hidden}"><span>${field.label}${required}</span><select data-path="${field.path}" data-custom-select="true">${field.options.map(option => `<option value="${escapeHtml(option)}" ${option === selected ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select><input type="text" data-path="${field.path}" value="${escapeHtml(customValue)}" placeholder="Escribir opción personalizada" ${selected === 'Otro / Personalizar' || customValue ? '' : 'hidden'}></label>`;
  }
  if (field.type === 'select') {
    return `<label class="field${hidden}"><span>${field.label}${required}</span><select data-path="${field.path}">${field.options.map(option => `<option value="${escapeHtml(option)}" ${option === field.value ? 'selected' : ''}>${escapeHtml(field.labeler ? field.labeler(option) : option)}</option>`).join('')}</select></label>`;
  }
  if (field.type === 'fileText') {
    const help = field.help ? `<small>${escapeHtml(field.help)}</small>` : '';
    return `<label class="field file-name-field${hidden}"><span>${field.label}${required}</span><div class="file-picker-row"><input type="text" data-path="${field.path}" value="${escapeHtml(field.value)}" placeholder="Ej: logo_rincon.png"><span class="file-picker-button">Elegir archivo<input type="file" accept="${escapeHtml(field.accept || 'image/*')}" data-file-target="${field.path}"></span></div>${help}</label>`;
  }
  return `<label class="field${hidden}"><span>${field.label}${required}</span><input type="text" data-path="${field.path}" value="${escapeHtml(field.value)}"></label>`;
}

function renderSocialLinks(state, handlers, targetSelector = '#socialLinksEditor') {
  const target = document.querySelector(targetSelector);
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
  const editor = document.querySelector('[data-visible-services-editor]');
  if (editor) editor.hidden = contentViewMode === 'guided';

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

function renderCustomImageAttachments(state, handlers) {
  const target = document.querySelector('#designFields');
  if (!target) return;
  target.insertAdjacentHTML('beforeend', renderCustomImageAttachmentsHtml(state));
  bindCustomImageAttachmentControls(target, handlers);
}

function renderCustomImageAttachmentsHtml(state) {
  const customIndexes = state.attachments.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => ![ATTACHMENT_ROLES.clinicLogo, ATTACHMENT_ROLES.professionalPhoto].includes(item.role));

  return `
    <div class="list-editor attachment-panel full-width">
      <div class="list-title">
        <label>Imágenes personalizadas para GPT</label>
        <button class="secondary-button" type="button" id="addCustomAttachmentButton">Agregar imagen</button>
      </div>
      <p class="helper-text">Elegí fotos, referencias o imágenes temáticas para que la app agregue sus nombres al prompt. Después adjuntalas manualmente en ChatGPT.</p>
      <div class="repeatable-list">
        ${customIndexes.length ? customIndexes.map(({ item, index }) => renderAttachmentRow(item, index, customAttachmentRoles)).join('') : '<p class="institution-empty-state">No hay imágenes personalizadas seleccionadas.</p>'}
      </div>
    </div>
  `;
}

function bindCustomImageAttachmentControls(target, handlers) {
  bindAttachmentControls(target, handlers);
  target.querySelector('#addCustomAttachmentButton')?.addEventListener('click', () => {
    if (handlers.onAddAttachmentWithRole) handlers.onAddAttachmentWithRole(ATTACHMENT_ROLES.thematicImage);
    else handlers.onAddAttachment();
  });
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
      ${state.attachments.items.map((item, index) => renderAttachmentRow(item, index, attachmentRoles)).join('')}
    </div>
  `;
  target.querySelector('#addAttachmentButton')?.addEventListener('click', handlers.onAddAttachment);
  bindAttachmentControls(target, handlers);
}

function renderAttachmentRow(item, index, roles = attachmentRoles) {
  return `
    <div class="repeatable-row attachment-row" data-warning-path="attachments.items.${index}">
      <label class="field"><span>Rol</span><select data-attachment-index="${index}" data-attachment-key="role">${roles.map(role => `<option value="${escapeHtml(role)}" ${role === item.role ? 'selected' : ''}>${escapeHtml(labelAttachmentRole(role))}</option>`).join('')}</select></label>
      <label class="field file-field"><span>Elegir archivo</span><input type="file" accept="image/*" data-attachment-file="${index}"></label>
      <label class="field"><span>Nombre de archivo</span><input type="text" value="${escapeHtml(item.fileName)}" data-attachment-index="${index}" data-attachment-key="fileName" placeholder="Ej: imagen_flyer.jpg"></label>
      <label class="field"><span>Instrucción para GPT</span><input type="text" value="${escapeHtml(item.instruction)}" data-attachment-index="${index}" data-attachment-key="instruction" placeholder="Ej: usar como referencia visual"></label>
      <button type="button" class="icon-button" data-remove-attachment="${index}">Quitar</button>
    </div>
  `;
}

function bindAttachmentControls(target, handlers) {
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
      const file = event.target.files?.[0];
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
  const baseChoices = [...new Set((options || []).filter(Boolean))];
  const hasCurrent = value && !baseChoices.includes(value) && value !== 'Otro / Personalizar';
  const choices = [...baseChoices, ...(hasCurrent ? [value] : []), ...(baseChoices.includes('Otro / Personalizar') ? [] : ['Otro / Personalizar'])];
  return { type: 'selectCustom', label, path, value: value || choices[0] || '', options: choices.length ? choices : ['Otro / Personalizar'], recommended, customActive: hasCurrent || value === 'Otro / Personalizar' };
}

function campaignValidityText(options = {}) {
  const start = String(options.campaignStartDate || '').trim();
  const end = String(options.campaignEndDate || '').trim();
  if (start && end) return `Desde ${start} hasta ${end}`;
  if (start) return `Desde ${start}`;
  if (end) return `Hasta ${end}`;
  return String(options.campaignValidity || '').trim();
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

function fileText(label, path, value, accept = 'image/*', recommended = false, hidden = false, help = '') {
  return { type: 'fileText', label, path, value, accept, recommended, hidden, help };
}

function textarea(label, path, value, recommended = false, hidden = false) {
  return { type: 'textarea', label, path, value, recommended, hidden };
}

function date(label, path, value, recommended = false, hidden = false) {
  return { type: 'date', label, path, value, recommended, hidden };
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

function cssEscape(value = '') {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\"');
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
    promotionCampaign: 'Promoción / campaña'
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
