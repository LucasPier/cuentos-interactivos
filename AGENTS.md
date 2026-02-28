# Proyecto: Biblioteca del tío Pier con cuento interactivos

Este archivo contiene las instrucciones centrales para los agentes de IA que laburen en este proyecto. **LEER ESTO ANTES DE TOCAR NADA.**

## Contexto del Proyecto
Es una plataforma de cuentos interactivos web tipo "Elige tu propia aventura". El sistema es un motor genérico que soporta múltiples historias independientes, accesibles desde una **Biblioteca central**.

## Reglas de Narrativa (CRÍTICO)
1.  **Voseo Rioplatense:** El texto DEBE estar escrito en español argentino (voseo). Esta es una convención global de la biblioteca.
    *   *Correcto:* "¡Despertá!", "Querés", "Mirá", "Te quedás".
    *   *Incorrecto:* "¡Despierta!", "Quieres", "Mira", "Te quedas".
2.  **Lenguaje:** Sencillo, frases cortas y claras (acorde a la edad objetivo de la historia específica).
3.  **Tono:** Dependerá de la historia en cuestión (ej. aventura, misterio, aprendizaje, terror infantil, etc.). Deberás consultar el archivo de concepto de cada cuento.

## Stack Tecnológico
*   **Core:** HTML5, CSS3 y JavaScript (Vainilla). Servido como PWA (Service Worker) cien por ciento offline mediante "Cache First". Sin frameworks, ni CDNs.
*   **Tipografía:** Nunito (Google Fonts) — única dependencia externa.
*   **Estructura:** Multi-historia. Cada historia tiene su propia carpeta en `/historias/{id}/` con sus datos (`descenas/`, `desafios/`), imágenes y configuración.
*   **Biblioteca:** Pantalla inicial para seleccionar qué historia jugar.
*   **Desafíos:** Minijuegos (observación, clicks) y "desafíos reales" (preguntas a un adulto).
*   **Servidor:** Sitio estático — requiere un servidor HTTP local (los ES Modules no funcionan abriendo el `index.html` directo). Opciones: Apache/XAMPP, `python -m http.server 8000`, Live Server (VS Code), o cualquier equivalente.

---

## Arquitectura del Motor de Juego

> Documentación técnica detallada en la carpeta `documentacion/` (`documentacion/index.md`). Acá va el resumen para orientar a cualquier agente.

### Flujo Macro
`main.js` → `BibliotecaManager` (Selección) → `GameEngine` (Juega historia seleccionada)

### Módulos JavaScript (`/js/`)

El motor usa **ES Modules nativos** con inyección de dependencias. Todos los módulos usan campos privados (`#`).

| Módulo | Rol |
|--------|-----|
| `main.js` | Bootstrap: instancia módulos y arranca `BibliotecaManager` |
| `BibliotecaManager.js` | **Nuevo**: Gestiona la pantalla de selección de historias y carga configs |
| `GameEngine.js` | Orquestador de una historia específica. Carga dinámica desde `historia.json` |
| `ContentLoader.js` | Fetch de JSONs con rutas dinámicas (`rutaBase + rutaRelativa`) |
| `StateManager.js` | Estado aislado por historia (`biblioteca_{id}`) |
| `ImagePreloader.js` | Precarga con rutas dinámicas por historia |
| `SceneRenderer.js` | Composición visual: fondo + elementos + texto + opciones |
| `EffectsRenderer.js` | **Nuevo**: Capa visual dinámica (ej. luciérnagas) renderizada vía "efectos" en el JSON |
| `ChallengeManager.js` | Registry de handlers de desafíos (Strategy Pattern) |
| `UIManager.js` | Controles permanentes + **Logo de carga dinámico** |
| `AudioManager.js` | Sistema de audio (fondo, narración, efectos) |
| `DevPanel.js` | Panel de desarrollo: lazy, zero-impact en producción (`?dev=true` / `Ctrl+Shift+D`) |

### Challenge Handlers (`/js/challenges/`)

| Handler | Subtipo JSON | Mecánica |
|---------|-------------|----------|
| `PreguntaRealHandler.js` | `pregunta_real` | Pregunta aleatoria con opciones múltiples, correcta marcada en JSON |
| `ObservacionHandler.js` | `minijuego_observacion` | Encontrar elemento con `correcto: true` en la escena |
| `ClicksHandler.js` | `minijuego_clicks` | Clickear objeto N veces con mensajes progresivos |

