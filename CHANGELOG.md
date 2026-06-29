## 2026-06-29 - Revisión final de circuitos, acentos y prompts

### Corregido
- Se estabilizó la separación IMAGEN / VIDEO / AUDIO con navegación y selector `Ir a...` en el orden del circuito activo.
- Se corrigió el resumen de Resultado para mostrar contenido específico de campaña, infografía, flyer informativo o flyer profesional.
- Se aisló la normalización sin diacríticos a búsquedas internas, comparaciones técnicas y slugs de exportación; no se aplica a campos visibles ni prompt final.
- Se ajustaron pruebas heredadas que todavía buscaban video/animación dentro de IMAGEN.

### Pruebas
- Se agregó cobertura mínima de IMAGEN, VIDEO y AUDIO hasta Resultado.
- Se agregó cobertura explícita para conservar `ñ` y acentos en campos, resumen y prompt final.
- Pasaron dirigidos:
  - `inicio muestra solo tres circuitos principales`
  - `acentos|ñ|diacríticos|prompt final`
  - `flujos IMAGEN VIDEO AUDIO`
  - `tests/audio-prompt.spec.js`
  - `tests/demo-video-gemini.spec.js`

### Verificación final
- `npm test`: 152 passed.

## 2026-06-29 - Hotfix test sin dependencia de barra lateral

### Corregido
- Se corrigió la prueba dirigida de los tres circuitos para validar títulos y paneles visibles reales, no botones laterales que pueden estar ocultos por diseño responsive.

### Compatibilidad
- Windows PowerShell.
- Web/PWA sin cambios funcionales.




## Hotfix test video coherente - 2026-06-29

- Se corrigió la prueba dirigida para no exigir visibilidad del botón lateral `Video`, porque la navegación lateral puede permanecer oculta aunque el paso activo sea correcto.
- La validación queda centrada en `#workflowTitle` y en el panel real de video (`data-video-config-panel`).
- No se modifica lógica funcional de la app.
## 2026-06-29 - Hotfix circuito VIDEO coherente

### Corregido
- El circuito VIDEO ahora avanza desde `Institución` hacia el paso `Video`, no hacia contenido ni diseño de imagen.
- Los números de pasos se recalculan según el circuito activo para evitar valores heredados como `5` u `8`.
- El selector `Ir a...` y la navegación lateral muestran etiquetas coherentes: `Video` para el circuito VIDEO y `Audio` para AUDIO.
- La configuración guiada de video aparece como primera tarjeta del circuito, usando los selectores existentes de modo, duración, destino, música, ritmo y adjuntos por nombre.

### Pendiente
- Validación manual completa en navegador de IMAGEN, VIDEO y AUDIO antes de publicar.


## 2026-06-29 - Hotfix navegación guiada por circuito

### Corregido
- Al elegir IMAGEN, VIDEO o AUDIO desde Inicio, el asistente reinicia el circuito en el primer paso real (`Institución`).
- Se restauran los modos guiados de institución, contenido y diseño al iniciar un nuevo circuito para evitar pantallas completas/manuales heredadas de un uso anterior.
- Se limpia el estado del contenido anterior conservando la institución cargada, para no mezclar reglas ni datos entre imagen, video y audio.

### Compatibilidad
- Windows PowerShell.
- Web/PWA en navegador.


## 2026-06-29 - Hotfix test 3 circuitos

### Corregido
- Se ajustó la prueba dirigida del inicio de 3 circuitos para no exigir la pestaña Diseño mientras el usuario todavía está en la pantalla de institución.
- Se mantiene la validación principal: Inicio muestra IMAGEN, VIDEO y AUDIO; VIDEO/AUDIO no muestran Tipo; AUDIO no muestra Diseño; IMAGEN no muestra Audio ni Solicitar pieza animada.

### Pendiente
- Ejecutar prueba dirigida en Windows PowerShell.

## 2026-06-29 - Inicio separado en IMAGEN / VIDEO / AUDIO

### Agregado
- Pantalla inicial con tres circuitos principales: `IMAGEN`, `VIDEO` y `AUDIO`.
- Test dirigido para validar que los tres circuitos quedan separados.

### Modificado
- `Tipo de pieza` queda reservado para variantes de imagen estática.
- `VIDEO` usa flujo propio y configuración de video sin depender del checkbox de imagen animada.
- `AUDIO` usa flujo propio para jingle, spot narrado e instrumental.
- El modo demo de video conserva `requestAnimation` activo y agrega un flyer base demo por nombre.

### Corregido
- Se elimina la mezcla entre imagen y video mediante el checkbox `Solicitar pieza animada`.
- Se elimina la mezcla entre imagen y audio dentro de `Tipo de pieza`.

### Pruebas
- `node --check src/app.js`
- `node --check src/ui/formRenderer.js`
- `node --check tests/app.spec.js`
- Intento de `npm test -- tests/audio-prompt.spec.js`: no se pudo completar en el entorno de análisis porque no había `node_modules` y el comando global disponible respondió `unknown command 'test'`.

