const requiredChecks = [
  { key: 'doctorName', label: 'Nombre del medico', path: 'doctor.name', test: state => Boolean(state.doctor.name.trim()) },
  { key: 'specialty', label: 'Especialidad principal', path: 'services.primarySpecialty', test: state => Boolean(state.services.primarySpecialty.trim()) },
  { key: 'schedule', label: 'Horarios de atencion', path: 'care.schedules.0', test: state => state.care.schedules.some(isCompleteSchedule) },
  { key: 'services', label: 'Prestaciones', path: 'services.featured', test: state => state.services.items.length > 0 || Boolean(state.services.featured.trim()) },
  { key: 'modality', label: 'Modalidad de atencion', path: 'care.modality', test: state => Boolean(state.care.modality.trim()) },
  { key: 'color', label: 'Color principal', path: 'design.primaryColor', test: state => Boolean(state.design.primaryColor.trim()) },
  { key: 'contact', label: 'Datos de contacto', path: 'clinic.phone', test: state => hasContact(state) }
];

export function validateState(state) {
  const checklist = requiredChecks.map(item => ({ label: item.label, ok: item.test(state) }));
  const warnings = [];
  const fieldPaths = [];

  requiredChecks.forEach(item => {
    if (!item.test(state)) {
      warnings.push(`Falta o conviene completar: ${item.label}.`);
      fieldPaths.push(item.path);
    }
  });

  if (state.services.highlightedArea.trim() && !highlightedAreaMatches(state)) {
    warnings.push('El area destacada del flyer no coincide claramente con la especialidad principal ni con las adicionales.');
    fieldPaths.push('services.highlightedArea');
  }

  state.clinic.socialLinks.forEach((item, index) => {
    if (item.type && !item.value.trim()) {
      warnings.push(`La red social ${index + 1} tiene tipo elegido pero falta usuario, texto o URL.`);
      fieldPaths.push(`clinic.socialLinks.${index}`);
    }
  });

  state.care.schedules.forEach((item, index) => {
    const hasAnyValue = item.days.trim() || item.from.trim() || item.to.trim() || item.note.trim();
    if (hasAnyValue && !isCompleteSchedule(item)) {
      warnings.push(`El horario ${index + 1} esta incompleto: completa dia, hora desde y hora hasta.`);
      fieldPaths.push(`care.schedules.${index}`);
    }
  });

  if (isOtherColor(state.design.primaryColor) && !state.design.primaryCustomColor.trim()) {
    warnings.push('Se eligio "Otro..." como color principal, pero falta escribir el color deseado.');
    fieldPaths.push('design.primaryCustomColor');
  }

  if (isOtherColor(state.design.secondaryColor) && !state.design.secondaryCustomColor.trim()) {
    warnings.push('Se eligio "Otro..." como color secundario, pero falta escribir el color deseado.');
    fieldPaths.push('design.secondaryCustomColor');
  }

  return {
    checklist,
    warnings,
    fieldPaths: [...new Set(fieldPaths)],
    percent: Math.round((checklist.filter(item => item.ok).length / checklist.length) * 100)
  };
}

function hasContact(state) {
  return Boolean(state.clinic.phone.trim() || state.clinic.socialLinks.some(item => item.value.trim()));
}

function isCompleteSchedule(item) {
  return Boolean(item.days.trim() && item.from.trim() && item.to.trim());
}

function highlightedAreaMatches(state) {
  const area = normalize(state.services.highlightedArea);
  const specialties = [state.services.primarySpecialty, ...state.services.additionalSpecialties].map(normalize);
  return specialties.some(specialty => specialty && (area.includes(specialty) || specialty.includes(area)));
}

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isOtherColor(value) {
  return value === 'otro' || value === 'personalizado';
}
