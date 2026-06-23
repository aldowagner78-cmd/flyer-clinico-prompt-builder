import { ATTACHMENT_ROLES } from './schema.js';

// Temporary adapter for Etapa 1: the persisted state is schema v2, while
// the current form, validation and prompt builder still read legacy paths.
// Remove this adapter when Etapa 2 migrates the UI to the v2 model.
export function toLegacyState(state) {
  return {
    clinic: {
      name: state.clinic.name,
      address: state.clinic.address,
      phone: state.clinic.primaryPhone,
      social: '',
      socialLinks: state.clinic.socialLinks.map(link => ({ ...link })),
      tagline: state.clinic.institutionalPhrase,
      logoName: getAttachmentFileName(state, ATTACHMENT_ROLES.clinicLogo),
      showContact: state.clinic.showContactData,
      saveAsDefault: state.clinic.saveAsDefault
    },
    doctor: {
      title: state.professional.title,
      name: state.professional.fullName,
      specialty: state.specialty.primaryProfessionalSpecialty,
      license: state.professional.license,
      showPhoto: state.professional.showPhoto,
      roleNote: state.professional.roleNote
    },
    services: {
      primarySpecialty: state.specialty.primaryProfessionalSpecialty,
      additionalSpecialties: [...state.specialty.additionalSpecialties],
      highlightedArea: state.specialty.communicationFocus,
      specialty: state.specialty.primaryProfessionalSpecialty,
      featured: state.services.mainHighlightedService,
      items: [...state.services.visibleServices],
      allowExpansion: state.services.allowServiceExpansion,
      expansionNotes: state.services.expansionInstructions
    },
    care: {
      schedules: state.schedule.items.map(item => ({ ...item })),
      days: '',
      hours: '',
      insurance: state.coverage.insurance,
      privateCare: state.coverage.privatePatients,
      requiresAppointment: state.schedule.requiresAppointment,
      appointmentText: state.schedule.appointmentText,
      modality: state.schedule.modality,
      adminNote: state.schedule.administrativeNote
    },
    design: {
      format: state.design.format,
      primaryColor: state.design.primaryColor,
      primaryCustomColor: state.design.customPrimaryColor,
      secondaryColor: state.design.secondaryColor,
      secondaryCustomColor: state.design.customSecondaryColor,
      customColor: state.design.customPrimaryColor,
      visualStyle: state.design.visualStyle,
      typography: state.design.typography,
      impact: state.design.visualImpact,
      includeIcons: state.design.includeMedicalIcons,
      includeThemeBackground: state.design.includeThematicBackground,
      autoTheme: state.design.useAutomaticTheme,
      usePinnedStyle: state.design.usePinnedConversationStyle
    },
    images: {
      logoName: getAttachmentFileName(state, ATTACHMENT_ROLES.clinicLogo),
      doctorPhotoName: getAttachmentFileName(state, ATTACHMENT_ROLES.professionalPhoto),
      referenceName: getAttachmentFileName(state, ATTACHMENT_ROLES.referenceFlyer),
      themeName: getAttachmentFileName(state, ATTACHMENT_ROLES.thematicImage)
    },
    advanced: {
      suggestedPhrase: state.promptOptions.suggestedPhrase,
      forbiddenPhrases: state.promptOptions.forbiddenPhrases,
      highlightData: state.promptOptions.highlightData,
      smallData: state.promptOptions.smallData,
      freeInstructions: state.promptOptions.freeInstructions,
      creativity: toLegacyCreativity(state.promptOptions)
    }
  };
}

