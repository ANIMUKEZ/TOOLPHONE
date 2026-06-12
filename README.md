# StreamView Mobile 📱

Versión móvil del visualizador de streams OK.RU + chat de Twitch.  
Optimizada para **Safari iOS**, **Chrome Android** y **Brave Mobile**.

## Layout

```
┌──────────────────────┐
│  OK.RU · canal       │ ← topbar mínima con ⚙
├──────────────────────┤
│                      │
│   VIDEO  (16:9)      │ ← nunca se corta
│   sin scroll         │
├──────────────────────┤
│ ● CHAT · canal       │
│                      │
│   iframe Twitch      │ ← scroll interno
│   (ocupa el resto)   │
│                      │
└──────────────────────┘
```

En **landscape** con pantalla pequeña: video a la izquierda, chat a la derecha.  
En **desktop**: mismo layout que la versión escritorio original.

## Primera vez vs. sesiones siguientes

- **Primera vez**: aparece la pantalla de setup con los dos campos.
- **Siguientes visitas**: los campos se rellenan solos con lo guardado, el botón dice “Retomar sesión”.
- El botón **⚙** de la barra superior vuelve al setup en cualquier momento.

## Deploy en GitHub Pages

```bash
git init
git add .
git commit -m "init: StreamView Mobile"
git remote add origin https://github.com/TU_USUARIO/stream-viewer-mobile.git
git branch -M main
git push -u origin main
```

→ Settings → Pages → Source: `main` / `root` → Save

URL final: `https://TU_USUARIO.github.io/stream-viewer-mobile/`

## Detalles técnicos para móvil

|Problema                             |Solución aplicada                               |
|-------------------------------------|------------------------------------------------|
|Zoom al hacer focus en input (iOS)   |`font-size: 16px` en inputs                     |
|Rebote de scroll del body (Safari)   |`position: fixed` + `overflow: hidden` en body  |
|Safe area notch/Dynamic Island       |`env(safe-area-inset-*)` en padding             |
|Chat Twitch sin scroll táctil        |`-webkit-overflow-scrolling: touch` en iframe   |
|Video cortado                        |Ratio 16:9 con padding-bottom trick             |
|Teclado rompe layout (Chrome Android)|`interactive-widget=resizes-content` en viewport|
|Frames vacíos al cargar (Safari)     |`window.scrollTo(0,0)` tras montar iframes      |

## Archivos

```
stream-viewer-mobile/
├── index.html
├── style.css
└── app.js
```