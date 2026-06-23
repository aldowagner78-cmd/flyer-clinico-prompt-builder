# Prompt Architecture

## Objetivo

El prompt final debe ser claro, consistente y modular. Tiene que pedir a ChatGPT exactamente 2 alternativas finales de flyer clinico, como imagenes separadas e independientes, sin inventar datos medicos ni alterar datos administrativos.

## Estado actual

El prototipo actual genera un prompt largo en un unico template. Ya incluye reglas importantes:

- Comportarse como experto en diseno de flyers clinicos.
- Crear flyer vertical para Instagram, WhatsApp y redes.
- Entregar exactamente 2 alternativas finales.
- Cada alternativa debe ser una imagen separada.
- No collage, comparativa, grilla ni mockup multiple.
- Regla especial para historia o estado.
- No inventar datos medicos.
- No modificar datos administrativos.
- Adjuntos manuales.

Problemas a corregir:

- Algunas reglas se repiten.
- Especialidad profesional, especialidades adicionales y area destacada pueden quedar ambiguas.
- El prompt no tiene modos de densidad.
- Falta una revision inteligente previa que determine si el prompt deberia advertir contradicciones.

## Arquitectura propuesta

El motor debe construir el prompt por bloques. Cada bloque tiene una responsabilidad y puede omitirse o compactarse segun densidad.

Orden recomendado:

1. Bloque de rol.
2. Bloque de formato.
3. Bloque de estilo base.
4. Datos de clinica.
5. Datos del profesional.
6. Especialidad y enfoque.
7. Prestaciones visibles.
8. Horarios.
9. Cobertura.
10. Adjuntos.
11. Restricciones.
12. Salida esperada.

## Bloque de rol

Funcion:

- Define el comportamiento esperado de ChatGPT.
- Ubica el trabajo en diseno clinico profesional.

Contenido recomendado:

```text
Comportate como experto en diseno de flyers para clinicas, consultorios y profesionales de salud.
Tu tarea es generar piezas visuales finales, listas para publicar en redes sociales, respetando datos medicos y administrativos cargados por el usuario.
```

## Bloque de formato

Funcion:

- Define formato, canal y restricciones de composicion.

Datos usados:

- `design.format`

Reglas fijas:

- Exactamente 2 alternativas finales.
- Cada alternativa como imagen separada e independiente.
- No collage, no grilla, no mockup multiple.
- Si es historia o estado, debe verse completo en una sola pantalla de celular, sin scroll.

Contenido recomendado:

```text
Formato solicitado: {format}.
Entregar exactamente 2 alternativas finales listas para usar.
Cada alternativa debe ser una imagen separada e independiente.
No colocar dos flyers dentro de una misma imagen.
No hacer collage, comparativa, grilla, panel dividido ni mockup con varias opciones juntas.
```

Regla condicional para historia o estado:

```text
Como el formato es historia/estado, el flyer debe verse completo en una sola pantalla de celular, sin scroll, con margenes seguros y lectura inmediata.
```

## Bloque de estilo base

Funcion:

- Define tono visual, colores, tipografia e impacto.

Datos usados:

- `design.primaryColor`
- `design.secondaryColor`
- `design.visualStyle`
- `design.typography`
- `design.impact`
- `design.includeIcons`
- `design.includeThemeBackground`
- `design.autoTheme`
- `design.usePinnedStyle`

Reglas:

- Usar color lila por defecto si no hay otro color definido.
- No usar recursos visuales que contradigan la especialidad.
- Si se usa conversacion anclada, expresarlo como referencia del usuario, no como garantia tecnica.

## Datos de clinica

Funcion:

- Pasar datos institucionales y de contacto sin alterarlos.

Datos usados:

- `clinic.name`
- `clinic.address`
- `clinic.phone`
- `clinic.socialLinks`
- `clinic.tagline`
- `clinic.showContact`

Reglas:

- No modificar telefono, direccion ni redes.
- Si falta un dato, indicar "No informado" u omitir segun densidad.
- Si `showContact` es falso, no destacar visualmente los datos de contacto.

## Datos del profesional

Funcion:

- Identificar al profesional sin mezclar su especialidad con el enfoque del flyer.

Datos usados:

- `professional.title`
- `professional.fullName`
- `professional.license`
- `professional.roleNote`
- `professional.showPhoto`

Reglas:

- No inventar matricula.
- No cambiar titulo ni nombre.
- Si hay foto, integrarla sin deformar rostro ni alterar identidad.

## Especialidad y enfoque

Funcion:

- Resolver el problema central de coherencia.

Datos usados:

- `specialty.primaryProfessionalSpecialty`
- `specialty.additionalSpecialties`
- `specialty.communicationFocus`
- `specialty.visibleSpecialtyText`

Reglas:

- `primaryProfessionalSpecialty` es la especialidad profesional real.
- `additionalSpecialties` son orientaciones o areas complementarias.
- `communicationFocus` es el foco comunicacional de la pieza, no una nueva especialidad profesional.
- `visibleSpecialtyText` es el texto recomendado para mostrar si el usuario lo cargo.
- Si el enfoque es mas especifico que la especialidad, tratarlo como tema del flyer.
- No presentar una orientacion como titulo profesional si no corresponde.

