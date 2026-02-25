"""
analizar-sw.py — Analizador del Service Worker para La Biblioteca del Tío Pier.

Compara los archivos modificados/nuevos (git) con las entradas del service-worker.js
para identificar qué cachés necesitan bump de versión, qué archivos nuevos no tienen
caché asignada, y qué entradas del SW apuntan a archivos que ya no existen en disco
(entradas huérfanas).

COMPORTAMIENTO SEGÚN RAMA:
  - Si la rama actual es `main`: analiza solo los cambios sin commitear (git status).
  - Si la rama actual es otra: analiza los cambios sin commitear MÁS todos los cambios
    commiteados en la branch vs main (git diff main...HEAD), representando exactamente
    lo que impactará en main una vez que se haga el merge.

USO:
  python analizar-sw.py                          # Análisis completo via git
  python analizar-sw.py --archivo a.json b.webp  # Analizar archivos específicos (sin git)
  python analizar-sw.py --sw /ruta/sw.js         # Usar un SW custom
  python analizar-sw.py --help                   # Mostrar esta ayuda

NOTAS:
  - Este script es de SOLO LECTURA. No modifica nada.
  - Debe ejecutarse desde la raíz del proyecto (donde está service-worker.js).
  - Requiere git instalado y el directorio debe ser un repositorio git.
"""

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path


# ──────────────────────────────────────────────────────────
# COLORES ANSI (se deshabilitan si la terminal no los soporta)
# ──────────────────────────────────────────────────────────
USE_COLOR = sys.stdout.isatty() or os.environ.get("FORCE_COLOR")

def c(text, code):
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text

BOLD   = lambda t: c(t, "1")
GREEN  = lambda t: c(t, "32")
YELLOW = lambda t: c(t, "33")
RED    = lambda t: c(t, "31")
CYAN   = lambda t: c(t, "36")
DIM    = lambda t: c(t, "2")


# ──────────────────────────────────────────────────────────
# PARSEO DEL SERVICE WORKER
# ──────────────────────────────────────────────────────────

def encontrar_sw(ruta_custom=None):
    """Busca el service-worker.js: custom → raíz del proyecto → ruta relativa."""
    if ruta_custom:
        p = Path(ruta_custom)
        if not p.exists():
            sys.exit(f"❌ No se encontró el SW en: {ruta_custom}")
        return p

    # Intentar encontrar raíz del repo git
    try:
        raiz = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            stderr=subprocess.DEVNULL, text=True
        ).strip()
        candidate = Path(raiz) / "service-worker.js"
        if candidate.exists():
            return candidate
    except Exception:
        pass

    # Fallback: directorio actual
    candidate = Path("service-worker.js")
    if candidate.exists():
        return candidate

    sys.exit("❌ No se encontró service-worker.js. Ejecutá desde la raíz del proyecto o usá --sw.")


