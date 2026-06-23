import { defaultClinic } from '../data/defaultClinic.js';
import { CONTENT_DENSITIES, PROMPT_TYPES, SCHEMA_VERSION } from './schema.js';

export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    clinic: {
      name: defaultClinic.name || '',
      address: defaultClinic.address || '',
      primaryPhone: defaultClinic.phone || '',
      socialLinks: [],
      institutionalPhrase: defaultClinic.tagline || '',
      showContactData: true,
      saveAsDefault: true
    },
    professional: {
      title: 'Dr.',
      fullName: '',
      license: '',
      roleNote: '',
      showPhoto: true
    },
    specialty: {
      primaryProfessionalSpecialty: 'Cardiologia',
      additionalSpecialties: [],
      communicationFocus: '',
      visibleSpecialtyText: ''
    },
    services: {
      mainHighlightedService: '',
      visibleServices: [],
      contextServices: [],
      allowServiceExpansion: false,
      expansionInstructions: ''
    },
    schedule: {
      items: [],
      requiresAppointment: true,
      appointmentText: 'Solicitar turno por WhatsApp.',
      modality: 'presencial',
      administrativeNote: ''
    },
    coverage: {
      insurance: true,
      privatePatients: true
    },
    design: {
      format: 'Historia Instagram 1080x1920',
      primaryColor: 'lila',
      secondaryColor: 'lavanda',
      customPrimaryColor: '',
      customSecondaryColor: '',
      visualStyle: 'moderno',
      typography: 'moderna sans serif',
      visualImpact: 'medio',
      includeMedicalIcons: true,
      includeThematicBackground: true,
      useAutomaticTheme: true,
      usePinnedConversationStyle: true,
      contentDensity: CONTENT_DENSITIES.balanced
    },
    attachments: {
      items: []
    },
    promptOptions: {
      promptType: PROMPT_TYPES.finalFlyer,
      finalAlternativesCount: 2,
      requireSeparateImages: true,
      preventCollage: true,
      requireMobileSafeArea: true,
      allowVisualCreativity: true,
      visualCreativityLevel: 'moderate',
      freeInstructions: '',
      suggestedPhrase: '',
      forbiddenPhrases: '',
      highlightData: '',
      smallData: ''
    },
    validationState: {
      issues: []
    }
  };
}
