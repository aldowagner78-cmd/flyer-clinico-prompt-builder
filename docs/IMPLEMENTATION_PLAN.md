# Implementation Plan: Flyer Clinico Prompt Builder

## Objetivo del plan

Ordenar la implementacion definitiva de la app antes del redisenio visual. Este documento traduce la especificacion, el roadmap, el modelo de datos, la arquitectura del prompt, la estrategia de adjuntos y el checklist de pruebas en una secuencia practica de trabajo.

La prioridad es cerrar la logica funcional: datos, formulario, validaciones, adjuntos y prompt. La estetica visual se mejora despues, cuando el comportamiento este estable.

## 1. Diagnostico del estado actual

### Que ya existe

El prototipo actual ya tiene una base util:

- App estatica en HTML/CSS/JS vanilla.
- Formulario por secciones: clinica, medico, prestaciones, atencion, diseno, imagenes, avanzado y resultado.
- Persistencia local con `localStorage`.
- Exportacion e importacion JSON.
- Copia de prompt y descarga TXT.
- Checklist de adjuntos.
- Redes sociales multiples.
- Horarios multiples.
- Especialidad principal, especialidades adicionales y area destacada.
- Colores predefinidos y colores personalizados.
- Validaciones basicas de campos recomendados.
- Prompt en espanol con reglas importantes para ChatGPT.
- Compatibilidad conceptual con GitHub Pages.

### Que esta bien

- La app no depende de backend ni APIs externas.
- El usuario puede trabajar completamente desde el navegador.
- El flujo por secciones es entendible.
- Ya existen datos repetibles para redes y horarios.
- El prompt ya contiene restricciones criticas: 2 alternativas, imagenes separadas, no collage, no inventar datos medicos y no modificar datos administrativos.
- El sistema ya reconoce que los adjuntos se cargan manualmente en ChatGPT.
- Hay una estructura modular inicial en `src/data`, `src/ui`, `src/state` y `src/prompt`.

### Que problemas quedan

- El modelo actual mezcla `doctor.specialty`, `services.primarySpecialty` y `services.highlightedArea`.
- Falta separar especialidad profesional real, orientaciones adicionales, enfoque comunicacional y texto visible recomendado.
- El prompt puede ser redundante porque algunas reglas aparecen varias veces.
- No existen modos de densidad: breve, equilibrado y detallado.
- La validacion aun no clasifica problemas por severidad.
- Falta una revision inteligente antes de copiar el prompt.
- Adjuntos guarda principalmente nombres de archivo, sin metadatos ni miniaturas.
- Exportar/importar JSON todavia no contempla version de esquema.
- La UI aun refleja nombres del modelo viejo: medico, prestaciones, imagenes, avanzado.

### Que NO debe tocarse todavia

- No iniciar redisenio visual antes de cerrar el modelo funcional.
- No agregar backend ni dependencias pagas.
- No prometer subida automatica de adjuntos a ChatGPT.
- No integrar API de OpenAI.
- No reemplazar el flujo estatico compatible con GitHub Pages.
- No hacer refactors esteticos grandes mientras se migra el modelo.
- No romper importaciones JSON existentes sin una migracion explicita.

## 2. Decisiones funcionales definitivas

### Modelo de especialidades

El modelo definitivo debe usar:

- `specialty.primaryProfessionalSpecialty`: especialidad profesional real.
- `specialty.additionalSpecialties`: orientaciones o areas complementarias.
- `specialty.communicationFocus`: foco comunicacional del flyer.
- `specialty.visibleSpecialtyText`: texto recomendado para mostrar en el flyer.

Decision:

- La especialidad profesional no se reemplaza por el foco de campania.
- Las orientaciones adicionales agregan contexto, pero no deben duplicar ni contradecir la especialidad principal.
- El texto visible puede combinar especialidad y enfoque, pero debe ser controlable por el usuario.

### Enfoque comunicacional

El enfoque comunicacional define de que trata el flyer. Puede ser mas especifico que la especialidad, por ejemplo "chequeo predeportivo" dentro de Cardiologia.

Decision:

- El prompt debe tratarlo como tema principal de la pieza.
- No debe presentarlo como titulo profesional si no fue declarado como especialidad.
- Si el enfoque parece incoherente, la app debe advertir antes de copiar.