def parsear_sw(ruta_sw: Path):
    """
    Extrae del service-worker.js:
      - VERSION_APP
      - Variables de versión de caché (nombre → valor)
      - Grupos de caché (nombre_resuelto → lista de archivos)

    Retorna: (version_app, versiones_vars, grupos)
      versiones_vars: dict[var_name, value]  ej. {"CACHE_BIBLIOTECA": "1", ...}
      grupos: list[dict] con keys: nombre_template, nombre_resuelto, variable, archivos
    """
    contenido = ruta_sw.read_text(encoding="utf-8")

    # VERSION_APP
    m = re.search(r'VERSION_APP\s*=\s*["\']([^"\']+)["\']', contenido)
    version_app = m.group(1) if m else "N/A"

    # Variables de versión de caché.
    # Soporta tanto `const CACHE_X = '1';` como `const A = '1', B = '2', C = '3';`
    versiones_vars = {}
    # Buscar todas las asignaciones CACHE_X = 'N' en cualquier contexto
    for m in re.finditer(r'(CACHE_\w+)\s*=\s*[\'"](\d+)[\'"]', contenido):
        versiones_vars[m.group(1)] = m.group(2)

    # Resolver valores de variables para los nombres de caché
    # Ej: `cache-biblioteca-v${CACHE_BIBLIOTECA}` → buscar CACHE_BIBLIOTECA en versiones_vars
    def resolver_nombre(template):
        def repl(m):
            var = m.group(1)
            return versiones_vars.get(var, f"${{{var}}}")
        return re.sub(r'\$\{(\w+)\}', repl, template)

    # Extraer grupos RUTAS_CACHE: buscar bloques { nombre: `...`, archivos: [...] }
    grupos = []

    # Buscar cada objeto del array RUTAS_CACHE
    # Estrategia: encontrar cada bloque que tiene `nombre:` + `archivos:`
    bloque_pattern = re.compile(
        r'\{\s*nombre\s*:\s*`([^`]+)`\s*,\s*archivos\s*:\s*\[(.*?)\]',
        re.DOTALL
    )

    # Constantes de ruta (ej. RUTA_EMBE)
    rutas_dict = {k: v for k, v in re.findall(r"""const\s+(RUTA_\w+)\s*=\s*['"]([^'"]+)['"]""", contenido)}

    for m in bloque_pattern.finditer(contenido):
        nombre_template = m.group(1)
        archivos_raw    = m.group(2)

        # Resolver concatenaciones: RUTA_X + '/algo'
        archivos_resueltos = []
        partes_raw = re.findall(
            r"""(RUTA_\w+)\s*\+\s*['"]([^'"]+)['"]|['"]([^'"]+)['"]""",
            archivos_raw
        )
        for p in partes_raw:
            ruta_var, sufijo, literal = p
            if ruta_var:
                base = rutas_dict.get(ruta_var, ruta_var)
                archivos_resueltos.append(base + sufijo)
            elif literal and not literal.startswith("cache-"):
                # Evitar capturar el nombre de la caché o la variable v como archivo
                if not re.match(r'^v\d+$', literal):
                    archivos_resueltos.append(literal)

        # Deduplicar manteniendo orden
        vistos = set()
        archivos_finales = []
        for a in archivos_resueltos:
            if a not in vistos:
                vistos.add(a)
                archivos_finales.append(a)

        # Encontrar variable de versión usada en este grupo
        var_usada = None
        for var in versiones_vars:
            if f"${{{var}}}" in nombre_template:
                var_usada = var
                break

        grupos.append({
            "nombre_template":  nombre_template,
            "nombre_resuelto":  resolver_nombre(nombre_template),
            "variable":         var_usada,
            "archivos":         archivos_finales,
        })

    return version_app, versiones_vars, grupos


# ──────────────────────────────────────────────────────────
# OBTENCIÓN DE ARCHIVOS DESDE GIT
# ──────────────────────────────────────────────────────────

def obtener_rama_actual(raiz_proyecto: Path) -> str:
    """Retorna el nombre de la rama git actual."""
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=str(raiz_proyecto),
            stderr=subprocess.DEVNULL,
            text=True
        ).strip()
    except Exception:
        return "main"  # Asumir main si no se puede detectar


