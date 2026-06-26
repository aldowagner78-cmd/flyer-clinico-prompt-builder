# Instalación y uso - Parche Etapa 11D.3

## Requisitos

- Node.js instalado.
- npm instalado.
- Navegador compatible: Chrome, Firefox o Edge.
- Para pruebas automatizadas: navegadores de Playwright instalados.

## Qué contiene este parche

Implementa la Etapa 11D.3:

- Diseño guiado por tarjetas.
- Tarjeta de formato.
- Tarjeta de colores institucionales o personalizados.
- Tarjeta de estilo visual e impacto.
- Tarjeta de tipografía y densidad.
- Tarjeta de iconos, fondo y recursos según especialidad.
- Tarjeta de modo animado.
- Tarjeta de imágenes personalizadas para GPT.
- Botón de respaldo "Formulario completo".
- Pruebas automatizadas nuevas para el flujo de diseño guiado.

También conserva lo ya incorporado en 11D.2:

- Contenido guiado por tarjetas según tipo de pieza.
- Formulario completo como respaldo en Contenido.
- Modo demo con datos ficticios por tipo de pieza.

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
4. En "Contenido", completá las tarjetas guiadas.
5. En "Diseño", completá las tarjetas guiadas.
6. Si necesitás ver todo junto, tocá "Formulario completo".
7. Revisá "Resultado" y copiá el prompt.

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
tar -a -c -f .\flyer-clinico-prompt-builder.zip --exclude="./node_modules" --exclude="./.git" --exclude="./dist" --exclude="./build" --exclude="./coverage" --exclude="./playwright-report" --exclude="./test-results" --exclude="./.venv" --exclude="./venv" --exclude="./__pycache__" --exclude="*.pyc" --exclude="*.zip" .
```

Linux, desde la raíz del proyecto:

```bash
zip -r flyer-clinico-prompt-builder.zip . \
  -x "*/node_modules/*" "*/.git/*" "*/dist/*" "*/build/*" \
     "*/coverage/*" "*/playwright-report/*" "*/test-results/*" \
     "*/.venv/*" "*/venv/*" "*/__pycache__/*" "*.pyc" "*.zip"
```

## Problemas frecuentes

- Si `npm test` falla por navegadores faltantes, ejecutá `npx playwright install`.
- Si el formulario no muestra cambios, recargá con Ctrl+F5.
- Si hay datos viejos guardados, usá "Limpiar" o abrí una ventana privada.
- No subas `node_modules`, `.git`, `playwright-report`, `test-results` ni ZIPs al repositorio.
