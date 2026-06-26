# Changelog


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