### Pendiente
- Ejecutar Playwright en Windows con dependencias instaladas antes de publicar.

## 2026-06-28 - Autoavance en Tipo de pieza

### Modificado
- Al seleccionar una tarjeta en `Tipo de pieza`, el wizard avanza automáticamente al paso de contenido.
- El botón `Siguiente` deja de mostrarse solo en esa pantalla para evitar una acción redundante.
- `Anterior` sigue permitiendo volver a `Tipo de pieza` y elegir otra tarjeta.

### Pruebas
- `npx playwright test tests/app.spec.js -g "Tipo de pieza" --project=chromium-desktop --project=mobile-chrome`

### Reversión
- En `src/app.js`, volver `selectPieceType` a mostrar `tipo` después de seleccionar.
- Restaurar el botón `Siguiente` en el footer del paso `tipo`.

## 2026-06-28 - Tipo de pieza en una fila de escritorio

### Modificado
- La pantalla `Tipo de pieza` ahora acomoda las 5 tarjetas principales en una sola fila en escritorio.
- Se compactó solo esa grilla en desktop, manteniendo tarjetas legibles y sin desbordes de texto.
- En tablet/móvil se conserva layout responsive: 2 columnas cuando corresponde y 1 columna en pantallas chicas.

### Pruebas
- `npx playwright test tests/app.spec.js -g "Tipo de pieza" --project=chromium-desktop --project=mobile-chrome`

### Reversión
- Volver la regla desktop de `.piece-step-grid` a 4 columnas y quitar el ajuste compacto de `#tipo .piece-option-card`.

## 2026-06-28 - Tipos de audio separados

### Agregado
- Selector visible `Tipo de audio` con `Jingle cantado`, `Spot narrado con música de fondo` e `Instrumental / música de fondo`.
- El spot narrado genera un paquete de producción con `GUION PARA VOZ`, `VOZ SUGERIDA`, `MUSICA DE FONDO`, `MEZCLA`, `HERRAMIENTAS SUGERIDAS` y `CHECKLIST DE PRODUCCION`.
- El modo instrumental genera un prompt propio de música de fondo de 30 segundos sin voces, palabras, coros, tarareo ni vocalizaciones.

### Modificado
- El jingle cantado conserva las reglas de Gemini Audio ya definidas.
- Los datos administrativos permitidos y el texto exacto aplican también al spot narrado, sin contradecir WhatsApp o números escritos en palabras.
- El resumen de Resultado ahora cambia según el tipo de audio elegido.

### Pruebas
- `npm test -- audio-prompt.spec.js`
- `npx playwright test tests/app.spec.js -g "Etapa audio Gemini" --project=chromium-desktop --project=mobile-chrome`

## 2026-06-28 - Datos administrativos de audio sin contradicciones

### Corregido
- Al activar `Permitir cantar datos administrativos`, ahora aparece el bloque `Datos administrativos permitidos en audio` con opciones seleccionables.
- La selección se guarda en `promptOptions.jingleAdministrativeDataAllowed`.
- El prompt ya no prohíbe WhatsApp, teléfonos o redes cuando el usuario los escribió en `TEXTO A CANTAR`.
- Si el texto exacto incluye WhatsApp u otro dato administrativo, se respeta el texto y se evita agregar otros datos.
- Los números escritos en palabras se conservan exactamente y no se convierten a dígitos.

### Pruebas
- `npm test -- audio-prompt.spec.js`
- `npx playwright test tests/app.spec.js -g "Etapa audio Gemini" --project=chromium-desktop --project=mobile-chrome`

## 2026-06-28 - Reglas definitivas Gemini Audio 30 segundos

### Modificado
- `Audio / jingle / música` ahora usa duración fija de 30 segundos para Gemini Flash/Gemini Audio.
- Se quitó el selector visible de duración del módulo de audio.
- El prompt pide un `spot publicitario musical breve` y `audio publicitario breve para redes`, evitando canción larga.
- Se agregaron las secciones `DICCIÓN Y FRASEO` y `CIERRE FINAL`.
- Se agregaron reglas de fraseo compacto: dicción clara, fraseo fluido, sin pausas largas, sin estirar palabras ni vocales finales.
- El cierre final pide énfasis publicitario breve y recordable sin agregar palabras nuevas.
- Se ajustaron estilos visibles a opciones controladas: pop alegre promocional, corporativo moderno, infantil puro, folklore/pop argentino suave, cumbia suave profesional, motivador moderno e instrumental corporativo.
- `Voces infantiles` ahora genera instrucciones explícitas para pedir niñas o niños como voz principal, con fallback honesto si Gemini no lo logra.

### Nota
- Gemini puede no respetar siempre voces infantiles; la UI lo aclara sin prometer garantía.

### Pruebas
- `npm test -- audio-prompt.spec.js`
- `npx playwright test tests/app.spec.js -g "Etapa audio Gemini" --project=chromium-desktop --project=mobile-chrome`

