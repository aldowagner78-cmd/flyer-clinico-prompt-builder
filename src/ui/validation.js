const COMPLETE_REQUIRED_CHECKS = [
  {
    key: 'clinic',
    label: 'Nombre de la clinica',
    path: 'clinic.name',
    test: state => hasText(state?.clinic?.name)
  },
  {
    key: 'professionalName',
    label: 'Nombre del profesional',
    path: 'professional.fullName',
    test: state => hasText(state?.professional?.fullName)
  },
  {
    key: 'specialty',
    label: 'Especialidad profesional principal',
    path: 'specialty.primaryProfessionalSpecialty',
    test: state => hasText(state?.specialty?.primaryProfessionalSpecialty)
  },
  {
    key: 'schedule',
    label: 'Horarios de atencion',
    path: 'schedule.items.0',
    test: state => getArray(state?.schedule?.items).some(isCompleteSchedule)
  },
  {
    key: 'services',
    label: 'Prestaciones visibles o prestacion destacada',
    path: 'services.visibleServices',
    test: state =>
      hasText(state?.services?.mainHighlightedService) ||
      getArray(state?.services?.visibleServices).some(hasText)
  },
  {
    key: 'modality',
    label: 'Modalidad de atencion',
    path: 'schedule.modality',
    test: state => hasText(state?.schedule?.modality)
  },
  {
    key: 'color',
    label: 'Color principal',
    path: 'design.primaryColor',
    test: state => hasText(state?.design?.primaryColor)
  },
  {
    key: 'contact',
    label: 'Datos de contacto',
    path: 'clinic.primaryPhone',
    test: state => hasContact(state)
  }
];

const KNOWN_SPECIALTIES = [
  'cardiologia',
  'clinica medica',
  'diabetologia',
  'endocrinologia',
  'pediatria',
  'ginecologia',
  'obstetricia',
  'traumatologia',
  'dermatologia',
  'odontologia',
  'oftalmologia',
  'neurologia',
  'nutricion',
  'psicologia',
  'kinesiologia',
  'urologia',
  'gastroenterologia',
  'neumonologia',
  'reumatologia',
  'otorrinolaringologia',
  'diagnostico por imagenes',
  'laboratorio'
];

const GENERIC_FOCUS_WORDS = [
  'control',
  'prevencion',
  'chequeo',
  'seguimiento',
  'consulta',
  'turnos',
  'atencion',
  'salud',
  'agenda',
  'evaluacion'
];

export function validateState(state) {
  const issues = [];
  const fieldPaths = new Set();

  const checklist = COMPLETE_REQUIRED_CHECKS.map(item => {
    const ok = safeTest(item.test, state);

    if (!ok) {
      addIssue(issues, {
        severity: 'warning',
        code: `missing_${item.key}`,
        message: `Falta o conviene completar: ${item.label}.`,
        path: item.path
      });
      fieldPaths.add(item.path);
    }

    return {
      key: item.key,
      label: item.label,
      ok
    };
  });

  validateSpecialtyCoherence(state, issues, fieldPaths);
  validateSocialLinks(state, issues, fieldPaths);
  validateSchedules(state, issues, fieldPaths);
  validateColors(state, issues, fieldPaths);
  validateAttachments(state, issues, fieldPaths);
  validateContentDensity(state, issues, fieldPaths);
  validatePromptOptions(state, issues, fieldPaths);

  const warnings = issues.map(formatIssueMessage);
  const percent = Math.round((checklist.filter(item => item.ok).length / checklist.length) * 100);

  return {
    checklist,
    issues,
    warnings,
    fieldPaths: [...fieldPaths],
    percent,
    validationState: {
      issues
    }
  };
}

