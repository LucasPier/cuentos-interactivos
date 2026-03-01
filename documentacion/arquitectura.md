# Estructura y Arquitectura

## Estructura del Proyecto

```text
{raíz_del_proyecto}/
├── index.html                 # Entry point — estructura de capas
├── manifest.json              # Configuración PWA (íconos, colores, display)
├── service-worker.js          # Service Worker: Cache First y soporte offline
├── AGENTS.md                  # Instrucciones centrales para agentes IA
├── CLAUDE.md                  # Referencia a AGENTS.md (Copilot/Claude)
├── GEMINI.md                  # Referencia a AGENTS.md (Antigravity/Gemini CLI)
├── documentacion/             # Carpeta con documentación del proyecto
│   ├── index.md               # Entry point de la doc técnica que enlaza a los demás
│   ├── arquitectura.md        # Diagrama, módulos JS, dependencias y flujo general
│   ├── ui_estilos_capas.md    # Z-index, archivos CSS, toggle controles
│   ├── estado_recompensas.md  # localStorage, persistencia, recompensas, precarga
│   ├── formato_escenas.md     # Esquema JSON para escenas y desafíos
│   └── formato_historia.md    # Detalles de historia.json, biblioteca.json, extensiones
│
├── css/
│   ├── reset.css              # Reset minimalista + prevención de zoom táctil
│   ├── variables.css          # Design tokens (colores, tipografía, z-index, botones)
│   ├── layout.css             # Contenedor 16:9 centrado + indicador de carga + controles UI
│   ├── biblioteca.css         # Pantalla de selección de historias
│   ├── escena.css             # Composición visual (fondo, elementos, texto, opciones)
│   ├── desafios.css           # Layout de minijuegos y feedback
│   ├── animaciones.css        # Keyframes (float, bounce, shake, pulse, partículas)
│   ├── inicio.css             # Pantalla de inicio dinámica (overlay, logo, botón, luciérnagas)
│   ├── ui.css                 # Estados de botones toggle (texto, mute)
│   └── dev-panel.css          # Panel de desarrollo (cargado dinámicamente)
│
├── js/
│   ├── main.js                # Bootstrap: instancia módulos y arranca la biblioteca
│   ├── BibliotecaManager.js   # Pantalla de selección de historias
│   ├── GameEngine.js          # Orquestador central del flujo del juego
│   ├── ContentLoader.js       # Fetch de JSONs con cache y rutas dinámicas por historia
│   ├── StateManager.js        # Estado por historia: recompensas, historial, localStorage
│   ├── ImagePreloader.js      # Precarga de imágenes con rutas dinámicas por historia
│   ├── SceneRenderer.js       # Composición visual de escenas + transiciones
│   ├── FondoHelper.js         # Creación centralizada de fondos (imagen + video)
│   ├── ChallengeManager.js    # Dispatcher de desafíos (Strategy Pattern)
│   ├── UIManager.js           # Controles permanentes (toggle texto, mute, carga dinámica)
│   ├── AudioManager.js        # Sistema de audio (fondo + efectos)
│   ├── EffectsRenderer.js     # Capa visual dinámica (luciérnagas, polvo, etc.)
│   ├── FeatureFlags.js        # Feature flags globales del motor (experimental)
│   ├── DevPanel.js            # Panel de desarrollo (lazy, zero-impact en producción)
│   └── challenges/
│       ├── PreguntaRealHandler.js     # Handler: pregunta con opciones múltiples
│       ├── ObservacionHandler.js      # Handler: encontrar elemento en la escena
│       └── ClicksHandler.js           # Handler: clickear N veces un objeto
│
├── biblioteca/
│   ├── historias.json         # Catálogo de historias disponibles
│   └── imagenes/
│       ├── fondo.webp         # Fondo de la pantalla de biblioteca
│       ├── juego_biblioteca.webp # Imagen decorativa del juego
│       └── iconos/            # Favicons e íconos PWA
│
└── historias/                 # Cada historia vive en su propia carpeta
    └── el-misterio-del-bosque-encantado/
        ├── historia.json      # Configuración de la historia (título, logo, colores, efectos)
        ├── concepto.md        # Esencia, tema, tono y personajes reales
        ├── historia.md        # Guion completo, diálogos y descripciones
        ├── resumen_detallado.md # Mapa lógico de la historia y ramificaciones
        ├── datos/
        │   ├── escenas/       # 33 archivos JSON de escenas
        │   └── desafios/      # 4 archivos JSON de desafíos
        ├── imagenes/
        │   ├── fondos/        # Fondos WEBP (16:9)
        │   ├── personajes/{id}/ # Subcarpetas por personaje (fondo transparente)
        │   ├── objetos/       # Objetos WEBP (fondo transparente)
        │   ├── logo/          # Logo y portada de la historia
        │   └── tarjeta/       # Imagen de tarjeta para la biblioteca
        ├── videos/            # Videos de fondo para escenas/desafíos (MP4)
        └── audios/            # Archivos de audio de la historia
```

