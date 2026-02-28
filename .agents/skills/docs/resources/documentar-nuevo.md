# Guía para Documentar Nuevo Contenido

Esta guía aplica al **Modo 3** de la skill: cuando el usuario quiere documentar algo que aún no existe en la documentación del proyecto.

---

## Paso 1 — Entender Qué y Dónde

Antes de escribir una sola línea, hacerse estas preguntas:

**¿Qué hay que documentar?**
- ¿Es un módulo JS nuevo? → `documentacion/arquitectura.md`
- ¿Es un tipo de desafío/minijuego nuevo? → `documentacion/formato_escenas.md`
- ¿Es una nueva feature del motor (recompensas, condiciones)? → `documentacion/estado_recompensas.md`
- ¿Es una nueva convención visual/CSS? → `documentacion/ui_estilos_capas.md`
- ¿Es algo completamente nuevo (ej. skills, workflows, un sistema transversal)? → evaluar si requiere **archivo nuevo**

**¿Existe algo similar ya documentado?**
- Buscar en `documentacion/index.md` y `AGENTS.md`
- Si ya existe, proponer agregar una sección al doc existente (no crear duplicados)

---

## Paso 2 — Decidir: Sección Nueva vs. Archivo Nuevo

| Situación | Decisión |
|-----------|----------|
| El tema cae dentro del alcance de un doc existente | Agregar sección al doc existente |
| El tema es transversal a varios docs o no encaja en ninguno | Crear archivo nuevo en `documentacion/` |
| El tema es muy extenso y haría crecer demasiado un doc existente | Crear archivo nuevo |
| El tema es operativo (cómo usar tools/skills) y no técnico del motor | Evaluar si va en `documentacion/` o en la propia skill |

---

## Paso 3 — Escribir el Draft

### Convenciones de Formato

- **Títulos:** `#` para el doc, `##` para secciones principales, `###` para subsecciones
- **Tablas:** Para inventarios, comparaciones, campos de schema — siempre preferir tabla sobre lista
- **Alertas (`> [!NOTE]`, `> [!IMPORTANT]`, etc.):** Para destacar información crítica o warnings
- **Código:** Siempre con fenced code blocks y el lenguaje especificado (`json`, `js`, `bash`)
- **Links:** Relativos dentro de `documentacion/`. Ej: `[Arquitectura](arquitectura.md)`

### Criterios de Calidad

- **Voseo rioplatense:** La doc usa vos. Ej: "cuando necesitás extender el motor", "si querés agregar un handler"
- **Tono:** Técnico y directo. Explicar el *qué* y el *por qué*, no solo el *cómo*
- **Sin historia:** Documentar el estado actual, no cómo llegó a ser así
- **Ejemplos:** Todo concepto complejo debe tener al menos 1 ejemplo concreto (JSON, código, o flujo)
- **Atomicidad:** Cada sección cubre UN concepto. No mezclar temas

---

## Paso 4 — Checklist de Integración

Antes de dar por finalizada la documentación nueva, verificar:

- [ ] **¿Requiere entrada nueva en `documentacion/index.md`?** → Si es un archivo nuevo en `documentacion/`, SÍ
- [ ] **¿Requiere actualización en `AGENTS.md`?** → Si documenta un módulo, skill, o sistema nuevo que aparece en las tablas de AGENTS.md, SÍ
- [ ] **¿Hay referencias en otros docs que deberían apuntar a este nuevo contenido?** → Proponer actualizarlas

---

## Templates de Referencia

### Template: Nueva Sección en Doc Existente

```markdown
## Nombre de la Sección

Breve descripción de qué cubre esta sección y cuándo es relevante.

### Concepto Principal

Explicación del concepto. [Ejemplo si aplica]

### Cómo Funciona

[Pasos, código, tabla, o flujo]

### Ejemplo

[Ejemplo concreto]
```

### Template: Nuevo Archivo de Documentación

```markdown
# Título del Documento — La Biblioteca del Tío Pier

> Descripción breve de qué cubre este documento (1-2 líneas).

---

## [Sección Principal 1]

...

## [Sección Principal 2]

...

## Referencia Rápida

[Tabla resumen si aplica]
```
