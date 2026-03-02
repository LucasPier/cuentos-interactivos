# Contrato de Datos y Extensibilidad

## Contrato de Datos (JSON)

> Referencia de escenas/desafíos: `formato_escenas.md`

### Catálogo de historias (`biblioteca/historias.json`)

```jsonc
{
  "historias": [
    {
      "id": "el-misterio-del-bosque-encantado",
      "ruta": "historias/el-misterio-del-bosque-encantado/"
    }
  ]
}
```

### Configuración de historia (`historias/{id}/historia.json`)

```jsonc
{
  "id": "el-misterio-del-bosque-encantado",
  "titulo": "El Misterio del Bosque Encantado",
  "subtitulo": "Una aventura mágica para Irupé,\nhecha con mucho cariño por el tío Pier.",
  "portada": "imagenes/fondos/portal_bosque.webp",   // Ruta relativa a la carpeta de la historia
  "tarjeta": "imagenes/tarjeta/tarjeta.webp",
  "logo": "imagenes/logo/logo.webp",
  "musica_inicio": "el_misterio_del_bosque_encantado.mp3",
  "escena_inicial": "INICIO",
  "efectos": {                              // Efectos decorativos opcionales
    "luciernagas": true
  },
  "colores": {                              // Personalización visual opcional
    "boton_jugar_bg": "linear-gradient(...)",
    "boton_jugar_borde": "#d4a017",
    "boton_jugar_color": "#1a1207",
    "subtitulo_color": "#d1d5db"
  },
  "escenas": [                              // Opcional: lista de IDs de escenas (para DevPanel)
    "INICIO", "ENTRADA_BOSQUE", "..."
  ],
  "desafios": [                             // Opcional: lista de IDs de desafíos (para DevPanel)
    "DESAFIO_INICIAL", "..."
  ]
}
```

Todas las rutas dentro de `historia.json` son **relativas a la carpeta de la historia**. El motor las resuelve prepending `rutaBase`.

### Escenas y Desafíos (`historias/{id}/datos/...`)

Los esquemas detallados para los archivos JSON de **Escenas** (`escenas/*.json`) y **Desafíos** (`desafios/*.json`) tienen su propia documentación dedicada para mantener una única fuente de verdad.

Consultalos en: **[`formato_escenas.md`](formato_escenas.md)**

---

## Extensibilidad

### Agregar una nueva historia

1. Crear la carpeta `historias/nombre-de-la-historia/` con la estructura:
```
historias/nombre-de-la-historia/
├── historia.json              # Configuración (ver §7)
├── datos/
│   ├── escenas/               # JSONs de escenas
│   └── desafios/              # JSONs de desafíos
├── imagenes/
│   ├── fondos/                # Fondos
│   ├── personajes/{id}/       # Personajes
│   ├── objetos/               # Objetos
│   └── logo/                  # Logo y portada
├── videos/                    # Videos de fondo (opcional)
└── audios/                    # Audio (opcional)
```

2. Agregar la entrada al catálogo en `biblioteca/historias.json`:
```json
{
  "id": "nombre-de-la-historia",
  "ruta": "historias/nombre-de-la-historia/"
}
```

3. No se necesita tocar código JavaScript para la renderización. La biblioteca mostrará automáticamente la nueva tarjeta.
4. **MANDATORIO PWA:** Añadir la nueva historia al Service Worker (`service-worker.js`). Es obligatorio crear las constantes de caché respectivas de la historia nueva e incluir su matriz completa de archivos estáticos (JSONs, imágenes, videos y audios) dentro de `RUTAS_CACHE`. **De no hacerlo**, la nueva historia carecerá de funcionalidad offline, rompiendo la experiencia del jugador. Ante la duda, preguntale al usuario antes de modificar el SW.

### Agregar un nuevo tipo de desafío

1. Crear `js/challenges/NuevoHandler.js`:
```javascript
export class NuevoHandler {
    #audioManager;

    constructor(audioManager) {
        this.#audioManager = audioManager;
    }

    ejecutar(datos, panelEl, preloader) {
        return new Promise((resolve) => {
            // Renderizar dentro de panelEl
            // Usar this.#audioManager.reproducirEfecto(...) para sonidos
            // resolve(true) si éxito, resolve(false) si fallo
        });
    }
}
```

2. Registrarlo en `main.js`:
```javascript
import { NuevoHandler } from './challenges/NuevoHandler.js';
challengeManager.registrar('nuevo_subtipo', new NuevoHandler(audioManager));
```

3. Crear el JSON del desafío con `"subtipo": "nuevo_subtipo"`.

### Agregar una nueva condición

1. Agregar la lógica en `StateManager.evaluarCondicion()`:
```javascript
if (condicion.startsWith('visitó_')) {
    const escena = condicion.substring(7);
    return this.#estado.historial.includes(escena);
}
```

### Agregar nuevas recompensas

1. Agregar `"recompensa": "nombre_nuevo"` en `resultado_exito` del JSON del desafío.
2. Usar `"condicion": "tiene_nombre_nuevo"` en las opciones de las escenas que la requieran.
3. No se necesita tocar código JavaScript — todo se resuelve por convención.
