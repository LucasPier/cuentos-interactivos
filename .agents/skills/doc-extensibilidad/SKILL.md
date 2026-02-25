---
name: doc-extensibilidad
description: |
  Carga la documentación de formato e extensibilidad de historias de "La Biblioteca del Tío Pier".
  Activar cuando se mencione o se trabaje sobre: nueva historia, agregar historia, historias.json,
  historia.json, catálogo de historias, estructura de historia, extensibilidad,
  nuevo minijuego, nuevo handler, nueva recompensa, nueva variable, BibliotecaManager
  config, agregar cuento, portada de historia, contrato de datos, formato historia.
---

# doc-extensibilidad

Skill de documentación contextual. Su único rol es asegurarse de que el agente conozca
el contrato de datos del motor antes de crear o modificar cualquier historia o extender
el motor con nuevas funcionalidades.

## Cuándo usar

- Crear una historia nueva (carpeta, `historias.json`, `historia.json`, assets)
- Modificar el catálogo global (`historias.json`)
- Entender la estructura de `historia.json` (portada, pantalla inicio, escenas, etc.)
- Registrar un nuevo tipo de handler o recompensa en el motor
- Agregar variables/flags de estado específicos de una historia
- Extender el motor sin tocar el core JS (configuración vía JSON)

## Instrucción obligatoria

Antes de crear una historia nueva o modificar la estructura global del catálogo, DEBÉS leer
el archivo `documentacion/formato_historia.md` ubicado en la raíz del proyecto
(resolvé la ruta absoluta desde tu contexto de workspace y usá `view_file`).

No asumir nada sobre los campos requeridos ni las rutas de assets sin haber leído ese archivo primero.

## Referencia rápida (sin reemplazar la lectura del archivo)

| Archivo | Rol |
|---------|-----|
| `historias.json` | Catálogo global de historias para `BibliotecaManager` |
| `historia.json` | Config de una historia: portada, pantalla inicio, audio, rutas de escenas |
| `documentacion/formato_historia.md` | Fuente de verdad: esquema completo y guía de extensibilidad |

> **Importante:** Al agregar una historia nueva, consultá al usuario si hay que actualizar
> el caché del `service-worker.js`. De lo contrario el juego queda roto en modo offline.
