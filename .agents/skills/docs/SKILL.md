---
name: docs
description: |
  Gestión integral de documentación técnica del proyecto: consultar, auditar, corregir, crear y sincronizar.
  Activar al: trabajar con módulos JS, CSS, escenas JSON, estado, recompensas, historias, extensibilidad,
  auditar docs, revisar documentación, documentar algo nuevo, sincronizar historia.md con JSONs.
---

# docs — Documentación Técnica del Proyecto

Skill unificada para consultar, auditar, producir y sincronizar la documentación técnica
de La Biblioteca del Tío Pier.

## Recursos Incluidos

- `resources/inventario.md` — Fuentes de verdad por documento auditable
- `resources/auditorias.md` — Criterios detallados de verificación por modo
- `resources/informe-formato.md` — Template del informe de hallazgos
- `resources/documentar-nuevo.md` — Guía para crear documentación nueva
- `scripts/check_texts.py` — Compara textos narrativos JSON vs `historia.md`
- `scripts/check_opciones.py` — Compara opciones/botones JSON vs `historia.md`
- `scripts/update_md.py` — Actualiza `historia.md` con textos de los JSONs

---

## Decision Tree

```
¿Qué necesitás hacer?
  │
  ├── Consultar documentación antes de modificar código  →  MODO 1: CONSULTAR
  │
  ├── Auditar UN documento o la documentación general    →  MODO 2: AUDITAR
  │
  ├── Documentar algo nuevo (sección o archivo)          →  MODO 3: DOCUMENTAR
  │
  └── Sincronizar textos entre JSONs y historia.md       →  MODO 4: SINCRONIZAR
```

---

## Modo 1 — CONSULTAR

**Objetivo:** Cargar la documentación técnica correcta antes de modificar código, estilos,
escenas o configuración del motor.

### Instrucción obligatoria

Antes de modificar cualquier archivo del proyecto, **DEBÉS leer el documento correspondiente**
según la tabla de abajo. Usá `view_file` con la ruta absoluta resuelta desde tu workspace.

### Tabla de referencia rápida

| Vas a trabajar con… | Leé este archivo | Ruta |
|----------------------|------------------|------|
| Módulos JS, GameEngine, flujo de ejecución, PWA, Service Worker | Arquitectura | `documentacion/arquitectura.md` |
| Archivos CSS, animaciones, z-index, layout, design tokens | UI, Estilos y Capas | `documentacion/ui_estilos_capas.md` |
| localStorage, recompensas, flags, condiciones, precarga | Estado y Recompensas | `documentacion/estado_recompensas.md` |
| Escenas JSON, desafíos, minijuegos, ChallengeHandlers | Formato de Escenas | `documentacion/formato_escenas.md` |
| `historias.json`, `historia.json`, crear historia, nuevo handler | Formato y Extensibilidad | `documentacion/formato_historia.md` |

### Contexto narrativo (solo al trabajar con escenas)

Si vas a crear o modificar archivos JSON de escenas o desafíos, además del schema técnico
tenés que cargar el contexto narrativo de la historia en la que estás trabajando:

| Archivo (en `historias/{id}/`) | Contenido | Cuándo leerlo |
|-------------------------------|-----------|---------------|
| `concepto.md` | Protagonista, tono, personajes, estilo visual | Siempre |
| `resumen_detallado.md` | Árbol de decisiones, ramificaciones, finales | Siempre |
| `historia.md` | Guion completo con diálogos y descripciones | Solo si necesitás texto exacto |

> **El agente NO debe inventar texto narrativo, decisiones ni ramificaciones.**
> Todo debe ser consistente con lo documentado en esos archivos.

### Post-modificación de escenas

Después de crear o modificar escenas, **es obligatorio** actualizar los archivos de referencia
de la historia para mantener la consistencia:

- **`concepto.md`**: Si se agregaron personajes, cambió el alcance o se modificó algún rol.
- **`resumen_detallado.md`**: Si se agregaron, eliminaron o modificaron escenas/ramificaciones.
- **`historia.md`**: Con el texto narrativo y diálogos definitivos de las escenas nuevas o modificadas.

---

## Modo 2 — AUDITAR