---

## Arquitectura del Motor

El motor sigue una arquitectura **modular con inyección de dependencias**. No hay framework: todo es vanilla JS usando ES Modules nativos del browser.


## Diagrama de dependencias

```
main.js (Bootstrap)
  │
  ├── BibliotecaManager ←── pantalla de selección de historias
  │     ├── GameEngine ←── orquesta el flujo DENTRO de una historia
  │     │     ├── ContentLoader      (fetch + cache + rutas dinámicas)
  │     │     ├── StateManager       (estado por historia)
  │     │     ├── ImagePreloader     (precarga + rutas dinámicas)
  │     │     ├── SceneRenderer      (composición visual)
  │     │     │     ├── EffectsRenderer    (capa visual dinámica en escenas)
  │     │     │     └── FondoHelper        (fondo: imagen + video opcional)
  │     │     ├── ChallengeManager   (dispatch de desafíos)
  │     │     │     ├── EffectsRenderer    (capa visual dinámica en desafíos)
  │     │     │     ├── PreguntaRealHandler ─┐
  │     │     │     ├── ObservacionHandler  ─┤─ FondoHelper
  │     │     │     └── ClicksHandler      ─┘
  │     │     ├── UIManager          (controles permanentes + logo de carga dinámico)
  │     │     └── AudioManager       (fondo + efectos)
  │     └── (callback: volver a biblioteca)
  │
  └── [DevPanel]  ←── lazy, import() dinámico (activación: ?dev=true / Ctrl+Shift+D)
        ├── GameEngine       (navegación, inspección, callbacks)
        ├── StateManager     (lectura/escritura de estado)
        └── FeatureFlags     (setea flags experimentales via toggles)
```

## Principios

- **Sin dependencias externas**: Solo Nunito de Google Fonts.
- **Contenido externalizado**: Toda la narrativa y configuración vive en JSONs. Cero hardcoding de texto o lógica narrativa en el código.
- **Campos privados**: Todos los módulos usan `#` (private class fields) para encapsulación real.
- **Async/await**: Toda la carga de contenido y las transiciones son asíncronas.
---

## Soporte PWA y Modo Offline

El proyecto está configurado como una Progressive Web App (PWA) de funcionalidad **100% offline**, controlada desde `service-worker.js` usando la estrategia **Cache First**:

- **Caché Estricta por Afinidad**: Durante el evento `install`, el Service Worker precarga TODOS los recursos del juego divididos en grupos (ej. `cache-biblioteca-vX`, `cache-embe-imagenes-vX`). Cada versión es administrada manualmente con constantes para tener control granular de la invalidación de memoria.
- **Bypass de Caché Nativo (`?v=VERSION`)**: Durante la recolección inicial, a cada URL extraída se le anexa un query parameter. Esto obliga al navegador a sortear su memoria HTTP para guardar bytes 100% limpios del servidor en las memorias locales particionadas.
- **Soporte Dinámico CORS (Google Fonts)**: Las requests tipográficas a `fonts.googleapis.com` y `fonts.gstatic.com` generan "Respuestas Opacas" (`status 0`), las cuales no pueden ser consumidas en la subrrutina convencional de instalación. El SW atrapa esos requests al vuelo, los clona y los mete en la subpartición paralela `cache-fonts-v1` permitiendo fuentes online gratuitas con funcionalidad absoluta en modo Avión.
- **Instalación Manual (`beforeinstallprompt`)**: En el front, la app escucha el evento nativo del navegador, lo previene (`preventDefault()`) y lo deriva a un botón custom de interfaz (`#btn-instalar-pwa` en `BibliotecaManager.js`) para ofrecer una experiencia de onboarding no invasiva ni molesta, integrada al diseño nativo.

