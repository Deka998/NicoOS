NICO OS — PWA INSTALABLE
========================

Qué incluye esta versión:
- Interfaz optimizada para móvil / Xiaomi Redmi 13C.
- Icono y pantalla de arranque de Nico OS.
- Modo Obsidian / Midnight / Paper.
- Hora, clima de Santa Rosa (Open-Meteo) y enlace a alertas oficiales SMN.
- Agenda local persistente y alta de compromisos.
- D&D: métricas, checklist y generador rápido de cierre.
- Focus Timer + audio ambiental local.
- YouTube Music: acceso directo a "Tus Me gusta" y a la app/web de YouTube Music.
- Smart Inbox: snapshot inicial + acceso directo a Gmail.
- Noticias locales: intenta actualizar mediante feed público GDELT y mantiene fallback.
- Captura rápida de notas, guardadas en el teléfono.
- Funciona offline para la interfaz y datos locales gracias al Service Worker.

IMPORTANTE SOBRE YOUTUBE MUSIC
------------------------------
YouTube Music no ofrece actualmente una API pública oficial para leer automáticamente
las canciones marcadas como favoritas desde una PWA de terceros. Nico OS abre tu lista
"Tus Me gusta" mediante el enlace de YouTube Music (list=LM), que normalmente utiliza
la sesión ya iniciada en el teléfono. El control completo de la reproducción queda en
YouTube Music.

IMPORTANTE SOBRE GMAIL / CALENDAR / DRIVE
-----------------------------------------
Esta PWA no puede reutilizar directamente las conexiones privadas que existen dentro
de ChatGPT. Para leer Gmail/Calendar/Drive automáticamente desde Nico OS haría falta
un backend con OAuth de Google. En esta versión los accesos abren las aplicaciones
oficiales de forma segura.

CÓMO INSTALARLA EN ANDROID
--------------------------
Una PWA necesita estar publicada en HTTPS para que Android la instale como app.

Opción simple: GitHub Pages
1. Crear un repositorio nuevo, por ejemplo: nico-os
2. Subir TODO el contenido de esta carpeta (no la carpeta contenedora, sino los archivos).
3. En GitHub: Settings > Pages > Deploy from a branch > main / root.
4. Esperar la URL HTTPS de GitHub Pages.
5. Abrir esa URL en Chrome en el Xiaomi Redmi 13C.
6. Chrome > menú ⋮ > "Instalar aplicación" / "Añadir a pantalla principal".
7. Nico OS aparecerá con su propio icono y abrirá en modo standalone.

Para probarla en PC antes de publicarla:
- En esta carpeta ejecutar: python -m http.server 8080
- Abrir: http://localhost:8080

La próxima mejora recomendada es agregar un backend seguro para sincronización real
con Google Calendar/Gmail/Drive y, si se desea, un servicio propio para el briefing AI.
