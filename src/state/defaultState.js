import { defaultClinic } from '../data/defaultClinic.js';
import { CONTENT_DENSITIES, PIECE_TYPES, PROMPT_TYPES, SCHEMA_VERSION } from './schema.js';

export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    clinic: {
      name: defaultClinic.name || '',
      institutionType: defaultClinic.institutionType || 'Centro médico',
      otherInstitutionType: '',
      address: defaultClinic.address || '',
      primaryPhone: defaultClinic.phone || '',
      secondaryPhone: '',
      email: '',
      website: '',
      socialLinks: [],
      institutionalPhrase: defaultClinic.tagline || '',
      showContactData: true,
      saveAsDefault: true,
      defaultPrimaryColor: 'lila',
      defaultSecondaryColor: 'lavanda',
      logoFileName: defaultClinic.logoName || '',
      logoInstruction: 'Usar como logo institucional, respetando proporciones.'
    },
    professional: {
      title: 'Dr.',
      fullName: '',
      license: '',
      roleNote: '',
      showPhoto: true,
      photoFileName: ''
    },
    specialty: {
      primaryProfessionalSpecialty: 'Clinica medica',
      additionalSpecialties: [],
      communicationFocus: 'Control clinico y prevencion',
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
      useInstitutionalColors: true,
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
      pieceType: PIECE_TYPES.professionalFlyer,
      pieceTypeConfirmed: false,
      contentGoal: '',
      targetAudience: '',
      educationalTopic: '',
      mainMessage: '',
      infoBlocksText: '',
      campaignType: '',
      campaignStartDate: '',
      campaignEndDate: '',
      campaignValidity: '',
      campaignConditions: '',
      campaignCallToAction: '',
      legalEthicalNote: '',
      finalAlternativesCount: 1,
      requireSeparateImages: true,
      preventCollage: true,
      requireMobileSafeArea: true,
      allowVisualCreativity: true,
      visualCreativityLevel: 'moderate',
      freeInstructions: '',
      suggestedPhrase: '',
      suggestedPhraseSource: '',
      suggestedPhraseSourceSpecialty: '',
      requestAnimation: false,
      videoCreationMode: 'Desde cero',
      videoDestination: 'Instagram / WhatsApp vertical 9:16',
      videoDuration: 'Automático recomendado',
      videoMotionStyle: 'Suave profesional',
      videoMusic: 'Instrumental suave',
      videoStructure: 'Beneficio → Servicio → Mensaje final',
      videoFinalMessage: 'Pedí tu turno',
      videoVoiceOver: 'Sin voz en off',
      videoTextAmount: 'Breve',
      videoPace: 'Medio',
      videoRestrictions: 'Mantener tono profesional; no exagerar resultados; evitar saturación visual.',
      jingleAudioType: 'Jingle cantado',
      jingleCreationMode: 'Desde cero',
      jingleContentMode: 'Usar datos/frase cargada',
      jingleObjective: 'Promoción / campaña',
      jingleStyle: 'Pop alegre promocional',
      jingleVoices: 'Voz principal + coros',
      jingleDuration: '30 segundos',
      jingleDestination: 'Instagram / Reels / Stories',
      jingleFinalMessage: 'Consultanos por WhatsApp',
      jingleCustomPhrase: '',
      jingleBaseIdea: '',
      jingleEmotionalTone: 'Profesional',
      jinglePace: 'Media',
      jingleInstrumentation: 'Instrumental corporativo',
      jingleIncludeSlogan: true,
      jingleAvoidSensitiveTopics: true,
      jingleWithLyrics: true,
      jingleInstrumentalAlternative: false,
      jingleAllowAdministrativeData: false,
      jingleAdministrativeDataAllowed: '',
      jinglePronunciationGuide: '',
      forbiddenPhrases: '',
      highlightData: '',
      smallData: ''
    },
    validationState: {
      issues: []
    }
  };
}
