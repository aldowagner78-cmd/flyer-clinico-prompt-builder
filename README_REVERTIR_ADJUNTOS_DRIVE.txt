Parche para revertir el cambio de Adjuntos Drive.

Restaura los archivos al estado del ZIP revision_usabilidad_resultados_actual.zip, antes de agregar:
- Link directo al archivo
- Carpeta Drive contenedora
- Obligatorio si/no
- Validaciones de URL Drive

Aplicar en PowerShell:
Expand-Archive -Path revertir_adjuntos_drive_patch.zip -DestinationPath . -Force

Validar:
node --check src/app.js
node --check src/ui/formRenderer.js
node --check src/prompt/promptBuilder.js
node --check src/ui/previewRenderer.js
node --check src/ui/validation.js
node --check src/state/migrations.js