---

## Flujo de Ejecución

### Arranque (`DOMContentLoaded`)

```
1. main.js se ejecuta cuando el DOM está listo
2. Instancia todos los módulos en orden:
   - ContentLoader, StateManager, ImagePreloader (base)
   - AudioManager, UIManager (utilidades)
   - SceneRenderer, ChallengeManager (renderizado)
3. Registra los 3 handlers de desafíos en ChallengeManager
4. Crea GameEngine con todas las dependencias inyectadas
5. Crea BibliotecaManager con GameEngine + dependencias
6. Llama biblioteca.inicializar()
```

---

### Flujo Biblioteca → Historia

```
BibliotecaManager.inicializar():
  1. Oculta controles de UI y pantalla de inicio
  2. Muestra #pantalla-biblioteca
  3. Fetch de biblioteca/historias.json (catálogo)
  4. Para cada historia: fetch de su historia.json
  5. Renderiza tarjetas con portada + título
  6. Al click en tarjeta:
     a. Verifica si hay partida guardada vía StateManager
     b. Si NO HAY: Oculta biblioteca, cargarHistoria(resetear=false)
     c. Si HAY: Muestra modal preguntando acción
        - Continuar: Oculta biblioteca, cargarHistoria(resetear=false)
        - Reiniciar: Oculta biblioteca, cargarHistoria(resetear=true)
```

### Inicialización de una historia

```
GameEngine.cargarHistoria(config, rutaBase, onVolver, resetear=false):
  1. Configura rutas dinámicas en ContentLoader e ImagePreloader
  2. Configura StateManager con el ID de la historia
  3. Establece el logo de carga dinámico en UIManager
  4. Construye pantalla de inicio dinámicamente (fondo, logo, subtítulo, botones, efectos)
  5. Muestra pantalla de inicio
  6. Si resetear es true → limpia el StateManager de esa historia
  7. Si hay estado guardado (y no se reseteó) → continúa desde la última escena
  8. Si no → espera a que el usuario toque "Jugar"
```

### Flujo de una escena

```
GameEngine.#cargarEscena(id):
  1. Muestra indicador de carga
  2. ContentLoader.cargarEscena(id) → fetch del JSON (o cache)
  3. ImagePreloader.precargar() → new Image() para fondo + elementos
  4. StateManager.setEscenaActual(id) → persiste en localStorage
  5. SceneRenderer.renderizar():
     a. Fade-out de escena anterior (opacity → 0, delay 400ms)
     b. Pausa video de fondo anterior (si había)
     c. Limpia DOM previo
     d. Renderiza fondo vía FondoHelper (imagen + video opcional con fade-in al bufferearse)
     e. Renderiza elementos + efectos en un solo contenedor .escena-elementos
        (comparten stacking context para z-index independiente por cada uno)
     f. Renderiza texto narrativo en #panel-texto
     g. Renderiza opciones filtradas por condición en #panel-opciones
     h. Delay 50ms (para que el browser pinte)
     i. Fade-in (opacity → 1, delay 400ms)
  6. Precarga fire-and-forget de escenas siguientes
  7. Oculta indicador de carga
```

### Flujo de un desafío

```
GameEngine.#cargarDesafio(id):
  1. Muestra indicador de carga
  2. ContentLoader.cargarDesafio(id) → fetch del JSON
  3. ImagePreloader → precarga imágenes del desafío
  4. Oculta indicador de carga
  5. ChallengeManager.ejecutar(datos, stateManager):
     a. Busca el handler registrado para datos.subtipo
     b. Muestra #panel-desafio (clase .activo)
     c. handler.ejecutar(datos, panelEl, preloader) → renderiza + espera interacción
     d. Si éxito → otorga recompensa (si la hay)
     e. Devuelve { exito, target, recompensa }
     f. Delay 800ms para feedback → oculta panel
  6. GameEngine navega a resultado.target (escena de éxito o fallo)
```

### Navegación (al elegir una opción)

