# Cambios realizados

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
