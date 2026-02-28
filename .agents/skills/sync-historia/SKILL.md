---
name: sync-historia
description: |
  Sincroniza textos de JSONs de escenas con historia.md.
  Activar al comparar o actualizar narrativa entre archivos JSON y la documentación.
---

# Sync Historia - Sincronizador de Narrativa

Esta skill proporciona herramientas automáticas para verificar que los textos base de la narrativa escritos en los archivos `.json` de las escenas de un cuento, coincidan de forma exacta con la documentación del archivo `historia.md`, y de no ser así, permite actualizar la documentación automáticamente.

## Cuándo usar esta skill
- Cuando el usuario duda si los textos del juego (JSON) están desincronizados con `historia.md`.
- Después de una refactorización masiva de textos o corrección ortográfica en los JSON.
- Cuando el usuario te pide explícitamente ejecutar los scripts de comprobación de escenas.

## Directorio Base
Los scripts están preparados para ejecutarse indicando como `--dir` el **directorio raíz de la historia específica** (por ejemplo: `d:/xampp/htdocs/cuento-irupe/historias/el-misterio-del-bosque-encantado`).

La estructura esperada dentro del directorio de la historia es:
- `historia.md` (El archivo markdown a revisar/actualizar).
- `datos/escenas/` (Carpeta con los archivos `.json`).

## Scripts Disponibles

Todos los scripts se encuentran en la carpeta `scripts/` de esta skill. Puedes usar el comando con `--help` para ver los detalles.

### 1. Verificar diferencias de Texto Narrativo
Compara el campo `texto` de cada JSON contra la sección `*   **TEXTO:**` del MD.
```bash
python .agents/skills/sync-historia/scripts/check_texts.py --dir <ruta-absoluta-a-la-historia>
```

### 2. Verificar diferencias de Opciones/Botones
Compara los campos `texto` de los botones en el JSON contra la sección `*   **OPCIONES:**` del MD. **Nota:** No usar para autocompletar porque el MD tiene sintaxis de destino (`-> Va a...`).
```bash
python .agents/skills/sync-historia/scripts/check_opciones.py --dir <ruta-absoluta-a-la-historia>
```

### 3. Actualizar `historia.md` Automáticamente
Crea un archivo nuevo (o sobreescribe) volcando exactamente los textos encontrados en los JSON hacia el MD.
```bash
python .agents/skills/sync-historia/scripts/update_md.py --dir <ruta-absoluta-a-la-historia> [--in-place]
```
> **Atención:** Al usar el script de actualización, siempre confirma primero con `check_texts.py` para estar seguro de los cambios.
