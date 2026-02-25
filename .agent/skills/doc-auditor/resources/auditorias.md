# Criterios de Auditoría por Modo

---

## Auditoría Particular

El agente debe ir a fondo en UN documento. Verificar:

### 1. Exactitud técnica
- Cada afirmación sobre el código se contrasta con el archivo fuente real
- Los nombres de módulos, métodos, propiedades y clases coinciden exactamente con el código
- Los flujos descritos (ej. "GameEngine llama a X") son reales y actuales

### 2. Completitud
- ¿Existen módulos, métodos o patrones implementados que NO están documentados?
- ¿Faltan campos en los schemas JSON?
- ¿Hay casos de uso o comportamientos especiales no mencionados?

### 3. Referencias cruzadas
- Links internos (entre docs) que apunten a secciones que ya no existen
- Menciones a archivos o módulos que fueron renombrados o eliminados
- Citas del `index.md` que no coincidan con la descripción real del archivo

### 4. Ejemplos
- ¿Los fragmentos de código o JSON de ejemplo son válidos con el estado actual del motor?
- ¿Los ejemplos usan campos o sintaxis deprecada?

### 5. Consistencia con index.md
- ¿La descripción en `documentacion/index.md` para este archivo es correcta?

---

## Auditoría General

El agente verifica el esquema global, **de a un documento a la vez**.

### Sobre `GEMINI.md`

| Sección | Qué verificar | Fuente de verdad |
|---------|---------------|------------------|
| Tabla de Módulos JS | Todos los `.js` en `/js/` presentes y con rol correcto | `ls js/` |
| Tabla de Challenge Handlers | Todos los handlers en `js/challenges/` | `ls js/challenges/` |
| Tabla de Skills | Todas las skills del proyecto listadas | `ls .agent/skills/` |
| Tabla de CSS | Todos los archivos en `/css/` con descripción correcta | `ls css/` |
| Flujo Macro | Coincide con la implementación real de `main.js` | `js/main.js` |
| Sistema de Capas (Z-index) | Valores de z-index coinciden con `variables.css` | `css/variables.css` |
| Tabla Referencia Documentación | Links a archivos que realmente existen | `ls documentacion/` |

### Sobre `documentacion/index.md`

- Todos los archivos listados existen en `documentacion/`
- No hay archivos en `documentacion/` sin entrada en el índice
- Las descripciones de cada documento son correctas y actuales
- El orden de lectura sugerido es razonable

### Profundidad adicional (Paso 3, opcional)

Si se detectan discrepancias importantes, o el usuario lo solicita explícitamente:
- Leer el primer bloque (hasta la primera sección) de cada doc para verificar su vigencia
- Verificar que el título de cada doc coincida con la entrada del índice

---

## Criterios de Calidad para Todos los Docs

- **Voseo rioplatense:** La documentación técnica usa vos (ej. "cuando necesitás", "si querés agregar")
- **Tono:** Técnico y directo. No florido, no ambiguo.
- **Actualidad:** Si un módulo cambió de nombre o responsabilidad, el doc debe reflejarlo
- **Sin referencias al pasado:** La doc describe cómo está el proyecto AHORA, no cómo era antes
