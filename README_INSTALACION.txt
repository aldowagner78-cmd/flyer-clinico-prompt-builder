# Instalación y uso - Fix orden prestaciones y título Odont.

## Qué corrige este parche

- Corrige el timeout del test de orden de prestaciones en escritorio.
- Mantiene la validación de que el prompt respeta el orden definido.
- Agrega `Odont.` como opción de título en Flyer profesional.
- No toca la lógica de adjuntos múltiples.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
`2 passed`

## Prueba visual

- Ir a `Flyer profesional > Profesional > Título`.
- Confirmar que aparece `Odont.`.

## Prueba completa antes de commit

```powershell
npm test
```

---

# Instalación y uso - Etapa orden prestaciones

## Qué agrega este parche

- Permite ordenar manualmente prestaciones, datos visibles y puntos visibles.
- Agrega botones `Subir` y `Bajar` para accesibilidad.
- Mantiene botón `Quitar`.
- Permite arrastrar y soltar los ítems visibles cuando el navegador lo soporte.
- El prompt final respeta exactamente el orden definido por el usuario.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "permite ordenar prestaciones visibles" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
`2 passed`

## Prueba completa antes de commit

```powershell
npm test
```

---

# Instalación y uso - Fix texto de navegación guiada

## Qué corrige este parche

- Cambia todos los botones `Siguiente tarjeta` por `Siguiente`.
- Mantiene intactos los atributos y la lógica de navegación del wizard.
- No toca la lógica de adjuntos, logo institucional ni foto profesional.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados|promoción usa fechas desde y hasta con selectores de fecha|muestra diseño guiado" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
tests puntuales pasando sin errores.

---

# Instalación y uso - Fix limpieza adjuntos y sesión

## Qué corrige este parche

- Quita el botón inútil `Adjuntar archivos` dentro de cada fila ya creada.
- Mantiene el botón principal `Adjuntar archivos` para copiar nombres de varios archivos de referencia.
- Evita recordar adjuntos transitorios entre sesiones:
  - referencias visuales,
  - adjuntos manuales,
  - foto profesional.
- Conserva únicamente el logo institucional guardado en la institución.
- No sube archivos reales: solo copia nombres para que el prompt los liste y ChatGPT los pida si faltan.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
`2 passed`

---

# Instalación y uso - Fix UX adjuntos múltiples

## Qué corrige este parche

- Cambia el botón principal a `Adjuntar archivos`.
- Mantiene la regla clave: la app no sube archivos reales, solo copia nombres de referencia para el prompt.
- Oculta el control nativo `Browse / No files selected` en las filas de adjuntos múltiples.
- Muestra cada archivo como `Archivo referido: nombre.ext`.
- Convierte `Instrucción para GPT` en desplegable con opciones predefinidas y `Otro / Personalizar`.
- Amplía las opciones de `Rol` para referencias visuales sin tocar la lógica de logo institucional ni foto profesional, que siguen siendo adjuntos individuales.
- Aplica a las secciones de adjuntos múltiples, incluyendo imágenes personalizadas y adjuntos manuales.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
`2 passed`

---

# Instalación y uso - Fix adjuntos múltiples

## Qué corrige este parche

- La app no sube archivos reales: solo copia nombres de archivos para agregarlos al prompt.
- Los nombres capturados desde selectores múltiples quedan visibles en el formulario.
- El prompt indica que, si faltan archivos adjuntos en ChatGPT, la IA debe pedirlos por nombre exacto antes de generar.
- Se mantiene compatibilidad con el checklist final de adjuntos.

