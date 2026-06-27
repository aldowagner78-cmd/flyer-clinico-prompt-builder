# Accesos rápidos a plataformas - 2026-06-27

## Archivos modificados
- `index.html`
- `src/app.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

## Qué se cambió
- Se agregaron botones para copiar el prompt y abrir ChatGPT, Gemini, CapCut o Canva en una pestaña nueva.
- Se muestra un aviso indicando que el prompt fue copiado y que debe pegarse en la plataforma abierta.
- Se mantiene el botón principal `Copiar prompt revisado`.

## Por qué se cambió
- Para que el usuario pueda salir desde la app hacia la plataforma ideal sin pasos extra.

## Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "botones de plataforma" --project=chromium-desktop
```

## Cómo revertir
- Quitar los botones `data-open-platform` de `index.html`.
- Quitar `copyPromptAndOpenPlatform` y su listener de `src/app.js`.
- Quitar estilos `.platform-actions` / `.platform-button`.
- Quitar el test asociado.

---

# QA final smoke - 2026-06-27

## Archivos agregados
- `tests/qa-final-smoke.spec.js`

## Archivos modificados
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

## Que se cambio
- Se agrego un smoke QA final separado de la bateria principal.
- El smoke valida carga, textos visibles sin caracteres rotos, ausencia de resumen lateral, boton Inicio, `Odont.`, fechas de campana, video, material para Gemini, accesos a plataformas, sugerencias corregibles, prompt final y overflow horizontal.

## Como probar
```powershell
npx playwright test tests/qa-final-smoke.spec.js --project=chromium-desktop --workers=1 --timeout=60000
npx playwright test tests/qa-final-smoke.spec.js --project=mobile-chrome --workers=1 --timeout=60000
```

## Como revertir
- Eliminar `tests/qa-final-smoke.spec.js` y quitar estas notas de documentacion.

---

# Demo visual prompt Gemini video - 2026-06-27

## Archivos agregados
- `tests/demo-video-gemini.spec.js`

## Archivos modificados
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

## Que se cambio
- Se agrego una demo Playwright independiente para completar un prompt de video desde cero con datos ficticios.
- La demo usa modo visible desde el comando, pausas cortas y selectores por `data-path`, rol o texto visible.
- El prompt generado se valida y se guarda en `test-results/prompt-video-gemini-demo.txt`.

## Como probar
```powershell
npx playwright test tests/demo-video-gemini.spec.js --project=chromium-desktop --headed --workers=1
```

## Como revertir
- Eliminar `tests/demo-video-gemini.spec.js` y quitar estas notas de documentacion.

---

# Etapa videos animados base - 2026-06-27

## Archivos modificados
- `src/state/schema.js`
- `src/state/defaultState.js`
- `src/state/migrations.js`
- `src/app.js`
- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`
- `src/prompt/promptBuilder.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

## Qué se cambió
- Se agregó una configuración rápida de video al activar `Solicitar pieza animada`.
- Se agregaron modos `Desde cero`, `Basado en material` e `Híbrido`.
- Se agregó material de apoyo para video con la misma lógica de nombres de archivo de adjuntos múltiples.
- Se separó el prompt de video del prompt de imagen.
- Se agregaron instrucciones temporizadas, duración de 15 a 25 segundos, formato y mensaje final.

## Por qué
- El prompt de imagen adaptado no era suficiente para Gemini/video.
- El usuario necesita interacción mínima, pero un prompt final más detallado y profesional.

## Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "video animado|video basado en material" --project=chromium-desktop --project=mobile-chrome
```

## Cómo revertir
- Revertir este parche o restaurar los archivos modificados desde la rama estable anterior.

---

# Etapa PWA instalable - 2026-06-26

## 2026-06-26 - Fix texto de adjuntos en Resultado

### Archivos modificados
- `index.html`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se cambió el texto visible del Resultado para incluir "Si hay adjuntos" y mantener la indicación sobre archivos referidos.

### Por qué
- La batería completa falló en el test de checklist de adjuntos porque el texto visible ya no contenía la frase esperada.

### Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "checklist de adjuntos queda visible" --project=chromium-desktop --project=mobile-chrome
```