**Objetivo:** Verificar que la documentación sea correcta, completa y esté actualizada.

### Submodo: Auditoría Particular

Auditar UN documento específico en profundidad.

**Pasos:**

1. Leer el archivo `.md` completo con `view_file`
2. Identificar las fuentes de verdad según `resources/inventario.md`
3. Leer los archivos fuente relevantes (JS, CSS, JSONs)
4. Comparar: buscar afirmaciones incorrectas, info faltante, ejemplos desactualizados
5. Emitir informe usando `resources/informe-formato.md`
6. **Pedir aprobación** al usuario
7. Con aprobación → aplicar correcciones

**Criterios detallados:** `resources/auditorias.md` → sección *Auditoría Particular*.

### Submodo: Auditoría General

Verificar la salud del esquema global de documentación.

> [!IMPORTANT]
> Cargá los archivos **de a uno** para no saturar el contexto.
> Emitir hallazgos parciales después de cada archivo, antes de pasar al siguiente.

**Pasos:**

1. **`AGENTS.md`:** Verificar tablas de módulos JS, CSS. Emitir hallazgos parciales.
2. **`documentacion/index.md`:** Verificar que archivos listados existan y descripciones sean correctas. Emitir hallazgos parciales.
3. **(opcional)** Revisar la cabecera de cada doc en `documentacion/` para detectar discrepancias con el índice.
4. Consolidar hallazgos en informe final (formato: `resources/informe-formato.md`)
5. **Pedir aprobación** al usuario
6. Con aprobación → aplicar correcciones

**Criterios detallados:** `resources/auditorias.md` → sección *Auditoría General*.

---

## Modo 3 — DOCUMENTAR

**Objetivo:** Crear documentación de algo que aún no está documentado.

**Pasos:**

1. Definir qué documentar y dónde:
   - ¿En un doc existente? → Leer ese doc y proponer la nueva sección
   - ¿Requiere archivo nuevo? → Proponer nombre, estructura y contenido
2. Verificar que no duplique info existente (revisar `index.md` y `AGENTS.md`)
3. Mostrar el draft completo al usuario y **pedir aprobación**
4. Con aprobación → crear/modificar archivo
5. Proponer actualizaciones en `documentacion/index.md` y/o `AGENTS.md` si corresponde

**Guía completa:** `resources/documentar-nuevo.md`

---

## Modo 4 — SINCRONIZAR

**Objetivo:** Verificar y corregir la sincronización entre textos en los JSONs de escenas
y el archivo `historia.md` de una historia específica.

### Directorio base

Los scripts esperan como `--dir` el directorio raíz de la historia, por ejemplo:
`d:/xampp/htdocs/cuentos-interactivos/historias/el-misterio-del-bosque-encantado`

### Flujo recomendado

1. **Verificar textos narrativos** (campo `texto` del JSON vs sección `TEXTO:` del MD):
```bash
python .agents/skills/docs/scripts/check_texts.py --dir <ruta-historia>
```

2. **Verificar opciones/botones** (campo `texto` de botones vs sección `OPCIONES:` del MD):
```bash
python .agents/skills/docs/scripts/check_opciones.py --dir <ruta-historia>
```

3. **Actualizar `historia.md`** solo si las diferencias son intencionales (JSON es la fuente de verdad):
```bash
python .agents/skills/docs/scripts/update_md.py --dir <ruta-historia> [--in-place]
```

> **Siempre** corré los scripts de verificación antes de actualizar.
> Usá `--help` en cualquier script para ver las opciones disponibles.

---

## Reglas de Oro

1. **Nunca modificar documentación** sin mostrar draft/diff y recibir aprobación explícita
2. **Informe primero, correcciones después** — siempre son dos pasos separados
3. **La documentación describe el estado ACTUAL** — no debe quedar registro de "cómo era antes"
4. **Voseo rioplatense** en toda la documentación técnica (ej. "cuando necesitás", "si querés agregar")
5. **Si un cambio impacta `index.md` o `AGENTS.md`**, proponer esas actualizaciones junto al cambio principal
6. **Auditoría general = carga progresiva** (un doc a la vez, hallazgos parciales)
7. **Auditoría particular = profundidad** (leer el código real para verificar afirmaciones)