```
GameEngine.#manejarNavegacion(accion, target, tipoTarget):
  - Guard: si ya está navegando, ignora (previene doble-click)
  - Si accion === "reiniciar" → reinicia estado y vuelve a pantalla de inicio de ESTA historia
  - Si tipoTarget === "desafio" → cargarDesafio(target)
  - Si tipoTarget === "escena" → cargarEscena(target)
```

### Comportamiento de reinicio

- **"Reiniciar"** (desde opciones del juego): Vuelve a la pantalla de inicio de la historia actual, NO a la biblioteca.
- **Botón "Salir"** (desde pantalla de inicio de la historia): Anula `configHistoria` (deja `configActual` en `null`), detiene audio y vuelve a la biblioteca vía callback.
- **Recarga de página** (F5): Vuelve a la biblioteca (estado fresco).

---

## Módulos JavaScript

### `main.js`
**Rol**: Bootstrap. Instancia, conecta y arranca.

No tiene lógica de negocio. Solo:
- Importa todos los módulos y handlers
- Los instancia en el orden correcto
- Registra handlers en ChallengeManager
- Crea GameEngine con dependency injection
- Crea BibliotecaManager con GameEngine + AudioManager + UIManager + callback `onMostrarBiblioteca` (para cerrar el DevPanel al volver a la biblioteca)
- Llama `biblioteca.inicializar()`
- Detecta activación del DevPanel (`?dev=true` en URL o `Ctrl+Shift+D`) y lo carga con `import()` dinámico. Ambos mecanismos tienen un guard que requiere historia activa (`engine.configActual`) para abrir el panel

### `BibliotecaManager.js`
**Rol**: Pantalla de selección de historias ("La Biblioteca del Tío Pier").

| Método | Visibilidad | Descripción |
|--------|-------------|-------------|
| `constructor({engine, stateManager, audioManager, uiManager, onMostrarBiblioteca?})` | público | Recibe dependencias inyectadas y callback opcional para notificar al volver |
| `inicializar()` | público | Fetch del catálogo, carga configs, renderiza tarjetas |
| `mostrar()` | público | Muestra la biblioteca, oculta controles UI y ejecuta `onMostrarBiblioteca` si existe |
| `#renderizarTarjetas(historias)` | privado | Genera botones con portada + overlay + título |
| `#seleccionarHistoria(config, ruta)` | privado | Verifica si hay partida en curso y dispara modal o carga directa |
| `#mostrarModalRetomar(config, ruta)` | privado | Genera dinámicamente el modal UI estilo madera |
| `#cargarDirecto(config, ruta, resetear)` | privado | Oculta biblioteca, pide fullscreen, llama `engine.cargarHistoria()` |

### `GameEngine.js`
**Rol**: Orquestador central del flujo DENTRO de una historia.

| Método | Visibilidad | Descripción |
|--------|-------------|-------------|
| `constructor({...})` | público | Recibe todos los módulos inyectados |
| `cargarHistoria(config, ruta, onVolver, resetear)` | público | Configura módulos, construye pantalla de inicio dinámica y decide flujo |
| `#construirPantallaInicio(config, ruta)` | privado | Genera DOM dinámico: fondo, logo, botones, efectos |
| `#renderizarLuciernagas()` | privado | Genera elementos decorativos con CSS vars para animación |
| `#empezarJuego(escena)` | privado | Oculta pantalla inicio, muestra paneles, carga primera escena |
| `#cargarEscena(id)` | privado | Flujo completo: fetch → preload → render → precarga siguientes |
| `#cargarDesafio(id)` | privado | Flujo completo: fetch → preload → ejecutar → navegar a resultado |
| `#manejarNavegacion(...)` | privado | Dispatcher de acciones (navegar/reiniciar) con guard de doble-click |
| `#reiniciar()` | privado | Limpia estado, re-carga pantalla de inicio de la misma historia |
| `#precargarSiguientes(opciones)` | privado | Fire-and-forget: precarga JSONs e imágenes de escenas futuras |
| `get configActual` | público | Getter: devuelve la config de la historia activa (`#configHistoria`) |
| `onCambioEscena(callback)` | público | Registra un callback `(id, tipo, datos)` invocado tras cada cambio. Retorna función de desuscripción |
| `navegarA(id, tipo)` | público | Navega programáticamente a una escena o desafío (uso dev/testing). Resetea el guard de doble-click. Si la pantalla de inicio está visible, la oculta e inicializa la UI del juego antes de navegar |

