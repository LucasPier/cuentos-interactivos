# Sistema de Estado, Recompensas y Caché

## Sistema de Estado y Recompensas

### Estado interno (`StateManager.#estado`)

```javascript
{
  escenaActual: "INICIO",      // ID de la escena actual
  recompensas: {               // Mapa de recompensas obtenidas
    "flor_de_luz": true,
    "piedra_magica": true
  },
  historial: [                 // Array de todas las escenas visitadas
    "INICIO",
    "ENCUENTRO_PADRES",
    "ENTRADA_BOSQUE"
  ]
}
```

### Ejemplo de Recompensas (varía por historia)

> [!NOTE]
> Las recompensas no son fijas ni parte del core del motor. Cada historia define sus propios ítems (flags) y condiciones. La siguiente tabla es solo un ejemplo de cómo se estructuran en "El Misterio del Bosque Encantado":

| Recompensa | Otorgada por | Desbloquea |
|------------|-------------|------------|
| `flor_de_luz` | `DESAFIO_BUSCAR_HONGO` | Opción "Ofrecer la flor de luz" en `DECISION_FINAL` → `FINAL_SECRETO` |
| `piedra_magica` | `DESAFIO_ACERTIJO_DUENDE` | _(Reservada para uso futuro)_ |

### Evaluación de condiciones

Las opciones del JSON pueden tener un campo `condicion`. La convención es:

```
condicion: "tiene_X"  →  StateManager.tieneRecompensa("X")
```

Ejemplo: `"tiene_flor_de_luz"` → verifica si `recompensas["flor_de_luz"] === true`.

- Si **no hay condición**: la opción siempre se muestra.
- Si la **condición se cumple**: la opción se muestra.
- Si la **condición NO se cumple**: la opción se omite del renderizado (el usuario no la ve).

### Persistencia

- **Mecanismo**: `localStorage` con clave dinámica `"biblioteca_{historiaId}"`.
- **Serialización**: `JSON.stringify()` / `JSON.parse()`.
- **Momento de escritura**: Cada vez que cambia la escena actual o se otorga una recompensa.
- **Restauración**: Al llamar `setHistoriaActual(id)`, que carga el estado de la historia correspondiente.
- **Reinicio**: Al llamar `reiniciar()`, se vacía el estado de la historia activa.
- **Aislamiento**: Cada historia tiene su propia clave de storage; jugar una historia no afecta el progreso de otra.

---

## Precarga de Recursos

### Imágenes

1. **Al cargar escena o desafío**: `ImagePreloader.extraerImagenes(datos)` extrae todas las URLs de fondo, elementos visuales (`elementos`) y elementos interactivos propios de la configuración de un desafío (`minijuego_observacion`, `minijuego_clicks`). Luego `precargar(urls)` las descarga con `new Image()`.
2. **Precarga anticipada**: Después de renderizar, `GameEngine.#precargarSiguientes()` carga fire-and-forget los JSONs e imágenes de los destinos referenciados en las opciones actuales (evaluando dinámicamente el `tipo_target`: escena o desafío).
3. **Deduplicación**: Un `Set` interno de `ImagePreloader` evita descargar la misma imagen dos veces.

### JSONs

- `ContentLoader` cachea en un `Map` con clave `"tipo:id"`.
- El método `precargar(tipo, id)` hace un fetch silencioso que guarda en cache.
- Los errores de precarga se silencian (no bloquean el flujo).
