# Checks Cross-cutting — Criterios de Auditoría Transversal

Criterios que abarcan múltiples tipos de archivo (JS, CSS, JSON, HTML).
El script `auditar.py` cubre: rutas de imágenes, transiciones desinc., catálogo.

---

## 1. Consistencia Z-index CSS ↔ JSON ↔ Documentación

**Fuentes de verdad:**
- Definición: `css/variables.css` (`:root`)
- Documentación: `documentacion/ui_estilos_capas.md` y `AGENTS.md`
- Uso en CSS: todos los archivos `.css`
- Uso en JSON: campo `z_index` en `estilo` de elementos y efectos

**Qué buscar:**
- Valores z-index en CSS que no correspondan al sistema de variables
- Elementos JSON con `z_index` fuera del rango documentado
- Documentación desactualizada respecto a los valores reales en `variables.css`
- Nuevas capas agregadas sin actualizar la documentación

---

## 2. Rutas de Imágenes: JSON ↔ Filesystem

**Convención de resolución:**
```
ImagePreloader.resolverRuta(archivo, tipo, id) →
  fondo     → {rutaBase}imagenes/fondos/{archivo}
  personaje → {rutaBase}imagenes/personajes/{id}/{archivo}
  objeto    → {rutaBase}imagenes/objetos/{archivo}
```

**Qué buscar:**
- IDs de personaje en JSON que no tengan carpeta correspondiente
- Archivos de imagen referenciados que no existan en el filesystem
- Imágenes en el filesystem que no estén referenciadas por ningún JSON (posible dead asset)
- Extensiones incorrectas (ej: `.png` donde debería ser `.webp`)

---

## 3. Sincronización de Transiciones JS ↔ CSS

**Fuentes:**
- JS: `SceneRenderer.#DURACION_TRANSICION`
- CSS: `--transicion-escena` en `variables.css`

**Qué buscar:**
- Valores duplicados (JS hardcodea lo que debería leer del CSS)
- Nuevas transiciones en JS que no estén sincronizadas con CSS
- Timeouts en JS (ej: en handlers) que deberían coincidir con duraciones CSS

---

## 4. IDs de DOM: HTML ↔ JS ↔ CSS

**IDs críticos del sistema:**
- `#juego` — Contenedor principal
- `#escena` — Composición visual
- `#panel-texto` — Texto narrativo
- `#texto-narrativo` — Contenido del texto
- `#panel-opciones` — Botones de decisión
- `#panel-desafio` — Overlay de minijuegos
- `#pantalla-inicio` — Portada de historia
- `#pantalla-biblioteca` — Selección de historias
- `#indicador-carga` — Logo de carga

**Qué buscar:**
- IDs referenciados en JS (`getElementById`, `querySelector('#...')`) que no existan en HTML
- IDs en CSS que no existan en HTML
- IDs duplicados en HTML (inválido)
- Cambio de ID en HTML sin actualizar JS y CSS

---

## 5. localStorage Keys

**Convención:** `biblioteca_{historiaId}` (ej: `biblioteca_el-misterio-del-bosque-encantado`).

**Qué buscar:**
- Keys sin el prefijo `biblioteca_`
- Fallbacks con clave genérica `"biblioteca"` (vestigio, no debería usarse)
- Datos persistidos que no se limpian al "empezar de cero"
- Colisiones de keys entre historias diferentes

---

## 6. Catálogo ↔ Historias Reales

**Fuentes:**
- `biblioteca/historias.json` — Lista de historias publicadas
- `historias/*/historia.json` — Configuración de cada historia

**Qué buscar:**
- Historias con carpeta y `historia.json` que no estén en el catálogo
- Entradas del catálogo que apunten a historias inexistentes
- Rutas en el catálogo que no coincidan con la carpeta real

---

## 7. Flujo de Audio: JSON ↔ AudioManager

**Convención:**
- `audio` en escena/desafío → `AudioManager.reproducirMusica()`
- `audio_narracion` → `AudioManager.reproducirNarracion()` (si implementado)
- `sfx` en configuración de desafío → `AudioManager.reproducirEfecto()`

**Qué buscar:**
- Archivos de audio referenciados en JSON que no existan
- Audios en el filesystem no referenciados (dead assets)
- `audio_narracion` usado en JSONs pero método no implementado en AudioManager
- Audios no incluidos en la caché del SW

---

## 8. Efectos Visuales: JSON ↔ EffectsRenderer ↔ CSS

**Qué buscar:**
- Tipos de efecto en JSON que no estén implementados en `EffectsRenderer`
- Animaciones CSS referenciadas en JSON (`efecto`, `animacion`) que no existan en `animaciones.css`
- Clases CSS de efecto definidas pero nunca generadas por `EffectsRenderer`
- Colores de efecto que referencien nombres no mapeados en `EffectsRenderer`

---

## 9. Documentación ↔ Código Real

**Qué buscar:**
- Tablas de módulos en `AGENTS.md` desactualizadas (módulos nuevos o eliminados)
- `documentacion/arquitectura.md` que no refleje cambios en módulos JS
- `documentacion/ui_estilos_capas.md` con z-index desactualizados
- `documentacion/formato_escenas.md` con campos que cambiaron
- `documentacion/formato_historia.md` con estructura desactualizada

> **Nota:** Para auditoría de documentación en profundidad, usar la skill `docs` (modo auditoría).
> Este check cross-cutting solo detecta desincronización evidente entre código y docs.
