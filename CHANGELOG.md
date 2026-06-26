# Changelog

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
