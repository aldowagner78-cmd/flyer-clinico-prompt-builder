# Testing Checklist

## Objetivo

Checklist manual para validar que Flyer Clinico Prompt Builder funciona correctamente como app estatica en HTML/CSS/JS vanilla y que el prompt generado es coherente, accionable y compatible con GitHub Pages.

Marcar cada item durante pruebas funcionales antes de publicar una version estable.

## Preparacion

- [ ] Abrir la app localmente.
- [ ] Abrir la consola del navegador.
- [ ] Confirmar que no hay errores iniciales de JavaScript.
- [ ] Limpiar estado anterior si la prueba requiere datos frescos.
- [ ] Probar en al menos un navegador Chromium.
- [ ] Probar en un viewport movil.

## Carga de clinica

- [ ] Cargar nombre de clinica.
- [ ] Cargar direccion.
- [ ] Cargar telefono o WhatsApp.
- [ ] Cargar frase institucional.
- [ ] Activar y desactivar "Mostrar datos de contacto".
- [ ] Confirmar que el resumen refleja los cambios.
- [ ] Confirmar que el prompt incluye datos de clinica sin modificarlos.
- [ ] Confirmar que un campo recomendado vacio aparece como advertencia.

## Redes multiples

- [ ] Agregar una red social.
- [ ] Completar tipo y usuario/URL.
- [ ] Agregar al menos tres redes distintas.
- [ ] Quitar una red.
- [ ] Confirmar que el prompt lista solo redes existentes.
- [ ] Dejar una red con tipo pero sin valor.
- [ ] Confirmar advertencia por red incompleta.

## Profesional

- [ ] Cargar titulo.
- [ ] Cargar nombre completo.
- [ ] Cargar especialidad declarada del profesional.
- [ ] Cargar matricula.
- [ ] Cargar cargo o aclaracion.
- [ ] Activar y desactivar mostrar foto.
- [ ] Confirmar que el prompt no inventa matricula si esta vacia.
- [ ] Confirmar que el prompt mantiene nombre y titulo sin alterarlos.

## Especialidades multiples

- [ ] Seleccionar especialidad principal.
- [ ] Confirmar que se aplican prestaciones sugeridas si corresponde al estado actual.
- [ ] Agregar una especialidad adicional distinta.
- [ ] Intentar agregar como adicional la misma especialidad principal.
- [ ] Confirmar que no se duplica.
- [ ] Agregar varias especialidades adicionales.
- [ ] Quitar una especialidad adicional.
- [ ] Confirmar que el prompt distingue principal y adicionales.

## Enfoque comunicacional

- [ ] Completar un enfoque compatible con la especialidad principal.
- [ ] Confirmar que el prompt lo trata como foco del flyer.
- [ ] Completar un enfoque mas especifico que la especialidad.
- [ ] Confirmar que el prompt no lo presenta como nueva especialidad profesional.
- [ ] Dejar el enfoque vacio.
- [ ] Confirmar que el prompt deriva un foco prudente o usa la especialidad.

## Incoherencias

- [ ] Cargar una especialidad principal y un area/enfoque claramente no relacionado.
- [ ] Confirmar que aparece advertencia.
- [ ] Confirmar que el campo conflictivo queda marcado visualmente si corresponde.
- [ ] Corregir el enfoque.
- [ ] Confirmar que la advertencia desaparece.
- [ ] Probar especialidades adicionales redundantes.
- [ ] Probar color personalizado sin valor.
- [ ] Probar horario incompleto.

## Prestaciones

- [ ] Cargar prestacion principal destacada.
- [ ] Agregar prestaciones visibles.
- [ ] Quitar prestaciones.
- [ ] Probar lista vacia con prestacion destacada.
- [ ] Probar lista vacia sin prestacion destacada.
- [ ] Activar ampliacion razonable.
- [ ] Cargar notas de ampliacion.
- [ ] Desactivar ampliacion.
- [ ] Confirmar que el prompt indica no ampliar prestaciones.
- [ ] Confirmar que el prompt no exagera prestaciones.

## Horarios multiples

- [ ] Agregar un horario completo.
- [ ] Agregar varios horarios.
- [ ] Usar dias distintos.
- [ ] Usar notas por horario.
- [ ] Quitar un horario.
- [ ] Dejar un horario incompleto.
- [ ] Confirmar advertencia por horario incompleto.
- [ ] Confirmar que el prompt no inventa horarios faltantes.

## Modalidad y cobertura

- [ ] Probar modalidad presencial.
- [ ] Probar modalidad virtual.
- [ ] Probar modalidad ambas.
- [ ] Activar y desactivar requiere turno previo.
- [ ] Cambiar texto personalizado para turnos.
- [ ] Activar y desactivar obra social.
- [ ] Activar y desactivar particulares.
- [ ] Confirmar que el prompt no inventa nombres de obras sociales.
- [ ] Confirmar que observaciones administrativas se conservan.

## Colores y diseno

- [ ] Cambiar formato.
- [ ] Probar formato historia Instagram.
- [ ] Confirmar regla de pantalla completa sin scroll.
- [ ] Probar formato estado WhatsApp.
- [ ] Confirmar regla de pantalla completa sin scroll.
- [ ] Cambiar color principal.
- [ ] Cambiar color secundario.
- [ ] Seleccionar "Otro" sin completar valor.
- [ ] Confirmar advertencia.
- [ ] Completar color personalizado.
- [ ] Confirmar que desaparece advertencia.
- [ ] Cambiar estilo visual.
- [ ] Cambiar tipografia.
- [ ] Cambiar impacto visual.
- [ ] Activar/desactivar iconos, fondo tematico y tematica automatica.

