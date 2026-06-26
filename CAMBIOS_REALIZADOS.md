# Cambios realizados

## Archivos modificados

- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

## Archivos agregados

- Ninguno.

## Qué se cambió

- Se agregó un modo de diseño guiado por tarjetas dentro del paso "Diseño".
- Las tarjetas de Diseño cubren:
  - Formato.
  - Colores.
  - Estilo visual.
  - Tipografía y densidad.
  - Iconos, fondo y recursos según especialidad.
  - Modo animado.
  - Imágenes personalizadas.
- Se mantuvo el botón "Formulario completo" como respaldo para editar todos los campos juntos.
- Se reutilizó la lógica existente de adjuntos personalizados sin subir archivos reales.
- Se agregaron pruebas automatizadas para validar el nuevo flujo guiado de Diseño.
- Se adaptaron pruebas previas que esperaban todos los campos de Diseño visibles desde el inicio.

## Por qué se cambió

- El roadmap pendiente pedía completar la Etapa 11D.3: Diseño guiado.
- La app ya tenía los campos de diseño, pero faltaba presentarlos como flujo guiado por tarjetas para usuarios no técnicos.
- El cambio mantiene la estructura existente y evita reescribir el motor de prompts.

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
3. Crear o completar institución.
4. Elegir un tipo de pieza.
5. Completar Contenido.
6. Pasar a Diseño.
7. Confirmar que aparece "Diseño guiado".
8. Avanzar tarjetas internas con "Siguiente tarjeta".
9. Confirmar que aparecen formato, colores, estilo, tipografía/densidad, recursos, modo animado e imágenes.
10. Tocar "Formulario completo".
11. Volver a "Diseño guiado".
12. Agregar una imagen personalizada por nombre.
13. Pasar a Resultado y confirmar que el prompt se genera.

## Resultado esperado

- La app inicia sin errores.
- El flujo principal mantiene 5 pasos visibles.
- El paso Contenido mantiene tarjetas guiadas.
- El paso Diseño muestra tarjetas guiadas.
- El formulario completo sigue disponible.
- El modo animado modifica el prompt final.
- Las imágenes personalizadas aparecen en el prompt y checklist de adjuntos.
- Las pruebas automatizadas pasan cuando Playwright tiene navegadores instalados.

## Cómo revertir

Restaurar desde copia de seguridad o revertir estos archivos:

- `src/ui/formRenderer.js`
- `tests/app.spec.js`
- `README_INSTALACION.txt`
- `CHANGELOG.md`
- `CAMBIOS_REALIZADOS.md`

Si usás Git:

```bash
git checkout -- src/ui/formRenderer.js tests/app.spec.js README_INSTALACION.txt CHANGELOG.md CAMBIOS_REALIZADOS.md
```