export function updateFromLegacyPath(state, path, value) {
  const stringValue = typeof value === 'string' ? value : value;
  const handlers = {
    'clinic.name': () => { state.clinic.name = stringValue; },
    'clinic.address': () => { state.clinic.address = stringValue; },
    'clinic.phone': () => { state.clinic.primaryPhone = stringValue; },
    'clinic.tagline': () => { state.clinic.institutionalPhrase = stringValue; },
    'clinic.showContact': () => { state.clinic.showContactData = Boolean(value); },
    'clinic.saveAsDefault': () => { state.clinic.saveAsDefault = Boolean(value); },
    'doctor.title': () => { state.professional.title = stringValue; },
    'doctor.name': () => { state.professional.fullName = stringValue; },
    'doctor.specialty': () => { state.specialty.primaryProfessionalSpecialty = stringValue; },
    'doctor.license': () => { state.professional.license = stringValue; },
    'doctor.showPhoto': () => { state.professional.showPhoto = Boolean(value); },
    'doctor.roleNote': () => { state.professional.roleNote = stringValue; },
    'services.primarySpecialty': () => { state.specialty.primaryProfessionalSpecialty = stringValue; },
    'services.highlightedArea': () => { state.specialty.communicationFocus = stringValue; },
    'services.featured': () => { state.services.mainHighlightedService = stringValue; },
    'services.allowExpansion': () => { state.services.allowServiceExpansion = Boolean(value); },
    'services.expansionNotes': () => { state.services.expansionInstructions = stringValue; },
    'care.insurance': () => { state.coverage.insurance = Boolean(value); },
    'care.privateCare': () => { state.coverage.privatePatients = Boolean(value); },
    'care.requiresAppointment': () => { state.schedule.requiresAppointment = Boolean(value); },
    'care.appointmentText': () => { state.schedule.appointmentText = stringValue; },
    'care.modality': () => { state.schedule.modality = stringValue; },
    'care.adminNote': () => { state.schedule.administrativeNote = stringValue; },
    'design.format': () => { state.design.format = stringValue; },
    'design.primaryColor': () => { state.design.primaryColor = stringValue; },
    'design.primaryCustomColor': () => { state.design.customPrimaryColor = stringValue; },
    'design.secondaryColor': () => { state.design.secondaryColor = stringValue; },
    'design.secondaryCustomColor': () => { state.design.customSecondaryColor = stringValue; },
    'design.visualStyle': () => { state.design.visualStyle = stringValue; },
    'design.typography': () => { state.design.typography = stringValue; },
    'design.impact': () => { state.design.visualImpact = stringValue; },
    'design.includeIcons': () => { state.design.includeMedicalIcons = Boolean(value); },
    'design.includeThemeBackground': () => { state.design.includeThematicBackground = Boolean(value); },
    'design.autoTheme': () => { state.design.useAutomaticTheme = Boolean(value); },
    'design.usePinnedStyle': () => { state.design.usePinnedConversationStyle = Boolean(value); },
    'images.logoName': () => setAttachmentFileName(state, ATTACHMENT_ROLES.clinicLogo, stringValue, 'Usar como logo de la clinica.'),
    'images.doctorPhotoName': () => setAttachmentFileName(state, ATTACHMENT_ROLES.professionalPhoto, stringValue, 'Usar como foto del profesional, sin deformar rostro ni alterar identidad.'),
    'images.referenceName': () => setAttachmentFileName(state, ATTACHMENT_ROLES.referenceFlyer, stringValue, 'Usar como referencia visual del flyer.'),
    'images.themeName': () => setAttachmentFileName(state, ATTACHMENT_ROLES.thematicImage, stringValue, 'Usar como imagen tematica opcional.'),
    'advanced.suggestedPhrase': () => { state.promptOptions.suggestedPhrase = stringValue; },
    'advanced.forbiddenPhrases': () => { state.promptOptions.forbiddenPhrases = stringValue; },
    'advanced.highlightData': () => { state.promptOptions.highlightData = stringValue; },
    'advanced.smallData': () => { state.promptOptions.smallData = stringValue; },
    'advanced.freeInstructions': () => { state.promptOptions.freeInstructions = stringValue; },
    'advanced.creativity': () => updateCreativity(state, stringValue)
  };
  handlers[path]?.();
}

export function getLegacyAttachmentFiles(state) {
  return [
    ['Logo de clinica', getAttachmentFileName(state, ATTACHMENT_ROLES.clinicLogo)],
    ['Foto del medico', getAttachmentFileName(state, ATTACHMENT_ROLES.professionalPhoto)],
    ['Imagen de referencia del flyer', getAttachmentFileName(state, ATTACHMENT_ROLES.referenceFlyer)],
    ['Imagen tematica opcional', getAttachmentFileName(state, ATTACHMENT_ROLES.thematicImage)]
  ].filter(([, value]) => value);
}

function getAttachmentFileName(state, role) {
  return state.attachments.items.find(item => item.role === role)?.fileName || '';
}

function setAttachmentFileName(state, role, fileName, instruction) {
  const existingIndex = state.attachments.items.findIndex(item => item.role === role);
  if (!fileName) {
    if (existingIndex >= 0) state.attachments.items.splice(existingIndex, 1);
    return;
  }
  const item = {
    id: `attachment_${role}`,
    role,
    fileName,
    mimeType: '',
    status: 'selected',
    instruction
  };
  if (existingIndex >= 0) state.attachments.items.splice(existingIndex, 1, item);
  else state.attachments.items.push(item);
}

function updateCreativity(state, value) {
  const normalized = value.toLowerCase();
  state.promptOptions.allowVisualCreativity = !normalized.startsWith('no');
  if (normalized.includes('amplia')) {
    state.promptOptions.visualCreativityLevel = 'broad';
  } else if (normalized.startsWith('no')) {
    state.promptOptions.visualCreativityLevel = 'strict';
  } else {
    state.promptOptions.visualCreativityLevel = 'moderate';
  }
}

function toLegacyCreativity(promptOptions) {
  if (!promptOptions.allowVisualCreativity || promptOptions.visualCreativityLevel === 'strict') {
    return 'No: respetar estrictamente los datos cargados.';
  }
  if (promptOptions.visualCreativityLevel === 'broad') {
    return 'Si, amplia: permitir imagenes o recursos graficos aleatorios relacionados con la especialidad, sin inventar datos medicos.';
  }
  return 'Si, moderada: permitir recursos visuales relacionados con la especialidad.';
}
