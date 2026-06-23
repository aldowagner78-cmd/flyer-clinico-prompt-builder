import { ATTACHMENT_ROLES } from './schema.js';

// Temporary adapter: the form already uses schema v2, while validation and
// promptBuilder still read legacy paths. Remove this when those modules move
// fully to the v2 model in later stages.
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

function getAttachmentFileName(state, role) {
  return state.attachments.items.find(item => item.role === role)?.fileName || '';
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
