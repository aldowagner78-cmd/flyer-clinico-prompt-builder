# Product Spec: Flyer Clinico Prompt Builder

## Objetivo

Flyer Clinico Prompt Builder es una app estatica, gratuita y sin backend para construir prompts completos y consistentes para ChatGPT. Su objetivo es ayudar a crear flyers clinicos para Instagram, WhatsApp y redes sociales a partir de datos cargados por el usuario: clinica, profesional, especialidad, prestaciones, horarios, cobertura, estilo visual y adjuntos locales.

La app no genera imagenes por si misma. Genera un prompt listo para copiar y pegar en ChatGPT, junto con instrucciones para adjuntar manualmente los archivos necesarios.

## Usuarios previstos

- Personal administrativo de clinicas, consultorios y centros medicos.
- Profesionales de salud que publican contenido propio en redes.
- Disenadores o asistentes que necesitan ordenar informacion clinica antes de pedir una pieza visual a ChatGPT.
- Usuarios sin conocimientos tecnicos que necesitan un flujo guiado, prudente y repetible.

## Estado actual

El prototipo actual incluye:

- Formulario por secciones.
- Datos de clinica, profesional, prestaciones, atencion, diseno, imagenes y observaciones avanzadas.
- Especialidad principal, especialidades adicionales y area destacada del flyer.
- Redes sociales multiples.
- Horarios multiples.
- Seleccion local de imagenes por nombre de archivo.
- Checklist de adjuntos.
- Validacion visual de campos recomendados y algunas advertencias.
- Prompt generado en espanol.
- Copiar prompt, copiar checklist, descargar TXT.
- Guardar y cargar plantilla en `localStorage`.
- Exportar e importar JSON.
- Compatibilidad con GitHub Pages.

## Diseno propuesto

La siguiente etapa debe ordenar el modelo funcional antes de redisenar la interfaz. El cambio principal es distinguir cuatro conceptos que hoy pueden mezclarse:

- Especialidad profesional real: formacion o especialidad declarada del profesional.
- Orientaciones adicionales: areas relacionadas o complementarias que pueden aparecer como contexto.
- Enfoque comunicacional del flyer: tema principal de la pieza, por ejemplo "control cardiologico preventivo".
- Texto visible recomendado: texto concreto que deberia aparecer en el flyer si el usuario quiere controlar la rotulacion.

## Flujo principal

1. El usuario carga datos institucionales de la clinica.
2. Carga datos del profesional.
3. Define especialidad profesional, orientaciones adicionales y enfoque comunicacional.
4. Carga prestaciones visibles y decide si autoriza ampliacion prudente.
5. Carga horarios, cobertura, modalidad y datos administrativos.
6. Define formato, colores y estilo visual.
7. Selecciona adjuntos locales y revisa el checklist.
8. La app valida coherencia, faltantes y posibles contradicciones.
9. El usuario revisa advertencias antes de copiar.
10. La app genera un prompt con densidad breve, equilibrada o detallada.
11. El usuario adjunta manualmente los archivos en ChatGPT y pega el prompt.

## Secciones del formulario

### Clinica

Datos institucionales y administrativos:

- Nombre.
- Direccion.
- Telefono o WhatsApp.
- Redes sociales.
- Frase institucional.
- Logo opcional.
- Opcion para mostrar u ocultar datos de contacto.

### Profesional

Identidad profesional:

- Titulo.
- Nombre completo.
- Especialidad profesional real.
- Matricula.
- Cargo o aclaracion.
- Foto opcional.
- Opcion para mostrar u ocultar foto.

### Especialidad y enfoque

Definicion semantica del flyer:

- Especialidad profesional principal.
- Especialidades u orientaciones adicionales.
- Enfoque comunicacional.
- Texto visible recomendado.
- Prestacion principal destacada.
- Lista de prestaciones visibles.
- Autorizacion o rechazo de ampliacion de prestaciones.

### Atencion

Datos de agenda y modalidad:

- Horarios multiples.
- Modalidad presencial, virtual o ambas.
- Requiere turno previo.
- Texto personalizado para turnos.
- Cobertura por obra social.
- Atencion particular.
- Observaciones administrativas.

### Diseno

Preferencias visuales:

- Formato.
- Colores.
- Estilo visual.
- Tipografia sugerida.
- Nivel de impacto visual.
- Uso de iconos medicos.
- Fondo tematico.
- Uso de estetica de conversacion anclada.

### Adjuntos

Archivos seleccionados localmente:

- Logo.
- Foto del profesional.
- Referencia visual.
- Imagen tematica opcional.

La app debe recordar que estos archivos se adjuntan manualmente en ChatGPT. No debe prometer subida automatica.

### Resultado

Revision y salida final:

- Checklist de datos.
- Checklist de adjuntos.
- Advertencias.
- Prompt generado.
- Copiar prompt.
- Descargar TXT.
- Exportar o importar JSON.

## Reglas funcionales

- La app debe funcionar sin backend, sin cuenta, sin base de datos y sin APIs externas.
- Todo dato se procesa en el navegador.
- Los archivos locales no deben subirse automaticamente.
- El prompt debe evitar contradicciones entre especialidad real, orientaciones adicionales y enfoque del flyer.
- El prompt debe evitar redundancias innecesarias.
- La app debe advertir antes de copiar si detecta incoherencias relevantes.
- Las prestaciones medicas no deben inventarse ni exagerarse.
- La ampliacion de prestaciones solo puede ocurrir si el usuario la autoriza.
- Los datos administrativos no deben modificarse en el prompt.
- El formato historia o estado debe incluir la regla de que todo debe verse completo en una sola pantalla de celular, sin scroll.
- La salida final pedida a ChatGPT debe ser exactamente 2 alternativas como imagenes separadas e independientes.

## Que hace la app

- Ordena informacion clinica y comercial.
- Detecta faltantes e incoherencias basicas.
- Construye prompts claros y accionables para ChatGPT.
- Ayuda a preparar adjuntos mediante checklist.
- Permite guardar, exportar e importar configuraciones locales.
- Funciona en GitHub Pages.

## Que no hace la app

- No crea flyers directamente.
- No llama a la API de OpenAI.
- No sube archivos a ChatGPT.
- No aloja imagenes.
- No valida matriculas profesionales contra registros oficiales.
- No garantiza exactitud medica de datos ingresados por el usuario.
- No reemplaza revision profesional, legal o institucional.
- No debe diagnosticar ni sugerir informacion clinica no cargada.

## Restricciones

- Tecnologia base: HTML, CSS y JavaScript vanilla.
- Publicacion: GitHub Pages.
- Persistencia: `localStorage` y archivos JSON exportables.
- Sin backend.
- Sin dependencias obligatorias de pago.
- Interfaz pensada para escritorio y movil.
- Documentacion y arquitectura deben permitir evolucion modular sin romper datos existentes.

## Criterios de exito

- El usuario entiende que informacion esta cargando y por que.
- El prompt final es menos redundante y mas consistente.
- Las contradicciones se detectan antes de copiar.
- El flujo de adjuntos es claro aunque siga siendo manual.
- La app conserva su simplicidad estatica y gratuita.
- El modelo interno queda listo para futuras mejoras visuales y funcionales.