Para agregar un nuevo tipo: crear handler con método `ejecutar(datos, panelEl, preloader) → Promise<boolean>`, registrarlo en `main.js` con `challengeManager.registrar('subtipo', handler)`.

### Archivos CSS (`/css/`)

| Archivo | Contenido |
|---------|-----------|
| `reset.css` | Reset + prevención zoom táctil |
| `variables.css` | Design tokens: paleta bosque mágico, tipografía `clamp()`, z-index, botones |
| `layout.css` | Contenedor 16:9 centrado, indicador de carga, botones UI circulares con glassmorphism |
| `escena.css` | Fondo `cover`, elementos con custom properties (`--x`, `--y`, `--ancho`), panel texto, botones |
| `desafios.css` | Layout minijuegos, área interactiva, feedback éxito/fallo |
| `animaciones.css` | Keyframes: float, bounce, shake, pulse, fadeIn, partículas |
| `inicio.css` | Pantalla de inicio: overlay, título dorado, botón "Jugar" con shimmer, luciérnagas |
| `biblioteca.css` | Estilos visuales de la pantalla de selección de historias |
| `ui.css` | Estados toggle de botones |
| `dev-panel.css` | Panel de desarrollo: glassmorphism, slide-in, acordeón (cargado dinámicamente) |

### Sistema de Capas (Z-index)

| Z | Elemento | Función |
|---|----------|---------|
| 0 | `.escena-fondo` | Imagen de fondo de la escena |
| 10 | `.escena-elementos` | Contenedor compartido de efectos (`.efecto-contenedor`, z default 5) y elementos visuales (`.elemento-visual`, z default 10) |
| 100 | `#panel-texto` | Texto narrativo |
| 200 | `#panel-opciones` | Botones de decisión |
| 300 | `#panel-desafio` | Overlay de minijuegos |
| 1000 | `#pantalla-inicio` | Portada de historia (Dinámica) |
| 1050 | `#pantalla-biblioteca` | Selección de historias |
| 1100 | `.ui-controles` | Botones permanentes |
| 1200 | `#indicador-carga` | Logo de la historia (animado) |
| 1500 | `#panel-dev` | Panel de desarrollo (solo en modo dev) |

### Flujo Principal

```
Biblioteca → Click Historia 
  ├─ Sin partida previa → Pantalla Inicio Historia
  │                         └── Jugar → renderEscena(INICIO)
  └─ Con partida previa → Modal Confirmación
       ├─ Continuar → Reanuda escena sin pasar por pantalla de inicio
       └─ Empezar de cero → Limpia memoria → Pantalla Inicio Historia 
                              └── Jugar → renderEscena(INICIO)
       
(Desde cualquier punto del juego):
  ├── Salir → Volver a Biblioteca
  └── Reiniciar → Volver a Pantalla Inicio Historia
```

### Estado y Recompensas

*   **Persistencia:** `localStorage` (clave `"biblioteca_{id}"` o `"biblioteca"`). La partida se guarda y no se pierde al cerrar la pestaña.
*   **Recompensas activas:** Los flags o ítems obtenidos se guardan en el estado (los IDs y descripciones dependen de la configuración de cada historia).
*   **Condiciones en JSON:** Campo `"condicion": "tiene_X"` → evalúa si el jugador tiene la recompensa o flag `X`. Si no la tiene, la opción NO se renderiza.

### Convenciones de Imágenes

El `ImagePreloader` resuelve rutas en base al parámetro opcional `tipo` (default: "fondo"). En el caso de los personajes, resuelve dinámicamente su subcarpeta.

| Tipo (parámetro) | Carpeta destino (dentro de `historias/{id}/`) |
|---------|----------------|
| `fondo` | `imagenes/fondos/` |
| `personaje` | `imagenes/personajes/{id}/` |
| `objeto` | `imagenes/objetos/` |

### Transiciones

Opacity + `setTimeout` (no `animationend` — causa problemas de event bubbling con animaciones hijas). Duración: 400ms, sincronizada con `--transicion-escena` en CSS.

---

## Guía de Estilo Visual (IA de Imágenes)
Las directivas visuales específicas (estilo, atmósfera, diseño de personajes) **dependerán de la historia actual**. 
Siempre debés consultar el archivo `concepto.md` de la historia en curso antes de generar nuevos recursos.