## 2026-06-28 - Audio minimalista para Gemini Audio

### Modificado
- El prompt de `Audio / jingle / música` ahora queda reducido a seis secciones: `TAREA`, `AUDIO A GENERAR`, `TEXTO A CANTAR`, `ESTILO Y VOZ`, `PRONUNCIACIÓN` y `REGLAS`.
- `TEXTO A CANTAR` queda cerrado: Gemini debe cantar únicamente ese texto y no agregar frases, datos ni llamadas a la acción.
- Se dejaron de arrastrar al audio campos de flyer como profesional genérico, prestaciones, especialidad, atención, obras sociales, redes, WhatsApp y adjuntos no usados.
- La pronunciación automática ahora se limita al texto realmente cantado.
- El resumen de Resultado para audio muestra solo datos relevantes del audio.
- El botón principal queda como `Copiar prompt` y confirma temporalmente con `Copiado ✓`.

### Agregado
- Selector contextual de datos administrativos permitidos en audio: WhatsApp, teléfono, Instagram, Facebook, email, dirección, horarios, obras sociales u otro.

### Pruebas
- `npm test -- audio-prompt.spec.js`
- `npx playwright test tests/app.spec.js -g "Etapa audio Gemini" --project=chromium-desktop --project=mobile-chrome`

## 2026-06-28 - Audio / jingle / música para Gemini Audio

### Modificado
- El tipo visible pasa a `Audio / jingle / música`, manteniendo el identificador interno `jinglePromotional`.
- El prompt de audio ahora pide una única pista final para Gemini, sin respuesta explicativa, sin letra aparte, sin alternativas y con duración exacta.
- Se agregaron reglas automáticas de duración para 10, 15, 20 y 30 segundos.
- El prompt usa frase institucional por defecto o una frase editada opcional antes de generar.
- Se agregó pronunciación obligatoria automática desde institución, profesional, especialidad, prestaciones y frase.
- Los datos administrativos no se cantan por defecto; quedan permitidos solo si se activa la opción avanzada.
- El modo instrumental prohíbe voz, letra y texto hablado.

### Agregado
- Opciones mínimas para audio: `Desde cero`, `Basado en flyer / imagen`, `Híbrido`.
- Modos de contenido: datos/frase cargada, frase editada, texto exacto, jingle libre guiado e instrumental.
- Opción avanzada `Permitir cantar datos administrativos`.
- Campo avanzado opcional `Corrección manual de pronunciación`.
- Tests dirigidos en `tests/audio-prompt.spec.js`.

### Pruebas
- `npm test -- audio-prompt.spec.js`

## 2026-06-27 - Jingles promocionales con Gemini

### Agregado
- Tipo de pieza `Jingle / canción promocional`.
- Formulario breve para objetivo, estilo musical, voces, duración, destino, mensaje final e idea base.
- Opciones avanzadas colapsadas para tono, velocidad, instrumentación, slogan y versiones alternativas.
- Prompt específico para Gemini como compositor/productor musical.
- Tests dirigidos de jingle/canción.

### Modificado
- Resultado destaca Gemini cuando el tipo de pieza es jingle.
- Manual y roadmap documentan la función y próximos pendientes de audio.
- `service-worker.js` actualiza versión de cache para refrescar la PWA.

## 2026-06-27 - Reset seguro, Ir a y video desde flyer

### Agregado
- Modal de confirmación para `Inicio`.
- Selector `Ir a...` para saltar entre pasos del asistente.
- Modo de video `Desde flyer / imagen estática`.
- Tests dirigidos para reset, recarga limpia, navegación rápida, plataformas y prompt de video desde flyer.

### Modificado
- El estado persistido al recargar conserva solo base institucional, logo y configuración visual externa.
- Resultado conserva ChatGPT y Gemini; se quitaron CapCut y Canva.
- Manual y roadmap documentan el pendiente futuro de canciones/jingles.
- `service-worker.js` actualiza versión de cache para refrescar la PWA.

## 2026-06-27 - Manual sincronizado con tema de color

### Modificado
- `docs/manual-usuario.html` ahora lee el tema de color elegido en la app y aplica la misma paleta al manual.
- Se agregó compatibilidad con modo claro/oscuro del selector de interfaz.
- Se actualizó el cache de la PWA para refrescar el manual.

### Pruebas sugeridas
- `npx playwright test tests/manual-usuario.spec.js --project=chromium-desktop`

## 2026-06-27 - Manual de usuario interactivo

### Agregado
- `docs/manual-usuario.html` con navegación por secciones, iconos visuales, enlaces y contenido para usuarios no técnicos.
- `docs/MANUAL_USUARIO.md` como versión textual de respaldo.
- Accesos al manual desde la barra superior y desde Inicio.
- `tests/manual-usuario.spec.js` para validar apertura del manual, navegación y ausencia de caracteres rotos.

### Modificado
- `service-worker.js` cachea el manual para uso desde la PWA.
- `README_INSTALACION.txt` documenta cómo abrir y probar el manual.

