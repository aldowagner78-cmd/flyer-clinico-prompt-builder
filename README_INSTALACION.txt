Parche Etapa 10T.2 - corrección robusta del botón Gestionar instituciones

Diagnóstico:
- El panel #institutionActionsPanel seguía con atributo hidden después de hacer clic.
- La corrección no busca pasar el test artificialmente: hace robusto el comportamiento real.
- Agrega un controlador delegado global y centraliza la apertura/cierre del panel en toggleInstitutionActionsPanel().
- Mantiene el panel cerrado por defecto y lo abre solo cuando el usuario toca Gestionar instituciones.

Aplicar:
Expand-Archive -Path etapa10t2_fix_toggle_instituciones_patch.zip -DestinationPath . -Force

Validar:
node --check src/app.js

Probar:
npm test