Contenido recomendado:

```text
Especialidad profesional real: {primaryProfessionalSpecialty}.
Orientaciones adicionales: {additionalSpecialties}.
Enfoque comunicacional del flyer: {communicationFocus}.
Texto visible recomendado para especialidad/enfoque: {visibleSpecialtyText}.

Usa el enfoque comunicacional como tema principal del flyer, pero no lo transformes en una especialidad profesional si no fue declarado como tal.
```

## Prestaciones visibles

Funcion:

- Indicar que servicios pueden aparecer en la pieza.

Datos usados:

- `services.featuredService`
- `services.visibleServices`
- `services.allowReasonableExpansion`
- `services.expansionNotes`

Reglas fijas:

- No inventar datos medicos.
- No exagerar prestaciones.
- No agregar prestaciones si no hay autorizacion.
- Si hay autorizacion, agregar solo prestaciones generales razonables y compatibles con la especialidad.

## Horarios

Funcion:

- Incluir dias, horas y modalidad de atencion.

Datos usados:

- `schedule.items`
- `schedule.requiresAppointment`
- `schedule.appointmentText`
- `schedule.modality`
- `schedule.adminNote`

Reglas:

- No cambiar dias ni horarios.
- Si una fila esta incompleta, el prompt no debe inventar la parte faltante.
- Priorizar claridad visual en celular.

## Cobertura

Funcion:

- Indicar obra social, particulares y aclaraciones.

Datos usados:

- `coverage.insurance`
- `coverage.privateCare`
- `coverage.coverageText`

Reglas:

- No inventar nombres de obras sociales.
- No alterar condiciones de cobertura.

## Adjuntos

Funcion:

- Asignar cada archivo seleccionado a un rol claro.

Datos usados:

- `attachments.items`

Reglas:

- La app debe aclarar que el usuario adjuntara manualmente los archivos en ChatGPT.
- Si falta un adjunto, resolver visualmente sin inventar que existe.
- Si hay logo, respetar proporcion.
- Si hay foto profesional, no deformar ni alterar identidad.
- Si hay referencia, usarla como guia visual sin copiar datos incorrectos.

Contenido recomendado:

```text
El usuario adjuntara manualmente estos archivos antes de enviar el prompt:
- Logo de clinica: {fileName}
- Foto del profesional: {fileName}
- Referencia visual: {fileName}

Tomar cada archivo segun su rol indicado. No asumir archivos no adjuntados.
```

## Restricciones

Funcion:

- Concentrar reglas criticas una sola vez.

Reglas fijas obligatorias:

- Entregar exactamente 2 alternativas finales.
- Cada alternativa debe ser una imagen separada e independiente.
- No hacer collage, comparativa, grilla, panel dividido ni mockup multiple.
- Si es historia/estado, debe verse completo en una sola pantalla de celular, sin scroll.
- No inventar datos medicos.
- No exagerar prestaciones.
- No modificar datos administrativos.
- No cambiar nombres, horarios, telefonos, redes, direccion, matricula ni modalidad.
- No atribuir practicas que no correspondan.
- Priorizar legibilidad en celular.

## Salida esperada

Funcion:

- Define que debe entregar ChatGPT.

Contenido recomendado:

```text
Salida esperada:
Genera exactamente 2 imagenes finales independientes:
1. Alternativa A.
2. Alternativa B.

Ambas deben estar listas para publicar y deben variar levemente en composicion, manteniendo la misma informacion cargada.
```

## Modos de densidad

### brief

Uso:

- Prompts rapidos.
- Pocos datos.
- Usuario con conversacion anclada ya bien entrenada.

Comportamiento:

- Omitir explicaciones largas.
- Mantener datos y reglas criticas.
- Reducir listas vacias.

### balanced

Uso:

- Modo recomendado.
- Buen equilibrio entre claridad y longitud.

Comportamiento:

- Incluir todos los bloques relevantes.
- Mantener contexto suficiente para evitar contradicciones.
- Evitar duplicar restricciones.

### detailed

Uso:

- Casos complejos.
- Muchas prestaciones, adjuntos o restricciones.
- Necesidad de maximo control.

Comportamiento:

- Incluir aclaraciones de coherencia.
- Incluir instrucciones mas explicitas de jerarquia visual.
- Incluir notas sobre que no mostrar.

## Revision previa al copiado

Antes de copiar el prompt, la app debe revisar:

- Especialidad profesional vacia.
- Enfoque comunicacional incompatible o ambiguo.
- Especialidades adicionales duplicadas.
- Prestaciones incompatibles o vacias.
- Horarios incompletos.
- Adjuntos mencionados pero no seleccionados.
- Color personalizado sin valor.
- Falta de datos de contacto si `showContact` es verdadero.

Resultado esperado:

- Mostrar advertencias accionables.
- Permitir copiar si no hay bloqueo critico.
- En bloqueos criticos, pedir correccion o confirmacion explicita.
