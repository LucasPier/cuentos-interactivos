# Inventario de Documentos Auditables

Para cada documento, se indica qué debe verificarse y cuáles son las fuentes de verdad a consultar.

---

## Documentos del Proyecto

### `AGENTS.md`
**Ruta:** `AGENTS.md` (raíz del proyecto)
**Rol:** Instrucciones globales para agentes. Resumen de arquitectura, stack, convenciones y reglas.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Tabla de Módulos JS | `js/*.js` (listar y comparar) |
| Tabla de Challenge Handlers | `js/challenges/*.js` |
| Tabla de CSS | `css/*.css` |
| Tabla de Documentación (footer) | `documentacion/*.md` |
| Flujo Macro | `js/main.js` |
| Sistema de Capas (Z-index) | `css/variables.css`, comentarios en `css/layout.css` |
| Stack Tecnológico | `index.html`, `service-worker.js` |

---

### `documentacion/index.md`
**Ruta:** `documentacion/index.md`
**Rol:** Índice de navegación. Primer archivo que debe leer un agente nuevo.

| Qué verificar | Fuente de verdad |
|---------------|-----------------|
| Archivos listados existen | `ls documentacion/` |
| Archivos en `documentacion/` tienen entrada | `ls documentacion/` |
| Descripciones son correctas | Cada archivo referenciado |

---

### `documentacion/arquitectura.md`
**Ruta:** `documentacion/arquitectura.md`
**Rol:** Arquitectura del motor: módulos JS, inyección de dependencias, PWA, flujo de ejecución.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Lista de módulos JS y sus roles | `js/*.js` |
| Diagrama/tabla de dependencias | `js/main.js` (instanciación) |
| Challenge Handlers y registro | `js/challenges/*.js`, `js/main.js` |
| Flujo de ejecución | `js/main.js`, `js/GameEngine.js` |
| PWA / Service Worker | `service-worker.js` |
| Estructura de carpetas | Sistema de archivos real |

---

### `documentacion/ui_estilos_capas.md`
**Ruta:** `documentacion/ui_estilos_capas.md`
**Rol:** Sistema de capas (Z-index), archivos CSS, design tokens, animaciones.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Tabla de archivos CSS y su contenido | `css/*.css` |
| Sistema Z-index (tabla de capas) | `css/variables.css`, `css/layout.css` |
| Design tokens / variables | `css/variables.css` |
| Animaciones (keyframes) | `css/animaciones.css` |
| Sistema glassmorphism, botones | `css/layout.css`, `css/ui.css` |

---

### `documentacion/estado_recompensas.md`
**Ruta:** `documentacion/estado_recompensas.md`
**Rol:** localStorage, recompensas, flags, evaluación de condiciones, precarga.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Clave de localStorage | `js/StateManager.js` |
| Estructura del estado guardado | `js/StateManager.js` |
| Evaluación de condiciones (`tiene_X`) | `js/GameEngine.js` o `js/SceneRenderer.js` |
| Recompensas: cómo se obtienen/verifican | `js/GameEngine.js` |
| ImagePreloader: resolución de rutas | `js/ImagePreloader.js` |
| ContentLoader: precarga de JSONs | `js/ContentLoader.js` |

---

### `documentacion/formato_escenas.md`
**Ruta:** `documentacion/formato_escenas.md`
**Rol:** Schema JSON de escenas narrativas y desafíos.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Campos de escena narrativa | JSONs reales en `historias/*/datos/escenas/*.json` |
| Campos de `minijuego_observacion` | `js/challenges/ObservacionHandler.js` + JSONs reales |
| Campos de `minijuego_clicks` | `js/challenges/ClicksHandler.js` + JSONs reales |
| Campos de `pregunta_real` | `js/challenges/PreguntaRealHandler.js` + JSONs reales |
| Campo `condicion` | `js/GameEngine.js` o `js/SceneRenderer.js` |
| Tipos de `efectos` | `js/EffectsRenderer.js` |

---

### `documentacion/formato_historia.md`
**Ruta:** `documentacion/formato_historia.md`
**Rol:** Estructura de `historias.json`, `historia.json`, guía de extensibilidad.

| Sección a verificar | Fuentes de verdad |
|--------------------|-------------------|
| Schema `historias.json` | `biblioteca/historias.json` |
| Schema `historia.json` | `historias/*/historia.json` |
| Campos de configuración visual | `js/BibliotecaManager.js`, `js/UIManager.js` |
| Guía para agregar nueva historia | Estructura de carpeta `historias/*/` |
| Guía para agregar nuevo handler | `js/main.js` + `js/challenges/*.js` |

---

## Documentos de Historias (Fuera del Motor)

Estos documentos son específicos de cada historia. Solo se auditan si el usuario lo solicita explícitamente para una historia en particular.

| Documento | Fuente de verdad |
|-----------|-----------------|
| `historias/*/concepto.md` | No tiene fuente de código; es documento creativo |
| `historias/*/resumen_detallado.md` | `historias/*/historia.md` (el guion es la fuente) |
| `historias/*/historia.md` | JSONs de escenas en `historias/*/datos/escenas/` |
