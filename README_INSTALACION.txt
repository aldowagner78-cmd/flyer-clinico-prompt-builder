# Instalación y uso - Parche fix Promoción / campaña

## Requisitos

- Node.js instalado.
- npm instalado.
- Navegador compatible: Chrome, Firefox o Edge.
- Para pruebas automatizadas: navegadores de Playwright instalados.

## Qué contiene este parche

Corrige el flujo guiado de **Promoción / campaña**:

- Oculta el bloque externo "Prestaciones visibles en el flyer" mientras se usa el contenido guiado.
- Muestra los puntos/datos visibles solamente dentro de la tarjeta correspondiente del wizard.
- Permite agregar y quitar datos visibles personalizados dentro de esa tarjeta.
- Evita que el usuario vea un bloque fuera de contexto debajo de "Condiciones y CTA".
- Mantiene el "Formulario completo" como respaldo.
- Agrega una prueba automatizada específica para validar que no aparezca el bloque externo en promoción/campaña.

También deja agendada una mejora funcional pendiente:

- Reemplazar campos de "Fecha o período" por dos selectores: "Desde" y "Hasta".

Conserva lo ya incorporado:

- 11D.2: Contenido guiado por tarjetas según tipo de pieza.
- 11D.3: Diseño guiado por tarjetas.
- 11D.4: Resultado final más claro y asistido.
- Modo demo con datos ficticios.

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
5. En Promoción / campaña, verificá que los puntos visibles aparezcan solo en su tarjeta.
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
