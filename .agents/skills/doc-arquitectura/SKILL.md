---
name: doc-arquitectura
description: |
  Carga docs de arquitectura: módulos JS, flujo de ejecución, PWA y service worker.
  Activar al trabajar sobre módulos JS, GameEngine o la estructura del motor de juego.
---

# doc-arquitectura

Skill de documentación contextual. Su único rol es asegurarse de que el agente tenga
la arquitectura del motor de juego antes de tocar cualquier módulo JS o configuración PWA.

## Cuándo usar

- Modificar o crear cualquier módulo en `/js/` (incluyendo `/js/challenges/`)
- Analizar el flujo de ejecución (biblioteca → historia → escena → desafío)
- Trabajar con el Service Worker o la configuración PWA
- Entender cómo se conectan los módulos entre sí (dependency injection)
- Agregar un nuevo tipo de desafío (Strategy Pattern / ChallengeManager)
- Diagnóstico de bugs que involucren el ciclo de vida del juego

## Instrucción obligatoria

Antes de responder o modificar cualquier módulo JS del proyecto, DEBÉS leer el archivo
`documentacion/arquitectura.md` ubicado en la raíz del proyecto (resolvé la ruta absoluta
desde tu contexto de workspace y usá `view_file`).

No asumir nada sobre la estructura interna de los módulos sin haber leído ese archivo primero.

## Referencia rápida (sin reemplazar la lectura del archivo)

| Módulo | Rol en una línea |
|--------|-----------------|
| `main.js` | Bootstrap: instancia y conecta todo |
| `BibliotecaManager` | Pantalla de selección de historias |
| `GameEngine` | Orquesta el flujo dentro de una historia |
| `ContentLoader` | Fetch de JSONs con cache y rutas dinámicas |
| `StateManager` | Estado + persistencia aislada por historia |
| `ImagePreloader` | Descarga anticipada de imágenes |
| `SceneRenderer` | Composición visual de escenas |
| `EffectsRenderer` | Capa de efectos visuales dinámicos |
| `ChallengeManager` | Registry + dispatcher (Strategy Pattern) |
| `UIManager` | Controles permanentes + logo de carga |
| `AudioManager` | Audio: fondo, narración, efectos |
