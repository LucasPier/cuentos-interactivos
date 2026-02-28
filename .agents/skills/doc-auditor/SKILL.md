---
name: doc-auditor
description: |
  Audita, corrige y crea documentación .md del proyecto. Requiere aprobación antes de modificar.
  Activar al pedir: auditar docs, revisar documentación, corregir doc, documentar algo nuevo.
---

# doc-auditor — Auditor y Gestor de Documentación

Skill central para mantener y expandir la documentación técnica del proyecto.

## Documentación de Referencia

- `resources/auditorias.md` — Criterios detallados de qué verificar en cada modo
- `resources/informe-formato.md` — Template del informe de hallazgos
- `resources/docs-inventario.md` — Inventario de docs auditables y fuentes de verdad
- `resources/documentar-nuevo.md` — Guía para crear nueva documentación

---

## Decision Tree

```
¿Qué pidió el usuario?
  │
  ├── Auditar UN documento específico  →  MODO: AUDITORÍA PARTICULAR
  │
  ├── Auditar la documentación         →  MODO: AUDITORÍA GENERAL
  │   del proyecto / esquema global
  │
  └── Documentar algo nuevo            →  MODO: DOCUMENTAR NUEVO
      (nueva sección, nuevo archivo)
```

---

## Modo 1: Auditoría Particular

**Objetivo:** Verificar que un archivo `.md` específico sea correcto y esté completo.

**Pasos:**

1. Leer el archivo completo con `view_file`
2. Identificar las fuentes de verdad según `resources/docs-inventario.md`
3. Leer los archivos fuente relevantes (JS, CSS, JSONs de ejemplo)
4. Comparar: buscar afirmaciones incorrectas, información faltante, referencias rotas, ejemplos desactualizados
5. Emitir informe usando el formato de `resources/informe-formato.md`
6. Pedir aprobación al usuario
7. Con aprobación → aplicar correcciones

**Criterios detallados:** ver `resources/auditorias.md` → sección *Auditoría Particular*.

---

## Modo 2: Auditoría General

**Objetivo:** Verificar la salud del esquema global de documentación.

> [!IMPORTANT]
> Cargá los archivos **de a uno** para no saturar el contexto.
> Emitir hallazgos parciales después de cada archivo, antes de pasar al siguiente.

**Pasos:**

1. **Paso 1 — `GEMINI.md`:** Leer con `view_file`. Verificar tablas de módulos JS, CSS, skills. Emitir hallazgos parciales.
2. **Paso 2 — `documentacion/index.md`:** Leer. Verificar que los archivos listados existan y las descripciones sean correctas. Emitir hallazgos parciales.
3. **Paso 3 (si hace falta):** Revisar cabecera/primer bloque de cada doc en `documentacion/` para detectar discrepancias con el índice.
4. Consolidar todos los hallazgos parciales en un informe final
5. Pedir aprobación al usuario
6. Con aprobación → aplicar correcciones

**Criterios detallados:** ver `resources/auditorias.md` → sección *Auditoría General*.

---

## Modo 3: Documentar Nuevo Contenido

**Objetivo:** Crear documentación de algo que aún no está documentado.

**Pasos:**

1. Preguntar: ¿qué hay que documentar y dónde debería vivir?
   - ¿En un doc existente? → leer ese doc primero y proponer la nueva sección
   - ¿Requiere archivo nuevo? → proponer nombre, estructura y contenido
2. Verificar que no duplique info ya existente (revisar `index.md` y `GEMINI.md`)
3. Mostrar el draft completo al usuario y pedir aprobación
4. Con aprobación → crear/modificar archivo
5. Si corresponde → proponer actualizaciones en `documentacion/index.md` y/o `GEMINI.md`

**Guía completa:** ver `resources/documentar-nuevo.md`.

---

## Reglas de Oro

1. **Nunca modificar** sin mostrar draft/diff y recibir aprobación explícita (aplica los tres modos)
2. **Informe primero, correcciones después** — son dos pasos siempre separados
3. **Auditoría general = carga progresiva** — un doc a la vez, hallazgos parciales en el camino
4. **Auditoría particular = profundidad** — leer el código real para verificar afirmaciones
5. **Documentar nuevo = verificar duplicados** antes de proponer contenido
6. **Si un cambio afecta `index.md` o `GEMINI.md`**, proponer esas actualizaciones junto al cambio principal

---

## Ejemplo de Flujo (Auditoría Particular)

```
1. Usuario: "auditá arquitectura.md"
2. Leer documentacion/arquitectura.md
3. Leer fuentes: js/GameEngine.js, js/main.js, etc. (ver inventario)
4. Comparar | detectar diferencias
5. Emitir informe con hallazgos (severidad ALTA/MEDIA/BAJA)
6. Preguntar: "¿Aplico las correcciones?"
7. Con aprobación → editar el archivo
```
