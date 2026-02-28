---
name: code-auditor
description: |
  Activar para auditar código, hacer code review, buscar bugs, revisar calidad, refactorizar, detectar inconsistencias, hardcodeos o código muerto.
---

# code-auditor — Auditoría de Código del Proyecto

Skill híbrida que combina un script Python para detección mecánica de hallazgos
con instrucciones para que el agente haga análisis semántico profundo.

## Recursos

- `resources/checks-js.md` — Criterios detallados para JavaScript
- `resources/checks-css.md` — Criterios detallados para CSS
- `resources/checks-json.md` — Criterios detallados para JSONs de escenas/desafíos
- `resources/checks-pwa.md` — Criterios para PWA y Service Worker
- `resources/checks-cross.md` — Checks transversales (cross-cutting)
- `resources/informe-formato.md` — Template del informe de auditoría
- `scripts/auditar.py` — Script de detección automática (solo lectura)

---

## Decision Tree

```
¿Qué necesitás auditar?
  │
  ├── Todo el proyecto                    →  MODO 1: AUDITORÍA COMPLETA
  │
  ├── Una categoría específica            →  MODO 2: AUDITORÍA POR ÁREA
  │   (js, css, json, pwa, cross)
  │
  └── Un archivo en particular            →  MODO 3: AUDITORÍA DE ARCHIVO
```

---

## Modo 1 — AUDITORÍA COMPLETA

**Objetivo:** Escanear todo el proyecto en busca de defectos y mejoras.

### Pasos

1. Ejecutar el script automático:
```bash
python .agents/skills/code-auditor/scripts/auditar.py
```

2. Leer el JSON de salida del script (hallazgos mecánicos).

3. Para cada categoría (js, css, json, pwa, cross), cargar el recurso
   correspondiente (`resources/checks-{cat}.md`) y hacer análisis semántico:
   - Leer los archivos relevantes del proyecto
   - Aplicar los criterios de análisis semántico listados en el recurso
   - Anotar hallazgos que el script no puede detectar

4. Consolidar hallazgos (automáticos + semánticos) en informe
   usando `resources/informe-formato.md`.

5. Presentar informe al usuario y preguntar qué corregir.

> **IMPORTANTE:** Cargá los archivos de a uno para no saturar el contexto.
> Emití hallazgos parciales por categoría antes de pasar a la siguiente.

---

## Modo 2 — AUDITORÍA POR ÁREA

**Objetivo:** Auditar en profundidad una categoría específica.

### Categorías válidas

| Categoría | Qué cubre | Recurso |
|-----------|-----------|---------|
| `js` | Módulos JS, handlers, patterns | `resources/checks-js.md` |
| `css` | Estilos, variables, z-index, layout | `resources/checks-css.md` |
| `json` | Escenas, desafíos, schema, voseo | `resources/checks-json.md` |
| `pwa` | Service Worker, manifest, cachés | `resources/checks-pwa.md` |
| `cross` | Consistencia inter-módulo | `resources/checks-cross.md` |

### Pasos

1. Ejecutar script filtrado:
```bash
python .agents/skills/code-auditor/scripts/auditar.py --categoria js
```

2. Cargar `resources/checks-{categoria}.md` completo.

3. Leer los archivos del proyecto relevantes a esa categoría.

4. Aplicar todos los criterios (mecánicos del script + semánticos del recurso).

5. Emitir informe usando `resources/informe-formato.md`.

---

## Modo 3 — AUDITORÍA DE ARCHIVO

**Objetivo:** Revisar un archivo específico a fondo.

### Pasos

1. Ejecutar script con archivo:
```bash
python .agents/skills/code-auditor/scripts/auditar.py --archivo js/GameEngine.js
```

2. Determinar la categoría del archivo por extensión/ubicación:
   - `.js` → cargar `resources/checks-js.md`
   - `.css` → cargar `resources/checks-css.md`
   - `.json` (en `datos/`) → cargar `resources/checks-json.md`
   - `service-worker.js` / `manifest.json` → cargar `resources/checks-pwa.md`

3. Leer el archivo completo.

4. Aplicar todos los criterios de su categoría + checks cross-cutting relevantes.

5. Emitir informe usando `resources/informe-formato.md`.

---

## Ejemplo de Flujo

```
Usuario: "Auditá el código JavaScript del proyecto"

1. python .agents/skills/code-auditor/scripts/auditar.py --categoria js
2. Leer resources/checks-js.md
3. Leer cada módulo en js/ → aplicar criterios semánticos
4. Consolidar hallazgos automáticos + semánticos
5. Presentar informe categorizado
6. "¿Querés que corrija alguno de estos hallazgos?"
```

---

## Reglas de Oro

1. **Informe primero, correcciones después** — nunca corregir sin aprobación explícita
2. **El script es de solo lectura** — no modifica ningún archivo del proyecto
3. **Análisis semántico obligatorio** — el script cubre lo mecánico, el agente debe
   complementar leyendo el código real y aplicando los criterios de `resources/`
4. **Carga progresiva** — en auditoría completa, procesar una categoría a la vez
5. **Contexto del proyecto** — respetar las convenciones de `AGENTS.md` como fuente de verdad
6. **Voseo rioplatense** — el informe se escribe en español rioplatense
7. **Usar `--help`** — ante dudas sobre el script, ejecutar `auditar.py --help`
