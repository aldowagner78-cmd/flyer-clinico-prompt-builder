import { createDefaultState } from './defaultState.js';
import { ATTACHMENT_ROLES, CONTENT_DENSITIES, PROMPT_TYPES, SCHEMA_VERSION } from './schema.js';

export function migrateState(rawState) {
  try {
    if (!isObject(rawState)) return createDefaultState();
    if (rawState.schemaVersion === SCHEMA_VERSION) return normalizeV2State(rawState);
    return migrateLegacyState(rawState);
  } catch {
    return createDefaultState();
  }
}

function migrateLegacyState(rawState) {
  const next = createDefaultState();
  const clinic = objectOrEmpty(rawState.clinic);
  const doctor = objectOrEmpty(rawState.doctor);
  const services = objectOrEmpty(rawState.services);
  const care = objectOrEmpty(rawState.care);
  const design = objectOrEmpty(rawState.design);
  const images = objectOrEmpty(rawState.images);
  const advanced = objectOrEmpty(rawState.advanced);

  next.clinic = sanitizeClinic({
    name: stringFrom(clinic.name),
    institutionType: firstString(clinic.institutionType, clinic.type, 'Centro médico'),
    otherInstitutionType: stringFrom(clinic.otherInstitutionType),
    address: stringFrom(clinic.address),
    primaryPhone: firstString(clinic.primaryPhone, clinic.phone),
    secondaryPhone: stringFrom(clinic.secondaryPhone),
    email: stringFrom(clinic.email),
    website: stringFrom(clinic.website),
    socialLinks: migrateSocialLinks(clinic),
    institutionalPhrase: firstString(clinic.institutionalPhrase, clinic.tagline),
    showContactData: booleanFrom(clinic.showContactData, booleanFrom(clinic.showContact, true)),
    saveAsDefault: booleanFrom(clinic.saveAsDefault, true),
    defaultPrimaryColor: stringFrom(clinic.defaultPrimaryColor) || 'lila',
    defaultSecondaryColor: stringFrom(clinic.defaultSecondaryColor) || 'lavanda',
    logoFileName: firstString(clinic.logoFileName, images.logoName),
    logoInstruction: stringFrom(clinic.logoInstruction) || 'Usar como logo institucional, respetando proporciones.'
  });

  next.professional = sanitizeProfessional({
    title: stringFrom(doctor.title) || 'Dr.',
    fullName: firstString(doctor.fullName, doctor.name),
    license: stringFrom(doctor.license),
    roleNote: stringFrom(doctor.roleNote),
    showPhoto: booleanFrom(doctor.showPhoto, true)
  });

  const primaryProfessionalSpecialty = firstString(
    rawState.specialty?.primaryProfessionalSpecialty,
    doctor.specialty,
    services.primarySpecialty,
    services.specialty,
    next.specialty.primaryProfessionalSpecialty
  );

  next.specialty = sanitizeSpecialty({
    primaryProfessionalSpecialty,
    additionalSpecialties: arrayOfStrings(services.additionalSpecialties),
    communicationFocus: firstString(rawState.specialty?.communicationFocus, services.highlightedArea),
    visibleSpecialtyText: stringFrom(rawState.specialty?.visibleSpecialtyText)
  });

  next.services = sanitizeServices({
    mainHighlightedService: firstString(services.mainHighlightedService, services.featured),
    visibleServices: arrayOfStrings(services.visibleServices || services.items),
    contextServices: arrayOfStrings(services.contextServices),
    allowServiceExpansion: booleanFrom(services.allowServiceExpansion, booleanFrom(services.allowExpansion, false)),
    expansionInstructions: firstString(services.expansionInstructions, services.expansionNotes)
  });

  next.schedule = sanitizeSchedule({
    items: migrateSchedules(care),
    requiresAppointment: booleanFrom(care.requiresAppointment, true),
    appointmentText: stringFrom(care.appointmentText) || next.schedule.appointmentText,
    modality: stringFrom(care.modality) || next.schedule.modality,
    administrativeNote: firstString(care.administrativeNote, care.adminNote)
  });

  next.coverage = sanitizeCoverage({
    insurance: booleanFrom(care.insurance, true),
    privatePatients: booleanFrom(care.privatePatients, booleanFrom(care.privateCare, true))
  });

  next.design = sanitizeDesign({
    format: stringFrom(design.format) || next.design.format,
    primaryColor: normalizeLegacyColor(stringFrom(design.primaryColor), 'primary'),
    secondaryColor: normalizeLegacyColor(stringFrom(design.secondaryColor), 'secondary'),
    customPrimaryColor: firstString(design.customPrimaryColor, design.primaryCustomColor, design.customColor),
    customSecondaryColor: firstString(design.customSecondaryColor, design.secondaryCustomColor),
    visualStyle: stringFrom(design.visualStyle) || next.design.visualStyle,
    typography: stringFrom(design.typography) || next.design.typography,
    visualImpact: firstString(design.visualImpact, design.impact) || next.design.visualImpact,
    includeMedicalIcons: booleanFrom(design.includeMedicalIcons, booleanFrom(design.includeIcons, true)),
    includeThematicBackground: booleanFrom(design.includeThematicBackground, booleanFrom(design.includeThemeBackground, true)),
    useAutomaticTheme: booleanFrom(design.useAutomaticTheme, booleanFrom(design.autoTheme, true)),
    usePinnedConversationStyle: booleanFrom(design.usePinnedConversationStyle, booleanFrom(design.usePinnedStyle, true)),
    contentDensity: validContentDensity(design.contentDensity) || next.design.contentDensity
  });

  next.attachments = sanitizeAttachments({
    items: migrateAttachments(images)
  });

  next.promptOptions = sanitizePromptOptions({
    promptType: PROMPT_TYPES.finalFlyer,
    finalAlternativesCount: 2,
    requireSeparateImages: true,
    preventCollage: true,
    requireMobileSafeArea: true,
    allowVisualCreativity: inferAllowCreativity(advanced.creativity),
    visualCreativityLevel: inferCreativityLevel(advanced.creativity),
    freeInstructions: stringFrom(advanced.freeInstructions),
    suggestedPhrase: stringFrom(advanced.suggestedPhrase),
    forbiddenPhrases: stringFrom(advanced.forbiddenPhrases),
    highlightData: stringFrom(advanced.highlightData),
    smallData: stringFrom(advanced.smallData)
  });

  next.validationState = sanitizeValidationState(rawState.validationState);
  return next;
}

