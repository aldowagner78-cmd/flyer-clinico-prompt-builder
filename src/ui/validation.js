const requiredChecks = [
  { key: 'doctorName', label: 'Nombre del medico', test: state => Boolean(state.doctor.name.trim()) },
  { key: 'specialty', label: 'Especialidad', test: state => Boolean(state.services.specialty.trim()) },
  { key: 'schedule', label: 'Dia y horario', test: state => Boolean(state.care.days.trim() && state.care.hours.trim()) },
  { key: 'services', label: 'Prestaciones', test: state => state.services.items.length > 0 || Boolean(state.services.featured.trim()) },
  { key: 'modality', label: 'Modalidad de atencion', test: state => Boolean(state.care.modality.trim()) },
  { key: 'color', label: 'Color principal', test: state => Boolean(state.design.primaryColor.trim()) },
  { key: 'contact', label: 'Datos de contacto', test: state => Boolean(state.clinic.phone.trim() || state.clinic.social.trim()) }
];

export function validateState(state) {
  const checklist = requiredChecks.map(item => ({ label: item.label, ok: item.test(state) }));
  const warnings = checklist.filter(item => !item.ok).map(item => `Falta o conviene completar: ${item.label}.`);
  return {
    checklist,
    warnings,
    percent: Math.round((checklist.filter(item => item.ok).length / checklist.length) * 100)
  };
}
