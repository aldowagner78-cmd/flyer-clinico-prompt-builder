# Roadmap

### PWA instalable - completado en etapa actual

- Agregado `manifest.webmanifest`.
- Agregados iconos de app.
- Registrado `service-worker.js` simple.
- Preparado para instalación en Android y escritorio desde Chrome/Edge.
- Documentada instalación en `README_INSTALACION.txt`.
- Pendiente de validación manual real después de publicar en GitHub Pages.


### Resultado compacto

- Completado: acciones finales reubicadas y compactadas dentro de `Resultado`.
- Mantener como criterio futuro que el resultado no genere scroll innecesario.
- Mantener `Copiar prompt revisado` como acción principal y opciones avanzadas agrupadas.



## Pendientes futuros

### PWA instalable

- Agregar `manifest.webmanifest`.
- Agregar iconos de app.
- Registrar `service-worker.js` simple.
- Permitir instalación en Android y escritorio desde navegador.
- Documentar instalación en Chrome/Edge/Android.
- Mantener compatibilidad con GitHub Pages.

### Prompts para animaciones y videos

- Mejorar prompts especificos para Gemini/video.
- Sugerir duracion de 15 a 25 segundos segun la cantidad de contenido.
- Preparar salidas listas para Instagram y WhatsApp.
- No implementar en esta etapa de modernizacion visual.

## Cambios UX recientes


### Corrección post-Codex de layout e iconos

- Se repararon textos e iconos rotos por codificación en la interfaz.
- Se corrigió el botón Inicio para que sea claro y accesible.
- Se mantuvo el resumen lateral retirado durante el asistente.
- Se recuperaron acciones importantes en la pantalla Resultado.

### Resumen lateral retirado

- Se retiro el panel lateral de resumen durante el asistente para ganar ancho util.
- El asistente usa una sola columna principal en pasos intermedios.
- El resumen queda concentrado en la pantalla Resultado, junto con la revision final, checklist, adjuntos y advertencias.
- Mantener este criterio en futuras pantallas para evitar scroll horizontal en desktop, tablet y movil.

## Principios

- Mantener la app gratuita, estatica y compatible con GitHub Pages.
- Priorizar claridad funcional antes de redisenar la estetica.
- Separar datos, validacion, arquitectura de prompt y UI.
- No prometer automatizaciones que requieren backend o integraciones externas.
- Evolucionar sin romper configuraciones JSON existentes cuando sea posible.


## Mejoras funcionales detectadas en prueba visual

### Resuelto en parche fix 3 problemas

- Promoción / campaña ahora usa dos campos separados:
  - `Desde`: selector de fecha.
  - `Hasta`: selector de fecha.
- El prompt final expresa el rango como: `Período de campaña: desde AAAA-MM-DD hasta AAAA-MM-DD`.
- Se mantiene compatibilidad con datos anteriores que usen `promptOptions.campaignValidity`.
- El bloque externo de prestaciones visibles queda oculto durante el modo guiado.
- El resumen de institución muestra la frase institucional guardada.


### Resuelto en parche Adjuntos múltiples

- Se permite seleccionar varios archivos personalizados de una sola vez.
- La app captura múltiples nombres de archivo sin subirlos realmente.
- El prompt final y el checklist listan todos los archivos seleccionados.
- El prompt incluye la regla: si algún archivo listado no fue adjuntado en ChatGPT, la IA debe pedirlo por nombre exacto antes de generar y no debe crear la pieza hasta recibirlo.


### Resuelto en parche Orden prestaciones

- Prestaciones visibles, datos visibles y puntos visibles pueden ordenarse manualmente.
- Se agregan botones `Subir` / `Bajar` para accesibilidad.
- Se agrega soporte de arrastrar y soltar.
- El prompt final respeta el orden exacto elegido por el usuario.


### Resuelto en parche Campos vacíos y desplegables

- Campos manuales de profesional, matrícula, especialidad visible y observaciones quedan vacíos por defecto.
- Los valores sugeridos se mantienen en desplegables, no como texto libre precargado.
- `Título` profesional y `Texto para turnos` permiten `Otro / Personalizar`.
- El campo manual de personalización solo se muestra cuando se elige esa opción.


### Pendiente

- Revisar si otros flujos futuros piden períodos y aplicar el mismo patrón `Desde` / `Hasta` donde corresponda.

## Fase 0: Documentacion

Estado: en curso.

Objetivo:

- Definir especificacion funcional.
- Definir roadmap.
- Definir modelo de datos interno.
- Definir arquitectura del prompt.
- Definir estrategia realista de adjuntos.
- Definir checklist manual de pruebas.

Entregables:

- `docs/PRODUCT_SPEC.md`
- `docs/ROADMAP.md`
- `docs/DATA_MODEL.md`
- `docs/PROMPT_ARCHITECTURE.md`
- `docs/ATTACHMENTS_STRATEGY.md`
- `docs/TESTING_CHECKLIST.md`

Criterio de cierre:

- La documentacion distingue estado actual y comportamiento propuesto.
- Las siguientes fases pueden implementarse sin redefinir conceptos clave.

## Fase 1: Modelo funcional

Objetivo:

