# Checks PWA — Criterios de Auditoría Semántica

Criterios para el Service Worker, manifest y experiencia offline.
El script `auditar.py` cubre: archivos huérfanos, faltantes, íconos del manifest.

---

## 1. Sincronización SW ↔ Filesystem

**Regla de `AGENTS.md`:** Si se agregan, renombran o eliminan recursos estáticos,
se DEBE actualizar el Service Worker.

**Qué buscar (semántico):**
- Archivos nuevos (imágenes, audios, JSONs) que no estén en `RUTAS_CACHE`
- Archivos eliminados que sigan referenciados en el SW (huérfanos)
- Archivos renombrados donde la referencia vieja persiste
- Recursos cargados dinámicamente que también necesiten caché

---

## 2. Clasificación Correcta de Cachés

Cada archivo debe estar en el grupo correcto:

| Patrón de archivo | Grupo de caché |
|-------------------|----------------|
| `index.html`, `manifest.json`, `biblioteca/*` | `cache-biblioteca` |
| `css/*.css` (excepto `biblioteca.css`) | `cache-css` |
| `js/*.js` (excepto `BibliotecaManager.js`) | `cache-js` |
| `js/challenges/*.js` | `cache-challenges` |
| `historias/{id}/datos/**` | `cache-{id}-datos` |
| `historias/{id}/audios/**` | `cache-{id}-audios` |
| `historias/{id}/imagenes/**` | `cache-{id}-imagenes` |

**Nota:** `biblioteca.css` y `BibliotecaManager.js` van en `cache-biblioteca`
porque son necesarios para la pantalla inicial.

**Qué buscar:**
- Archivos en el grupo incorrecto
- Archivos de una historia mezclados con los de otra
- `historia.json` que esté en datos pero no en el grupo correcto

---

## 3. Manifest Completo

**Campos requeridos en `manifest.json`:**
- `name`, `short_name`, `description`
- `start_url`, `scope`
- `display`: debería ser `"standalone"`
- `theme_color`, `background_color`
- `icons`: al menos 192x192 y 512x512, con variantes `maskable`

**Qué buscar:**
- Íconos referenciados que no existan como archivo
- Íconos no incluidos en el caché del SW
- `start_url` que no apunte a `"./"` o `"index.html"`
- Colores del manifest que no correspondan al tema visual del proyecto

---

## 4. Versionado Consistente

**Regla:** Cada grupo de caché tiene una constante de versión. Al modificar archivos
de un grupo, se bumpa su versión (+1).

**Qué buscar:**
- Grupos sin propiedad `version` mientras otros sí la tienen
- Versiones que no se incrementaron tras cambios conocidos
- `VERSION_APP` desactualizada respecto a cambios significativos

---

## 5. Estrategia de Cache

**Regla:** El proyecto usa "Cache First" con fallback a red.

**Qué buscar:**
- Lógica de fetch que no siga Cache First
- Requests que bypaseen el caché sin motivo
- Assets dinámicos que deberían tener una estrategia diferente
  (ej: `historias.json` del catálogo podría beneficiarse de "Network First"
  si se agrega contenido nuevo frecuentemente)

---

## 6. Range Requests (Audio)

**Regla:** El SW debe soportar Range Requests para reproducción de audio offline.

**Qué buscar:**
- Handler de `fetch` que no detecte `Range` header
- Respuestas de audio que no incluyan `Content-Range` y `206 Partial Content`
- Audios nuevos que no estén cacheados (fallan offline)

---

## 7. Google Fonts

**Regla:** Nunito es la única dependencia externa. Se cachea via caché de fonts.

**Qué buscar:**
- Referencias a fuentes diferentes a Nunito
- Links a CDNs no autorizados
- Caché de fonts sin fallback para modo offline
- Font-display que no sea `swap` (afecta carga percibida)

---

## 8. Comunicación SW ↔ Cliente

**Qué buscar:**
- `postMessage` enviando `VERSION_APP` correcta
- Listener `controllerchange` en `main.js` para auto-reload
- Protección contra reload infinito en primera instalación
- `skipWaiting()` en install y `clients.claim()` en activate