### Cómo revertir
- Revertir este parche o restaurar el texto anterior en `index.html`.


## Archivos modificados
- `index.html`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

## Archivos agregados
- `manifest.webmanifest`
- `service-worker.js`
- `src/pwa.js`
- `assets/icons/icon.svg`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/maskable-512.png`

## Qué se cambió
- Se agregó soporte PWA para instalación desde Chrome/Edge.
- Se agregó manifest, iconos, service worker y registro automático.
- Se agregaron tests básicos para verificar manifest y service worker.

## Por qué se cambió
- Para facilitar el uso en celulares Android y escritorio sin crear una app nativa pesada.

## Cómo probar
- Ejecutar `py -m http.server 8000`.
- Abrir `http://127.0.0.1:8000/`.
- Verificar que la app carga normal.
- Ejecutar tests PWA dirigidos.
- Publicar en GitHub Pages y probar instalación desde Chrome.

## Cómo revertir
- Eliminar archivos PWA agregados.
- Quitar referencias a manifest/iconos/service worker de `index.html`.
- Quitar `src/pwa.js` y tests PWA.


# Fix botón Más opciones en Resultado - 2026-06-26

## Archivos modificados
- `index.html`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

## Qué se cambió
- Se eliminó el `+` textual del botón compacto de Más opciones para evitar que se vea duplicado junto al icono generado por CSS.

## Por qué
- El botón mostraba dos signos `+` y generaba ruido visual en Resultado.

## Cómo probar
- Abrir la app localmente con `py -m http.server 8000`.
- Ir a Resultado.
- Confirmar que junto a `Copiar prompt revisado` aparece un solo botón `+`.

## Cómo revertir
- Restaurar los archivos desde el commit anterior o revertir este parche.

# Cambios realizados

## Fix Resultado compacto - 2026-06-26

### Archivos modificados
- `index.html`
- `assets/css/styles.css`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `README_INSTALACION.txt`
- `docs/ROADMAP.md`

### Qué se cambió
- Se movió el bloque `Acciones` dentro de la tarjeta principal del prompt final.
- Se compactaron botones y acciones secundarias para reducir altura del resultado.
- Se mantiene `Copiar prompt revisado` como acción principal.
- Se dejaron acciones secundarias visibles o dentro de `Más opciones`.
- Se conserva el resumen final solo en `Resultado`.

### Por qué se cambió
- El bloque de acciones quedaba muy abajo y alargaba innecesariamente la pantalla final.
- El usuario pidió reducir scroll y ubicar los botones en una zona más prolija.

### Cómo probar
- Abrir local con `py -m http.server 8000`.
- Ir a `Resultado`.
- Confirmar que `Acciones` aparece compacto junto al prompt final.
- Confirmar que no vuelve el panel lateral de resumen.

### Cómo revertir
- Revertir los cambios de `index.html` y `assets/css/styles.css` de esta sección.


## Corrección post-Codex de layout, iconos y codificación - 2026-06-26

### Archivos modificados
- `index.html`
- `assets/css/styles.css`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se corrigieron caracteres rotos visibles en la interfaz.
- Se reemplazaron iconos rotos de tarjetas, botones y resultado por caracteres válidos.
- Se corrigió el botón `Inicio` para que sea claro y accesible.
- Se mantuvo oculto el panel lateral durante el asistente.
- Se movieron acciones importantes al contenido de `Resultado`, para no perder funciones al ocultar el lateral.

### Por qué se cambió
- La etapa generada por Codex introdujo errores visuales de codificación e iconos.
- El panel lateral oculto dejaba acciones útiles inaccesibles.
- Se busca conservar el beneficio de más ancho útil sin perder funciones.

### Cómo probar
- Abrir local con `py -m http.server 8000`.
- Revisar Home, Tipo de pieza, Institución, Contenido, Diseño y Resultado.
- Confirmar que no hay textos tipo textos corruptos ni iconos rotos.
- Confirmar que `Inicio` se ve correctamente.
- Confirmar que el resumen no aparece lateralmente durante el asistente.
- Confirmar que Resultado muestra resumen y acciones.

