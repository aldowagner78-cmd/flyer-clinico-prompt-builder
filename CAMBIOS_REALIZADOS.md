# Cambios realizados

## Archivos modificados

- `index.html`
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`

## Archivos agregados

- Ninguno.

## Qué se cambió

- Se corrigió el flujo guiado de **Promoción / campaña**.
- El bloque externo "Prestaciones visibles en el flyer" queda oculto mientras se usa el modo guiado.
- Los puntos/datos visibles ahora aparecen dentro de la tarjeta guiada correspondiente.
- Se puede agregar un dato visible personalizado desde esa misma tarjeta.
- Se puede quitar un dato visible desde esa misma tarjeta.
- Se agregó prueba automatizada para confirmar que el bloque externo no aparece en tarjetas anteriores como "Condiciones y CTA".
- Se dejó agendada la mejora pendiente para cambiar "Fecha o período" por campos "Desde" y "Hasta" con selectores de fecha.

## Por qué se cambió

- En Promoción / campaña, las prestaciones visibles aparecían antes de tiempo y fuera de contexto.
- Ese bloque externo generaba sensación de navegación duplicada.
- La corrección mantiene una sola acción principal por tarjeta y respeta el flujo guiado.
- No modifica el contenido final del prompt salvo por los datos visibles que el usuario agregue o quite.

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
3. Crear o cargar una institución.
4. Elegir **Promoción / campaña**.
5. Avanzar por Contenido guiado.
6. En "Condiciones y CTA", confirmar que no aparece el bloque externo "Prestaciones visibles en el flyer" debajo de la tarjeta.
7. Avanzar a "Puntos visibles".
8. Confirmar que los datos visibles aparecen dentro de la tarjeta.
9. Agregar un dato visible personalizado.
10. Quitar un dato visible.
11. Avanzar a Diseño y Resultado sin errores.

## Resultado esperado

- La app inicia sin errores.
- El flujo principal mantiene 5 pasos visibles.
- Promoción / campaña no muestra prestaciones visibles fuera de contexto.
- La tarjeta "Puntos visibles" permite elegir, agregar y quitar datos visibles.
- No hay navegación duplicada visual en el contenido guiado.
- Las pruebas automatizadas pasan.
- No aparecen ZIPs, reportes ni temporales en `git status`.

## Cómo revertir

Revertir el commit de este parche:

```bash
git revert <hash-del-commit>
```

O restaurar estos archivos desde el backup previo al parche:

- `index.html`
- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`
- `docs/ROADMAP.md`