function validateSpecialtyCoherence(state, issues, fieldPaths) {
  const specialty = state?.specialty || {};
  const primary = specialty.primaryProfessionalSpecialty || '';
  const additional = getArray(specialty.additionalSpecialties).filter(hasText);
  const focus = specialty.communicationFocus || '';
  const visibleText = specialty.visibleSpecialtyText || '';

  const loadedSpecialties = [primary, ...additional].map(normalize).filter(Boolean);
  const loadedText = loadedSpecialties.join(' ');

  if (hasText(focus)) {
    const focusNorm = normalize(focus);
    const detectedSpecialty = detectKnownSpecialty(focusNorm);

    if (detectedSpecialty && !specialtyIsLoaded(detectedSpecialty, loadedSpecialties)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'focus_specialty_mismatch',
        message: `El enfoque comunicacional "${focus}" parece referirse a "${detectedSpecialty}", pero esa especialidad no esta cargada como principal ni adicional.`,
        path: 'specialty.communicationFocus'
      });
      fieldPaths.add('specialty.communicationFocus');
    } else if (!isReasonablyRelatedFocus(focusNorm, loadedText)) {
      addIssue(issues, {
        severity: 'suggestion',
        code: 'focus_relation_unclear',
        message: 'El enfoque comunicacional no parece claramente relacionado con las especialidades cargadas. Revisalo si queres evitar ambiguedades.',
        path: 'specialty.communicationFocus'
      });
      fieldPaths.add('specialty.communicationFocus');
    }
  }

  if (hasText(visibleText)) {
    const visibleNorm = normalize(visibleText);
    const detectedSpecialty = detectKnownSpecialty(visibleNorm);

    if (detectedSpecialty && !specialtyIsLoaded(detectedSpecialty, loadedSpecialties)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'visible_text_specialty_mismatch',
        message: `El texto visible recomendado menciona "${detectedSpecialty}", pero esa especialidad no esta cargada como principal ni adicional.`,
        path: 'specialty.visibleSpecialtyText'
      });
      fieldPaths.add('specialty.visibleSpecialtyText');
    }
  }

  if (!hasText(visibleText) && (hasText(primary) || additional.length)) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'missing_visible_specialty_text',
      message: 'Conviene completar el texto visible recomendado para controlar exactamente que especialidad aparecera en el flyer.',
      path: 'specialty.visibleSpecialtyText'
    });
    fieldPaths.add('specialty.visibleSpecialtyText');
  }
}

function validateSocialLinks(state, issues, fieldPaths) {
  getArray(state?.clinic?.socialLinks).forEach((item, index) => {
    const hasType = hasText(item?.type);
    const hasValue = hasText(item?.value);

    if (hasType && !hasValue) {
      addIssue(issues, {
        severity: 'warning',
        code: 'social_link_without_value',
        message: `La red social ${index + 1} tiene tipo elegido pero falta usuario, texto o URL.`,
        path: `clinic.socialLinks.${index}.value`
      });
      fieldPaths.add(`clinic.socialLinks.${index}.value`);
    }

    if (!hasType && hasValue) {
      addIssue(issues, {
        severity: 'suggestion',
        code: 'social_link_without_type',
        message: `La red social ${index + 1} tiene usuario o URL, pero falta indicar el tipo de red.`,
        path: `clinic.socialLinks.${index}.type`
      });
      fieldPaths.add(`clinic.socialLinks.${index}.type`);
    }
  });
}

function validateSchedules(state, issues, fieldPaths) {
  getArray(state?.schedule?.items).forEach((item, index) => {
    const hasAnyValue = hasText(item?.days) || hasText(item?.from) || hasText(item?.to) || hasText(item?.note);

    if (hasAnyValue && !isCompleteSchedule(item)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'incomplete_schedule',
        message: `El horario ${index + 1} esta incompleto: completa dia, hora desde y hora hasta.`,
        path: `schedule.items.${index}`
      });
      fieldPaths.add(`schedule.items.${index}`);
    }
  });
}

