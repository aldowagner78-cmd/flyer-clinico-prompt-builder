# Cambios realizados

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