### Cómo revertir
- Revertir este parche desde Git o restaurar el backup previo si hubiera problemas.

---

## Layout sin resumen lateral - 2026-06-26

### Archivos modificados
- `index.html`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `docs/ROADMAP.md`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Que se cambio
- Se movio el resumen desde el panel lateral hacia la pantalla Resultado.
- Se oculto el contenedor lateral para que no ocupe ancho durante el asistente.
- Se paso el asistente a una sola columna principal.
- Se movio el mensaje de estado al contenido principal.
- Se agregaron reglas para evitar scroll horizontal y mejorar ancho util en formularios, tarjetas y resultado.
- Se agregaron verificaciones Playwright de resumen en Resultado y ausencia de overflow horizontal.

### Por que se cambio
- El panel lateral comprimía formularios y tarjetas en pantallas medianas y moviles.
- El resumen es mas util al final, junto con la revision asistida antes de copiar el prompt.

### Como probar
- Iniciar el asistente y confirmar que no aparece el panel lateral `Resumen / Vista rapida`.
- Avanzar a Resultado y confirmar que el resumen aparece dentro del contenido principal.
- Revisar que no haya scroll horizontal en desktop, tablet ni movil.
- Ejecutar los tests dirigidos de esta etapa en `chromium-desktop` y `mobile-chrome`.

### Como revertir
- Revertir los archivos listados desde Git o aplicar el backup previo al parche.

---

## Etapa modernizacion visual segura - 2026-06-26

### Archivos modificados
- `assets/css/styles.css`
- `docs/ROADMAP.md`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Que se cambio
- Se agrego una capa final de estilos para modernizar la interfaz sin cambiar arquitectura, rutas ni IDs.
- Se ajusto la paleta hacia un aspecto clinico mas sobrio y menos decorativo.
- Se reforzo la jerarquia de botones primarios y secundarios.
- Se unificaron cards, encabezados, paneles guiados, resultado asistido y espaciados.
- Se mejoro el boton de inicio del asistente y el boton para volver al inicio con icono y texto claro desde CSS.
- Se ajusto el responsive movil para wizard, cards, acciones y formularios.
- Se agrego en roadmap un pendiente futuro para prompts de animaciones/videos.

### Por que se cambio
- La etapa buscaba limpieza UX y modernizacion visual sin tocar la logica funcional central.
- El usuario debe ver pantallas mas limpias, una accion principal clara y navegacion comprensible.

### Como probar
- Ejecutar las validaciones sintacticas:
  `node --check src/app.js`
  `node --check src/ui/formRenderer.js`
  `node --check src/prompt/promptBuilder.js`
- Ejecutar los tests dirigidos en desktop y mobile indicados para esta etapa.
- Confirmar visualmente Home, wizard guiado, formulario completo, adjuntos multiples, orden manual y resultado asistido.

### Como revertir
- Revertir los archivos listados desde Git o aplicar el backup previo al parche.

---

## Etapa campos vacíos y desplegables - 2026-06-26

### Archivos modificados
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `docs/ROADMAP.md`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se evitó autocompletar campos manuales de profesional y especialidad visible.
- Se agregó placeholder orientativo en lugar de texto precargado para la especialidad visible.
- Se transformó `Texto para turnos` en desplegable con opciones frecuentes y opción `Otro / Personalizar`.
- Se transformó `Título` profesional en desplegable editable, manteniendo `Odont.`.
- Se normalizaron opciones editables para usar `Otro / Personalizar`.

### Por qué se cambió
- Los campos libres no deben aparecer completados artificialmente.
- Los valores sugeridos deben vivir en desplegables, no en campos manuales.
- El usuario solo debe ver un campo manual adicional cuando quiere personalizar.

### Cómo probar
- Ejecutar:
  `npx playwright test tests/app.spec.js -g "campos manuales|texto visible y observaciones" --project=chromium-desktop --project=mobile-chrome`
- Confirmar visualmente que nombre, matrícula, especialidad visible y observaciones empiezan vacíos.
- Confirmar que `Título` y `Texto para turnos` muestran `Otro / Personalizar` y despliegan campo manual solo al elegirlo.