### Prestaciones visibles vs prestaciones de contexto

El modelo definitivo debe separar:

- `services.featuredService`: prestacion principal destacada.
- `services.visibleServices`: prestaciones que pueden mostrarse en la pieza.
- `services.allowReasonableExpansion`: permiso para ampliar.
- `services.expansionNotes`: limites o instrucciones de ampliacion.

Decision:

- Las prestaciones visibles son las que pueden aparecer en el flyer.
- Las prestaciones de contexto solo pueden agregarse si el usuario autoriza ampliacion razonable.
- Si no hay autorizacion, el prompt debe pedir expresamente no agregar prestaciones.

### Horarios multiples

Decision:

- Los horarios siguen siendo filas repetibles.
- Cada horario completo requiere dias, hora desde y hora hasta.
- Las notas por horario deben conservarse.
- El prompt no debe completar horarios faltantes por inferencia.

### Redes multiples

Decision:

- Las redes siguen como lista repetible con tipo y valor.
- El valor puede ser usuario, texto o URL.
- Si hay tipo sin valor, se muestra advertencia.
- El prompt debe listar solo redes con informacion util.

### Colores amigables

Decision:

- Mantener presets de colores por nombre.
- Mantener color lila como default.
- Permitir color principal y secundario personalizados.
- Validar que "Otro" tenga texto cargado.
- El prompt debe expresar colores por nombre entendible, no depender solo de codigos.

### Adjuntos

Decision:

- Los adjuntos son seleccion local y checklist manual.
- No se automatiza la subida a ChatGPT.
- El modelo debe evolucionar de `images.*Name` a `attachments.items[]`.
- Cada adjunto debe tener rol, nombre, tipo, estado e instruccion.
- Las miniaturas locales son una mejora valida, pero temporales.
- El JSON puede guardar metadatos, no binarios ni URLs temporales.

### Densidad del contenido

Decision:

- Agregar `promptOptions.contentDensity` con valores:
  - `brief`
  - `balanced`
  - `detailed`
- El modo equilibrado debe ser el recomendado.
- Las reglas criticas nunca desaparecen, incluso en modo breve.
- La densidad cambia extension, detalle y omision de bloques vacios.

### Revision inteligente

Decision:

- La validacion debe devolver checklist, issues, severidad y estado de copia.
- Severidades:
  - `blocking`
  - `warning`
  - `suggestion`
- La app debe mostrar advertencias accionables antes de copiar.
- Bloqueos criticos deben pedir correccion o confirmacion explicita.

### Tipos de prompt

Decision:

- Mantener un prompt principal para generacion de imagen final.
- Preparar arquitectura para variantes futuras sin implementarlas de golpe.
- Tipos previstos:
  - `finalFlyer`: prompt principal para generar 2 flyers finales.
  - `revisionOnly`: futuro prompt para revisar coherencia del pedido.
  - `copyTextOnly`: futuro prompt para sugerir texto visible del flyer.

En esta implementacion funcional, el tipo obligatorio es `finalFlyer`.

## 3. Orden exacto de implementacion

### Etapa 1: modelo de datos

Objetivo:

- Introducir el modelo propuesto con `schemaVersion`.
- Migrar datos viejos sin perder configuraciones existentes.
- Mantener la app funcionando con `localStorage`, exportar e importar JSON.

Tareas:

- Crear `createDefaultState()` con las nuevas areas.
- Agregar migracion desde el modelo actual.
- Mapear `doctor` a `professional`.
- Mapear `services.primarySpecialty` y `doctor.specialty` a `specialty.primaryProfessionalSpecialty`.
- Mapear `services.highlightedArea` a `specialty.communicationFocus`.
- Mapear `images.*Name` a `attachments.items[]`.
- Mapear `advanced.*` a `promptOptions.*`.
- Definir comportamiento para configuraciones sin `schemaVersion`.

Archivos probables:

- `src/app.js`
- `src/state/storage.js`
- `src/data/defaultClinic.js`
- `src/data/specialties.js`
- `src/data/designPresets.js`

Criterio de cierre:

- El estado nuevo se crea correctamente.
- Una configuracion vieja se carga sin romper la app.
- Exportar e importar JSON conserva los datos principales.