### `ContentLoader.js`
**Rol**: Capa de acceso a datos. Centraliza todos los `fetch()` con rutas dinámicas por historia.

| Método | Descripción |
|--------|-------------|
| `setRutaBase(ruta)` | Configura la ruta base de la historia activa. Limpia el cache al cambiar |
| `cargar(tipo, id)` | Fetch genérico con cache en `Map`. Construye URL con `rutaBase + rutaRelativa` |
| `cargarEscena(id)` | Atajo: `cargar('escena', id)` |
| `cargarDesafio(id)` | Atajo: `cargar('desafio', id)` |
| `precargar(tipo, id)` | Fire-and-forget: carga sin esperar, silencia errores |
| `limpiarCache()` | Vacía el `Map` de cache |

**Rutas dinámicas**: La URL final se construye como `{rutaBaseHistoria}{rutaRelativa}{id}.json`. Ejemplo: `historias/el-misterio-del-bosque-encantado/datos/escenas/INICIO.json`.
**Estrategia de cache**: La clave es `"tipo:id"`. El cache se limpia automáticamente al cambiar de historia (`setRutaBase`).

### `StateManager.js`
**Rol**: Estado por historia + persistencia aislada.

| Método | Descripción |
|--------|-------------|
| `setHistoriaActual(id)` | Configura la historia activa y restaura su estado |
| `tienePartidaGuardada(idHistoria)` | Verifica en el storage si la historia tiene progreso guardado sin setearla |
| `setEscenaActual(id)` | Registra escena actual + la pushea al historial |
| `getEscenaActual()` | Devuelve ID de la escena actual (o `null`) |
| `otorgarRecompensa(nombre)` | Marca una recompensa como obtenida |
| `tieneRecompensa(nombre)` | Verifica si el jugador tiene una recompensa |
| `evaluarCondicion(condicion)` | Evalúa condiciones del JSON (ver §9) |
| `getHistorial()` | Devuelve copia del array de escenas visitadas |
| `getRecompensas()` | Devuelve copia shallow del objeto de recompensas |
| `revocarRecompensa(nombre)` | Elimina una recompensa otorgada y persiste |
| `reiniciar()` | Limpia todo el estado y el localStorage de la historia activa |

**Persistencia por historia**: La clave de `localStorage` es dinámica: `biblioteca_{historiaId}`. Cada historia tiene su estado aislado. El constructor NO restaura estado automáticamente; espera a que `setHistoriaActual()` defina qué historia cargar.

### `ImagePreloader.js`
**Rol**: Descarga anticipada de imágenes pesadas con rutas dinámicas por historia.

| Método | Descripción |
|--------|-------------|
| `setRutaBase(ruta)` | Configura la ruta base de la historia activa. Limpia el Set al cambiar |
| `resolverRuta(nombre, tipo, id)` | Construye ruta completa: `rutaBase + rutaRelativa + nombre`. Para `tipo: "personaje"`, requiere el `id` del elemento para construir `personajes/{id}/{imagen}` |
| `resolverRutaVideo(nombre)` | Construye ruta completa para video: `rutaBase + videos/ + nombre` |
| `precargar(urls, onProgreso)` | Descarga imágenes con `new Image()`, callback de progreso |
| `extraerImagenes(datos)` | Extrae todas las URLs de un JSON de escena/desafío (incluye `imagen_final`) |
| `limpiar()` | Vacía el Set de URLs ya precargadas |

**Convención de rutas** (el parámetro opcional `tipo` determina la subcarpeta dentro de la historia):

| Tipo | Ruta relativa |
|---------|------|
| `fondo` | `imagenes/fondos/` |
| `personaje` | `imagenes/personajes/{id}/` |
| `objeto` | `imagenes/objetos/` |
| `video` | `videos/` |
| (default) | `imagenes/fondos/` |

### `SceneRenderer.js`
**Rol**: Composición visual de escenas.

| Método | Descripción |
|--------|-------------|
| `renderizar(datos, stateManager, onNavegar)` | Compone fondo + elementos + texto + opciones con transición |
| `limpiar()` | Vacía la escena y paneles |