### Cómo revertir
- Restaurar los archivos listados desde el commit anterior o desde el ZIP backup previo.

---


## Fix orden prestaciones y título Odont. - 2026-06-26

### Archivos modificados
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se optimizó la prueba de orden de prestaciones para validar el orden de los ítems agregados sin borrar toda la lista previa.
- Se agregó `Odont.` como opción de título profesional en Flyer profesional.
- No se modificó la lógica de adjuntos múltiples.

### Por qué se cambió
- El test de escritorio podía superar el timeout de 30 segundos aunque la función pasara en móvil.
- Se necesitaba una opción de título adecuada para odontólogos.

### Cómo probar
- Ejecutar:
  `npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome`
- Confirmar visualmente que `Odont.` aparece en `Flyer profesional > Profesional > Título`.

### Cómo revertir
- Revertir estos archivos desde Git o aplicar el backup previo al parche.

---

## Etapa orden prestaciones - 2026-06-26

### Archivos modificados
- `src/app.js`
- `src/ui/formRenderer.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `docs/ROADMAP.md`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se agregó orden manual para prestaciones/datos/puntos visibles.
- Se agregaron botones `Subir`, `Bajar` y `Quitar` en cada ítem visible.
- Se agregó soporte de arrastrar y soltar para ordenar.
- Se agregó prueba automática para verificar que el prompt respeta el orden.

### Por qué se cambió
- El usuario debe controlar el orden exacto en que los datos aparecen en el prompt final y, por extensión, en la pieza solicitada.

### Cómo probar
- Ejecutar el test puntual:
  `npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome`
- Confirmar visualmente que las prestaciones se pueden subir/bajar y arrastrar.
- Confirmar que el prompt final respeta el orden definido.

### Cómo revertir
- Restaurar los archivos listados desde el commit anterior o desde el ZIP backup previo.

---


## Fix texto de navegación guiada - 2026-06-26

### Archivos modificados
- `src/ui/formRenderer.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se reemplazó el texto visible `Siguiente tarjeta` por `Siguiente`.
- Se mantuvieron los mismos `data-*` y handlers de navegación.

### Por qué se cambió
- El texto era innecesariamente largo y menos limpio para el usuario.

### Cómo probar
- Abrir el flujo guiado de contenido y diseño.
- Confirmar que los botones dicen `Siguiente`.
- Confirmar que la navegación sigue avanzando correctamente.
- Antes de commit, ejecutar `npm test`.

### Cómo revertir
- Restaurar `src/ui/formRenderer.js` desde el commit anterior.

---


## Fix limpieza adjuntos y sesión - 2026-06-26

### Archivos modificados
- `src/state/storage.js`
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se eliminó el botón `Adjuntar archivos` dentro de cada fila ya creada.
- Se mantiene la acción principal de adjuntar/copiar nombres en el encabezado de cada sección de adjuntos múltiples.
- Se limpian del estado persistido los adjuntos transitorios y la foto profesional.
- Se conserva únicamente el logo institucional como adjunto persistente.
- Se agregó verificación automática para que los adjuntos múltiples no queden guardados en `localStorage`.

### Por qué se cambió
- La interfaz mostraba una acción repetida que no aportaba valor.
- Los nombres de archivos referidos no deben reaparecer en sesiones futuras porque son datos específicos de cada pieza.

### Cómo probar
- Ejecutar el test puntual de adjuntos múltiples en desktop y mobile.
- Confirmar visualmente que cada fila muestra el archivo referido sin botón extra.
- Recargar la app y confirmar que referencias y foto profesional quedan limpias; el logo institucional guardado se mantiene.

### Cómo revertir
- Restaurar los archivos listados desde el backup previo o desde Git.

---


## Fix UX adjuntos múltiples - 2026-06-26

### Archivos modificados
- `src/app.js`
- `src/ui/formRenderer.js`
- `assets/css/styles.css`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se reemplazó la acción visible por `Adjuntar archivos`.
- Se ocultó el input nativo de archivo en las filas de adjuntos múltiples.
- Se mantuvo visible el nombre capturado mediante el texto `Archivo referido`.
- Se agregó un desplegable para instrucciones de GPT con opciones predefinidas y opción personalizada.
- Se ampliaron roles para referencias visuales.
- No se tocó la lógica de logo institucional ni foto profesional, que siguen usando campos individuales de un solo archivo.