function normalizeV2State(rawState) {
  const base = createDefaultState();
  return {
    schemaVersion: SCHEMA_VERSION,
    clinic: sanitizeClinic({ ...base.clinic, ...objectOrEmpty(rawState.clinic) }),
    professional: sanitizeProfessional({ ...base.professional, ...objectOrEmpty(rawState.professional) }),
    specialty: sanitizeSpecialty({ ...base.specialty, ...objectOrEmpty(rawState.specialty) }),
    services: sanitizeServices({ ...base.services, ...objectOrEmpty(rawState.services) }),
    schedule: sanitizeSchedule({ ...base.schedule, ...objectOrEmpty(rawState.schedule) }),
    coverage: sanitizeCoverage({ ...base.coverage, ...objectOrEmpty(rawState.coverage) }),
    design: sanitizeDesign({ ...base.design, ...objectOrEmpty(rawState.design) }),
    attachments: sanitizeAttachments({ ...base.attachments, ...objectOrEmpty(rawState.attachments) }),
    promptOptions: sanitizePromptOptions({ ...base.promptOptions, ...objectOrEmpty(rawState.promptOptions) }),
    validationState: sanitizeValidationState(rawState.validationState)
  };
}

function sanitizeClinic(clinic) {
  return {
    name: stringFrom(clinic.name),
    institutionType: stringFrom(clinic.institutionType) || 'Centro médico',
    otherInstitutionType: stringFrom(clinic.otherInstitutionType),
    address: stringFrom(clinic.address),
    primaryPhone: stringFrom(clinic.primaryPhone),
    secondaryPhone: stringFrom(clinic.secondaryPhone),
    email: stringFrom(clinic.email),
    website: stringFrom(clinic.website),
    socialLinks: sanitizeSocialLinks(clinic.socialLinks),
    institutionalPhrase: stringFrom(clinic.institutionalPhrase),
    showContactData: booleanFrom(clinic.showContactData, true),
    saveAsDefault: booleanFrom(clinic.saveAsDefault, true),
    defaultPrimaryColor: stringFrom(clinic.defaultPrimaryColor) || 'lila',
    defaultSecondaryColor: stringFrom(clinic.defaultSecondaryColor) || 'lavanda',
    logoFileName: stringFrom(clinic.logoFileName),
    logoInstruction: stringFrom(clinic.logoInstruction) || 'Usar como logo institucional, respetando proporciones.'
  };
}

