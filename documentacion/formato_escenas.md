# Formato de Escenas y Desafíos (JSON)

Este documento define la estructura de datos para el motor de cuentos interactivos. Cada escena y desafío se almacenará en un archivo `.json` independiente para facilitar la edición y escalabilidad.

## Ubicación de Archivos
*   **Escenas:** `/datos/escenas/{id_escena}.json`
*   **Desafíos:** `/datos/desafios/{id_desafio}.json`

### Video de fondo (opcional)

Las escenas y desafíos pueden incluir un **video de fondo** mediante la propiedad `"video"`. El motor busca los videos en `historias/{id}/videos/`.

| Propiedad | Ubicación | Obligatoria |
|-----------|-----------|-------------|
| `"fondo"` | `imagenes/fondos/` | Sí (siempre presente como fallback) |
| `"video"` | `videos/` | No (opcional) |

**Comportamiento:**
- La **imagen de fondo** (`"fondo"`) se muestra inmediatamente como fallback visible mientras el video carga.
- El **video** se reproduce en **loop, sin sonido** (`muted`) y sin controles.
- Arranca invisible (`opacity: 0`) y aparece con **fade-in** (300ms) cuando el navegador emite `canplaythrough` (buffer suficiente para reproducción sin interrupciones).
- Toda escena con video **debe tener también una imagen de fondo**.
- La creación del DOM de fondo está centralizada en `FondoHelper.js`, usado tanto por `SceneRenderer` (escenas) como por los Challenge Handlers (desafíos).

---

## 1. Esquema de Escena (`.json`)

Utilizado para escenas narrativas, diálogos y menús de decisión.

### Estructura Base

```json
{
  "id": "NOMBRE_UNICO_ESCENA",
  "tipo": "escena", 
  "fondo": "nombre_imagen_fondo.webp",
  "video": "nombre_video_fondo.mp4", // Opcional: video de fondo (busca en carpeta videos/)
  "texto": "El contenido narrativo que leerá o que escuchará quien esté jugando.",
  "audio": "audio_fondo.mp3", // Opcional: música de fondo (busca en carpeta audios/)
  "audio_narracion": "audio_opcional.mp3",
  "efectos": [
    // Efectos visuales de fondo (ej: luciérnagas, polvo_hadas/nieve, destellos/sparkles) configurables.
    // Colores soportados: dorado, esmeralda, cyan-bio, violeta, rosa, blanco.
    // Ejemplos:
    // { "tipo": "luciérnagas", "estilo": { "x": 50, "y": 100, "ancho": 100, "z_index": 5 }, "cantidad": 15, "color": "dorado" }
    // { "tipo": "polvo_hadas", "estilo": { "x": 50, "y": 100, "ancho": 100, "z_index": 5 }, "cantidad": 30, "color": "blanco", "tamano": "3px" }
    // { "tipo": "destellos", "estilo": { "x": 50, "y": 50, "ancho": 20, "alto": 20, "z_index": 10 }, "cantidad": 5, "color": "cyan-bio", "tamano": "8px" }
    // Nota: en escenas, los efectos y elementos comparten stacking context
    // dentro de .escena-elementos. Un efecto con z_index menor al z_index de
    // un elemento aparecerá detrás de él, y viceversa.
    // Default: efectos z_index=5, elementos z_index=10.
  ],
  "elementos": [ 
    // Array de elementos visuales superpuestos (Personajes, Objetos)
  ],
  "opciones": [
    // Botones de decisión para avanzar
  ]
}
```

### Detalle: Elementos Visuales (`elementos`)

Lista de imágenes que se superponen al fondo. Se usa posicionamiento porcentual para mantener la consistencia en diferentes pantallas.

```json
{
  "tipo": "personaje", // "personaje" | "objeto" | "decoracion"
  "id": "tio_pier_saludando",
  "imagen": "tio_pier.webp",
  "estilo": {
    "x": 50,      // Posición horizontal (0-100%) - Centro del elemento
    "y": 100,     // Posición vertical (0-100%) - Base del elemento (usualmente 100 para estar en el piso)
    "ancho": 35,  // Ancho relativo al contenedor (0-100%)
    "z_index": 10 // Orden de apilamiento (mayor número = más adelante)
  },
  "efecto": "aparecer_suave", // Opcional (efecto de entrada): "rebote", "aparecer_suave", etc.
  "animacion": "respiracion-aura" // Opcional (animación continua): "flotacion", "respiracion", "aura", "resplandor", "movimiento-sutil", "movimiento-sutil-2", o combos ("flotacion-aura", etc)
}
```

### Detalle: Opciones de Navegación (`opciones`)

Los botones que permiten al usuario interactuar.

```json
{
  "texto": "Saludar al Tío Pier",
  "accion": "navegar", // "navegar" | "reiniciar"
  "target": "ENCUENTRO_TIO_PIER", // ID del siguiente archivo JSON (sin extensión)
  "tipo_target": "escena", // "escena" | "desafio"
  "condicion": null // Opcional: "{tiene_flor_de_luz}" (lógica futura)
}
```

---

## 2. Esquema de Desafío (`.json`)

Utilizado para minijuegos, preguntas o interacciones especiales que rompen el flujo narrativo estándar.

