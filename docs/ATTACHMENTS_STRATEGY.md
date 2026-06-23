# Attachments Strategy

## Objetivo

Definir una estrategia realista para adjuntos en una app estatica, gratuita y publicada en GitHub Pages. La app debe ayudar al usuario a preparar archivos para ChatGPT, pero no puede automatizar la subida ni transferirlos desde el navegador a una conversacion.

## Regla principal

No se automatiza la subida de archivos a ChatGPT.

Motivo:

- La app no tiene backend.
- GitHub Pages solo sirve archivos estaticos.
- No hay autenticacion con ChatGPT.
- No hay API ni permiso para adjuntar archivos a una conversacion del usuario.
- Subir o procesar imagenes requeriria otra arquitectura, costos, permisos y politicas de privacidad.

La experiencia correcta es manual y guiada:

1. El usuario selecciona archivos localmente en la app.
2. La app muestra nombres, miniaturas y checklist.
3. La app incluye instrucciones explicitas en el prompt.
4. El usuario abre ChatGPT.
5. Adjunta manualmente los archivos.
6. Pega el prompt generado.

## Estado actual

El prototipo actual:

- Permite seleccionar archivos locales.
- Guarda el nombre del archivo en el estado.
- Muestra una lista de imagenes seleccionadas.
- Genera un checklist de adjuntos.
- Indica en el prompt que los archivos deben adjuntarse manualmente.

Limitaciones actuales:

- No muestra miniaturas.
- No guarda metadatos detallados.
- No permite reordenar ni etiquetar archivos adicionales.
- No verifica si el usuario efectivamente adjunto archivos en ChatGPT.

## Estrategia propuesta

## Seleccion local de archivos

La app debe permitir seleccionar archivos para roles especificos:

- Logo de clinica.
- Foto del profesional.
- Imagen de referencia del flyer.
- Imagen tematica opcional.
- Otros adjuntos opcionales en una fase futura.

Datos guardables:

- Nombre del archivo.
- Tipo MIME si esta disponible.
- Tamano.
- Rol.
- Estado local de seleccion.
- Instruccion de uso en el prompt.

Datos que no deben persistirse por defecto:

- Contenido binario del archivo.
- Base64 completo en `localStorage`.
- URLs locales temporales.

## Vista previa de miniaturas

Propuesta:

- Mostrar miniatura local usando `URL.createObjectURL(file)`.
- Revocar la URL cuando el archivo cambie o se limpie.
- Mostrar fallback con nombre de archivo si no se puede previsualizar.

Reglas:

- La miniatura es solo local y temporal.
- La miniatura no prueba que ChatGPT recibira el archivo.
- Al exportar/importar JSON no se recupera la imagen, solo su metadato.

## Checklist de adjuntos

La app debe generar un checklist visible y copiables:

```text
Antes de pegar el prompt en ChatGPT, adjunta estos archivos:
- Logo de clinica: logo-clinica.png
- Foto del profesional: dra-gomez.jpg
- Imagen de referencia del flyer: referencia.png
```

Checklist recomendado en UI:

- Archivo seleccionado.
- Rol asignado.
- Estado: seleccionado / falta seleccionar / opcional.
- Instruccion: "Adjuntar manualmente en ChatGPT antes de pegar el prompt".

## Asignacion explicita en el prompt

El prompt debe decir como usar cada archivo:

```text
El usuario adjuntara manualmente estos archivos en ChatGPT antes de enviar el prompt:
- Logo de clinica: logo-clinica.png. Usarlo como marca institucional, respetando proporcion.
- Foto del profesional: dra-gomez.jpg. Integrarla sin deformar rostro ni alterar identidad.
- Imagen de referencia: referencia.png. Usarla como guia visual, no como fuente de datos administrativos.
```

Reglas:

- No asumir archivos que no estan seleccionados.
- No pedir que ChatGPT busque archivos por nombre.
- No decir que la app ya subio los archivos.
- No usar nombres de archivo como prueba de contenido clinico.

## Paquete descargable opcional

Propuesta futura:

- Descargar un `.zip` con:
  - `prompt.txt`
  - `config.json`
  - `checklist-adjuntos.txt`

Limitacion:

- Incluir las imagenes reales en el ZIP requiere conservar referencias `File` en memoria durante la sesion.
- No debe depender de `localStorage`.
- Es opcional y no reemplaza la subida manual a ChatGPT.

Alternativa simple sin ZIP:

- Descargar TXT del prompt.
- Exportar JSON de configuracion.
- Copiar checklist de adjuntos.

## Limites tecnicos

### GitHub Pages

- Sirve archivos estaticos.
- No ejecuta backend.
- No puede recibir ni almacenar archivos del usuario.
- No puede comunicarse directamente con una sesion privada de ChatGPT.

### Navegador

- Puede leer metadatos de archivos seleccionados localmente.
- Puede mostrar vista previa temporal.
- No debe acceder a archivos sin seleccion explicita del usuario.
- Puede perder referencias `File` al recargar la pagina.

### ChatGPT

- El usuario debe adjuntar archivos manualmente.
- La app no puede verificar desde GitHub Pages si los adjuntos fueron enviados.
- El prompt debe ser robusto ante adjuntos faltantes.

## Privacidad

Principios:

- Los archivos permanecen en el dispositivo hasta que el usuario decide adjuntarlos en ChatGPT.
- La app no sube imagenes a servidores propios.
- El estado persistido debe guardar metadatos minimos.
- La interfaz debe explicar claramente el alcance local de la seleccion.

Texto recomendado:

```text
Las imagenes seleccionadas solo se usan para ayudarte a recordar que adjuntar. No se suben desde esta app. Debes adjuntarlas manualmente en ChatGPT.
```

## Flujo recomendado para el usuario

1. Completar datos de clinica y profesional.
2. Elegir especialidad, enfoque y prestaciones.
3. Seleccionar logo, foto o referencias si corresponde.
4. Revisar miniaturas y checklist.
5. Copiar checklist si necesita preparar archivos.
6. Ir a ChatGPT.
7. Adjuntar manualmente los archivos listados.
8. Volver a la app y copiar el prompt.
9. Pegar el prompt en ChatGPT.
10. Confirmar que ChatGPT genero 2 imagenes separadas.

## Mensajes de advertencia recomendados

Sin archivos:

```text
No hay archivos seleccionados. El prompt se puede usar igual, pero ChatGPT no recibira logo, foto ni referencias visuales.
```

Archivos seleccionados:

```text
Seleccionaste archivos locales. Recorda adjuntarlos manualmente en ChatGPT antes de pegar el prompt.
```

JSON importado con nombres de archivo:

```text
El JSON importado incluye nombres de archivos, pero las imagenes reales no se importan. Seleccionalas nuevamente si queres usarlas.
```

## Criterio de exito

- El usuario entiende que la seleccion local no equivale a subir archivos.
- El prompt indica exactamente que archivo cumple que rol.
- La UI ayuda a revisar adjuntos sin prometer automatizacion.
- El flujo sigue siendo compatible con una app estatica gratuita.