**Composición por capas**:
1. `#renderizarFondo(nombre, video)` → delega a `FondoHelper.crearFondo()` → `<div class="escena-fondo"><img>` + `<video>` opcional
2. `#renderizarElementos(elementos, efectos)` → `<div class="escena-elementos">` con efectos y elementos posicionados en el mismo stacking context
3. `#renderizarTexto(texto)` → actualiza `.texto-narrativo`
4. `#renderizarOpciones(opciones, state, callback)` → botones filtrados por condición

**Ciclo de vida del video**: Guarda referencia al `<video>` activo en `#videoActual`. Al renderizar una nueva escena, pausa el video anterior antes de limpiar el DOM.

**Posicionamiento de elementos**: Cada elemento visual se posiciona con CSS custom properties asignadas inline:
```css
--x      →  left: calc(var(--x) * 1%)       /* posición horizontal */
--y      →  bottom: calc((100 - var(--y)) * 1%)  /* posición vertical (y:100 = pegado abajo) */
--ancho  →  width: calc(var(--ancho) * 1%)   /* ancho relativo al contenedor */
--z-index → z-index para orden de superposición
```

### `ChallengeManager.js`
**Rol**: Registry + dispatcher de desafíos.

Usa el **Strategy Pattern**: cada subtipo de desafío tiene un handler registrado. Para agregar un nuevo tipo de desafío, solo hay que crear un handler y llamar `registrar()`.

| Método | Descripción |
|--------|-------------|
| `registrar(subtipo, handler)` | Registra un handler en el Map de handlers |
| `ejecutar(datos, stateManager)` | Despacha al handler correcto, gestiona panel y recompensas |
| `tieneHandler(subtipo)` | Verifica si hay handler para un subtipo |

### `FondoHelper.js`
**Rol**: Módulo utilitario que centraliza la creación del DOM de fondo (imagen y/o video). Usado por `SceneRenderer` y los tres Challenge Handlers.

| Función exportada | Descripción |
|--------|-------------|
| `crearFondo(preloader, nombreFondo, nombreVideo, clase)` | Crea `<div>` con clase indicada, agrega `<img>` de fondo siempre visible, y opcionalmente un `<video loop muted playsinline>` que arranca invisible y hace fade-in al emitir `canplaythrough`. Retorna `{ contenedor, video }` |

**Comportamiento del video**:
- El bloque de video solo se ejecuta si `FeatureFlags.videosHabilitados === true` (feature experimental, deshabilitada por defecto)
- Arranca con `opacity: 0` y `preload="auto"`
- Al emitir `canplaythrough` (buffer suficiente para reproducción continua), llama a `play()` y transiciona `opacity` a `1` (300ms via CSS)
- La imagen de fondo queda debajo como fallback visible durante la carga
- Loop infinito, sin sonido, sin controles

| Método | Descripción |
|--------|-------------|
| `registrar(subtipo, handler)` | Registra un handler en el Map de handlers |
| `ejecutar(datos, stateManager)` | Despacha al handler correcto, gestiona panel y recompensas |
| `tieneHandler(subtipo)` | Verifica si hay handler para un subtipo |

### `FeatureFlags.js`
**Rol**: Singleton liviano de feature flags del motor. Permite activar funcionalidades experimentales sin afectar el código de producción.

Expone un único objeto mutable `FeatureFlags` con los flags disponibles:

| Flag | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `videosHabilitados` | `boolean` | `false` | Habilita la reproducción de videos de fondo en escenas y desafíos |

**Flujo de control**: `DevPanel` setea los flags vía sus toggles de "Configuración Dev". `FondoHelper` consulta `videosHabilitados` antes de crear el elemento `<video>`. Si el flag es `false`, el bloque de video se omite completamente — sin elemento, sin listeners, sin `preload`.

**Impacto en producción**: `FeatureFlags` se importa como ES Module estático en `FondoHelper`; `DevPanel` lo importa solo cuando se activa (lazy load). En carga normal, el flag permanece `false` y ningún video se crea.

### `UIManager.js`
**Rol**: Controles de interfaz permanentes + indicador de carga dinámico.

