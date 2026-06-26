# Roadmap

## Principios

- Mantener la app gratuita, estatica y compatible con GitHub Pages.
- Priorizar claridad funcional antes de redisenar la estetica.
- Separar datos, validacion, arquitectura de prompt y UI.
- No prometer automatizaciones que requieren backend o integraciones externas.
- Evolucionar sin romper configuraciones JSON existentes cuando sea posible.


## Mejoras funcionales pendientes detectadas en prueba visual

- Cambiar los campos "Fecha o período" por dos campos separados:
  - `Desde`: selector de fecha.
  - `Hasta`: selector de fecha.
- Aplicar el cambio en Promoción / campaña y en cualquier otro flujo que pida período.
- El prompt final debe expresar el rango de forma clara, por ejemplo: `Período: desde AAAA-MM-DD hasta AAAA-MM-DD`.
- Mantener compatibilidad con datos anteriores que usen `promptOptions.campaignValidity`.

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