### Pruebas sugeridas
- `npx playwright test tests/manual-usuario.spec.js --project=chromium-desktop`


## Fix pruebas dirigidas Resultado/Video

### Corregido
- Se ajustó el test de video animado en escritorio para marcar el checkbox de animación de forma robusta.
- Se actualizó la expectativa del botón principal a `Copiar prompt`, acorde al texto final aprobado.

### Pruebas sugeridas
- `npx playwright test tests/app.spec.js -g "video animado|resultado muestra revisión final|botones de plataforma|sugerencias del resultado" --project=chromium-desktop --project=mobile-chrome`

## 2026-06-27 - Accesos rápidos a plataformas

### Agregado
- Botones compactos en Resultado para copiar el prompt y abrir ChatGPT, Gemini, CapCut o Canva en una pestaña nueva.
- Test dirigido para validar botones de plataforma, copia del prompt y URL abierta.

### Modificado
- Se mantiene `Copiar prompt revisado` como acción principal.
- Las plataformas externas quedan como accesos rápidos secundarios.

### Pruebas
- Ejecutar: `npx playwright test tests/app.spec.js -g "botones de plataforma" --project=chromium-desktop`.

## 2026-06-27 - QA final smoke

### Agregado
- `tests/qa-final-smoke.spec.js` como verificacion rapida separada para desktop y mobile.
- Cobertura smoke de carga, textos visibles, ausencia de resumen lateral, Inicio, `Odont.`, fechas de campana, video/Gemini, adjuntos, plataformas, sugerencias corregibles, prompt final y overflow horizontal.

### Pruebas
- Desktop: `npx playwright test tests/qa-final-smoke.spec.js --project=chromium-desktop --workers=1 --timeout=60000`.
- Mobile: `npx playwright test tests/qa-final-smoke.spec.js --project=mobile-chrome --workers=1 --timeout=60000`.
- No reemplaza la bateria completa ni ejecuta `npm test`.

## 2026-06-27 - Demo visual prompt Gemini video

### Agregado
- `tests/demo-video-gemini.spec.js` como demo visual/manual asistida separada de la bateria principal.
- La demo completa un flujo ficticio de `Promocion / campana`, activa video `Desde cero`, valida el prompt final y lo guarda en `test-results/prompt-video-gemini-demo.txt`.

### Documentacion
- Se agrego en `README_INSTALACION.txt` el comando para ejecutar la demo headed.

### Pruebas
- Ejecutar solo: `npx playwright test tests/demo-video-gemini.spec.js --project=chromium-desktop --headed --workers=1`.
- No reemplaza `npm test` ni modifica la configuracion global de Playwright.

## 2026-06-27 - Etapa videos animados base

### Agregado
- Configuración rápida de video al activar `Solicitar pieza animada`.
- Modos de creación: `Desde cero`, `Basado en material` e `Híbrido`.
- Campos compactos para destino, duración, estilo de movimiento, música, estructura y mensaje final.
- Material de apoyo para video con la misma lógica visual de adjuntos múltiples.
- Prompt de video separado del prompt de imagen, con escenas temporizadas y reglas para Gemini/ChatGPT.
- Tests básicos para configuración de video y material de apoyo.

### Modificado
- La tarjeta de diseño `Modo animado` pasa a `Video / animación`.
- Se amplían etiquetas de adjuntos para roles de video.

### Pendiente
- Probar prompts reales en Gemini y ajustar calidad de salida, música y duración según resultado.


## 2026-06-26 - Etapa PWA instalable

## 2026-06-26 - Fix texto de adjuntos en Resultado

### Corregido
- Se ajustó el texto de ayuda del Resultado para mantener la frase "Si hay adjuntos" esperada por la prueba automatizada.
- Se conserva la aclaración para archivos referidos que deben subirse manualmente en ChatGPT.


### Agregado
- `manifest.webmanifest` con nombre, tema, alcance, modo `standalone` e iconos instalables.
- Iconos PWA en `assets/icons/`.
- `service-worker.js` con cache básico de la app.
- `src/pwa.js` para registrar el service worker en contextos seguros.
- Tests básicos de manifest y service worker.

### Compatibilidad
- Preparado para instalación desde Chrome/Edge en Android y escritorio.
- Mantiene rutas relativas para GitHub Pages.

### Pendiente
- Probar instalación real desde Chrome en Android después de publicar.


## 2026-06-26 - Fix botón Más opciones en Resultado

### Corregido
- Se quitó el signo `+` duplicado del botón compacto de Más opciones en Resultado.
- No se modificó la lógica del prompt ni de las acciones avanzadas.

# Changelog

## [Fix Resultado compacto] - 2026-06-26

### Modificado
- Se reubicó el panel `Acciones` dentro del bloque principal del resultado.
- Se compactaron botones principales, secundarios y `Más opciones`.
- Se redujo el alto total de la pantalla final.

### Conservado
- Resumen final visible en `Resultado`.
- Panel lateral oculto durante el asistente.
- Acciones de copiar, checklist, TXT, plantilla, JSON y limpiar.

