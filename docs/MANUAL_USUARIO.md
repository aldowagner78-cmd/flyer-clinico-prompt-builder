# Manual de usuario

Versión interactiva: `docs/manual-usuario.html`

## Qué es la app

La app genera prompts médicos promocionales para crear imágenes, flyers, infografías, campañas y videos/animaciones en plataformas externas como ChatGPT, Gemini, CapCut o Canva.

La app no sube archivos reales. Solo copia nombres de archivos para incluirlos en el prompt.

## Abrir la app

- Desde GitHub Pages: abrir la URL publicada.
- Local: desde la raíz del proyecto ejecutar `py -m http.server 8000` y abrir `http://127.0.0.1:8000/`.

## Instalar como PWA

En Android con Chrome:
1. Abrir la página publicada.
2. Tocar el menú de tres puntos.
3. Elegir `Agregar a pantalla principal` o `Instalar app`.

En escritorio con Chrome o Edge:
1. Abrir la página publicada.
2. Usar la opción de instalar app del navegador.

## Flujo básico

1. Comenzar asistente.
2. Cargar o crear institución.
3. Elegir tipo de pieza.
4. Completar contenido.
5. Ajustar diseño.
6. Ir a Resultado.
7. Copiar prompt o abrir plataforma externa.

## Institución

La institución guarda nombre, contacto, redes, frase institucional y logo. El logo se recuerda con la institución. Los demás adjuntos no se recuerdan entre sesiones.

## Imagen / flyer

Completar el contenido guiado y luego ajustar formato, colores, estilo visual, tipografía, iconos, fondo y recursos.

## Video / animación

Al activar `Solicitar pieza animada / video`, elegir:
- Desde cero.
- Basado en material.
- Híbrido.

Luego configurar destino, duración, estilo de movimiento, música, estructura y mensaje final.

## Adjuntos

La app no sube archivos. Copia nombres para que el prompt indique qué archivos necesita. Si el usuario no sube esos archivos en la plataforma externa, la IA debe pedirlos por nombre exacto antes de trabajar.

## Resultado

- `Copiar prompt`: copia el prompt final.
- `ChatGPT`, `Gemini`, `CapCut`, `Canva`: copian el prompt y abren la plataforma en otra pestaña.
- El usuario debe pegar manualmente con `Ctrl + V` o la opción `Pegar`.

## Corregir sugerencias

En Resultado, tocar `Corregir`, editar el campo indicado y luego usar `Volver al resultado`.

## Problemas frecuentes

- Si no se ven cambios: usar `Ctrl + F5`.
- Si una plataforma no pega automáticamente: pegar manualmente.
- Si faltan archivos: subirlos con el mismo nombre mencionado en el prompt.
- Si un video queda corto: reducir texto y usar mensaje final más breve.
