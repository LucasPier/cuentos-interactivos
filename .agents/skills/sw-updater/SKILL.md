---
name: sw-updater
description: |
  Actualiza el service-worker.js de "La Biblioteca del Tío Pier".
  Detecta la rama git actual y analiza los archivos a impactar:
  en `main` analiza solo los cambios sin commitear; en cualquier otra
  rama analiza además todos los cambios commiteados vs main, reflejando
  el impacto total del merge futuro. Pregunta siempre antes de modificar VERSION_APP.
  Activar cuando el usuario mencione: actualizar service worker, actualizar SW,
  actualizar caché PWA, nuevo recurso al SW, nuevo archivo offline, bump caché,
  versión service worker, archivo huérfano en caché, nueva historia al SW,
  modo avión roto, PWA no actualiza, service-worker.js, agregar al caché.
---

# sw-updater — Actualizador del Service Worker

Script de análisis + guía de decisiones para mantener el `service-worker.js` sincronizado con los archivos reales del proyecto.

## Documentación de Referencia

- `resources/estructura-sw.md` — Tabla de cachés actuales, heurísticas y notas de implementación
- `scripts/analizar-sw.py` — Script de análisis (solo lectura)

---

## Cuándo Usar

- El usuario comiteó o está por commitear archivos nuevos/modificados que deben estar disponibles offline
- El usuario pregunta explícitamente por el SW o las cachés
- Aparece la regla de laburo de `GEMINI.md`: *"Si agregás, renombrás o eliminás recursos estáticos, consultá si actualizar el SW"*
- El usuario pide actualizar un archivo específico en el SW

---

## Comportamiento según Rama Git

El script detecta automáticamente en qué rama se encuentra el usuario:

| Rama actual | Qué analiza |
|-------------|--------------|
| `main` | Solo cambios **sin commitear** (`git status`) |
| Cualquier otra | Cambios sin commitear **+** diff commiteado vs `main` (`git diff main...HEAD`) |

---

## Decision Tree

```
Usuario pide actualizar SW
  ├── Archivos ESPECÍFICOS mencionados
  │    └── Modo manual: ejecutar analizar-sw.py --archivo <rutas...>
  │         → Ir al paso "Analizar resultado"
  │
  └── Sin archivos específicos
       └── Ejecutar analizar-sw.py (modo git)
            → Ir al paso "Analizar resultado"

── Analizar resultado ──────────────────────────────
  ├── 📦 CACHÉS AFECTADAS (archivos modificados)
  │    └── Proponer bump de versión (+1) de las variables correspondientes
  │
  ├── 🆕 ARCHIVOS NUEVOS sin caché asignada
  │    ├── css/*.css             → cache-css
  │    ├── js/challenges/*.js    → cache-challenges
  │    ├── js/*.js               → cache-js
  │    ├── biblioteca/*          → cache-biblioteca
  │    ├── historias/{id}/datos/ → cache-{id}-datos
  │    ├── historias/{id}/audios/→ cache-{id}-audios
  │    ├── historias/{id}/imag./ → cache-{id}-imagenes
  │    └── Nueva historia completa → proponer 3 cachés nuevas (ver resources/)
  │
  ├── 👻 ENTRADAS HUÉRFANAS (en SW, archivo inexistente)
  │    └── Proponer eliminar esas líneas del SW
  │
  └── Preguntar al usuario: "¿Actualizamos también VERSION_APP?"
       └── Solo si responde SÍ explícitamente → modificar VERSION_APP
```

---

## Cómo Ejecutar el Script

```bash
# Desde la raíz del proyecto:
python .agents/skills/sw-updater/scripts/analizar-sw.py

# Con archivos específicos:
python .agents/skills/sw-updater/scripts/analizar-sw.py --archivo ruta/a/archivo.json otra/ruta.webp

# Ayuda completa:
python .agents/skills/sw-updater/scripts/analizar-sw.py --help
```

El script es de **solo lectura**. No modifica nada.

---

## Reglas de Oro

1. **Nunca** modificar `service-worker.js` sin mostrar primero los cambios propuestos y obtener confirmación del usuario.
2. **`VERSION_APP`** se actualiza separadamente y solo con confirmación explícita ("sí", "dale", "actualizala").
3. Si hay archivos nuevos de una **nueva historia**, ver `resources/estructura-sw.md` → sección "Agregar una nueva historia".
4. Bumpeár la versión de caché = incrementar en 1 la constante numérica (`'1'` → `'2'`). El SW limpia las cachés viejas automáticamente en `activate`.
5. Consultar `resources/estructura-sw.md` para la tabla de cachés actualizada y las heurísticas de clasificación.

---

## Ejemplo de Flujo

```
1. Ejecutar: python .agents/skills/sw-updater/scripts/analizar-sw.py
2. Leer el reporte
3. Proponer al usuario los cambios en service-worker.js (diff claro)
4. Preguntar: "¿Actualizamos VERSION_APP de 1.0.0 a 1.0.1?"
5. Con aprobación → aplicar cambios con replace_file_content / multi_replace_file_content
```