### Pendiente
- Agregar PWA instalable en una etapa separada.


## [Corrección post-Codex de layout e iconos] - 2026-06-26

### Corregido
- Se repararon textos e iconos rotos por mojibake en `index.html`.
- Se corrigió el botón `Inicio` para que tenga texto e icono reales, no generados por pseudo-elementos.
- Se mantuvo el resumen fuera del lateral y visible solo en `Resultado`.
- Se recuperaron las acciones útiles del panel lateral dentro de la pantalla `Resultado`.

### Pruebas recomendadas
- Prueba visual local con `py -m http.server 8000`.
- Tests dirigidos de apertura, resultado y ausencia de scroll horizontal.

---

## [Layout sin resumen lateral] - 2026-06-26

### Modificado
- Se retiro el panel lateral `Resumen / Vista rapida` durante el asistente.
- El resumen ahora aparece integrado en la pantalla `Resultado`.
- El layout del asistente pasa a una sola columna principal para ganar ancho util.
- Se reforzaron reglas anti scroll horizontal en desktop, tablet y movil.
- El mensaje de estado queda visible en el contenido principal.

### Pruebas
- Se agregaron validaciones dirigidas para confirmar que el lateral no se muestra, que el resumen aparece en Resultado y que no hay overflow horizontal.
- Antes de commit, ejecutar `npm test`.

---

## [Etapa modernizacion visual segura] - 2026-06-26

### Modificado
- Interfaz general modernizada con paleta clinica mas sobria, cards mas consistentes y menor decoracion visual.
- Home y boton de inicio reforzados con jerarquia clara.
- Boton de volver al inicio normalizado visualmente con icono y texto mediante CSS, sin cambiar IDs ni acciones.
- Botones primarios/secundarios, encabezados, tarjetas, resultado asistido y responsive movil ajustados.

### Documentacion
- `docs/ROADMAP.md` suma pendiente futuro para prompts de animaciones/videos orientados a Gemini, Instagram y WhatsApp.

### Pruebas
- Validacion sintactica puntual recomendada: `node --check src/app.js`, `node --check src/ui/formRenderer.js`, `node --check src/prompt/promptBuilder.js`.
- Pruebas Playwright dirigidas recomendadas en `chromium-desktop` y `mobile-chrome`.
- Antes de commit, ejecutar `npm test`.

---

## [Etapa campos vacíos y desplegables] - 2026-06-26

### Modificado
- Campos manuales del flujo profesional quedan vacíos por defecto: nombre, matrícula, especialidad visible y observaciones.
- `Texto para turnos` pasa a desplegable con valores predefinidos y opción `Otro / Personalizar`.
- `Título` profesional pasa a desplegable editable con opción `Otro / Personalizar`, manteniendo `Odont.`.
- Selects editables normalizan la opción `Otro / Personalizar` para mostrar el campo manual solo cuando corresponde.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "campos manuales|texto visible y observaciones" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.

---


## [Fix orden prestaciones y título profesional] - 2026-06-26

### Modificado
- Prueba de orden de prestaciones optimizada para evitar timeout en escritorio.
- Agregada opción `Odont.` en el selector de título profesional.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.

---

## [Etapa orden prestaciones] - 2026-06-26

### Agregado
- Prestaciones, datos visibles y puntos visibles ahora pueden reordenarse manualmente.
- Se agregan botones `Subir` y `Bajar` como alternativa accesible al arrastre.
- Las listas visibles aceptan arrastrar y soltar para ordenar.
- El prompt final respeta exactamente el orden definido por el usuario.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.



## [Fix texto de navegación guiada] - 2026-06-26

### Modificado
- Botones `Siguiente tarjeta` renombrados a `Siguiente` en tarjetas guiadas de contenido y diseño.
- Sin cambios funcionales en navegación ni adjuntos.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "captura varios archivos personalizados|promoción usa fechas desde y hasta con selectores de fecha|muestra diseño guiado" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.


## [Fix limpieza adjuntos y sesión] - 2026-06-26

### Modificado
- Se quitó el botón de adjuntar dentro de cada fila de archivo referido.
- El selector de archivos queda solo en la acción principal de cada sección de adjuntos múltiples.
- Los adjuntos transitorios ya no se guardan entre sesiones.
- La foto profesional tampoco se recuerda entre sesiones.
- El logo institucional sigue siendo el único adjunto recordado por estar asociado a la institución.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.


## [Fix UX adjuntos múltiples] - 2026-06-26

### Modificado
- Botones de selección múltiple renombrados a `Adjuntar archivos`.
- Filas de adjuntos múltiples rediseñadas para ocultar el control nativo del navegador y mostrar un estado claro de archivo referido.
- `Instrucción para GPT` ahora usa desplegable con opciones predefinidas y opción `Otro / Personalizar`.
- Se ampliaron roles de referencia visual sin modificar los campos individuales de logo institucional ni foto profesional.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.