function sanitizeProfessional(professional) {
  return {
    title: stringFrom(professional.title) || 'Dr.',
    fullName: stringFrom(professional.fullName),
    license: stringFrom(professional.license),
    roleNote: stringFrom(professional.roleNote),
    showPhoto: booleanFrom(professional.showPhoto, true)
  };
}

function sanitizeSpecialty(specialty) {
  return {
    primaryProfessionalSpecialty: stringFrom(specialty.primaryProfessionalSpecialty) || 'Cardiologia',
    additionalSpecialties: arrayOfStrings(specialty.additionalSpecialties),
    communicationFocus: stringFrom(specialty.communicationFocus),
    visibleSpecialtyText: stringFrom(specialty.visibleSpecialtyText)
  };
}

function sanitizeServices(services) {
  return {
    mainHighlightedService: stringFrom(services.mainHighlightedService),
    visibleServices: arrayOfStrings(services.visibleServices),
    contextServices: arrayOfStrings(services.contextServices),
    allowServiceExpansion: booleanFrom(services.allowServiceExpansion, false),
    expansionInstructions: stringFrom(services.expansionInstructions)
  };
}

function sanitizeSchedule(schedule) {
  return {
    items: sanitizeSchedules(schedule.items),
    requiresAppointment: booleanFrom(schedule.requiresAppointment, true),
    appointmentText: stringFrom(schedule.appointmentText) || 'Solicitar turno por WhatsApp.',
    modality: stringFrom(schedule.modality) || 'presencial',
    administrativeNote: stringFrom(schedule.administrativeNote)
  };
}

function sanitizeCoverage(coverage) {
  return {
    insurance: booleanFrom(coverage.insurance, true),
    privatePatients: booleanFrom(coverage.privatePatients, true)
  };
}

function sanitizeDesign(design) {
  return {
    format: stringFrom(design.format) || 'Historia Instagram 1080x1920',
    useInstitutionalColors: booleanFrom(design.useInstitutionalColors, true),
    primaryColor: stringFrom(design.primaryColor) || 'lila',
    secondaryColor: stringFrom(design.secondaryColor) || 'lavanda',
    customPrimaryColor: stringFrom(design.customPrimaryColor),
    customSecondaryColor: stringFrom(design.customSecondaryColor),
    visualStyle: stringFrom(design.visualStyle) || 'moderno',
    typography: stringFrom(design.typography) || 'moderna sans serif',
    visualImpact: stringFrom(design.visualImpact) || 'medio',
    includeMedicalIcons: booleanFrom(design.includeMedicalIcons, true),
    includeThematicBackground: booleanFrom(design.includeThematicBackground, true),
    useAutomaticTheme: booleanFrom(design.useAutomaticTheme, true),
    usePinnedConversationStyle: booleanFrom(design.usePinnedConversationStyle, true),
    contentDensity: validContentDensity(design.contentDensity) || CONTENT_DENSITIES.balanced
  };
}

function sanitizeAttachments(attachments) {
  return {
    items: sanitizeAttachmentItems(attachments.items)
  };
}

function sanitizePromptOptions(promptOptions) {
  return {
    promptType: stringFrom(promptOptions.promptType) || PROMPT_TYPES.finalFlyer,
    finalAlternativesCount: numberFrom(promptOptions.finalAlternativesCount, 1),
    requireSeparateImages: booleanFrom(promptOptions.requireSeparateImages, true),
    preventCollage: booleanFrom(promptOptions.preventCollage, true),
    requireMobileSafeArea: booleanFrom(promptOptions.requireMobileSafeArea, true),
    allowVisualCreativity: booleanFrom(promptOptions.allowVisualCreativity, true),
    visualCreativityLevel: stringFrom(promptOptions.visualCreativityLevel) || 'moderate',
    freeInstructions: stringFrom(promptOptions.freeInstructions),
    suggestedPhrase: stringFrom(promptOptions.suggestedPhrase),
    forbiddenPhrases: stringFrom(promptOptions.forbiddenPhrases),
    highlightData: stringFrom(promptOptions.highlightData),
    smallData: stringFrom(promptOptions.smallData)
  };
}