- Migrar el estado interno hacia un modelo mas claro y robusto.
- Separar `professional`, `specialty`, `schedule`, `coverage`, `attachments` y `promptOptions`.
- Mantener compatibilidad con datos existentes del prototipo.

Trabajos previstos:

- Crear adaptador de migracion desde el estado actual.
- Distinguir especialidad profesional, orientaciones adicionales, enfoque comunicacional y texto visible.
- Normalizar horarios, redes, prestaciones y adjuntos.
- Definir version del esquema JSON.

Criterio de cierre:

- Exportar/importar JSON funciona con el nuevo modelo.
- Configuraciones antiguas pueden cargarse o migrarse de forma segura.

## Fase 2: Validacion inteligente

Objetivo:

- Agregar revision previa antes de copiar el prompt.
- Detectar contradicciones y redundancias relevantes.

Trabajos previstos:

- Clasificar validaciones por severidad: bloqueante, advertencia, sugerencia.
- Detectar conflicto entre especialidad profesional y enfoque comunicacional.
- Detectar especialidades adicionales repetidas o iguales a la principal.
- Detectar area destacada ambigua.
- Detectar falta de datos minimos visibles.
- Detectar adjuntos marcados como necesarios pero no seleccionados.
- Mostrar resumen de revision antes de copiar.

Criterio de cierre:

- El usuario recibe advertencias accionables antes de copiar.
- Las advertencias no impiden trabajar cuando no hay riesgo fuerte.

## Fase 3: Adjuntos

Objetivo:

- Mejorar el flujo manual de archivos sin backend.

Trabajos previstos:

- Mostrar miniaturas locales cuando el navegador lo permita.
- Guardar metadatos, no contenido de archivos.
- Mantener checklist explicito de adjuntos.
- Permitir etiquetas por archivo: logo, foto profesional, referencia, imagen tematica.
- Generar instrucciones de asignacion de archivos dentro del prompt.
- Evaluar paquete descargable opcional con prompt TXT y JSON.

Criterio de cierre:

- El usuario sabe exactamente que adjuntar en ChatGPT y en que orden.
- La app no sugiere que puede subir archivos automaticamente.

## Fase 4: Motor de prompts

Objetivo:

- Convertir el prompt en bloques modulares y menos redundantes.

Trabajos previstos:

- Crear builder por bloques: rol, formato, estilo, datos, especialidad, adjuntos, restricciones y salida.
- Omitir bloques vacios o irrelevantes.
- Mantener reglas fijas criticas.
- Incluir resumen de coherencia semantica.
- Permitir salida breve, equilibrada o detallada.

Criterio de cierre:

- El prompt es claro, estable y facil de auditar.
- Las reglas fijas aparecen una sola vez o en lugares justificados.

## Fase 5: Modos de contenido

Objetivo:

- Implementar densidades de prompt y de texto visible.

Modos propuestos:

- Breve: prompt compacto, ideal para flyers simples o datos ya conocidos.
- Equilibrado: modo recomendado, suficiente detalle sin exceso.
- Detallado: maximo control, util cuando hay muchas restricciones o adjuntos.

Trabajos previstos:

- Agregar `promptOptions.contentDensity`.
- Definir que bloques cambian con cada modo.
- Ajustar longitud de instrucciones y cantidad de contexto.
- Probar que las reglas criticas no desaparezcan en modo breve.

Criterio de cierre:

- Los tres modos producen prompts validos y diferenciados.

## Fase 6: Rediseno visual

Objetivo:

- Mejorar estetica, jerarquia y facilidad de uso sin cambiar la logica ya cerrada.

Trabajos previstos:

- Redisenar layout para uso repetido.
- Mejorar navegacion entre secciones.
- Agregar estados claros de validacion.
- Mejorar responsive movil.
- Usar miniaturas y controles mas ergonomicos.
- Evitar cambios funcionales simultaneos salvo ajustes necesarios.

Criterio de cierre:

- La app se ve mas profesional y es mas rapida de usar.
- No se rompe el modelo ni el prompt.

## Fase 7: Publicacion estable

Objetivo:

- Dejar una version confiable publicada en GitHub Pages.

Trabajos previstos:

- Checklist completo de pruebas manuales.
- Revision de README.
- Versionar esquema JSON.
- Confirmar rutas relativas compatibles con GitHub Pages.
- Probar en navegador movil y escritorio.
- Preparar notas de version.

Criterio de cierre:

- La version publicada puede usarse como herramienta estable.
- Hay documentacion suficiente para mantenimiento futuro.

### Videos animados - base estructural completada

- Agregar configuración rápida al activar `Solicitar pieza animada`.
- Modos definidos: `Desde cero`, `Basado en material`, `Híbrido`.
- Prompt de video separado del prompt de imagen.
- Material de apoyo para video usa la misma lógica visual de adjuntos múltiples.
- Interacción mínima para el usuario y detalle máximo para Gemini/ChatGPT.

### Videos animados - próximos ajustes

- Probar prompts reales en Gemini.
- Ajustar duración real, música, subtítulos, ritmo y legibilidad según resultados.
- Refinar instrucciones para material grabado por profesionales.
- Agregar presets específicos por tipo de pieza si hace falta.
