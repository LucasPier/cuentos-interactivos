---
name: doc-estado
description: |
  Carga docs de persistencia, recompensas y condiciones del estado del juego.
  Activar al trabajar con localStorage, flags, partida guardada, recompensas o precarga.
---

# doc-estado

Skill de documentación contextual. Su único rol es asegurarse de que el agente tenga
el esquema completo de persistencia, recompensas y condiciones antes de tocar cualquier
lógica relacionada al estado del jugador.

## Cuándo usar

- Modificar cómo se guarda o carga el progreso del jugador (`localStorage`)
- Trabajar con recompensas, flags o ítems del inventario
- Implementar o depurar el campo `"condicion"` en JSONs de escenas/opciones
- Entender cómo `StateManager` persiste el estado por historia
- Analizar el sistema de precarga (`ImagePreloader`, `ContentLoader`)
- Diagnosticar bugs relacionados a "continuar partida" o estado corrupto

## Instrucción obligatoria

Antes de modificar cualquier lógica de persistencia, recompensas o condiciones, DEBÉS
leer el archivo `documentacion/estado_recompensas.md` ubicado en la raíz del proyecto
(resolvé la ruta absoluta desde tu contexto de workspace y usá `view_file`).

No asumir nada sobre la estructura del estado o la evaluación de condiciones sin haber
leído ese archivo primero.

## Referencia rápida (sin reemplazar la lectura del archivo)

| Concepto | Descripción en una línea |
|----------|--------------------------|
| `StateManager` | Persiste estado aislado por historia (`"biblioteca_{id}"` en `localStorage`) |
| Recompensas / flags | Strings guardados en el estado; se chequean con `tiene_X` |
| `"condicion"` | Campo en opciones JSON; oculta la opción si el flag no existe |
| `ImagePreloader` | Descarga anticipada de imágenes; rutas resueltas por tipo (`fondo`, `personaje`, `objeto`) |
| `ContentLoader` | Fetch de JSONs con rutas dinámicas (`rutaBase + rutaRelativa`) |
