---
name: doc-escenas
description: |
  Carga la documentación del formato JSON de escenas narrativas y desafíos de "La Biblioteca del Tío Pier".
  Activar cuando se mencione o se trabaje sobre: escena JSON, crear escena, modificar escena,
  desafío, minijuego, minijuego_observacion, minijuego_clicks, pregunta_real, schema de escena,
  estructura del JSON, campos de escena, elementos interactivos, opciones de escena,
  fondo de escena, personajes en escena, texto narrativo JSON, formato desafío,
  ChallengeHandler, nueva escena.
---

# doc-escenas

Skill de documentación contextual. Su rol es doble: asegurarse de que el agente tenga el schema
técnico de escenas **y** el contexto narrativo de la historia en la que está trabajando, antes de
crear o modificar cualquier JSON.

---

## Paso 1 — Cargar el schema técnico

Antes de crear o editar cualquier archivo JSON de escena o desafío, DEBÉS leer el archivo
`documentacion/formato_escenas.md` ubicado en la raíz del proyecto (resolvé la ruta absoluta
desde tu contexto de workspace y usá `view_file`).

No asumir nada sobre los campos del JSON sin haber leído ese archivo primero.

---

## Paso 2 — Entender el contexto narrativo de la historia

Toda escena pertenece a una historia específica. Antes de crear o modificar una escena, DEBÉS
identificar en qué historia estás trabajando (por la ruta del archivo o el pedido del usuario)
y leer los siguientes archivos de referencia de esa historia, ubicados en
`historias/{id_de_la_historia}/`:

| Archivo | Qué contiene | Cuándo leerlo |
|---------|-------------|---------------|
| `concepto.md` | Protagonista, tono, personajes y sus roles, estilo visual, alcance | Siempre |
| `resumen_detallado.md` | Árbol de decisiones, ramificaciones, escenas clave, finales | Siempre |
| `historia.md` | Guion completo con diálogos y descripciones detalladas | Solo si necesitás texto exacto de narración o diálogos |

**El agente NO debe inventar texto narrativo, decisiones ni ramificaciones.** Todo debe
ser consistente con lo que ya está documentado en estos archivos.

---

## Paso 3 — Actualizar la documentación después de cualquier cambio

Una vez finalizada cualquier creación o modificación de escenas, DEBÉS actualizar los archivos
de referencia de la historia para mantener la consistencia. Esto es **obligatorio**:

- **`concepto.md`**: Actualizar si se agregaron personajes nuevos, cambió el alcance del proyecto
  (nueva escena, nuevo desafío, nuevo final), o se modificó algún rol.
- **`resumen_detallado.md`**: Actualizar el árbol de decisión y el listado de escenas si se
  agregaron, eliminaron o modificaron escenas o ramificaciones.
- **`historia.md`**: Actualizar con el texto narrativo y diálogos definitivos de las escenas
  nuevas o modificadas.

> **Regla de consistencia:** La documentación describe el estado ACTUAL del proyecto.
> No debe quedar ningún archivo de referencia describiendo una versión anterior de la historia.

---

## Referencia rápida (sin reemplazar la lectura del archivo)

### Tipos de desafío (`subtipo`)

| Subtipo | Mecánica |
|---------|----------|
| `pregunta_real` | Pregunta aleatoria del array `preguntas`, opciones con `correcto: true` |
| `minijuego_observacion` | Clickear el elemento con `correcto: true` en la escena |
| `minijuego_clicks` | Clickear un objeto N veces con mensajes progresivos |

### Campos clave de una escena

| Campo | Tipo | Función |
|-------|------|---------|
| `id` | string | Identificador único de la escena |
| `fondo` | string | Nombre del archivo de fondo (sin ruta) |
| `elementos` | array | Personajes u objetos posicionados en la escena |
| `texto` | string | Narración que aparece en el panel de texto |
| `opciones` | array | Botones de decisión que llevan a otras escenas |
| `desafio` | object | Configura un minijuego o pregunta real |
| `condicion` | string | Evalúa si el jugador tiene un flag/recompensa |
| `recompensa` | string | Flag que se otorga al completar la escena/opción |