| Método | Descripción |
|--------|-------------|
| `mostrarCarga()` / `ocultarCarga()` | Toggle del `#indicador-carga` vía clase `.oculto` |
| `setLogoCarga(src)` | Establece dinámicamente el logo del indicador de carga (por historia) |
| `mostrarControles()` / `ocultarControles()` | Visibilidad de botones UI (ocultos en pantalla de inicio/biblioteca) |
| `mostrarSoloMute()` | Muestra solo el botón de mute (para pantalla de inicio) |
| `resetearTexto()` | Resetea el toggle de texto a estado visible |

**Toggle de texto**: El botón 📖 alterna la visibilidad del panel de texto narrativo usando la clase `.oculto`. El emoji cambia a 👁️ cuando está oculto.

**Indicador de carga dinámico**: En lugar de un spinner genérico, muestra el logo de la historia activa con una animación `fade-loop` (opacity + scale). El src se actualiza vía `setLogoCarga()` cuando se carga una historia.

### `EffectsRenderer.js`
**Rol**: Procesador de efectos visuales dinámicos (luciérnagas, polvo de hadas, nieve, destellos). Crea contenedores `.efecto-contenedor` con partículas posicionadas via custom properties (`--x, --y, --ancho, --alto, --z-index`).

| Método | Descripción |
|--------|-------------|
| `renderizar(efectos, padre, { envolver })` | Crea los efectos. Con `envolver: true` (default), los envuelve en un `<div class="escena-efectos">` (usado por desafíos). Con `envolver: false`, appenda los `.efecto-contenedor` directo al padre (usado por escenas, para compartir stacking context con los elementos). |

**Uso dual**: `SceneRenderer` lo llama con `{ envolver: false }` para que efectos y elementos compartan z-index dentro de `.escena-elementos`. `ChallengeManager` lo llama sin opciones (default `envolver: true`) para mantener el wrapper `.escena-efectos` dentro de `#panel-desafio`.

### `AudioManager.js`
**Rol**: Sistema de audio con reproducción de fondo y efectos dinámica.

| Método / Getter | Descripción |
|--------|-------------|
| `setRutaBase(ruta)` | Actualiza el path relativo base para audios de la historia actual |
| `reproducirFondo(archivo)` | Música de fondo en loop (vol 0.5). Evita reinicio si ya suena el mismo track |
| `detenerFondo()` | Pausa + reset del BGM actual |
| `reproducirNarracion(archivo)` | Narración de la escena (stub, pendiente de implementación) |
| `reproducirEfecto(archivo)` | Efecto de sonido fire-and-forget (vol 0.8). Resuelve ruta con `rutaBase + 'audios/'` |
| `pausar()` | Pausa el BGM sin destruirlo |
| `reanudar()` | Reanuda el BGM pausado (si existe y no está muteado) |
| `detener()` | Alias de `detenerFondo()` |
| `toggleMute()` | Alterna mute global. Retorna el nuevo estado |
| `get muteado` | Getter del estado de mute actual |

**Manejo de visibilidad**: El constructor registra un listener de `visibilitychange` que pausa automáticamente el BGM cuando la app pasa a segundo plano (cambio de pestaña, minimizar navegador) y lo reanuda al volver a primer plano. Un flag interno (`#pausadoPorVisibilidad`) distingue la pausa automática de una manual (mute, cambio de escena, etc.) para no interferir con la lógica del juego. Solo se afecta el BGM; los SFX son cortos y fire-and-forget.

### `DevPanel.js`
**Rol**: Panel de desarrollo para inspección y navegación rápida durante el desarrollo. Carga lazy (dynamic `import()`) — zero-impact en producción.

**Activación**: `?dev=true` en la URL o `Ctrl+Shift+D`. Ambos mecanismos viven en `main.js` y ejecutan el `import('./DevPanel.js')`. `?dev=true` crea el panel y su botón toggle al inicio, pero el botón permanece oculto (vive dentro de `.ui-controles--izquierda`, que arranca con `display: none` en el HTML) hasta que se carga una historia. `Ctrl+Shift+D` tiene un guard que requiere `engine.configActual` — no funciona en la pantalla de biblioteca.

**Inyección de CSS**: `activar()` es `async` y espera a que el `<link>` a `css/dev-panel.css` cargue completamente (`onload`) antes de crear el DOM del panel. Esto evita que se vea la transición CSS de cierre al insertar el panel sin estilos aplicados.