function sanitizeValidationState(validationState) {
  return {
    issues: Array.isArray(validationState?.issues) ? validationState.issues.filter(isObject).map(issue => ({ ...issue })) : []
  };
}

function migrateSocialLinks(clinic) {
  const links = sanitizeSocialLinks(clinic.socialLinks);
  const legacySocial = stringFrom(clinic.social);
  if (links.length || !legacySocial) return links;
  return [{ id: 'social_1', type: 'Instagram', value: legacySocial }];
}

function sanitizeSocialLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.map((link, index) => ({
    id: stringFrom(link?.id) || `social_${index + 1}`,
    type: stringFrom(link?.type) || 'Instagram',
    value: stringFrom(link?.value)
  }));
}

function migrateSchedules(care) {
  const schedules = sanitizeSchedules(care.schedules);
  if (schedules.length) return schedules;
  if (stringFrom(care.days) || stringFrom(care.hours)) {
    return [{
      id: 'schedule_1',
      days: stringFrom(care.days),
      from: '',
      to: '',
      note: stringFrom(care.hours)
    }];
  }
  return [];
}

function sanitizeSchedules(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: stringFrom(item?.id) || `schedule_${index + 1}`,
    days: stringFrom(item?.days),
    from: stringFrom(item?.from),
    to: stringFrom(item?.to),
    note: stringFrom(item?.note)
  }));
}

function migrateAttachments(images) {
  return [
    attachmentFromLegacy(ATTACHMENT_ROLES.clinicLogo, images.logoName, 'Usar como logo de la clinica.'),
    attachmentFromLegacy(ATTACHMENT_ROLES.professionalPhoto, images.doctorPhotoName, 'Usar como foto del profesional, sin deformar rostro ni alterar identidad.'),
    attachmentFromLegacy(ATTACHMENT_ROLES.referenceFlyer, images.referenceName, 'Usar como referencia visual del flyer.'),
    attachmentFromLegacy(ATTACHMENT_ROLES.thematicImage, images.themeName, 'Usar como imagen tematica opcional.')
  ].filter(Boolean);
}

function attachmentFromLegacy(role, fileName, instruction) {
  const normalizedName = stringFrom(fileName);
  if (!normalizedName) return null;
  return {
    id: `attachment_${role}`,
    role,
    fileName: normalizedName,
    mimeType: '',
    status: 'selected',
    instruction
  };
}

function sanitizeAttachmentItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(isObject)
    .map((item, index) => ({
      id: stringFrom(item.id) || `attachment_${index + 1}`,
      role: stringFrom(item.role) || ATTACHMENT_ROLES.other,
      fileName: stringFrom(item.fileName),
      mimeType: stringFrom(item.mimeType),
      status: stringFrom(item.status) || (item.fileName ? 'selected' : 'missing'),
      instruction: stringFrom(item.instruction)
    }))
    .filter(item => item.fileName || item.role);
}

function normalizeLegacyColor(value, type) {
  if (!value) return type === 'primary' ? 'lila' : 'lavanda';
  if (value === 'personalizado') return 'otro';
  if (value === 'gris') return 'grisInstitucional';
  if (value === 'naranja') return 'naranjaSuave';
  if (isLegacyColorValue(value)) return 'otro';
  return value;
}

function inferAllowCreativity(value) {
  return !String(value || '').trim().toLowerCase().startsWith('no');
}

function inferCreativityLevel(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('amplia')) return 'broad';
  if (normalized.startsWith('no')) return 'strict';
  return 'moderate';
}

function validContentDensity(value) {
  return Object.values(CONTENT_DENSITIES).includes(value) ? value : '';
}

function objectOrEmpty(value) {
  return isObject(value) ? value : {};
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function arrayOfStrings(value) {
  if (!Array.isArray(value)) return [];
  return value.map(stringFrom).filter(Boolean);
}

function firstString(...values) {
  return values.map(stringFrom).find(Boolean) || '';
}

function stringFrom(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function booleanFrom(value, fallback) {
  return typeof value === 'boolean' ? value : fallback;
}

function numberFrom(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function isLegacyColorValue(value) {
  return typeof value === 'string' && (value.startsWith('#') || value.includes('rgb('));
}