def obtener_archivos_git(raiz_proyecto: Path):
    """
    Retorna tres valores:
      - rama: nombre de la rama actual
      - modificados: archivos tracked con cambios (staged o unstaged)
      - nuevos: archivos untracked (excluyendo carpetas de sistema: .agent/, .github/, etc.)

    Si la rama actual NO es `main`, además incorpora los cambios commiteados
    entre la rama y main (git diff main...HEAD), para reflejar el impacto
    total del merge futuro.
    """
    # Prefijos a ignorar como "archivos nuevos" (no son assets web del proyecto)
    PREFIJOS_IGNORAR = (".agent/", ".github/", ".git/", "node_modules/", ".gemini/", "documentacion/")

    rama = obtener_rama_actual(raiz_proyecto)

    # ── Paso 1: cambios sin commitear (git status --porcelain) ──
    try:
        salida_status = subprocess.check_output(
            ["git", "status", "--porcelain"],
            cwd=str(raiz_proyecto),
            stderr=subprocess.DEVNULL,
            text=True
        )
    except subprocess.CalledProcessError:
        sys.exit("❌ Error al ejecutar git status. ¿Estás en un repositorio git?")
    except FileNotFoundError:
        sys.exit("❌ git no encontrado. Instalá git o usá --archivo para modo manual.")

    modificados = set()
    nuevos = set()

    for linea in salida_status.splitlines():
        if not linea.strip():
            continue
        estado  = linea[:2]
        archivo = linea[3:].strip().strip('"')

        # Renombres: "R viejo -> nuevo"
        if " -> " in archivo:
            archivo = archivo.split(" -> ")[1].strip()

        # Normalizar separadores
        archivo = archivo.replace("\\", "/")

        if estado.strip() == "??":
            # Filtrar carpetas de sistema y de la skill
            if not any(archivo.startswith(p) for p in PREFIJOS_IGNORAR):
                nuevos.add(archivo)
        else:
            modificados.add(archivo)

    # ── Paso 2 (solo si NO es main): diff commiteado vs main ──
    if rama != "main":
        try:
            salida_diff = subprocess.check_output(
                ["git", "diff", "main...HEAD", "--name-status"],
                cwd=str(raiz_proyecto),
                stderr=subprocess.DEVNULL,
                text=True
            )
            for linea in salida_diff.splitlines():
                if not linea.strip():
                    continue
                partes  = linea.split("\t")
                estado  = partes[0][0]  # 'A', 'M', 'D', 'R', etc.
                archivo = partes[-1].strip().replace("\\", "/")

                # Renombres: git diff --name-status usa dos columnas para R
                # La ultima parte siempre es el archivo destino (nuevo nombre)

                if any(archivo.startswith(p) for p in PREFIJOS_IGNORAR):
                    continue

                if estado == "A":
                    # Archivo nuevo commiteado en la branch
                    if archivo not in modificados:  # no duplicar si ya está sin commitear
                        nuevos.add(archivo)
                elif estado in ("M", "R", "C"):
                    # Archivo modificado o renombrado commiteado
                    nuevos.discard(archivo)  # promover de nuevo a modificado si estaba
                    modificados.add(archivo)
                # Estado 'D' (borrado) → se maneja vía huérfanos, no lo agregamos

        except subprocess.CalledProcessError:
            # Si main no existe o hay error, continuar solo con status
            print(YELLOW("  ⚠️  No se pudo comparar con 'main'. ¿Existe la rama main en este repo?"))
        except FileNotFoundError:
            pass  # git ya falló antes, no llegamos acá

    return rama, modificados, nuevos


# ──────────────────────────────────────────────────────────
# SUGERENCIA DE CACHÉ PARA ARCHIVOS NUEVOS
# ──────────────────────────────────────────────────────────

def sugerir_cache(archivo: str, grupos: list) -> str:
    """Heurística para sugerir a qué caché pertenece un archivo nuevo."""
    a = archivo.lower()

    # Por extensión y ruta
    if a.startswith("css/"):
        return "cache-css"
    if a.startswith("js/challenges/"):
        return "cache-challenges"
    if a.startswith("js/"):
        return "cache-js"
    if a.startswith("biblioteca/"):
        return "cache-biblioteca"
    if a in ("index.html", "manifest.json", "./"):
        return "cache-biblioteca"

    # Historias: identificar por carpeta
    m = re.match(r'historias/([^/]+)/(.+)', a)
    if m:
        historia_id = m.group(1)  # ej: "el-misterio-del-bosque-encantado"
        subruta     = m.group(2)

        # Buscar si ya existe una caché para esa historia buscando en sus archivos
        nombre_datos  = next((g["nombre_resuelto"] for g in grupos if any(historia_id in arch for arch in g["archivos"]) and "datos" in g["nombre_resuelto"]), None)
        nombre_audios = next((g["nombre_resuelto"] for g in grupos if any(historia_id in arch for arch in g["archivos"]) and "audio" in g["nombre_resuelto"]), None)
        nombre_imag   = next((g["nombre_resuelto"] for g in grupos if any(historia_id in arch for arch in g["archivos"]) and "imagen" in g["nombre_resuelto"]), None)

        # Abreviatura para nombre de caché nueva: primeras letras de cada palabra del id
        siglas = "".join(p[0] for p in historia_id.split("-") if p)

        if subruta.startswith("datos/") or subruta.endswith(".json"):
            return nombre_datos or f"cache-{siglas}-datos (NUEVA)"
        if subruta.startswith("audios/") or subruta.endswith((".mp3", ".wav", ".ogg")):
            return nombre_audios or f"cache-{siglas}-audios (NUEVA)"
        if subruta.startswith("imagenes/") or subruta.endswith((".webp", ".png", ".jpg", ".jpeg", ".svg")):
            return nombre_imag or f"cache-{siglas}-imagenes (NUEVA)"
        return f"cache-{siglas}-datos (revisar)"

    if a.endswith((".webp", ".png", ".jpg", ".jpeg", ".svg")):
        return "cache-biblioteca (o historia correspondiente)"
    if a.endswith(".json"):
        return "cache-biblioteca (historias.json) o datos de historia"

    return "❓ Revisar manualmente"