### Por qué se cambió
- La selección múltiple funcionaba, pero la interfaz mostraba controles nativos confusos y campos demasiado manuales para usuarios no técnicos.

### Cómo probar
- Ejecutar el test puntual de adjuntos múltiples en desktop y mobile.
- Revisar visualmente Diseño > Formulario completo > Imágenes personalizadas para GPT.
- Confirmar que el prompt y checklist mantienen los nombres de archivo.

### Cómo revertir
- Restaurar los archivos listados desde el commit anterior o desde el ZIP de backup.

## Fix adjuntos múltiples - 2026-06-26

### Archivos modificados
- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`
- `src/prompt/promptBuilder.js`
- `assets/css/styles.css`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se agregaron chips/textos visibles con el nombre de archivo referido en cada fila de adjunto.
- Se cambió el texto de interfaz para aclarar que la app solo copia nombres y no sube archivos.
- Se incorporó en el prompt la respuesta que debe dar ChatGPT si faltan archivos: “Para poder realizar la tarea necesito que subas los siguientes archivos:”.
- Se mantuvo la instrucción de no generar hasta recibir los archivos referidos.

### Cómo probar
- Ejecutar el test puntual de adjuntos múltiples en desktop y mobile.
- Verificar visualmente que los nombres seleccionados aparecen en el formulario, prompt y checklist.

### Cómo revertir
- Restaurar los archivos listados desde el commit anterior o desde el ZIP de backup.

## Adjuntos múltiples - 2026-06-26

### Archivos modificados
- `src/app.js`
- `src/ui/formRenderer.js`
- `src/ui/previewRenderer.js`
- `src/prompt/promptBuilder.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

### Qué se cambió
- Se agregó selector múltiple para imágenes personalizadas dentro de Diseño.
- Se agregó selector múltiple en Adjuntos manuales.
- Al seleccionar varios archivos en una fila, el primero queda en esa fila y el resto se agrega como filas nuevas.
- El prompt final lista todos los nombres seleccionados.
- El checklist de adjuntos lista todos los nombres seleccionados.
- Se agregó una regla explícita para que ChatGPT pida por nombre exacto cualquier archivo listado que no haya sido adjuntado antes de generar.
- Se agregaron pruebas automatizadas del flujo de adjuntos múltiples.

### Por qué se cambió
- El usuario necesitaba seleccionar varios archivos personalizados sin repetir el flujo de agregar uno por uno.
- El prompt y el checklist debían ser más seguros cuando la pieza depende de archivos adjuntos.

### Cómo probar rápido
Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
`npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome`

Resultado esperado:
`2 passed`

### Cómo probar completo antes de commit
`npm test`

### Cómo revertir
Usar Git:
`git checkout -- src/app.js src/ui/formRenderer.js src/ui/previewRenderer.js src/prompt/promptBuilder.js assets/css/styles.css tests/app.spec.js README_INSTALACION.txt CHANGELOG.md CAMBIOS_REALIZADOS.md docs/ROADMAP.md`

---

## Fix visual período campaña y navegación guiada - 2026-06-26

### Archivos modificados
- `src/ui/formRenderer.js`
- `src/app.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se creó un grupo visual `Período de campaña` para contener `Desde` y `Hasta`.
- Se aplicó el mismo grupo al modo guiado y al formulario completo.
- Se reforzó la limpieza de navegación inferior duplicada cuando una tarjeta guiada ya tiene botones propios.
- Se agregaron estilos para que los campos de fecha se vean consistentes con el resto del formulario.
- Se amplió la prueba de campaña para verificar título del grupo, selectores de fecha, layout horizontal en escritorio y ausencia de footer duplicado.

### Por qué se cambió
- El usuario veía `Desde` y `Hasta` sin contexto.
- En el paso a paso los campos seguían apilados.
- Quedaba navegación inferior duplicada debajo de la tarjeta guiada.

### Cómo probar rápido
Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
`npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha" --project=chromium-desktop --project=mobile-chrome`