## [Fix adjuntos múltiples - texto de checklist] - 2026-06-26

### Corregido
- Se ajustó el texto del checklist de adjuntos para que indique “pedilo por nombre exacto” cuando falta un archivo referido.
- Se mantiene la regla del prompt: no generar la pieza hasta recibir los archivos listados por nombre exacto.

### Pruebas
- Ejecutar solo: `npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome`.


## [Fix adjuntos múltiples] - 2026-06-26

### Corregido
- Los nombres capturados desde selectores de archivo ahora quedan visibles como texto en el formulario, no solo como valor interno del input.
- Se aclara en la interfaz que la app no sube archivos reales: solo copia nombres para incorporarlos al prompt.
- Se refuerza la regla del prompt para que ChatGPT pida por nombre exacto los archivos faltantes antes de generar.

## [Adjuntos múltiples] - 2026-06-26

### Agregado
- Selector para elegir varios archivos personalizados de una sola vez en imágenes para GPT.
- Selector múltiple en Adjuntos manuales para capturar varios nombres sin subir archivos.
- Soporte para elegir varios archivos desde una fila existente: el primero actualiza la fila y los demás crean filas nuevas.
- Regla explícita en el prompt: si falta un archivo listado, la IA debe pedirlo por nombre exacto antes de generar.
- Prueba automatizada para validar que varios archivos aparecen en prompt y checklist.

### Modificado
- Checklist de adjuntos indica que debe pedirse por nombre exacto cualquier archivo faltante.
- Textos de adjuntos aclaran que la app solo guarda nombres locales.

### Pruebas
- Prueba puntual recomendada: `npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar `npm test`.


## [Fix visual período campaña y navegación guiada] - 2026-06-26

### Corregido
- Agrupado de campos `Desde` y `Hasta` bajo el título visible `Período de campaña`.
- Alineación de `Desde` y `Hasta` lado a lado en escritorio y apilados en móvil.
- Estilo de los selectores de fecha para que mantengan altura, bordes y forma coherente con el resto de campos.
- Refuerzo para eliminar botones inferiores duplicados cuando el wizard guiado ya muestra navegación propia.
- Ocultamiento defensivo de editores externos en modo contenido guiado.

### Pruebas
- Prueba puntual recomendada para el caso de campaña en desktop y mobile.
- Ejecutar `npm test` antes de commit.


## 2026-06-26 - Fix visual de fechas y navegación guiada

### Corregido
- Los inputs `Desde` y `Hasta` de Promoción / campaña adoptan el mismo estilo visual que el resto de campos.
- En escritorio se muestran lado a lado con ancho reducido.
- Se eliminan botones de navegación duplicados debajo de tarjetas guiadas.
- Se oculta el contenedor vacío `additionalSpecialtiesEditor` en modo guiado.

### Pruebas sugeridas
- Ejecutar test puntual:
  `npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha|muestra diseño guiado y mantiene Formulario completo como respaldo" --project=chromium-desktop --project=mobile-chrome`
- Antes de commit, ejecutar `npm test`.



## 2026-06-26 - Fix test fecha campaña

### Corregido
- Ajuste de texto en la tarjeta guiada de Promoción / campaña para eliminar la frase residual "fecha o período".
- Se mantiene el rango con selectores `Desde` y `Hasta`.

### Pruebas sugeridas
- Ejecutar solo el test fallido: `npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha" --project=chromium-desktop --project=mobile-chrome`.
- Antes de commit, ejecutar batería completa con `npm test`.

## [fix-3-problemas-promocion-institucion] - 2026-06-26

### Agregado
- Campos `Desde` y `Hasta` con selector de fecha para Promoción / campaña.
- Pruebas automatizadas para validar el rango de fechas en el prompt final.
- Prueba automatizada para confirmar que la frase institucional guardada aparece en el resumen.

### Modificado
- `src/ui/formRenderer.js` reemplaza el campo libre "Fecha o período" por selectores de fecha.
- `src/prompt/promptBuilder.js` genera el texto del período desde las fechas elegidas.
- `src/app.js` sincroniza el rango de campaña y evita que inputs ocultos sobrescriban valores de select personalizados.
- `assets/css/styles.css` refuerza el ocultamiento de elementos con atributo `hidden`.
- `src/state/defaultState.js` y `src/state/migrations.js` agregan compatibilidad para `campaignStartDate` y `campaignEndDate`.

### Corregido
- El bloque externo "Prestaciones visibles en el flyer" queda oculto de forma robusta durante el contenido guiado.
- El resumen de institución ya no muestra "Sin frase institucional" cuando la frase se eligió desde opciones predefinidas.
- El prompt final ya no usa "Fecha o período" para campañas, sino un rango claro de campaña.

### Pendiente
- Adjuntos múltiples.
- Regla para archivos faltantes antes de generar.
- Orden manual de prestaciones visibles.
- Campos manuales vacíos por defecto y revisión de desplegables.

