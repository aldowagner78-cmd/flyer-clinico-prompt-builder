# Data Model

## Objetivo

Este documento define un modelo JSON interno propuesto para ordenar el estado de Flyer Clinico Prompt Builder. El modelo busca reducir contradicciones, facilitar validaciones, simplificar el motor de prompts y mantener compatibilidad con GitHub Pages.

## Estado actual

El prototipo actual usa una estructura con estas areas principales:

- `clinic`
- `doctor`
- `services`
- `care`
- `design`
- `images`
- `advanced`

Esa estructura funciona, pero mezcla algunos conceptos:

- `doctor.specialty` y `services.primarySpecialty` pueden representar cosas distintas.
- `services.highlightedArea` puede funcionar como especialidad, orientacion o enfoque del flyer.
- `images` guarda nombres de archivos, pero no expresa estado de adjuntos ni instrucciones asociadas.
- `advanced` combina frase visible, restricciones, jerarquia de datos y creatividad.

## Modelo propuesto

Raiz:

```json
{
  "schemaVersion": 1,
  "clinic": {},
  "professional": {},
  "specialty": {},
  "services": {},
  "schedule": {},
  "coverage": {},
  "design": {},
  "attachments": {},
  "promptOptions": {},
  "validationState": {}
}
```

## clinic

Datos institucionales y de contacto.

```json
{
  "clinic": {
    "name": "",
    "address": "",
    "phone": "",
    "tagline": "",
    "showContact": true,
    "saveAsDefault": true,
    "socialLinks": [
      {
        "id": "social_1",
        "type": "Instagram",
        "value": ""
      }
    ]
  }
}
```

Reglas:

- `name` y `phone` son recomendados, no necesariamente bloqueantes.
- `socialLinks.value` puede ser usuario, texto o URL.
- Si `showContact` es `false`, el prompt debe indicar que los datos de contacto no son prioritarios visualmente.

## professional

Identidad del profesional.

```json
{
  "professional": {
    "title": "Dr.",
    "fullName": "",
    "license": "",
    "roleNote": "",
    "showPhoto": true
  }
}
```

Reglas:

- `fullName` es recomendado.
- `license` no debe inventarse.
- `roleNote` puede contener aclaraciones como cargo, equipo o sede.

## specialty

Area semantica mas importante del nuevo modelo.

```json
{
  "specialty": {
    "primaryProfessionalSpecialty": "",
    "additionalSpecialties": [],
    "communicationFocus": "",
    "visibleSpecialtyText": ""
  }
}
```

### specialty.primaryProfessionalSpecialty

Especialidad profesional real o principal. Ejemplos:

- Cardiologia.
- Dermatologia.
- Traumatologia.
- Pediatria.

Uso:

- Determina el marco clinico principal.
- Debe alinear el estilo tematico general.
- No debe ser reemplazada por una campana o prestacion puntual.

### specialty.additionalSpecialties

Orientaciones, areas complementarias o especialidades adicionales.

```json
{
  "additionalSpecialties": ["Medicina del deporte", "Ecocardiografia"]
}
```

Uso:

- Agrega contexto.
- Puede ayudar a ordenar prestaciones.
- No debe contradecir la especialidad principal.
- No debe duplicar `primaryProfessionalSpecialty`.

### specialty.communicationFocus

Enfoque comunicacional del flyer. Ejemplos:

- Control cardiologico preventivo.
- Chequeo predeportivo.
- Consulta dermatologica estetica.
- Atencion pediatrica integral.

Uso:

- Define de que trata la pieza.
- Puede ser mas especifico que la especialidad.
- No debe presentarse como especialidad profesional si no lo es.

### specialty.visibleSpecialtyText

Texto sugerido para mostrarse en el flyer. Ejemplos:

- Cardiologia.
- Control cardiologico y chequeo preventivo.
- Dermatologia clinica y estetica.

Uso:

- Controla la rotulacion visible.
- Puede combinar especialidad y enfoque con lenguaje claro.
- Si esta vacio, el prompt puede sugerir una frase prudente a partir del modelo.

## services

Prestaciones visibles y alcance de ampliacion.

```json
{
  "services": {
    "featuredService": "",
    "visibleServices": [],
    "allowReasonableExpansion": false,
    "expansionNotes": ""
  }
}
```

Reglas:

- `featuredService` es recomendado.
- `visibleServices` no debe incluir prestaciones incompatibles con la especialidad.
- Si `allowReasonableExpansion` es `false`, el prompt debe pedir no agregar prestaciones.
- Si `allowReasonableExpansion` es `true`, el prompt debe limitarse a tareas generales razonables de consultorio y respetar `expansionNotes`.

## schedule

Horarios y modalidad.

```json
{
  "schedule": {
    "requiresAppointment": true,
    "appointmentText": "Solicitar turno por WhatsApp.",
    "modality": "presencial",
    "adminNote": "",
    "items": [
      {
        "id": "schedule_1",
        "days": "",
        "from": "",
        "to": "",
        "note": ""
      }
    ]
  }
}
```

Valores sugeridos de `modality`:

- `presencial`
- `virtual`
- `ambas`

Reglas:

- Una fila de horario se considera completa si tiene `days`, `from` y `to`.
- `note` puede contener aclaraciones como sede, profesional o modalidad.