# ──────────────────────────────────────────────────────────
# DETECCIÓN DE ENTRADAS HUÉRFANAS
# ──────────────────────────────────────────────────────────

def detectar_huerfanos(grupos: list, raiz: Path) -> list:
    """
    Retorna lista de dicts {archivo, cache} donde el archivo no existe en disco.
    Ignora './' que es la raíz del sitio.
    """
    huerfanos = []
    for grupo in grupos:
        for archivo in grupo["archivos"]:
            if archivo in ("./",):
                continue
            ruta = raiz / archivo
            if not ruta.exists():
                huerfanos.append({
                    "archivo": archivo,
                    "cache":   grupo["nombre_resuelto"],
                    "variable": grupo["variable"],
                })
    return huerfanos


# ──────────────────────────────────────────────────────────
# REPORTE
# ──────────────────────────────────────────────────────────

def imprimir_reporte(version_app, versiones_vars, grupos, modificados, nuevos, huerfanos, raiz, rama="main"):
    """Imprime el análisis completo en la terminal."""
    print()
    print(BOLD("🔍 Análisis del Service Worker"))
    print("=" * 50)
    print(f"  SW analizado: {CYAN(str(raiz / 'service-worker.js'))}")
    print(f"  VERSION_APP:  {BOLD(version_app)}")
    if rama != "main":
        print(f"  Rama actual:  {YELLOW(rama)}  {DIM('(incluye diff commiteado vs main)')}")
    else:
        print(f"  Rama actual:  {GREEN(rama)}  {DIM('(solo cambios sin commitear)')}")
    print()

    # Construir mapa archivo → grupo para cruzar
    archivo_a_grupo = {}
    for grupo in grupos:
        for archivo in grupo["archivos"]:
            archivo_a_grupo[archivo] = grupo

    # ── Cachés afectadas (archivos modificados que están en el SW)
    caches_afectadas = {}  # nombre_resuelto → {grupo, [archivos]}
    for archivo in sorted(modificados):
        if archivo in archivo_a_grupo:
            grupo = archivo_a_grupo[archivo]
            nombre = grupo["nombre_resuelto"]
            if nombre not in caches_afectadas:
                caches_afectadas[nombre] = {"grupo": grupo, "archivos": []}
            caches_afectadas[nombre]["archivos"].append(archivo)

    if caches_afectadas:
        print(BOLD(YELLOW("📦 CACHÉS AFECTADAS (archivos modificados en git):")))
        for nombre, datos in caches_afectadas.items():
            var = datos["grupo"]["variable"]
            val = versiones_vars.get(var, "?") if var else "?"
            var_str = f"  [{var} = '{val}']" if var else ""
            print(f"  • {YELLOW(nombre)}{DIM(var_str)}")
            for a in datos["archivos"]:
                print(f"      - {a}  {DIM('[MODIFICADO]')}")
        print()
    else:
        print(GREEN("📦 Sin cachés afectadas por archivos modificados."))
        print()

    # ── Archivos nuevos sin caché
    nuevos_sin_cache = []
    for archivo in sorted(nuevos):
        if archivo not in archivo_a_grupo:
            nuevos_sin_cache.append(archivo)

    if nuevos_sin_cache:
        print(BOLD("🆕 ARCHIVOS NUEVOS (sin caché asignada):"))
        for archivo in nuevos_sin_cache:
            sugerencia = sugerir_cache(archivo, grupos)
            print(f"  • {archivo}")
            print(f"      → Sugerencia: {CYAN(sugerencia)}")
        print()
    else:
        print(GREEN("🆕 No hay archivos nuevos sin caché."))
        print()

    # ── Archivos nuevos que SÍ ya estaban en el SW (edge case: nuevo en git pero ya listado)
    nuevos_ya_en_sw = [a for a in nuevos if a in archivo_a_grupo]
    if nuevos_ya_en_sw:
        print(DIM("ℹ️  Archivos nuevos en git pero ya registrados en el SW:"))
        for a in nuevos_ya_en_sw:
            print(f"  • {a}  {DIM('[ya en caché, bump recomendado]')}")
        print()

    # ── Entradas huérfanas
    if huerfanos:
        print(BOLD(RED("👻 ENTRADAS HUÉRFANAS (en SW pero archivo no existe en disco):")))
        for h in huerfanos:
            var = h["variable"]
            print(f"  • {RED(h['archivo'])}")
            print(f"      Cache: {h['cache']}")
        print()
    else:
        print(GREEN("👻 Sin entradas huérfanas."))
        print()

    # ── Resumen de versiones
    print(BOLD("📋 VERSIONES ACTUALES DE CACHÉ:"))
    for grupo in grupos:
        var = grupo["variable"]
        val = versiones_vars.get(var, "—") if var else "—"
        afectada = grupo["nombre_resuelto"] in caches_afectadas
        marker   = YELLOW(" ← bump recomendado") if afectada else ""
        print(f"  • {grupo['nombre_resuelto']:35s}  {DIM(f'{var} = {repr(val)}') if var else DIM('sin variable')}{marker}")
    print()

    # ── Recomendación final
    necesita_accion = bool(caches_afectadas or nuevos_sin_cache or huerfanos)
    if necesita_accion:
        print(BOLD("📝 PRÓXIMOS PASOS SUGERIDOS:"))
        if caches_afectadas:
            print(f"  1. Incrementar la(s) versión(es) de caché afectadas en service-worker.js")
        if nuevos_sin_cache:
            print(f"  {'2' if caches_afectadas else '1'}. Agregar los archivos nuevos a la caché correspondiente")
        if huerfanos:
            n = sum([1 for _ in [caches_afectadas, nuevos_sin_cache] if _]) + 1
            print(f"  {n}. Eliminar las entradas huérfanas del service-worker.js")
        print(f"  {'→'} Preguntar al usuario si también actualizar VERSION_APP")
        print()
    else:
        print(GREEN("✅ Todo en orden. No se detectaron cambios que requieran actualizar el SW."))
        print()