### Compatibilidad
- App web estática.
- Sin backend.
- Compatible con GitHub Pages.
- Sin dependencias nuevas.


## [fix-promocion-prestaciones] - 2026-06-26

### Agregado
- Prueba automatizada para validar que Promoción / campaña muestre los puntos visibles solo dentro de la tarjeta guiada correspondiente.
- Mejora funcional pendiente documentada: reemplazar "Fecha o período" por campos "Desde" y "Hasta" con selectores de fecha.

### Modificado
- `index.html` identifica el bloque externo de prestaciones visibles para poder ocultarlo en modo guiado.
- `src/ui/formRenderer.js` integra el alta, baja y listado de datos visibles dentro de las tarjetas guiadas de contenido.
- `tests/app.spec.js` agrega cobertura para el caso detectado en Promoción / campaña.
- `README_INSTALACION.txt` y `CAMBIOS_REALIZADOS.md` documentan la corrección.

### Corregido
- En Promoción / campaña, "Prestaciones visibles en el flyer" ya no aparece debajo de tarjetas como "Condiciones y CTA".
- Se evita la sensación de navegación duplicada en el wizard de contenido guiado.
- Los datos visibles quedan contextualizados dentro de la tarjeta "Puntos visibles".

### Pendiente
- Implementar rango de fechas con "Desde" y "Hasta" usando selectores de fecha.
- Adjuntos múltiples.
- Regla para archivos faltantes antes de generar.
- Orden manual de prestaciones visibles.
- Campos manuales vacíos por defecto y revisión de desplegables.

### Compatibilidad
- App web estática.
- Sin backend.
- Compatible con GitHub Pages.
- Sin dependencias nuevas.

## [11D.4] - 2026-06-26

### Agregado
- Panel de revisión final antes de copiar el prompt.
- Resumen asistido de datos mínimos, adjuntos, advertencias y siguiente acción.
- Tarjetas separadas para checklist de datos, adjuntos y advertencias.
- Botón "Copiar prompt revisado" destacado dentro del resultado.
- Pruebas automatizadas para resultado asistido, adjuntos visibles y advertencias finales.

### Modificado
- `index.html` reorganiza el paso Resultado para hacerlo más claro.
- `src/ui/previewRenderer.js` genera la revisión final y el checklist de adjuntos enriquecido.
- `src/app.js` conecta todos los botones de copia mediante `data-copy-prompt-action`.
- `assets/css/styles.css` agrega estilos para el resultado asistido y botón destacado.
- `tests/app.spec.js` agrega cobertura de 11D.4.

### Corregido
- El usuario ve una advertencia clara cuando debe adjuntar archivos manualmente en ChatGPT.
- El botón principal aclara que copia el prompt ya revisado.
- Las advertencias quedan agrupadas antes de copiar o generar.

### Pendiente
- Adjuntos múltiples.
- Regla para archivos faltantes antes de generar.
- Orden manual de prestaciones visibles.
- Campos manuales vacíos por defecto y revisión de desplegables.
- Modernización visual general.

### Compatibilidad
- App web estática.
- Sin backend.
- Compatible con flujo actual de GitHub Pages.
- Validación prevista en Chrome, Firefox y Edge mediante Playwright.

## [11D.3] - 2026-06-26

### Agregado
- Flujo de diseño guiado por tarjetas.
- Tarjeta para formato de salida.
- Tarjeta para colores institucionales o personalizados.
- Tarjeta para estilo visual e impacto.
- Tarjeta para tipografía y densidad de contenido.
- Tarjeta para iconos médicos, fondo temático y recursos según especialidad.
- Tarjeta para modo animado.
- Tarjeta para imágenes personalizadas.
- Pruebas automatizadas para validar diseño guiado, formulario completo, adjuntos personalizados y modo animado.

### Modificado
- `src/ui/formRenderer.js` separa Diseño en modo guiado y modo completo.
- Las pruebas existentes de Diseño y Adjuntos se adaptaron al nuevo flujo guiado.
- `README_INSTALACION.txt` documenta el nuevo flujo de uso y pruebas.

### Corregido
- Se preserva el formulario completo como respaldo para editar todos los campos de diseño juntos.
- Se mantiene la captura de nombres de imágenes personalizadas sin subir archivos reales.
- Se conserva compatibilidad con el prompt final existente.

### Pendiente
- 11D.4 Resultado más claro y asistido.
- Adjuntos múltiples.
- Orden manual de prestaciones visibles.
- Campos manuales vacíos por defecto y revisión de desplegables.
- Modernización visual general.

### Compatibilidad
- App web estática.
- Sin backend.
- Compatible con flujo actual de GitHub Pages.
- Validación prevista en Chrome, Firefox y Edge mediante pruebas Playwright cuando estén instalados los navegadores.

## [11D.2] - 2026-06-26

### Agregado
- Flujo de contenido guiado por tarjetas para los cuatro tipos de pieza.
- Respaldo "Formulario completo" dentro del paso Contenido.
- Tarjetas específicas para flyer profesional, infografía clínica, flyer informativo y promoción / campaña.
- Pruebas automatizadas para validar contenido guiado y regreso al formulario completo.

