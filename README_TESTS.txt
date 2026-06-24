# Etapa 10T — Pruebas automatizadas

Este parche agrega pruebas locales con Playwright.

## Qué prueba

- La app abre sin errores.
- El asistente inicia en institución.
- El flujo visible queda reducido a 5 pasos:
  1. Institución
  2. Tipo
  3. Contenido
  4. Diseño
  5. Resultado
- Guardar/cargar institución funciona.
- Cada tarjeta genera un prompt de una sola imagen.
- No aparecen restos de “2 alternativas”.
- Al elegir Odontología, cambian las sugerencias por pieza.
- Flyer informativo/infografía/campaña no arrastran datos de profesional.
- El estilo Infantil está disponible.

## Aplicar

```powershell
Expand-Archive -Path etapa10t_pruebas_automatizadas_patch.zip -DestinationPath . -Force
```

## Instalar dependencias

Primera vez:

```powershell
npm install
npx playwright install chromium
```

## Ejecutar pruebas

```powershell
npm test
```

## Ver reporte

Si falla algo:

```powershell
npm run test:report
```

## Ejecutar viendo el navegador

```powershell
npm run test:headed
```

## Nota

Estas pruebas no publican nada ni modifican GitHub. Solo corren localmente.
