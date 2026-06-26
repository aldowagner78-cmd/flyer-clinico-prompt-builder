
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