### Modificado
- `src/ui/formRenderer.js` separa el render de contenido en modo guiado y modo completo.
- El paso Contenido mantiene los campos existentes, pero ahora los organiza por tarjetas cuando se usa el modo guiado.

### Corregido
- No se eliminaron flujos previos de contenido ni diseño.
- Se preserva compatibilidad con el prompt final existente y los datos demo.

### Pendiente
- 11D.3 Diseño guiado.
- 11D.4 Resultado más asistido.
- Adjuntos múltiples.
- Orden manual de prestaciones visibles.
- Campos manuales vacíos por defecto y revisión de desplegables.
- Modernización visual general.

### Compatibilidad
- App web estática.
- Sin backend.
- Compatible con flujo actual de GitHub Pages.
- Validación prevista en Chrome, Firefox y Edge mediante pruebas Playwright cuando estén instalados los navegadores.

## 2026-06-26 - Fix compatibilidad tests de adjuntos

### Corregido
- Se restauró el selector local oculto para adjuntos personalizados, manteniendo la interfaz limpia.
- Se evita mostrar el control nativo del navegador dentro de cada fila.

### Pendiente
- Ejecutar los 4 tests puntuales y luego `npm test` antes de commit.

## [Fix campos vacíos] - 2026-06-26

### Corregido
- `Cómo se verá la especialidad` ya no se autocompleta con `Clínica médica` al iniciar el flujo guiado.
- La especialidad seleccionada se mantiene como desplegable y fallback del prompt, sin invadir campos manuales.


## Ajuste Resultado - acciones compactas

### Modificado
- Resultado ahora usa un único botón principal de copiado y un menú compacto de opciones avanzadas.
- Se redujo el alto ocupado por acciones finales.

### Corregido
- Se quitaron acciones redundantes que hacían largo el cierre del flujo.


### Corregido
- Se reemplazó la etiqueta visible `CTA` por `Mensaje final` en flujos, resumen y prompt.
- Se corrigió `Diseno visual` por `Diseño visual` y textos con acentos en la pantalla de diseño.
- En modo video, el bloque de adjuntos visuales ahora se identifica como `Imágenes/videos personalizados para Gemini`.

## 2026-06-27 - Fix accesos rápidos

### Corregido
- Se compactó el botón principal del resultado como “Copiar prompt”.
- Los botones ChatGPT/Gemini/CapCut/Canva ahora copian el prompt antes de abrir la plataforma.
- Se mejoró la alineación de acciones rápidas en la pantalla Resultado.
## Etapa sugerencias accionables

### Agregado
- Sugerencias del Resultado con botón Corregir.
- Navegación directa al campo relacionado y botón Volver al resultado.

### Corregido
- Menos recorrido manual cuando una advertencia requiere ajuste.
## Fix sugerencias accionables - retorno robusto

### Corregido
- El botón `Volver al resultado` ahora evita que el cambio de foco del campo editado interrumpa el retorno al Resultado.
- Se mantiene la actualización del prompt y de las sugerencias al volver.

### Pruebas sugeridas
- `npx playwright test tests/app.spec.js -g "sugerencias del resultado permiten corregir|advertencias finales quedan agrupadas" --project=chromium-desktop --project=mobile-chrome`


## Ajuste sugerencias accionables

### Corregido
- El resultado vuelve a exponer el prompt generado también como contenido legible del textarea para que las validaciones y pruebas visuales puedan confirmar el texto tras una corrección rápida.


## 2026-06-27 - Ajuste de prompt de jingles

- Se compactó el prompt de jingle/canción para evitar resultados demasiado largos.
- Se agregó duración estricta por segundos y límites de líneas/palabras cantadas.
- Se reforzó español argentino y pronunciación exacta de nombres propios, especialmente instituciones.
- Se indicó no cantar teléfonos, WhatsApp numéricos, direcciones, emails, redes, matrículas ni números.
- Se exige respetar estrictamente el estilo musical elegido por el usuario.

## 2026-06-29 - Hotfix navegación institución en circuitos

### Corregido
- El botón de continuar/guardar institución ahora avanza al siguiente paso real según el circuito elegido.
- IMAGEN avanza a Tipo.
- VIDEO avanza a Contenido/Video sin intentar abrir pasos no disponibles.
- AUDIO avanza a Contenido/Audio sin intentar abrir pasos no disponibles.

### Pruebas
- Verificación de sintaxis con `node --check src/app.js`.
- Prueba manual recomendada: elegir IMAGEN/VIDEO/AUDIO, completar institución y continuar.



## 2026-06-29 - Hotfix test video coherente

### Corregido
- Se ajustó la prueba dirigida para no exigir navegación lateral visible antes de completar Institución.
- Se valida VIDEO como Paso 1 Institución y luego Paso 2 Video con selectores guiados.

### Pendiente
- Validación visual manual de VIDEO/AUDIO en navegador.