## Prueba puntual recomendada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome
```

Resultado esperado:
`2 passed`

---

# Instalación y uso - Parche fix 3 problemas

## Requisitos

- Node.js instalado.
- npm instalado.
- Navegador compatible: Chrome, Firefox o Edge.
- Para pruebas automatizadas: navegadores de Playwright instalados.

## Qué contiene este parche

Corrige 3 problemas detectados en prueba visual:

- Oculta de forma robusta el bloque externo "Prestaciones visibles en el flyer" mientras se usa el contenido guiado.
- Mantiene los puntos/datos visibles solamente dentro de la tarjeta correspondiente del wizard.
- Reemplaza "Fecha o período" en Promoción / campaña por dos selectores de fecha: "Desde" y "Hasta".
- El prompt final expresa el rango como `Período de campaña: desde AAAA-MM-DD hasta AAAA-MM-DD`.
- Corrige el guardado/resumen de la frase institucional cuando se elige una frase predefinida.
- Agrega pruebas automatizadas para rango de fechas y frase institucional guardada.

Conserva lo ya incorporado:

- 11D.2: Contenido guiado por tarjetas según tipo de pieza.
- 11D.3: Diseño guiado por tarjetas.
- 11D.4: Resultado final más claro y asistido.
- Modo demo con datos ficticios.


## Parche visual posterior

Este parche corrige el acabado visual de Promoción / campaña:

- `Desde` y `Hasta` usan selectores de fecha con estilo consistente.
- En escritorio aparecen lado a lado y con ancho reducido.
- En móvil se apilan para mantener usabilidad táctil.
- Se eliminan los botones de navegación duplicados debajo del wizard.
- Se oculta el contenedor vacío que quedaba como residuo visual bajo la tarjeta.

Prueba puntual recomendada antes de la batería completa:

```powershell
npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha|muestra diseño guiado y mantiene Formulario completo como respaldo" --project=chromium-desktop --project=mobile-chrome
```



## Adjuntos múltiples

Este parche agrega una mejora funcional:

- En Diseño, el bloque "Imágenes personalizadas para GPT" permite elegir varios archivos de una sola vez.
- En Adjuntos manuales, también se pueden elegir varios archivos.
- La app no sube archivos ni guarda contenido: solo captura nombres locales para armar el prompt y el checklist.
- Si una fila ya existe y se eligen varios archivos, el primero completa esa fila y los demás se agregan como adjuntos nuevos.
- El prompt final incluye la regla: si falta algún archivo listado, ChatGPT debe pedirlo por nombre exacto antes de generar y no debe crear la pieza hasta recibirlo.

Prueba puntual recomendada:

```powershell
npx playwright test tests/app.spec.js -g "captura varios archivos personalizados" --project=chromium-desktop --project=mobile-chrome
```


## Instalación

Ruta Windows PowerShell:

```powershell
cd C:\Users\usuario\Desktop\flyer-clinico-prompt-builder
```

Comando:

```powershell
npm install
```

Ruta Linux:

```bash
cd ~/Escritorio/flyer-clinico-prompt-builder
```

Comando:

```bash
npm install
```

## Ejecución local

Ruta:

```bash
cd ruta/del/proyecto
```

Comando:

```bash
npx http-server . -p 4173 -c-1
```

Abrir en el navegador:

```text
http://127.0.0.1:4173
```

## Uso básico

1. Tocá "Comenzar asistente".
2. Cargá o creá una institución.
3. Elegí el tipo de pieza.
4. Completá Contenido guiado.
5. En Promoción / campaña, cargá el período con los campos Desde y Hasta y verificá que los puntos visibles aparezcan solo en su tarjeta.
6. Completá Diseño guiado.
7. Revisá el panel "Revisión final".
8. Si hay adjuntos, subilos manualmente en ChatGPT.
9. Tocá "Copiar prompt revisado".
10. Pegá el prompt en ChatGPT después de adjuntar los archivos indicados.

## Modo demo

El botón "Cargar ejemplo de este tipo" carga datos ficticios identificables para probar sin datos reales. Cada tipo de pieza tiene un ejemplo propio.

## Pruebas

Ruta:

```bash
cd ruta/del/proyecto
```

Comando principal:

```bash
npm test
```

Si Playwright indica que faltan navegadores:

```bash
npx playwright install
npm test
```

## Empaquetar ZIP limpio

Windows PowerShell, desde la raíz del proyecto:

```powershell
tar -a -c -f .\flyer-clinico-prompt-builder_fix_promocion_prestaciones_ok.zip --exclude="./node_modules" --exclude="./.git" --exclude="./dist" --exclude="./build" --exclude="./coverage" --exclude="./playwright-report" --exclude="./test-results" --exclude="./.venv" --exclude="./venv" --exclude="./__pycache__" --exclude="*.pyc" --exclude="*.zip" .
```

Linux, desde la raíz del proyecto:

```bash
zip -r flyer-clinico-prompt-builder_fix_promocion_prestaciones_ok.zip . \
  -x "*/node_modules/*" "*/.git/*" "*/dist/*" "*/build/*" \
     "*/coverage/*" "*/playwright-report/*" "*/test-results/*" \
     "*/.venv/*" "*/venv/*" "*/__pycache__/*" "*.pyc" "*.zip"
```

## Problemas frecuentes

- Si `npm test` falla porque faltan navegadores, ejecutar `npx playwright install`.
- Si GitHub Pages tarda en mostrar cambios, esperar 1 a 3 minutos y recargar con `Ctrl + F5`.
- Si el resultado indica adjuntos, ChatGPT no los recibirá automáticamente: hay que subirlos manualmente antes de pegar el prompt.

## Checklist manual

- La app inicia sin errores.
- El asistente mantiene 5 pasos visibles.
- Contenido guiado funciona.
- Diseño guiado funciona.
- Resultado muestra revisión final.
- El checklist de adjuntos queda visible.
- El botón de copiar está destacado.
- Las advertencias se muestran antes de copiar.
- `npm test` pasa.

## Prueba rápida de fix de fechas de campaña

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
`npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha" --project=chromium-desktop --project=mobile-chrome`

Resultado esperado:
Deben pasar solo los 2 tests de fechas de campaña. Antes de commit, ejecutar `npm test`.

## Prueba rápida de fix visual de período y navegación guiada

Ruta:
`C:\Users\usuario\Desktop\flyer-clinico-prompt-builder`

Comando:
`npx playwright test tests/app.spec.js -g "promoción usa fechas desde y hasta con selectores de fecha" --project=chromium-desktop --project=mobile-chrome`

Resultado esperado:
Deben pasar los 2 tests de campaña. Verificar visualmente que `Desde` y `Hasta` estén bajo el título `Período de campaña`, lado a lado en escritorio y sin botones inferiores duplicados en modo guiado.

