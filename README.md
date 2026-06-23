# Flyer Clinico Prompt Builder

App web estatica para generar prompts completos de flyers clinicos para ChatGPT. Funciona sin backend, sin APIs externas y sin subir imagenes a internet.

## Como abrir localmente

Abri `index.html` directamente en el navegador. La app usa HTML, CSS y JavaScript vanilla con modulos ES6, por lo que tambien puede servirse con cualquier servidor estatico si tu navegador restringe modulos desde archivos locales.

## Como publicar en GitHub Pages

1. Subi estos archivos a un repositorio de GitHub.
2. En GitHub, entra a `Settings > Pages`.
3. Elegi la rama principal y la carpeta raiz.
4. Guarda la configuracion y espera que GitHub Pages publique la URL.

## Estructura

```text
index.html
README.md
assets/css/styles.css
src/app.js
src/data/defaultClinic.js
src/data/specialties.js
src/data/designPresets.js
src/state/storage.js
src/ui/formRenderer.js
src/ui/previewRenderer.js
src/ui/validation.js
src/prompt/promptBuilder.js
```

## Privacidad

Todo se procesa en el navegador. Los datos se guardan en `localStorage` del dispositivo. Las imagenes seleccionadas solo se usan para mostrar el nombre del archivo y recordar que deben adjuntarse manualmente en ChatGPT.

## Funciones incluidas

- Formulario guiado por secciones.
- Presets prudentes por especialidad.
- Especialidad principal, especialidades adicionales y area destacada del flyer.
- Redes sociales multiples con tipo y usuario/URL.
- Horarios flexibles por dia en filas repetibles.
- Colores sugeridos por nombre, con opcion "Otro...".
- Checklist de archivos adjuntos para copiar antes de pegar el prompt.
- Validacion visual de campos recomendados.
- Prompt generado en espanol.
- Copiar prompt y descargar TXT.
- Guardar y cargar plantilla local.
- Exportar e importar configuracion JSON.
- Diseno responsive para computadora, tablet y celular.

## Futuras mejoras

- Soporte para multiples clinicas predeterminadas.
- Historial de prompts generados.
- Plantillas visuales por tipo de campana.
- Modo de impresion o version compacta del prompt.