Resultado esperado:
`2 passed`

### Cómo probar completo antes de commit
`npm test`

### Cómo revertir
Usar Git:
`git checkout -- src/ui/formRenderer.js src/app.js assets/css/styles.css tests/app.spec.js README_INSTALACION.txt CHANGELOG.md CAMBIOS_REALIZADOS.md`

---


## 2026-06-26 - Fix visual fechas y navegación guiada

### Archivos modificados
- `assets/css/styles.css`
- `src/app.js`
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Los campos `Desde` y `Hasta` de Promoción / campaña ahora usan el estilo visual general de inputs.
- En escritorio, `Desde` y `Hasta` quedan alineados uno al lado del otro, con ancho reducido.
- En móvil, el rango de fechas vuelve a una columna para mantener legibilidad táctil.
- Se elimina la navegación inferior duplicada cuando una tarjeta guiada ya tiene navegación propia.
- Se oculta el contenedor secundario vacío para evitar el residuo visual debajo del wizard.
- El botón para pasar al siguiente paso queda dentro de la última tarjeta guiada.

### Por qué se cambió
- La prueba visual mostraba inputs de fecha con estilo nativo sin integración visual.
- También quedaban botones `Anterior / Siguiente` duplicados debajo del wizard y un contenedor vacío fuera de contexto.

### Cómo probar
- Ejecutar primero el test puntual:
  `npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha|muestra diseño guiado y mantiene Formulario completo como respaldo" --project=chromium-desktop --project=mobile-chrome`
- Revisar visualmente Promoción / campaña en GitHub Pages o local.
- Antes de commit, ejecutar: `npm test`.

### Cómo revertir
- Restaurar los archivos listados desde el backup anterior al parche.



## Fix puntual - texto residual en fecha de campaña

### Archivos modificados
- `src/ui/formRenderer.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `README_INSTALACION.txt`

### Qué se cambió
- Se reemplazó la ayuda de la tarjeta `campaign-type` para que no use la frase residual "fecha o período".

### Por qué se cambió
- Fallaban los tests específicos de fechas porque la tarjeta todavía contenía el texto antiguo aunque los inputs `Desde` y `Hasta` ya existían.

### Cómo probar
- Ejecutar: `npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha" --project=chromium-desktop --project=mobile-chrome`.
- Luego, antes de commit, ejecutar: `npm test`.

### Cómo revertir
- Restaurar el archivo `src/ui/formRenderer.js` desde el backup o desde el commit anterior.


# Cambios realizados

## Archivos modificados

- `assets/css/styles.css`
- `src/app.js`
- `src/prompt/promptBuilder.js`
- `src/state/defaultState.js`
- `src/state/migrations.js`
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

## Archivos agregados

- Ninguno.

## Qué se cambió

- Se reforzó el ocultamiento del bloque externo **Prestaciones visibles en el flyer** durante el modo guiado.
- En **Promoción / campaña**, el campo único **Fecha o período** fue reemplazado por:
  - `Desde`: selector de fecha.
  - `Hasta`: selector de fecha.
- El prompt final ahora muestra el rango como: `Período de campaña: desde AAAA-MM-DD hasta AAAA-MM-DD`.
- Se corrigió el guardado de frase institucional cuando se usa un desplegable con opción predefinida.
- Se preservan los nuevos campos de fecha en el estado/migración.
- Se agregaron pruebas automatizadas para los 3 casos corregidos.

## Por qué se cambió

- Las prestaciones visibles podían verse fuera del contexto del wizard en la prueba visual.
- El campo libre de período no era suficientemente guiado para usuarios no técnicos.
- El resumen de institución mostraba `Sin frase institucional` aunque se hubiera elegido una frase predefinida.
- La corrección mantiene el flujo por tarjetas y evita duplicación visual.

## Cómo probar

Desde la raíz del proyecto:

```bash
npm install
npm test
```

Si Playwright indica que faltan navegadores:

```bash
npx playwright install
npm test
```

Prueba manual mínima:

1. Abrir la app.
2. Comenzar asistente.
3. Crear institución y elegir una frase institucional predefinida.
4. Guardar la institución.
5. Volver a Institución, seleccionar la guardada y confirmar que el resumen muestra la frase.
6. Elegir **Promoción / campaña**.
7. En la primera tarjeta de contenido, confirmar que aparecen `Desde` y `Hasta` como selectores de fecha.
8. Cargar ambas fechas.
9. Avanzar hasta "Condiciones y CTA" y confirmar que no aparece el bloque externo "Prestaciones visibles en el flyer".
10. Avanzar a "Puntos visibles" y confirmar que los datos visibles aparecen dentro de la tarjeta.
11. Ir a Resultado y confirmar que el prompt dice `Período de campaña: desde ... hasta ...`.

## Resultado esperado

- La app inicia sin errores.
- Los tests pasan.
- Promoción / campaña no muestra prestaciones fuera de contexto.
- El período se carga con dos selectores de fecha.
- La frase institucional guardada aparece correctamente en el resumen.
- No hay dependencias nuevas.
- No se incluyen ZIPs, `node_modules`, reportes ni temporales.

## Cómo revertir

Usar Git:

```bash
git checkout -- assets/css/styles.css src/app.js src/prompt/promptBuilder.js src/state/defaultState.js src/state/migrations.js src/ui/formRenderer.js tests/app.spec.js README_INSTALACION.txt CHANGELOG.md CAMBIOS_REALIZADOS.md docs/ROADMAP.md
```

O revertir el commit del parche:

```bash
git revert <hash-del-commit>
```

## Fix adjuntos múltiples - texto de checklist

### Archivos modificados
- `src/ui/previewRenderer.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se reemplazó el texto del checklist para que contenga exactamente “pedilo por nombre exacto”.
- No se cambió el comportamiento de selección de archivos: la app solo captura nombres, no sube archivos reales.

### Por qué se cambió
- Los tests puntuales ya encontraban los nombres de archivo, pero fallaban porque el checklist decía “debe pedirlo por nombre exacto” en vez de “pedilo por nombre exacto”.

### Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome
```

### Cómo revertir
- Restaurar `src/ui/previewRenderer.js`, `CHANGELOG.md` y `CAMBIOS_REALIZADOS.md` desde Git.

## Fix puntual - input oculto para tests de adjuntos (2026-06-26)

### Archivos modificados
- `src/ui/formRenderer.js`
- `assets/css/styles.css`

### Qué se cambió
- Se restauró el input `data-attachment-file` como control oculto dentro de cada fila de adjunto.
- El control oculto mantiene compatibilidad con Playwright y no muestra el botón nativo `Browse / No files selected`.

### Por qué se cambió
- Los tests heredados usan `setInputFiles` sobre `[data-attachment-file]`.
- La UX debía permanecer limpia, sin botón interno visible dentro de cada fila.

### Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "completa nombres de logo, foto profesional e imagen personalizada sin subir archivos|las tarjetas de diseño cubren formato, colores, estilo, tipografía, densidad, recursos, animación e imágenes" --project=chromium-desktop --project=mobile-chrome
```

### Cómo revertir
- Quitar el input oculto `attachment-file-input-hidden` de `renderAttachmentRow`.
- Quitar la regla CSS `.attachment-file-input-hidden`.

## Fix campos vacíos - 2026-06-26

### Archivos modificados
- `src/app.js`
- `src/state/defaultState.js`
- `CAMBIOS_REALIZADOS.md`
- `CHANGELOG.md`

### Qué se cambió
- Se corrigió el autocompletado de `specialty.visibleSpecialtyText` al seleccionar tipo de pieza o especialidad.
- El campo manual `Cómo se verá la especialidad` queda vacío; la especialidad elegida queda solo como desplegable y fallback del prompt.

### Por qué se cambió
- Para cumplir la regla de campos manuales vacíos por defecto.

### Cómo probar
- Ejecutar los tests de `campos manuales|texto visible y observaciones`.

### Cómo revertir
- Restaurar este parche desde Git con `git checkout -- src/app.js src/state/defaultState.js` antes de commitear.


## Ajuste Resultado - acciones compactas

- Se eliminó la sección secundaria redundante de Acciones.
- Se dejó un único botón principal para copiar el prompt revisado.
- Se agregó un botón `+` para opciones avanzadas.
- Se quitaron de la UI los botones `Descargar TXT` y `Copiar checklist de adjuntos`.
- Se confirmó que el prompt conserva la regla para pedir archivos faltantes por nombre exacto.


## Ajuste de coherencia video y textos visibles

### Archivos modificados
- `index.html`
- `src/ui/formRenderer.js`
- `src/app.js`
- `src/prompt/promptBuilder.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Se reemplazó `CTA` por `Mensaje final` en la interfaz y en el prompt generado.
- Se corrigieron textos visibles sin `ñ` en la sección de Diseño.
- Cuando se solicita video, el bloque de referencias pasa a decir `Imágenes/videos personalizados para Gemini`.

