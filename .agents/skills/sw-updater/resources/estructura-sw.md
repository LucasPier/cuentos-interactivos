# Estructura del Service Worker — Referencia para sw-updater

> Archivo de referencia para la skill `sw-updater`. Refleja el estado actual de `service-worker.js`.
> **Actualizar este archivo cuando se agreguen/eliminen cachés o se creen nuevas historias.**

---

## Variables de Versión

```javascript
const VERSION_APP = "1.0.0";       // Versión general de la app (mensaje a clientes)

const CACHE_BIBLIOTECA  = '1';     // Pantalla de biblioteca y assets globales
const CACHE_CSS         = '1';     // Todos los archivos CSS del motor
const CACHE_JS          = '1';     // Módulos JS principales del motor
const CACHE_CHALLENGES  = '1';     // Handlers de desafíos
const CACHE_EMBE_IMAGENES = '1';   // Imágenes de El Misterio del Bosque Encantado
const CACHE_EMBE_AUDIOS   = '1';   // Audios de El Misterio del Bosque Encantado
const CACHE_EMBE_DATOS    = '1';   // JSONs de escenas/desafíos de EMBE
const CACHE_FONTS       = '1';     // Google Fonts (lazy, no precacheada en install)
```

---

## Cachés Registradas

| Nombre de Caché | Variable | Qué contiene |
|-----------------|----------|--------------|
| `cache-biblioteca-v{N}` | `CACHE_BIBLIOTECA` | `index.html`, `manifest.json`, `biblioteca/historias.json`, imágenes de la biblioteca, iconos, `css/biblioteca.css`, `js/BibliotecaManager.js` |
| `cache-css-v{N}` | `CACHE_CSS` | Todos los archivos en `css/` (animaciones, desafios, escena, inicio, layout, reset, ui, variables) |
| `cache-js-v{N}` | `CACHE_JS` | Módulos principales: `AudioManager`, `ChallengeManager`, `ContentLoader`, `EffectsRenderer`, `GameEngine`, `ImagePreloader`, `main`, `SceneRenderer`, `StateManager`, `UIManager` |
| `cache-challenges-v{N}` | `CACHE_CHALLENGES` | `js/challenges/ClicksHandler.js`, `ObservacionHandler.js`, `PreguntaRealHandler.js` |
| `cache-embe-datos-v{N}` | `CACHE_EMBE_DATOS` | `historia.json` + todos los JSONs de escenas y desafíos de EMBE |
| `cache-embe-audios-v{N}` | `CACHE_EMBE_AUDIOS` | Audios `.mp3` de EMBE (bosque, aventuras, celebracion, etc.) |
| `cache-embe-imagenes-v{N}` | `CACHE_EMBE_IMAGENES` | Fondos, objetos, personajes e imágenes de logotipo de EMBE |
| `cache-fonts-v{N}` | `CACHE_FONTS` | Google Fonts — gestionada con lazy caching en el handler `fetch`, NO en install |

---

## Heurística: ¿A qué caché va un archivo nuevo?

```
css/*.css                    → cache-css
js/challenges/*.js           → cache-challenges
js/*.js                      → cache-js
biblioteca/*                 → cache-biblioteca
index.html / manifest.json   → cache-biblioteca
historias/{id}/datos/*       → cache-{id-corto}-datos
historias/{id}/audios/*      → cache-{id-corto}-audios
historias/{id}/imagenes/*    → cache-{id-corto}-imagenes
```

---

## Cómo bumpeár una versión de caché

Incrementar en 1 la constante correspondiente:

```diff
- const CACHE_EMBE_DATOS = '1';
+ const CACHE_EMBE_DATOS = '2';
```

Eso cambia el nombre de la caché de `cache-embe-datos-v1` → `cache-embe-datos-v2`.  
El SW eliminará automáticamente la caché vieja en el evento `activate`.

---

## Agregar una nueva historia

Crear **tres cachés nuevas** con su ruta base y tres nuevas constantes:

```javascript
// Nueva constante de ruta
const RUTA_NUEVA_HISTORIA = 'historias/nueva-historia-id';

// Nuevas variables de versión
const CACHE_NUEVA_IMAGENES = '1';
const CACHE_NUEVA_AUDIOS   = '1';
const CACHE_NUEVA_DATOS    = '1';

// Tres nuevos objetos en RUTAS_CACHE[]
{ nombre: `cache-nueva-datos-v${CACHE_NUEVA_DATOS}`,     archivos: [...] },
{ nombre: `cache-nueva-audios-v${CACHE_NUEVA_AUDIOS}`,   archivos: [...] },
{ nombre: `cache-nueva-imagenes-v${CACHE_NUEVA_IMAGENES}`, archivos: [...] }
```

---

## Notas de Implementación Relevantes

- **Cache First con evasión de caché en install**: se usa `?v={version}` como query param al descargar, pero se guarda con la URL original (sin query) para que los `match()` funcionen.
- **Fonts**: manejo especial con `cache-fonts` lazy. No se precachea en `install`, se almacena la primera vez que se pide en línea.
- **`./`**: la entrada `./` en `cache-biblioteca` es la raíz del sitio. El script `analizar-sw.py` la ignora al verificar existencia en disco.