**Persistencia de config**: Usa `sessionStorage` (clave `dev_config`) para recordar los toggles de Configuración Dev (`sinFullscreen`, `sinTransiciones`, `sinAudio`) durante la sesión de la pestaña. Sobrevive recargas (F5), se limpia al cerrar la pestaña.

| Método / Getter | Visibilidad | Descripción |
|--------|-------------|-------------|
| `constructor({engine, stateManager})` | público | Recibe dependencias. No crea DOM todavía |
| `activar()` | público | **Async.** Espera carga del CSS, luego crea DOM, registra listeners, suscribe a cambios de escena |
| `desactivar()` | público | Remueve DOM, CSS y listeners. Limpia estado |
| `abrir()` | público | Desliza el panel visible (translateX). Guard: requiere `engine.configActual` (historia activa) |
| `cerrar()` | público | Oculta el panel con animación de slide-out |
| `ir(id, tipo)` | público | Atajo de consola: navega a escena/desafío vía `engine.navegarA()` |
| `estado()` | público | Atajo de consola: imprime estado actual (escena, recompensas, historial) |
| `otorgar(nombre)` | público | Atajo de consola: otorga recompensa vía `stateManager` |
| `revocar(nombre)` | público | Atajo de consola: revoca recompensa vía `stateManager` |
| `get _abierto` | público | Getter booleano del estado visual del panel |

**Secciones del panel** (acordeón colapsable):

| Sección | Contenido |
|---------|-----------|
| Navegación Rápida | Input de texto libre para navegar por ID + dos selects (escenas y desafíos desde `historia.json`) con botón "Ir". Resalta la escena activa con ▸ en el dropdown |
| Inspector de Escena | Vista formateada de la escena/desafío actual: datos básicos (ID, tipo, fondo, audio), elementos, efectos, opciones con evaluación de condiciones en vivo, y respuesta correcta para desafíos. Se actualiza automáticamente vía callback `onCambioEscena` |
| Inspector de Estado | Escena actual, historial (orden inverso), recompensas con botón ✕ para revocar, input + botón para otorgar nuevas, y botones "Limpiar estado" (historia actual) / "Limpiar todo" (todo el localStorage de biblioteca) |
| Configuración Dev | Cuatro toggles funcionales: **Deshabilitar fullscreen** (patchea `Element.prototype.requestFullscreen`), **Deshabilitar transiciones** (setea `--transicion-escena: 0ms`), **Deshabilitar audio** (mutea elementos `<audio>` vía MutationObserver para atrapar los creados dinámicamente), **Habilitar videos** (setea `FeatureFlags.videosHabilitados = true`; feature experimental, deshabilitada por defecto) |

**Expuesto en `window.devPanel`** para uso rápido desde la consola del navegador.

**Exclusión PWA**: Los archivos `DevPanel.js` y `dev-panel.css` NO se agregan al Service Worker — son herramientas de desarrollo solamente.

---

## Decisiones de Diseño

| Decisión | Alternativa descartada | Razón |
|----------|------------------------|-------|
| `localStorage` para estado | `sessionStorage` | El juego guarda el progreso para que la nena no lo pierda si cierra la pestaña. |
| Opacity + setTimeout para transiciones | CSS `animationend` events | El event bubbling de animaciones de hijos causaba race conditions. |
| `display: none` para ocultar carga | `opacity: 0 + pointer-events: none` | Más robusto: el spinner no sigue animando invisible y no hay edge cases de clics fantasma. |
| Strategy Pattern para desafíos | Switch/if-else en ChallengeManager | Permite agregar nuevos subtipos sin tocar el código existente. |
| `id` del elemento JSON para resolver ruta de personaje | Lista hardcodeada de IDs en el motor | El `id` ya existe en cada elemento del JSON. Usarlo directamente elimina toda lógica de texto frágil en el motor y permite agregar personajes nuevos sin tocar código JS. |
| `Map` para cache de JSON | Objeto plano | `Map` tiene mejor rendimiento para adiciones/consultas frecuentes y `.has()` semántico. |
| `Set` para tracking de precarga | Array con `.includes()` | `Set.has()` es O(1) vs O(n) de `.includes()`. |
| Custom properties para posición | `style.left`, `style.bottom` inline | Las custom properties se leen en el CSS, separando preocupaciones (JS pone datos, CSS los usa). |
