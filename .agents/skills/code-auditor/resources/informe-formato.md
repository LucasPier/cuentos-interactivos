# Formato del Informe de Auditoría de Código

Template para los informes generados por la skill `code-auditor`.

---

## Template

```markdown
## Informe de Auditoría de Código
**Fecha:** [fecha]
**Modo:** Completa | Por área ({categoría}) | Archivo ({ruta})
**Alcance:** [qué se analizó]

---

### 📊 Resumen

| Categoría | Hallazgos |
|-----------|-----------|
| 🐛 Bugs | N |
| 🔒 Hardcodeos | N |
| 🔢 Magic Numbers | N |
| 🔄 Refactorizaciones | N |
| ⚠️ Inconsistencias | N |
| 📦 PWA | N |
| 💀 Dead Code | N |
| **Total** | **N** |

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICA | N |
| 🟠 ALTA | N |
| 🟡 MEDIA | N |
| 🔵 BAJA | N |

---

### 🤖 Hallazgos Automáticos (Script)

[Hallazgos detectados por `auditar.py`]

| # | Sev. | Tipo | Archivo | Línea | Descripción | Sugerencia |
|---|------|------|---------|-------|-------------|------------|
| 1 | 🔴 | bug | ruta/archivo.js | 42 | Descripción | Solución |
| 2 | 🟠 | hardcodeo | ruta/otro.js | 60 | Descripción | Solución |
| ... | | | | | | |

---

### 🔍 Hallazgos Semánticos (Análisis del Agente)

[Hallazgos que requieren comprensión del código, no detectables mecánicamente]

| # | Sev. | Tipo | Archivo | Descripción | Sugerencia |
|---|------|------|---------|-------------|------------|
| 1 | 🟠 | refactor | ruta/modulo.js | Descripción detallada | Solución propuesta |
| ... | | | | | |

---

### ✅ Aspectos Conformes

[Lo que está bien — es importante documentar lo que SÍ cumple]

- Campos privados: ✅ Todas las clases usan `#` correctamente
- Inyección de dependencias: ✅ Centralizada en `main.js`
- [etc.]

---

### 📋 Acciones Sugeridas

#### Prioridad CRÍTICA (resolver ya):
1. [Descripción breve del hallazgo y su corrección]

#### Prioridad ALTA:
1. ...

#### Prioridad MEDIA (próxima iteración):
1. ...

#### Prioridad BAJA (mejora continua):
1. ...

---

¿Querés que corrija alguno de estos hallazgos?
```

---

## Criterios de Severidad

| Severidad | Criterio | Ejemplo |
|-----------|----------|---------|
| 🔴 **CRÍTICA** | Bug que rompe funcionalidad o bloquea el juego | JSON inválido, escena_inicial inexistente, Promise que nunca resuelve |
| 🟠 **ALTA** | Defecto que causa comportamiento incorrecto o viola regla del proyecto | Hardcodeo de ID en JS, target roto, imagen faltante, tuteo en texto |
| 🟡 **MEDIA** | Inconsistencia o deuda técnica que puede causar problemas futuros | z-index literal, `!important`, `animationend`, TODO abandonado |
| 🔵 **BAJA** | Mejora de calidad, limpieza, convención menor | Magic number, console.log residual, naming, color literal |

---

## Tipos de Hallazgo

| Tipo | Ícono | Descripción |
|------|-------|-------------|
| `bug` | 🐛 | Error funcional: algo no funciona como debería |
| `hardcodeo` | 🔒 | Valor que debería ser configurable/dinámico pero está fijo en código |
| `magic_number` | 🔢 | Número literal sin nombre que dificulta el mantenimiento |
| `inconsistencia` | ⚠️ | Discrepancia entre componentes que deberían ser coherentes |
| `refactor` | 🔄 | Oportunidad de código más limpio, legible o mantenible |
| `dead_code` | 💀 | Código sin uso, TODO abandonado, feature incompleto |
| `pwa` | 📦 | Problema de caché, manifest, o experiencia offline |

---

## Hallazgos Parciales (Auditoría Completa)

Cuando se procesa una categoría a la vez, emitir este formato intermedio:

```markdown
### 📂 {CATEGORÍA} — Hallazgos parciales

**Automáticos:** N hallazgos del script
**Semánticos:** N hallazgos del análisis

| # | Sev. | Tipo | Descripción breve |
|---|------|------|-------------------|
| 1 | 🟠 | tipo | Descripción |
| ... | | | |

*(Continuando con la siguiente categoría...)*
```

Al finalizar todas las categorías, consolidar en el template completo.

---

## Reglas del Informe

1. **Voseo rioplatense** en todo el informe (ej: "encontramos", "podés corregir")
2. **Siempre incluir "Aspectos Conformes"** — no es solo una lista de problemas
3. **Separar hallazgos automáticos de semánticos** — transparencia sobre qué detectó el script vs. el agente
4. **Acciones priorizadas** — agrupar correcciones por urgencia, no por tipo
5. **No corregir sin aprobación** — el informe cierra con pregunta
