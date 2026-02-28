# Checks JSON — Criterios de Auditoría Semántica

Criterios para los JSONs de escenas, desafíos e `historia.json`.
El script `auditar.py` cubre: schema básico, naming, anti-voseo, targets rotos.

---

## 1. Schema de Escena

Campos requeridos:
```json
{
    "id": "UPPER_SNAKE_CASE",
    "tipo": "escena",
    "fondo": "nombre_archivo.webp",
    "texto": "Texto narrativo en voseo...",
    "opciones": [...]
}
```

Campos opcionales válidos:
```json
{
    "audio": "nombre.mp3",
    "audio_narracion": "nombre.mp3",
    "efectos": [...],
    "elementos": [...]
}
```

**Qué buscar (semántico):**
- Escenas sin opciones que no sean finales (callejón sin salida)
- Escenas de final que tengan opciones no `reiniciar` (narrativamente inconsistente)
- Texto excesivamente largo o corto para la escena
- Opciones con textos ambiguos o repetidos

---

## 2. Schema de Desafío

Campos requeridos:
```json
{
    "id": "DESAFIO_UPPER_SNAKE_CASE",
    "tipo": "desafio",
    "subtipo": "pregunta_real | minijuego_observacion | minijuego_clicks",
    "instruccion": "Texto en voseo...",
    "fondo": "nombre.webp",
    "configuracion": { ... },
    "resultado_exito": { "target": "ID_ESCENA", "recompensa": "..." },
    "resultado_fallo": { "target": "ID_ESCENA", "mensaje": "..." }
}
```

**Qué buscar (semántico):**
- `configuracion` vacía o incompleta según el subtipo
- `resultado_exito` y `resultado_fallo` apuntando al mismo target sin motivo
- Recompensas definidas que no se usan como condición en ninguna escena

---

## 3. Schema de Elementos

```json
{
    "tipo": "personaje | objeto",
    "id": "snake_case",
    "imagen": "archivo.webp",
    "estilo": { "x": 0-100, "y": 0-100, "ancho": 1-100, "z_index": N },
    "efecto": "nombre_entrada",
    "animacion": "nombre_continua"
}
```

**Qué buscar (semántico):**
- Elementos superpuestos (misma `x`/`y`/`ancho` que ocultan uno al otro)
- Personajes que aparecen en escenas donde narrativamente no deberían estar
- `z_index` que haga que un personaje tape el panel de texto u opciones
- Animaciones referenciadas que no existen en `animaciones.css`

---

## 4. Schema de Opciones

```json
{
    "texto": "Texto del botón en voseo",
    "accion": "navegar | reiniciar",
    "target": "ID_DE_ESCENA_O_DESAFIO",
    "tipo_target": "escena | desafio",
    "condicion": "tiene_X"
}
```

**Qué buscar (semántico):**
- `condicion` referenciando una recompensa que ningún desafío otorga
- Opciones duplicadas (mismo target, diferente texto sin sentido narrativo)
- Orden de opciones inconsistente (la opción "principal" debería ser la primera)
- Opciones con `reiniciar` que no sean en escenas de final

---

## 5. Schema de Efectos

```json
{
    "tipo": "luciérnagas | polvo_hadas | nieve | destellos | sparkles",
    "estilo": { "x": N, "y": N, "ancho": N, "alto": N, "z_index": N },
    "cantidad": N,
    "color": "nombre_paleta",
    "tamano": "Npx",
    "opacidad_max": 0.0-1.0
}
```

Tipos válidos registrados en `EffectsRenderer.js`:
- `luciérnagas` — Partículas flotantes con glow
- `polvo_hadas` — Partículas descendentes con sway
- `nieve` — Partículas cayendo
- `destellos` — Sparkles con scale pulsante
- `sparkles` — Alias/variante de destellos

**Qué buscar (semántico):**
- Efectos con cantidad excesiva (>30 puede afectar performance)
- `opacidad_max` de 1.0 en efectos que deberían ser sutiles
- Efectos que cubran toda la pantalla innecesariamente
- Colores de efecto que no combinen con la paleta de la escena

---

## 6. Voseo Rioplatense

**Regla INNEGOCIABLE de `AGENTS.md`:** Todo texto narrativo debe usar voseo.

### Correcto ✅
- "¡Despertá!", "Querés", "Mirá", "Te quedás", "Sabés", "Podés"
- Imperativo: "Elegí", "Caminá", "Ayudá", "Preguntale"
- Pronombre: "vos" (nunca "tú")

### Incorrecto ❌
- "¡Despierta!", "Quieres", "Mira", "Te quedas" (tuteo peninsular)
- "Usted puede", "¿Desea continuar?" (ustedeo formal)
- "Tú sabes", "Tu casa" (pronombre tú — ojo: "tu" posesivo SÍ es válido)

**Qué buscar (semántico, más allá del regex):**
- Conjugaciones de segunda persona singular que el regex no atrape
- Mezcla de voseo y tuteo en la misma escena
- Imperativos sin acento en la última sílaba ("mira" vs "mirá")
- Lenguaje demasiado formal para el tono de la historia

---

## 7. Coherencia Narrativa

**Qué buscar:**
- Escenas referenciadas como target que no existen
- Caminos que forman ciclos infinitos sin salida
- Recompensas prometidas en el texto que no se otorgan mecánicamente
- Condiciones que bloquean opciones necesarias para avanzar
- Personajes que aparecen/desaparecen sin justificación narrativa

---

## 8. Naming y Estructura de Archivos

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| ID de escena/desafío | UPPER_SNAKE_CASE | `ENTRADA_BOSQUE`, `DESAFIO_INICIAL` |
| ID de elemento | snake_case | `tio_pier`, `flor_de_luz` |
| Campos JSON | snake_case | `tipo_target`, `escena_inicial` |
| Archivos de imagen | snake_case.webp | `irupe_caminando.webp` |
| Nombre de archivo JSON | Igual al ID interno | `INICIO.json` contiene `"id": "INICIO"` |

**Qué buscar:**
- IDs con guiones en vez de guiones bajos
- Nombres de archivo que no coincidan con su ID interno
- Campos en camelCase (ej: `tipoTarget` en vez de `tipo_target`)

---

## 9. Configuraciones por Subtipo de Desafío

### `pregunta_real`
```json
"configuracion": {
    "preguntas": [
        {
            "texto": "Pregunta en voseo...",
            "opciones": ["A", "B", "C"],
            "correcta": 0
        }
    ]
}
```
- `correcta` debe ser un índice válido del array `opciones`
- Al menos 1 pregunta, idealmente 3+ para variedad

### `minijuego_observacion`
```json
"configuracion": {
    "elementos": [
        { "imagen": "x.webp", "alt": "...", "correcto": true|false }
    ]
}
```
- Exactamente 1 elemento con `correcto: true`
- Al menos 2 elementos totales (sino no es observación)

### `minijuego_clicks`
```json
"configuracion": {
    "objeto_interactivo": { "imagen": "x.webp", "alt": "..." },
    "clicks_necesarios": N,
    "mensajes_progresivos": ["msg1", "msg2", ...]
}
```
- `clicks_necesarios` > 0
- `mensajes_progresivos` debería tener al menos 2 entradas
- `objeto_interactivo` no debe ser null/undefined