Reglas Globales (Aplican a todas las historias):
*   **Formato Fondos:** Relación 16:9.
*   **Formato Personajes u Objetos:** Relación 9:16 (con fondo negro sólido que se remueve luego, o máscara si la herramienta IA lo permite).
*   **Consistencia:** Los personajes suelen estar basados en personas reales, manteniendo sus rasgos clave dentro del estilo artístico elegido para la historia.

## Agent Skills (Herramientas IA)

El proyecto cuenta con skills específicas inyectadas automáticamente en tu contexto para asistir en el desarrollo y mantenimiento.
**Regla:** Revisá siempre tu lista de `<skills>` disponibles y **usá estas herramientas nativas** del proyecto antes de intentar resolver tareas complejas a ciegas o leyendo archivos manualmente.

| Skill | Rol |
|-------|-----|
| `docs` | **Documentación integral:** consultar, auditar, corregir, crear y sincronizar toda la documentación técnica y narrativa del proyecto |
| `code-auditor` | **Auditoría de código:** detectar bugs, hardcodeos, magic numbers, inconsistencias, dead code y oportunidades de refactorización |
| `dev-server` | Levantar servidor HTTP local para servir el proyecto |
| `sw-updater` | Gestionar actualizaciones del caché en `service-worker.js` |

## Referencia de Documentación

| Archivo | Contenido |
|---------|-----------|
| `documentacion/index.md` | **Índice principal de la documentación técnica** |
| `documentacion/arquitectura.md` | Arquitectura del motor, módulos JS y flujo de ejecución |
| `documentacion/ui_estilos_capas.md` | Sistema de capas (Z-index), estilos CSS, animaciones y UI |
| `documentacion/estado_recompensas.md` | Persistencia (localStorage), recompensas y precarga |
| `documentacion/formato_historia.md` | Contrato JSON de historias y guías de extensibilidad |
| `documentacion/formato_escenas.md` | Esquema JSON para escenas y desafíos |
| `historias/el-misterio-del-bosque-encantado/concepto.md` | Esencia, tema, tono y personajes reales |
| `historias/el-misterio-del-bosque-encantado/resumen_detallado.md` | Mapa lógico de la historia y ramificaciones |
| `historias/el-misterio-del-bosque-encantado/historia.md` | Guion completo, diálogos y descripciones |

## Reglas de Laburo
1.  **Consulta Previa:** Si una tarea implica modificar cualquiera de estos archivos de documentación (`.md`), **DEBÉS PREGUNTAR AL USUARIO** antes de realizar el cambio.
2.  **Consistencia:** Cualquier actualización aprobada debe reflejarse coherentemente en todos los documentos relacionados.
3.  **Sin dependencias:** No agregar bibliotecas, frameworks ni CDNs. Todo es vanilla.
4.  **Campos privados:** Usar `#` en todas las clases JS. No exponer internos.
5.  **Contenido en JSON:** La narrativa, configuración de desafíos y lógica de ramificación viven en los JSONs, NO hardcodeadas en JavaScript.
6.  **Documentación:** Ante cambios significativos en módulos, actualizar los archivos de la carpeta `documentacion/`. No se debe dejar registro de "cómo era antes" sino solo importa cómo queda el proyecto actual.
7.  **Consultas PWA:** Si agregás, renombrás o eliminás recursos estáticos (imágenes, audios o JSONs) o creás una historia nueva, ESTÁS OBLIGADO a preguntarle al usuario si debés actualizar el caché del `service-worker.js`. De lo contrario el juego quedará roto al abrirse modo avión. No asumas ni ejecutes modificaciones enteras al SW en silencio.
8.  **Navegador con DevPanel:** Si usás una herramienta que abre el proyecto en un navegador, agregá el parámetro `?dev=true` a la URL (o activalo con `Ctrl+Shift+D` una vez cargado). Esto habilita el **Panel de Desarrollo**, que te da visibilidad del estado actual, escena, recompensas y herramientas de depuración sin tocar la consola.

---
*Si sos una IA y estás leyendo esto: Portate bien, consultá antes de tocar los documentos de planificación, y tené siempre en cuenta que el voseo y el tono rioplatense son innegociables para mantener la identidad del proyecto.*