## Adjuntos

- [ ] Seleccionar logo.
- [ ] Seleccionar foto del profesional.
- [ ] Seleccionar imagen de referencia.
- [ ] Seleccionar imagen tematica.
- [ ] Confirmar que la lista de imagenes muestra los nombres.
- [ ] Confirmar que el checklist de adjuntos incluye cada archivo.
- [ ] Copiar checklist de adjuntos.
- [ ] Confirmar que el texto copiado contiene roles y nombres.
- [ ] Recargar la pagina.
- [ ] Confirmar comportamiento esperado de persistencia de nombres.
- [ ] Confirmar que la app no afirma que subio archivos a ChatGPT.
- [ ] En fase futura: confirmar miniaturas locales.
- [ ] En fase futura: confirmar advertencia al importar JSON con nombres de archivo sin archivos reales.

## Prompt generado

- [ ] Confirmar que el prompt se actualiza al cambiar campos.
- [ ] Confirmar que incluye datos de clinica.
- [ ] Confirmar que incluye datos del profesional.
- [ ] Confirmar que distingue especialidad principal, adicionales y enfoque.
- [ ] Confirmar que incluye prestaciones visibles.
- [ ] Confirmar que incluye horarios.
- [ ] Confirmar que incluye cobertura.
- [ ] Confirmar que incluye adjuntos seleccionados.
- [ ] Confirmar que no hay redundancias excesivas.
- [ ] Confirmar regla "exactamente 2 alternativas finales".
- [ ] Confirmar regla "cada alternativa como imagen separada e independiente".
- [ ] Confirmar regla "no collage, no grilla, no mockup multiple".
- [ ] Confirmar regla "no inventar datos medicos".
- [ ] Confirmar regla "no exagerar prestaciones".
- [ ] Confirmar regla "no modificar datos administrativos".

## Copiar prompt

- [ ] Copiar prompt con datos completos.
- [ ] Pegar en un editor de texto y confirmar contenido.
- [ ] Copiar prompt con advertencias activas.
- [ ] En fase futura: confirmar que aparece revision previa si corresponde.
- [ ] Confirmar fallback de copia si el navegador bloquea clipboard.

## Descargar TXT

- [ ] Descargar TXT del prompt.
- [ ] Abrir archivo descargado.
- [ ] Confirmar codificacion legible.
- [ ] Confirmar que el contenido coincide con el prompt visible.

## Exportar/importar JSON

- [ ] Exportar JSON con formulario completo.
- [ ] Abrir JSON y confirmar estructura valida.
- [ ] Limpiar formulario.
- [ ] Importar JSON exportado.
- [ ] Confirmar que se restauran datos.
- [ ] Confirmar que horarios multiples se restauran.
- [ ] Confirmar que redes multiples se restauran.
- [ ] Confirmar que prestaciones se restauran.
- [ ] Confirmar que adjuntos se restauran segun comportamiento actual.
- [ ] Importar JSON invalido.
- [ ] Confirmar mensaje de error sin romper la app.
- [ ] En fase futura: probar migracion desde modelo viejo a modelo nuevo.

## Guardar/cargar plantilla

- [ ] Guardar plantilla local.
- [ ] Modificar datos.
- [ ] Cargar plantilla.
- [ ] Confirmar que vuelve el estado guardado.
- [ ] Limpiar formulario.
- [ ] Confirmar que la plantilla guardada se mantiene o se comporta segun lo definido.

## Responsive movil

- [ ] Probar ancho aproximado 390 px.
- [ ] Confirmar que no hay textos superpuestos.
- [ ] Confirmar que los botones son tocables.
- [ ] Confirmar que formularios repetibles no rompen el layout.
- [ ] Confirmar que textarea del prompt es usable.
- [ ] Confirmar que la navegacion por secciones es clara.
- [ ] Probar orientacion vertical.
- [ ] Probar orientacion horizontal si aplica.

## GitHub Pages

- [ ] Publicar en GitHub Pages o probar build estatico equivalente.
- [ ] Confirmar que `index.html` carga correctamente.
- [ ] Confirmar que CSS carga con rutas relativas.
- [ ] Confirmar que JS modular carga con rutas relativas.
- [ ] Confirmar que no hay errores CORS por archivos locales.
- [ ] Confirmar que exportar/importar JSON funciona en Pages.
- [ ] Confirmar que copiar prompt funciona bajo HTTPS.
- [ ] Confirmar que no hay dependencias de backend.

## Prueba end-to-end recomendada

- [ ] Completar una clinica realista.
- [ ] Completar profesional con especialidad.
- [ ] Agregar una orientacion adicional.
- [ ] Cargar enfoque comunicacional compatible.
- [ ] Agregar tres prestaciones visibles.
- [ ] Cargar dos horarios.
- [ ] Cargar redes y WhatsApp.
- [ ] Elegir formato historia.
- [ ] Seleccionar color principal y secundario.
- [ ] Seleccionar adjuntos.
- [ ] Revisar advertencias.
- [ ] Copiar checklist.
- [ ] Copiar prompt.
- [ ] Descargar TXT.
- [ ] Exportar JSON.
- [ ] Importar JSON en una sesion limpia.
- [ ] Confirmar que el prompt final sigue siendo coherente.

## Criterio de aprobacion

- [ ] No hay errores de consola en flujo normal.
- [ ] La app funciona sin backend.
- [ ] El prompt respeta reglas medicas y administrativas.
- [ ] El flujo de adjuntos es manual pero claro.
- [ ] La experiencia movil es utilizable.
- [ ] La version publicada en GitHub Pages coincide con la version local.
