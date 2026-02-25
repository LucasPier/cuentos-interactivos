---
name: doc-estilos
description: |
  Carga la documentación de UI, estilos y capas visuales de "La Biblioteca del Tío Pier".
  Activar cuando se mencione o se trabaje sobre: CSS, estilos, animaciones, z-index,
  capas visuales, design tokens, variables CSS, tipografía, layout 16:9, pantalla de inicio,
  biblioteca visual, botones UI, glassmorphism, keyframes, responsive, transiciones,
  reset.css, variables.css, layout.css, escena.css, desafios.css, animaciones.css,
  inicio.css, ui.css.
---

# doc-estilos

Skill de documentación contextual. Su único rol es asegurarse de que el agente tenga
el sistema de estilos y capas del motor antes de tocar cualquier archivo CSS o diseñar
elementos visuales nuevos.

## Cuándo usar

- Modificar o crear cualquier archivo en `/css/`
- Agregar o ajustar animaciones (keyframes, clases de animación combinada)
- Trabajar con el sistema de capas Z-Index
- Diseñar nuevos elementos de UI (botones, paneles, overlays)
- Diagnosticar problemas de layout, solapamiento o responsive
- Definir o cambiar design tokens (colores, tipografía, espaciado)

## Instrucción obligatoria

Antes de modificar cualquier archivo CSS o diseñar elementos visuales nuevos, DEBÉS leer
el archivo `documentacion/ui_estilos_capas.md` ubicado en la raíz del proyecto
(resolvé la ruta absoluta desde tu contexto de workspace y usá `view_file`).

No asumir nada sobre las variables CSS, el sistema de capas o las clases de animación
disponibles sin haber leído ese archivo primero.

## Referencia rápida (sin reemplazar la lectura del archivo)

| Archivo CSS | Contenido |\n|-------------|-----------|\n| `reset.css` | Reset + prevención zoom táctil |\n| `variables.css` | Design tokens: paleta, tipografía `clamp()`, z-index, botones |\n| `layout.css` | Contenedor 16:9, indicador de carga, botones circulares glassmorphism |\n| `escena.css` | Fondo `cover`, elementos con `--x`/`--y`/`--ancho`, panel texto |\n| `desafios.css` | Layout minijuegos, área interactiva, feedback éxito/fallo |\n| `animaciones.css` | Keyframes: float, bounce, shake, pulse, fadeIn, partículas |\n| `inicio.css` | Portada historia: overlay, título, botón shimmer, luciérnagas |\n| `ui.css` | Estados toggle de botones UI permanentes |

### Sistema de capas Z-Index (resumen)

| Z | Elemento |
|---|----------|
| 0 | `#escena` — fondo + personajes |
| 100 | `#panel-texto` — narrativa |
| 200 | `#panel-opciones` — botones decisión |
| 300 | `#panel-desafio` — overlay minijuegos |
| 1000 | `#pantalla-inicio` — portada de historia |
| 1050 | `#pantalla-biblioteca` — selección de historias |
| 1100 | `.ui-controles` — botones permanentes |
| 1200 | `#indicador-carga` — logo animado |