function validateColors(state, issues, fieldPaths) {
  const design = state?.design || {};

  if (isOtherColor(design.primaryColor) && !hasText(design.customPrimaryColor)) {
    addIssue(issues, {
      severity: 'warning',
      code: 'missing_custom_primary_color',
      message: 'Se eligio "Otro..." como color principal, pero falta escribir el color deseado.',
      path: 'design.customPrimaryColor'
    });
    fieldPaths.add('design.customPrimaryColor');
  }

  if (isOtherColor(design.secondaryColor) && !hasText(design.customSecondaryColor)) {
    addIssue(issues, {
      severity: 'warning',
      code: 'missing_custom_secondary_color',
      message: 'Se eligio "Otro..." como color secundario, pero falta escribir el color deseado.',
      path: 'design.customSecondaryColor'
    });
    fieldPaths.add('design.customSecondaryColor');
  }
}

function validateAttachments(state, issues, fieldPaths) {
  const attachments = getArray(state?.attachments?.items);
  const hasProfessionalPhoto = attachments.some(item => item?.role === 'professionalPhoto' && hasText(item?.fileName));
  const hasClinicLogo = attachments.some(item => item?.role === 'clinicLogo' && hasText(item?.fileName));

  attachments.forEach((item, index) => {
    const hasFile = hasText(item?.fileName);
    const hasRole = hasText(item?.role);
    const hasInstruction = hasText(item?.instruction);

    if (hasFile && !hasRole) {
      addIssue(issues, {
        severity: 'warning',
        code: 'attachment_without_role',
        message: `El adjunto ${index + 1} tiene archivo, pero falta indicar su rol.`,
        path: `attachments.items.${index}.role`
      });
      fieldPaths.add(`attachments.items.${index}.role`);
    }

    if (!hasFile && (hasRole || hasInstruction)) {
      addIssue(issues, {
        severity: 'suggestion',
        code: 'attachment_without_file',
        message: `El adjunto ${index + 1} tiene rol o instruccion, pero no tiene archivo seleccionado.`,
        path: `attachments.items.${index}.fileName`
      });
      fieldPaths.add(`attachments.items.${index}.fileName`);
    }
  });

  if (state?.professional?.showPhoto && !hasProfessionalPhoto) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'show_photo_without_attachment',
      message: 'Marcaste mostrar foto profesional, pero no hay foto profesional seleccionada como adjunto.',
      path: 'attachments.items'
    });
    fieldPaths.add('attachments.items');
  }

  if (state?.clinic?.showContactData && !hasClinicLogo) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'logo_recommended',
      message: 'Conviene adjuntar el logo de la clinica si el flyer va a mostrar datos institucionales.',
      path: 'attachments.items'
    });
  }
}

function validateContentDensity(state, issues, fieldPaths) {
  const density = state?.design?.contentDensity || 'balanced';
  const format = normalize(state?.design?.format || '');
  const visibleServicesCount = getArray(state?.services?.visibleServices).filter(hasText).length;
  const scheduleCount = getArray(state?.schedule?.items).filter(isCompleteSchedule).length;
  const isStoryLike = format.includes('historia') || format.includes('story') || format.includes('whatsapp') || format.includes('estado');

  if (isStoryLike && density === 'detailed' && visibleServicesCount >= 6) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'dense_story_flyer',
      message: 'El flyer tipo historia/estado esta en modo detallado y tiene muchas prestaciones visibles. Puede quedar cargado en celular.',
      path: 'design.contentDensity'
    });
    fieldPaths.add('design.contentDensity');
  }

  if (isStoryLike && scheduleCount > 3) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'many_schedules_story',
      message: 'Hay muchos horarios para un formato historia/estado. Considera usar resumen compacto si el flyer queda cargado.',
      path: 'schedule.items'
    });
    fieldPaths.add('schedule.items');
  }
}