## coverage

Cobertura y tipo de atencion.

```json
{
  "coverage": {
    "insurance": true,
    "privateCare": true,
    "coverageText": ""
  }
}
```

Reglas:

- `insurance` indica si atiende por obra social.
- `privateCare` indica si atiende particular.
- `coverageText` permite aclaraciones visibles o administrativas.
- No deben inventarse obras sociales especificas.

## design

Preferencias visuales.

```json
{
  "design": {
    "format": "Historia Instagram 1080x1920",
    "primaryColor": "lila",
    "primaryCustomColor": "",
    "secondaryColor": "lavanda",
    "secondaryCustomColor": "",
    "visualStyle": "moderno",
    "typography": "moderna sans serif",
    "impact": "medio",
    "includeIcons": true,
    "includeThemeBackground": true,
    "autoTheme": true,
    "usePinnedStyle": true
  }
}
```

Reglas:

- Si el formato es historia o estado, se agrega regla de pantalla completa sin scroll.
- Si se elige color personalizado, debe existir texto en el campo custom correspondiente.
- `usePinnedStyle` solo debe describir una referencia conversacional; no garantiza acceso automatico a otra conversacion.

## attachments

Adjuntos locales seleccionados por el usuario.

```json
{
  "attachments": {
    "items": [
      {
        "id": "attachment_logo",
        "role": "clinicLogo",
        "fileName": "",
        "mimeType": "",
        "previewUrl": "",
        "required": false,
        "status": "missing",
        "promptInstruction": "Usar como logo de la clinica."
      }
    ],
    "manualUploadRequired": true
  }
}
```

Roles sugeridos:

- `clinicLogo`
- `professionalPhoto`
- `flyerReference`
- `themeReference`
- `other`

Estados sugeridos:

- `missing`
- `selected`
- `readyToAttach`

Reglas:

- La app puede mostrar miniaturas con URLs locales temporales.
- El JSON exportado no debe depender de `previewUrl`, porque no sera valido en otro dispositivo.
- No guardar contenido binario de imagenes en `localStorage`.
- `manualUploadRequired` debe ser siempre `true` mientras la app siga siendo estatica.

## promptOptions

Opciones que modifican el prompt sin cambiar datos clinicos.

```json
{
  "promptOptions": {
    "contentDensity": "balanced",
    "suggestedVisiblePhrase": "",
    "forbiddenPhrases": "",
    "highlightData": "",
    "smallData": "",
    "freeInstructions": "",
    "creativityLevel": "moderate",
    "copyRequiresReview": true
  }
}
```

Valores de `contentDensity`:

- `brief`
- `balanced`
- `detailed`

Valores de `creativityLevel`:

- `strict`
- `moderate`
- `broad`

Reglas:

- `contentDensity` cambia extension y detalle del prompt.
- Las restricciones criticas no se eliminan en modo breve.
- `copyRequiresReview` permite mostrar validacion inteligente antes de copiar.

## validationState

Resultado calculado, no necesariamente persistente.

```json
{
  "validationState": {
    "percent": 0,
    "canCopy": true,
    "requiresReview": false,
    "checklist": [],
    "issues": [
      {
        "id": "specialty_focus_mismatch",
        "severity": "warning",
        "fieldPath": "specialty.communicationFocus",
        "message": "",
        "suggestion": ""
      }
    ]
  }
}
```

Severidades:

- `blocking`: riesgo alto; conviene impedir copia o pedir confirmacion explicita.
- `warning`: posible problema; permitir continuar.
- `suggestion`: mejora opcional.

## Mapeo desde el modelo actual

| Actual | Propuesto |
| --- | --- |
| `doctor.title` | `professional.title` |
| `doctor.name` | `professional.fullName` |
| `doctor.license` | `professional.license` |
| `doctor.roleNote` | `professional.roleNote` |
| `doctor.showPhoto` | `professional.showPhoto` |
| `doctor.specialty` o `services.primarySpecialty` | `specialty.primaryProfessionalSpecialty` |
| `services.additionalSpecialties` | `specialty.additionalSpecialties` |
| `services.highlightedArea` | `specialty.communicationFocus` |
| nuevo | `specialty.visibleSpecialtyText` |
| `services.featured` | `services.featuredService` |
| `services.items` | `services.visibleServices` |
| `services.allowExpansion` | `services.allowReasonableExpansion` |
| `care.schedules` | `schedule.items` |
| `care.insurance` | `coverage.insurance` |
| `care.privateCare` | `coverage.privateCare` |
| `images.*Name` | `attachments.items[]` |
| `advanced.*` | `promptOptions.*` |

## Reglas de migracion

- Si `doctor.specialty` existe, usarlo como primera fuente para `primaryProfessionalSpecialty`.
- Si `doctor.specialty` esta vacio, usar `services.primarySpecialty`.
- Si `services.highlightedArea` existe, migrarlo a `communicationFocus`.
- Si `visibleSpecialtyText` no existe, dejarlo vacio y permitir que el prompt lo derive.
- Convertir cada `images.*Name` no vacio en un item de `attachments.items`.
- Conservar campos antiguos durante una fase de transicion si hace falta para no romper importaciones.
