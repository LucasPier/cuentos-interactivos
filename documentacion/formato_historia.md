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
  }
}
```

Todas las rutas dentro de `historia.json` son **relativas a la carpeta de la historia**. El motor las resuelve prepending `rutaBase`.

### Escena (`historias/{id}/datos/escenas/*.json`)

```jsonc
{
  "id": "INICIO",                          // ID único, coincide con el nombre del archivo
  "tipo": "escena",
  "fondo": "cuarto_iru.webp",       // Nombre del archivo de fondo
  "texto": "Irupé se despierta...",        // Texto narrativo
  "audio": "pista_fondo.mp3",              // Opcional: reproduce música (busca en carpeta audios/)
  "elementos": [                           // Personajes/objetos superpuestos (opcional)
    {
      "id": "irupe",
      "imagen": "irupe.webp",
      "efecto": "aparecer_suave",          // Clase CSS: efecto-aparecer_suave (opcional)
      "estilo": {
        "x": 25,                           // Posición horizontal (0–100, porcentaje)
        "y": 100,                          // Posición vertical (0=arriba, 100=abajo)
        "ancho": 45,                       // Ancho relativo al contenedor (porcentaje)
        "z_index": 10                      // Orden de superposición
      }
    }
  ],
  "opciones": [                            // Botones de decisión
    {
      "texto": "Salir a explorar",
      "accion": "navegar",                 // "navegar" | "reiniciar"
      "target": "ENCUENTRO_PADRES",        // ID del destino
      "tipo_target": "escena"              // "escena" | "desafio"
    },
    {
      "texto": "Ofrecer la flor de luz",
      "accion": "navegar",
      "target": "FINAL_SECRETO",
      "tipo_target": "escena",
      "condicion": "tiene_flor_de_luz"     // Solo visible si cumple (ver §9)
    }
  ]
}
```

### Desafío (`historias/{id}/datos/desafios/*.json`)

```jsonc
{
  "id": "DESAFIO_INICIAL",
  "tipo": "desafio",
  "subtipo": "pregunta_real",              // Determina qué handler se usa
  "fondo": "cuarto_iru.webp",       // Fondo del desafío (opcional)
  "instruccion": "Preguntale a un adulto...",
  "audio": "pista_misterio.mp3",           // Opcional: música de fondo para el desafío
  "configuracion": {                       // Varía según subtipo
    "preguntas": [
      {
        "pregunta": "¿Cuándo es el cumpleaños?",
        "opciones": [
          { "texto": "En Verano", "correcta": false },
          { "texto": "En Invierno", "correcta": true },
          { "texto": "En Primavera", "correcta": false }
        ]
      }
    ]
  },
  "resultado_exito": {
    "target": "ENTRADA_BOSQUE",            // Escena al acertar
    "recompensa": "piedra_magica"          // Recompensa otorgada (opcional)
  },
  "resultado_fallo": {
    "target": "FALLO_PREGUNTA",            // Escena al fallar
    "mensaje": "¡Esa no era!"
  }
}
```

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
4. **MANDATORIO PWA:** Añadir la nueva historia al Service Worker (`service-worker.js`). Es obligatorio crear las constantes de caché respectivas de la historia nueva e incluir su matriz completa de archivos estáticos (JSONs, imágenes y audios) dentro de `RUTAS_CACHE`. **De no hacerlo**, la nueva historia carecerá de funcionalidad offline, rompiendo la experiencia del jugador. Ante la duda, preguntale al usuario antes de modificar el SW.

### Agregar un nuevo tipo de desafío

1. Crear `js/challenges/NuevoHandler.js`:
```javascript
export class NuevoHandler {
    ejecutar(datos, panelEl, preloader) {
        return new Promise((resolve) => {
            // Renderizar dentro de panelEl
            // resolve(true) si éxito, resolve(false) si fallo
        });
    }
}
```

2. Registrarlo en `main.js`:
```javascript
import { NuevoHandler } from './challenges/NuevoHandler.js';
challengeManager.registrar('nuevo_subtipo', new NuevoHandler());
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