### Etapa 2: formulario

Objetivo:

- Adaptar la UI al nuevo modelo funcional sin hacer todavia redisenio visual profundo.

Tareas:

- Cambiar campos de medico/profesional segun `professional`.
- Separar especialidad profesional, adicionales, enfoque y texto visible.
- Agregar selector de densidad de contenido.
- Ajustar prestaciones visibles y permiso de ampliacion.
- Ajustar horarios para `schedule.items`.
- Ajustar cobertura para `coverage`.
- Ajustar adjuntos para `attachments.items`.
- Mantener acciones existentes: copiar, descargar, exportar, importar, guardar plantilla.

Archivos probables:

- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`
- `src/app.js`
- `index.html`
- `assets/css/styles.css` solo para ajustes minimos de campos nuevos.

Criterio de cierre:

- El usuario puede cargar todos los datos del modelo nuevo.
- No hay campos funcionales importantes escondidos.
- El resumen y el resultado usan nombres coherentes.

### Etapa 3: validaciones

Objetivo:

- Convertir la validacion basica en revision inteligente.

Tareas:

- Devolver `validationState` con checklist, issues, severidad, `canCopy` y `requiresReview`.
- Validar especialidad principal vacia.
- Validar adicionales duplicadas o iguales a la principal.
- Validar enfoque comunicacional incompatible o ambiguo.
- Validar prestaciones vacias o potencialmente incompatibles.
- Validar horarios incompletos.
- Validar redes incompletas.
- Validar colores personalizados sin valor.
- Validar adjuntos marcados como necesarios pero ausentes.
- Mostrar advertencias antes de copiar.

Archivos probables:

- `src/ui/validation.js`
- `src/ui/previewRenderer.js`
- `src/app.js`
- `assets/css/styles.css` solo para estados visuales necesarios.

Criterio de cierre:

- La app detecta problemas importantes antes de copiar.
- Las advertencias son comprensibles y accionables.
- No bloquea innecesariamente casos validos.

### Etapa 4: adjuntos

Objetivo:

- Mejorar el flujo manual de adjuntos sin romper la naturaleza estatica.

Tareas:

- Migrar de `images` a `attachments.items`.
- Guardar metadatos: rol, nombre, tipo, tamano, estado e instruccion.
- Mostrar checklist por rol.
- Agregar miniaturas locales si el archivo sigue disponible en la sesion.
- Revocar URLs temporales cuando corresponda.
- Advertir al importar JSON con nombres de archivo pero sin archivo real seleccionado.
- Mantener copia de checklist.

Archivos probables:

- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`
- `src/app.js`
- `src/prompt/promptBuilder.js`
- `src/state/storage.js`
- `assets/css/styles.css` para miniaturas y estados.

Criterio de cierre:

- El usuario sabe que adjuntar y con que rol.
- El prompt asigna cada archivo explicitamente.
- La app no afirma que subio archivos a ChatGPT.

### Etapa 5: promptBuilder

Objetivo:

- Reemplazar el template unico por un motor modular por bloques.

Tareas:

- Crear builders por bloque: rol, formato, estilo, clinica, profesional, especialidad, prestaciones, horarios, cobertura, adjuntos, restricciones y salida.
- Agregar soporte para `promptOptions.contentDensity`.
- Reducir redundancias.
- Mantener reglas criticas obligatorias.
- Omitir bloques vacios segun densidad.
- Incluir coherencia entre especialidad y enfoque.
- Incluir tipo de prompt `finalFlyer`.

Archivos probables:

- `src/prompt/promptBuilder.js`
- Posibles nuevos archivos en `src/prompt/` si conviene modularizar.
- `src/data/designPresets.js` si se normalizan etiquetas de formato/color.

Criterio de cierre:

- El prompt final es claro y auditable.
- Los modos breve, equilibrado y detallado producen salidas diferenciadas.
- Todas las reglas fijas aparecen y no se contradicen.

### Etapa 6: pruebas funcionales

Objetivo:

- Verificar que la app quedo funcionalmente lista antes del redisenio visual.

Tareas:

- Ejecutar checklist manual minimo de este documento.
- Ejecutar checklist ampliado de `docs/TESTING_CHECKLIST.md`.
- Probar importacion desde JSON viejo y nuevo.
- Probar localStorage limpio y con datos previos.
- Probar en navegador local y entorno equivalente a GitHub Pages.
- Revisar prompt generado con casos reales.

Archivos probables:

- No deberia requerir cambios grandes.
- Ajustes puntuales en `src/*` si aparecen bugs.
- `README.md` en una etapa posterior si se documenta uso final.

Criterio de cierre:

- No hay errores de consola en flujo normal.
- Exportar/importar y localStorage funcionan.
- Prompt, validaciones y adjuntos cumplen especificacion.

### Etapa 7: mejora visual

Objetivo:

- Mejorar experiencia visual despues de cerrar la logica.

Tareas:

- Redisenar jerarquia del formulario.
- Mejorar navegacion entre secciones.
- Mejorar responsive movil.
- Mejorar estados de validacion.
- Mejorar vista de adjuntos y miniaturas.
- Mejorar panel de resumen y resultado.
- Revisar textos visibles para que sean claros y compactos.

Archivos probables:

- `assets/css/styles.css`
- `index.html`
- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`

Criterio de cierre:

- La app se ve mas profesional.
- La app sigue funcionando igual a nivel de datos y prompt.
- No se introducen cambios funcionales sin pruebas.

## 4. Archivos por etapa

| Etapa | Archivos principales |
| --- | --- |
| 1. Modelo de datos | `src/app.js`, `src/state/storage.js`, `src/data/*` |
| 2. Formulario | `src/ui/formRenderer.js`, `src/ui/previewRenderer.js`, `src/app.js`, `index.html`, `assets/css/styles.css` |
| 3. Validaciones | `src/ui/validation.js`, `src/ui/previewRenderer.js`, `src/app.js`, `assets/css/styles.css` |
| 4. Adjuntos | `src/ui/formRenderer.js`, `src/ui/previewRenderer.js`, `src/app.js`, `src/prompt/promptBuilder.js`, `src/state/storage.js`, `assets/css/styles.css` |
| 5. PromptBuilder | `src/prompt/promptBuilder.js`, posibles nuevos modulos en `src/prompt/`, `src/data/*` |
| 6. Pruebas funcionales | Ajustes puntuales en `src/*`, posible actualizacion posterior de `README.md` |
| 7. Mejora visual | `assets/css/styles.css`, `index.html`, `src/ui/formRenderer.js`, `src/ui/previewRenderer.js` |

## 5. Riesgos

### Romper localStorage actual

Riesgo:

- Usuarios con datos guardados pueden perder configuraciones si el nuevo modelo no migra datos viejos.

Mitigacion:

- Usar `schemaVersion`.
- Detectar estados sin version.
- Migrar campos conocidos.
- Mantener tolerancia a campos antiguos durante una fase.

### Perder compatibilidad con GitHub Pages

Riesgo:

- Introducir rutas absolutas, dependencias de build o APIs de backend.

Mitigacion:

- Mantener rutas relativas.
- Mantener JS vanilla con modulos compatibles.
- Probar version publicada o equivalente estatico.

### Volver redundante el prompt

Riesgo:

- Al modularizar, las reglas pueden repetirse en varios bloques.

Mitigacion:

- Concentrar restricciones criticas en un bloque unico.
- Usar tests manuales de lectura.
- Comparar longitud entre densidades.

### Generar incoherencias de especialidad

Riesgo:

- El prompt puede tratar enfoque o prestaciones como especialidad profesional.

Mitigacion:

- Separar campos del modelo.
- Validar incompatibilidades.
- Incluir instrucciones explicitas en el bloque de especialidad y enfoque.

### Prometer automatizacion de adjuntos imposible

Riesgo:

- La UI o el prompt pueden sugerir que los archivos ya fueron enviados a ChatGPT.

Mitigacion:

- Usar siempre lenguaje de seleccion local y adjunto manual.
- No guardar binarios en localStorage.
- Incluir advertencia visible y checklist.

## 6. Criterios de aceptacion funcional

La app queda lista funcionalmente antes del redisenio visual cuando:

- El modelo nuevo existe y usa `schemaVersion`.
- Configuraciones viejas se migran sin romper carga basica.
- El formulario permite cargar todos los campos definidos en el modelo funcional.
- Especialidad profesional, adicionales, enfoque y texto visible estan separados.
- Prestaciones visibles y ampliacion razonable estan claramente separadas.
- Horarios y redes multiples funcionan.
- Colores personalizados validan campos vacios.
- Adjuntos tienen roles claros y checklist manual.
- La app no promete subida automatica a ChatGPT.
- La revision inteligente muestra bloqueos, advertencias o sugerencias accionables.
- El prompt se construye por bloques.
- Los modos breve, equilibrado y detallado funcionan.
- El prompt siempre pide exactamente 2 imagenes finales separadas.
- El prompt incluye reglas de historia/estado cuando corresponde.
- El prompt no inventa datos medicos ni modifica datos administrativos.
- Copiar prompt, descargar TXT, exportar JSON e importar JSON funcionan.
- No hay errores de consola en uso normal.
- La app sigue funcionando como sitio estatico en GitHub Pages.

## 7. Pruebas manuales minimas

### Profesional con una especialidad

- Cargar profesional con una especialidad principal.
- No cargar adicionales.
- Generar prompt equilibrado.
- Confirmar que la especialidad aparece como especialidad profesional real.

### Profesional con dos especialidades

- Cargar especialidad principal.
- Agregar una especialidad adicional distinta.
- Generar prompt.
- Confirmar que principal y adicional no se mezclan.

### Enfoque comunicacional distinto pero coherente

- Especialidad: Cardiologia.
- Enfoque: Chequeo predeportivo.
- Confirmar que el enfoque se usa como tema del flyer, no como especialidad profesional.
- Confirmar que no aparece advertencia fuerte.

### Enfoque incoherente

- Especialidad: Cardiologia.
- Enfoque: Tratamiento dermatologico estetico.
- Confirmar advertencia de incoherencia.
- Confirmar que se puede corregir desde el campo indicado.

### Horarios diferentes por dia

- Cargar dos o mas horarios con dias y horas distintos.
- Confirmar que el prompt respeta cada fila.
- Dejar un horario incompleto y confirmar advertencia.

### Varias redes sociales

- Cargar Instagram, Facebook y sitio web.
- Confirmar que el prompt lista todas.
- Dejar una red sin valor y confirmar advertencia.

### Sin adjuntos

- No seleccionar archivos.
- Confirmar que el checklist indica que no hay adjuntos.
- Confirmar que el prompt no inventa logo, foto ni referencia.

### Con logo

- Seleccionar logo de clinica.
- Confirmar checklist.
- Confirmar que el prompt pide respetar proporcion del logo.

### Con foto profesional

- Seleccionar foto profesional.
- Confirmar checklist.
- Confirmar que el prompt pide no deformar rostro ni alterar identidad.

### Con referencia visual

- Seleccionar referencia visual.
- Confirmar que el prompt la usa como guia visual.
- Confirmar que no la trata como fuente de datos administrativos.

### Formato historia/estado

- Elegir historia Instagram o estado WhatsApp.
- Confirmar regla de una sola pantalla de celular, sin scroll.
- Confirmar que el prompt mantiene exactamente 2 alternativas.

### Formato post vertical

- Elegir post vertical.
- Confirmar que no aparece regla de historia/estado si no corresponde.
- Confirmar que se mantiene legibilidad movil.

### Prompt breve

- Elegir densidad breve.
- Confirmar que el prompt es mas compacto.
- Confirmar que mantiene reglas criticas.

### Prompt equilibrado

- Elegir densidad equilibrada.
- Confirmar que incluye todos los bloques relevantes.
- Confirmar que no resulta redundante.

### Prompt detallado

- Elegir densidad detallada.
- Confirmar que agrega aclaraciones utiles.
- Confirmar que no contradice datos cargados.

## Secuencia recomendada de trabajo

Implementar una etapa por vez y cerrar cada una con pruebas basicas antes de avanzar. El orden recomendado es estricto:

1. Modelo de datos.
2. Formulario.
3. Validaciones.
4. Adjuntos.
5. PromptBuilder.
6. Pruebas funcionales.
7. Mejora visual.

No conviene redisenar la interfaz antes de estabilizar modelo, validaciones y prompt. La app debe quedar primero correcta; despues, mas linda.