# ──────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="analizar-sw.py",
        description="Analizador del Service Worker — La Biblioteca del Tío Pier",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python analizar-sw.py
  python analizar-sw.py --archivo historias/el-misterio-del-bosque-encantado/datos/escenas/NUEVA.json
  python analizar-sw.py --archivo img1.webp img2.webp json3.json
  python analizar-sw.py --sw ../otro-proyecto/service-worker.js
        """
    )
    parser.add_argument(
        "--archivo", "-a",
        nargs="+",
        metavar="RUTA",
        help="Uno o más archivos a analizar manualmente (sin usar git)"
    )
    parser.add_argument(
        "--sw",
        metavar="RUTA_SW",
        help="Ruta al service-worker.js (por defecto: auto-detecta en la raíz del repo)"
    )

    args = parser.parse_args()

    # Encontrar SW
    ruta_sw    = encontrar_sw(args.sw)
    raiz       = ruta_sw.parent

    # Parsear SW
    version_app, versiones_vars, grupos = parsear_sw(ruta_sw)

    if not grupos:
        sys.exit("❌ No se pudieron extraer grupos de caché del service-worker.js. Verificá el formato.")

    # Obtener archivos a analizar
    if args.archivo:
        # Modo manual: el usuario especificó los archivos
        modificados = set()
        nuevos      = set()
        advertencias = []

        for ruta_str in args.archivo:
            # Normalizar a forward slashes
            ruta_norm = ruta_str.replace("\\", "/")
            ruta_abs  = raiz / ruta_norm

            if not ruta_abs.exists():
                advertencias.append(ruta_norm)

            # En modo manual: si el archivo YA está en el SW → modificado, sino → nuevo
            todos_archivos_sw = {a for g in grupos for a in g["archivos"]}
            if ruta_norm in todos_archivos_sw:
                modificados.add(ruta_norm)
            else:
                nuevos.add(ruta_norm)

        if advertencias:
            print()
            for a in advertencias:
                print(YELLOW(f"  ⚠️  Archivo no encontrado en disco: {a} (se analiza igual)"))

    else:
        # Modo git
        rama, modificados, nuevos = obtener_archivos_git(raiz)

    # Detectar huérfanos
    huerfanos = detectar_huerfanos(grupos, raiz)

    # Imprimir reporte
    imprimir_reporte(version_app, versiones_vars, grupos, modificados, nuevos, huerfanos, raiz, rama)


if __name__ == "__main__":
    main()