function validatePromptOptions(state, issues, fieldPaths) {
  const options = state?.promptOptions || {};

  if (options.promptType && options.promptType !== 'finalFlyer') {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'non_final_flyer_prompt_type',
      message: 'El tipo de prompt no es finalFlyer. Para esta app, el flujo principal debe generar flyers finales listos para usar.',
      path: 'promptOptions.promptType'
    });
    fieldPaths.add('promptOptions.promptType');
  }

  if (Number(options.finalAlternativesCount) !== 2) {
    addIssue(issues, {
      severity: 'suggestion',
      code: 'alternatives_not_two',
      message: 'La configuracion ideal es generar exactamente 2 alternativas finales.',
      path: 'promptOptions.finalAlternativesCount'
    });
    fieldPaths.add('promptOptions.finalAlternativesCount');
  }

  if (options.requireSeparateImages === false || options.preventCollage === false) {
    addIssue(issues, {
      severity: 'warning',
      code: 'separate_images_rule_disabled',
      message: 'No conviene desactivar la regla de imagenes separadas y sin collage.',
      path: 'promptOptions.requireSeparateImages'
    });
    fieldPaths.add('promptOptions.requireSeparateImages');
  }
}

function hasContact(state) {
  return Boolean(
    hasText(state?.clinic?.primaryPhone) ||
    getArray(state?.clinic?.socialLinks).some(item => hasText(item?.value))
  );
}

function isCompleteSchedule(item) {
  return Boolean(hasText(item?.days) && hasText(item?.from) && hasText(item?.to));
}

function detectKnownSpecialty(normalizedText) {
  return KNOWN_SPECIALTIES.find(specialty => normalizedText.includes(specialty));
}

function specialtyIsLoaded(specialty, loadedSpecialties) {
  const normalizedSpecialty = normalize(specialty);
  return loadedSpecialties.some(item => item === normalizedSpecialty || item.includes(normalizedSpecialty) || normalizedSpecialty.includes(item));
}

function isReasonablyRelatedFocus(focusNorm, loadedText) {
  if (!focusNorm) return true;

  if (!loadedText) return false;

  if (loadedText.includes(focusNorm) || focusNorm.includes(loadedText)) return true;

  const focusTokens = focusNorm.split(' ').filter(token => token.length > 3);
  const loadedTokens = loadedText.split(' ').filter(token => token.length > 3);
  const hasSharedToken = focusTokens.some(token => loadedTokens.includes(token));
  if (hasSharedToken) return true;

  const hasGenericFocus = GENERIC_FOCUS_WORDS.some(word => focusNorm.includes(word));
  if (hasGenericFocus) return true;

  if (focusNorm.includes('diabet') && loadedText.includes('diabet')) return true;
  if (focusNorm.includes('metabolic') && (loadedText.includes('diabet') || loadedText.includes('endocrin'))) return true;
  if (focusNorm.includes('cardiovascular') && (loadedText.includes('cardiolog') || loadedText.includes('clinica') || loadedText.includes('diabet'))) return true;
  if (focusNorm.includes('hipertension') && (loadedText.includes('cardiolog') || loadedText.includes('clinica'))) return true;

  return false;
}

function addIssue(issues, issue) {
  issues.push({
    severity: issue.severity || 'warning',
    code: issue.code || 'validation_issue',
    message: issue.message,
    path: issue.path || ''
  });
}

function formatIssueMessage(issue) {
  const prefix = {
    blocking: 'Bloqueante',
    warning: 'Advertencia',
    suggestion: 'Sugerencia'
  }[issue.severity] || 'Aviso';

  return `${prefix}: ${issue.message}`;
}

function safeTest(test, state) {
  try {
    return Boolean(test(state));
  } catch {
    return false;
  }
}

function getArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(value = '') {
  return String(value ?? '').trim().length > 0;
}

function normalize(value = '') {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isOtherColor(value) {
  return value === 'otro' || value === 'personalizado' || value === 'other' || value === 'custom';
}