### Estructura Base

```json
{
  "id": "NOMBRE_UNICO_DESAFIO",
  "tipo": "desafio",
  "subtipo": "pregunta_real", // "pregunta_real" | "minijuego_clicks" | "minijuego_observacion"
  "instruccion": "Preguntale a papá...",
  "fondo": "fondo_desafio.webp",
  "video": "video_desafio.mp4", // Opcional: video de fondo (busca en carpeta videos/)
  "audio": "audio_desafio.mp3", // Opcional: música de fondo (busca en carpeta audios/)
  "configuracion": {
    // Parámetros específicos según el subtipo
    // Opcional en minijuegos: "ubicacion_instrucciones": "arriba" | "medio" | "abajo"
  },
  "resultado_exito": {
    "target": "ID_ESCENA_EXITO",
    "recompensa": "flor_de_luz" // Opcional
  },
  "resultado_fallo": {
    "target": "ID_ESCENA_FALLO",
    "mensaje": "Intentalo de nuevo mañana."
  }
}
```

### Ejemplos de Configuración por Subtipo

#### A. Pregunta Real (Quiz)
```json
"configuracion": {
  "sonido_exito": "respuesta_correcta.mp3", // Opcional
  "sonido_fallo": "respuesta_incorrecta.mp3", // Opcional
  "preguntas": [
    {
      "pregunta": "¿Cuándo es el cumpleaños de la abuela Tere?",
      "opciones": [
        { "texto": "En Verano", "correcta": false },
        { "texto": "En Invierno", "correcta": true },
        { "texto": "En Primavera", "correcta": false }
      ]
    },
    {
      "pregunta": "¿Cómo se llama el gato del tío Pier?",
      "opciones": [
        { "texto": "Gardfield", "correcta": false },
        { "texto": "Pity", "correcta": true }
      ]
    }
  ]
}
```

#### B. Minijuego de Clics (Piedra en el Río)
```json
"configuracion": {
  "ubicacion_instrucciones": "arriba", // "arriba", "abajo" o "medio" (por defecto)
  "objetivo_clicks": 3,
  "sonido_exito": "victoria.mp3", // Opcional: Sonido reproducido al completar el objetivo
  "objeto_interactivo": {
    "imagen": "piedra_magica.webp",
    "x": 50, "y": 80, "ancho": 15,
    "animacion": "flotacion-aura", // Funciona en objetos de desafíos de minijuego (observacion / clicks)
    "sonido": "click.mp3" // Opcional: Sonido reproducido con cada clic al objeto
  },
  "mensajes_progreso": ["¡Una vez!", "¡Dos veces!", "¡Casi listo!"]
}
```

#### C. Minijuego de Observación
```json
"configuracion": {
  "ubicacion_instrucciones": "arriba", // "arriba", "abajo" o "medio" (por defecto)
  "correcto_aleatorio": true, // Opcional: Si es true, ignora el "correcto: true" de los elementos y elige uno al azar.
  "sonido_correcto": "exito.mp3", // Opcional: Útil si correcto_aleatorio es true
  "elementos_interactivos": [
    {
      "id": "hongo_normal",
      "imagen": "hongo_1.webp",
      "x": 20, "y": 80, "ancho": 15,
      "sonido": "error_boing.mp3" // Opcional: Sonido al clickear
    },
    {
      "id": "hongo_que_rie",
      "imagen": "hongo_2.webp",
      "x": 70, "y": 90, "ancho": 15,
      "correcto": true, // Requerido si correcto_aleatorio es false
      "imagen_final": "hongo_feliz.webp", // Opcional: Cambia la imagen si el jugador acierta (o si es elegido aleatoriamente)
      "animacion": "respiracion-aura",
      "sonido": "exito.mp3" // Opcional: Si la respuesta no es aleatoria, podés definir el sonido acá
    }
  ]
}
```

---

## 3. Ejemplo Completo: Escena `ENCUENTRO_TIO_PIER`

```json
{
  "id": "ENCUENTRO_TIO_PIER",
  "tipo": "escena",
  "fondo": "bosque_hongos_magicos.webp",
  "video": "bosque_hongos_magicos_720.mp4",
  "texto": "¡Hola, tío Pier! El tío Pier se da la vuelta y sonríe. '¡Oh, Irupé! Estoy haciendo mi famosa sopa, pero me falta el hongo que ríe'.",
  "elementos": [
    {
      "tipo": "personaje",
      "id": "tio_pier",
      "imagen": "tio_pier.webp",
      "estilo": { "x": 70, "y": 95, "ancho": 30, "z_index": 2 }
    },
    {
      "tipo": "personaje",
      "id": "irupe",
      "imagen": "irupe_espaldas.webp",
      "estilo": { "x": 20, "y": 100, "ancho": 25, "z_index": 3 }
    }
  ],
  "opciones": [
    {
      "texto": "Ayudar a buscar el hongo",
      "accion": "navegar",
      "target": "BUSQUEDA_HONGO",
      "tipo_target": "desafio"
    },
    {
      "texto": "Volver atrás",
      "accion": "navegar",
      "target": "CAMINO_BOSQUE",
      "tipo_target": "escena"
    }
  ]
}
```