### Cómo probar
- Activar `Solicitar pieza animada`.
- Revisar que no aparezca `CTA` en la interfaz.
- Revisar que Diseño muestre `Diseño visual`.
- Ir a Resultado y confirmar que el prompt usa `Mensaje final`.

## Fix accesos rápidos a plataformas

### Archivos modificados
- `index.html`
- `assets/css/styles.css`
- `src/app.js`
- `tests/app.spec.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `README_INSTALACION.txt`

### Qué se cambió
- Se renombró el botón principal a “Copiar prompt”.
- Se ordenaron los botones de plataformas en una línea compacta cuando hay espacio.
- Se corrigió el flujo para copiar el prompt antes de abrir ChatGPT/Gemini/CapCut/Canva.

### Cómo probar
- Generar un resultado.
- Usar un botón de plataforma.
- Pegar en la plataforma abierta y verificar que se pegó el prompt actual.
## Etapa sugerencias accionables

### Archivos modificados
- `src/app.js`
- `src/ui/previewRenderer.js`
- `src/ui/formRenderer.js`
- `assets/css/styles.css`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

### Qué se cambió
- Las advertencias/sugerencias del Resultado ahora tienen botón `Corregir`.
- Al corregir, la app lleva al paso/campo relacionado.
- Se agrega botón `Volver al resultado` para regresar sin recorrer todo el asistente.

### Cómo probar
- Ejecutar tests dirigidos de Resultado y sugerencias accionables.

### Cómo revertir
- Revertir este parche o restaurar los archivos modificados.
## Fix sugerencias accionables - retorno robusto

### Archivos modificados
- `src/app.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `README_INSTALACION.txt`

### Qué se cambió
- Se agregó un retorno robusto desde `Corrección rápida` hacia Resultado.
- Se previene que el blur del campo editado reprocesse la pantalla antes del clic en `Volver al resultado`.

### Cómo probar
- Ejecutar el test dirigido de sugerencias accionables en desktop y mobile.

### Cómo revertir
- Restaurar los archivos modificados desde el commit anterior o desde backup.


## Ajuste sugerencias accionables

### Archivos modificados
- `src/ui/previewRenderer.js`

### Qué se cambió
- El textarea del prompt final conserva el valor del prompt y también su contenido textual interno para validar correctamente el regreso al Resultado después de corregir una sugerencia.

### Cómo probar
- Ejecutar el test dirigido de sugerencias accionables.

### Cómo revertir
- Revertir el cambio en `renderResult` para volver a asignar solo `.value`.



## Fix pruebas dirigidas Resultado/Video

### Archivos modificados
- `tests/app.spec.js`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `README_INSTALACION.txt`

### Qué se cambió
- Se hizo más robusta la interacción del test con el checkbox `Solicitar pieza animada / video`.
- Se alineó el test con el texto final aprobado del botón: `Copiar prompt`.

### Por qué se cambió
- Los fallos eran de validación/automatización, no de la funcionalidad visual aprobada.

### Cómo probar
```powershell
npx playwright test tests/app.spec.js -g "video animado|resultado muestra revisión final|botones de plataforma|sugerencias del resultado" --project=chromium-desktop --project=mobile-chrome
```

### Cómo revertir
- Revertir los cambios en `tests/app.spec.js` y documentación asociada.

