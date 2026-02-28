#!/usr/bin/env python3
"""
auditar.py — Script de auditoría automática para La Biblioteca del Tío Pier.

Detecta mecánicamente: magic numbers, hardcodeos, !important, z-index literales,
inconsistencias de naming, schema JSON incompleto, anti-voseo, sincronización SW,
rutas de imágenes huérfanas y más.

Es de SOLO LECTURA — no modifica ningún archivo del proyecto.

Uso:
  python auditar.py                           # Auditoría completa
  python auditar.py --categoria js            # Solo JavaScript
  python auditar.py --categoria css           # Solo CSS
  python auditar.py --categoria json          # Solo JSONs de escenas/desafíos
  python auditar.py --categoria pwa           # Solo Service Worker / PWA
  python auditar.py --categoria cross         # Solo checks transversales
  python auditar.py --archivo js/GameEngine.js  # Archivo específico
  python auditar.py --resumen                 # Solo conteo por categoría/severidad
"""

import argparse
import io
import json
import os
import re
import sys
from pathlib import Path
from collections import defaultdict

# Forzar UTF-8 en stdout/stderr (Windows usa cp1252 por defecto)
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── Resolución de rutas ────────────────────────────────────────────

def encontrar_raiz():
    """Busca la raíz del proyecto subiendo desde el directorio del script."""
    # El script está en .agents/skills/code-auditor/scripts/
    ruta = Path(__file__).resolve()
    for _ in range(6):
        ruta = ruta.parent
        if (ruta / 'AGENTS.md').exists() and (ruta / 'js').is_dir():
            return ruta
    # Fallback: cwd
    cwd = Path.cwd()
    if (cwd / 'AGENTS.md').exists():
        return cwd
    print("ERROR: No se pudo encontrar la raíz del proyecto.", file=sys.stderr)
    sys.exit(1)

RAIZ = encontrar_raiz()

# ─── Helpers ────────────────────────────────────────────────────────

class Hallazgo:
    def __init__(self, categoria, severidad, tipo, archivo, linea, descripcion, sugerencia):
        self.categoria = categoria      # js | css | json | pwa | cross
        self.severidad = severidad      # CRITICA | ALTA | MEDIA | BAJA
        self.tipo = tipo                # bug | hardcodeo | magic_number | inconsistencia | refactor | dead_code | pwa
        self.archivo = archivo          # ruta relativa
        self.linea = linea              # número de línea (0 = no aplica)
        self.descripcion = descripcion
        self.sugerencia = sugerencia

    def to_dict(self):
        return {
            'categoria': self.categoria,
            'severidad': self.severidad,
            'tipo': self.tipo,
            'archivo': self.archivo,
            'linea': self.linea,
            'descripcion': self.descripcion,
            'sugerencia': self.sugerencia,
        }


def leer_archivo(ruta_relativa):
    """Lee un archivo y devuelve sus líneas. Retorna [] si no existe."""
    ruta = RAIZ / ruta_relativa
    if not ruta.exists():
        return []
    try:
        return ruta.read_text(encoding='utf-8').splitlines()
    except Exception:
        return []


def ruta_relativa(ruta_abs):
    """Convierte Path absoluto a string relativo al proyecto."""
    try:
        return str(Path(ruta_abs).relative_to(RAIZ)).replace('\\', '/')
    except ValueError:
        return str(ruta_abs).replace('\\', '/')

# ─── CHECKS: JavaScript ────────────────────────────────────────────

def check_js(archivos_filtro=None):
    """Ejecuta checks sobre archivos JavaScript."""
    hallazgos = []

    # Recopilar archivos JS
    rutas_js = []
    for carpeta in ['js', 'js/challenges']:
        dir_js = RAIZ / carpeta
        if dir_js.is_dir():
            for f in sorted(dir_js.glob('*.js')):
                rel = ruta_relativa(f)
                if archivos_filtro and rel not in archivos_filtro:
                    continue
                rutas_js.append((rel, f))

    # También el service-worker.js si no hay filtro o está explícito
    sw = RAIZ / 'service-worker.js'
    if sw.exists():
        rel_sw = 'service-worker.js'
        if not archivos_filtro or rel_sw in archivos_filtro:
            # SW se audita en pwa, no acá
            pass

    for rel, ruta in rutas_js:
        lineas = leer_archivo(rel)

        for i, linea in enumerate(lineas, 1):
            stripped = linea.strip()

            # Ignorar comentarios
            if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                continue

            # --- Magic numbers en setTimeout / delay ---
            match_timeout = re.search(r'setTimeout\s*\(\s*(?:.*?,\s*)(\d{3,5})\s*\)', linea)
            if match_timeout:
                valor = match_timeout.group(1)
                hallazgos.append(Hallazgo(
                    'js', 'BAJA', 'magic_number', rel, i,
                    f'Magic number {valor} en setTimeout',
                    'Extraer a una constante nombrada (ej: DELAY_FEEDBACK = ' + valor + ')'
                ))

            match_delay = re.search(r'#?delay\s*\(\s*(\d{3,5})\s*\)', linea)
            if match_delay:
                valor = match_delay.group(1)
                hallazgos.append(Hallazgo(
                    'js', 'BAJA', 'magic_number', rel, i,
                    f'Magic number {valor} en delay()',
                    'Extraer a una constante nombrada'
                ))

            # --- Magic numbers en volume ---
            match_vol = re.search(r'\.volume\s*=\s*(0\.\d+)', linea)
            if match_vol:
                valor = match_vol.group(1)
                hallazgos.append(Hallazgo(
                    'js', 'BAJA', 'magic_number', rel, i,
                    f'Volumen hardcodeado: {valor}',
                    'Extraer a constante (ej: VOLUMEN_BGM, VOLUMEN_SFX)'
                ))

            # --- innerHTML sin sanitizar ---
            if '.innerHTML' in linea and 'textContent' not in linea:
                # Verificar si hay interpolación de variables
                if re.search(r'\.innerHTML\s*=.*(\$\{|\.replace|\+\s*\w)', linea):
                    hallazgos.append(Hallazgo(
                        'js', 'MEDIA', 'bug', rel, i,
                        'Uso de .innerHTML con contenido dinámico (riesgo de inyección)',
                        'Considerar sanitizar el contenido o usar .textContent donde sea posible'
                    ))

            # --- console.log residuales ---
            if re.search(r'console\.(log|debug|info)\s*\(', linea):
                hallazgos.append(Hallazgo(
                    'js', 'BAJA', 'refactor', rel, i,
                    'console.log/debug/info residual (no es console.error/warn)',
                    'Eliminar o reemplazar por console.warn/error si es manejo de errores'
                ))

            # --- Hardcodeo de IDs de escena en JS ---
            match_id = re.search(r"['\"]([A-Z][A-Z0-9_]{3,})['\"]", linea)
            if match_id:
                id_val = match_id.group(1)
                # Excluir constantes de storage, DOM IDs comunes y el propio nombre
                excluidos = {'STORAGE_PREFIX', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'}
                if id_val not in excluidos and not id_val.startswith('CACHE_'):
                    # Verificar si parece un ID de escena (patrón típico)
                    if re.match(r'^[A-Z][A-Z0-9]+(_[A-Z0-9]+)+$', id_val):
                        hallazgos.append(Hallazgo(
                            'js', 'ALTA', 'hardcodeo', rel, i,
                            f'ID de escena/desafío hardcodeado en JS: "{id_val}"',
                            'Mover a configuración JSON. La lógica narrativa no debe estar en JS (regla de AGENTS.md)'
                        ))

            # --- TODO / FIXME / HACK ---
            if re.search(r'//\s*(TODO|FIXME|HACK|XXX)\b', linea, re.IGNORECASE):
                hallazgos.append(Hallazgo(
                    'js', 'MEDIA', 'dead_code', rel, i,
                    f'Marcador pendiente encontrado: {stripped[:80]}',
                    'Resolver o documentar formalmente como feature incompleto'
                ))

            # --- animationend (documentado como problemático) ---
            if 'animationend' in linea:
                hallazgos.append(Hallazgo(
                    'js', 'MEDIA', 'bug', rel, i,
                    'Uso de "animationend" — documentado como problemático por event bubbling',
                    'Evaluar si se puede reemplazar por setTimeout sincronizado con la duración CSS'
                ))

    return hallazgos

# ─── CHECKS: CSS ────────────────────────────────────────────────────

def check_css(archivos_filtro=None):
    """Ejecuta checks sobre archivos CSS."""
    hallazgos = []

    # Z-index válidos del sistema (valores numéricos definidos en variables.css)
    z_validos = {0, 1, 5, 10, 100, 200, 300, 1000, 1050, 1100, 1200}

    dir_css = RAIZ / 'css'
    if not dir_css.is_dir():
        return hallazgos

    for f in sorted(dir_css.glob('*.css')):
        rel = ruta_relativa(f)
        if archivos_filtro and rel not in archivos_filtro:
            continue
        lineas = leer_archivo(rel)

        # Track si estamos dentro de un @keyframes (z-index ahí puede ser intencional)
        en_keyframes = False
        en_root = False

        for i, linea in enumerate(lineas, 1):
            stripped = linea.strip()

            # Detectar bloques especiales
            if '@keyframes' in stripped:
                en_keyframes = True
            if ':root' in stripped:
                en_root = True
            if stripped == '}' and (en_keyframes or en_root):
                # Heurística simple: el cierre a nivel 0 cierra el bloque
                pass

            # --- !important ---
            if '!important' in stripped and not stripped.startswith('/*'):
                hallazgos.append(Hallazgo(
                    'css', 'MEDIA', 'refactor', rel, i,
                    f'Uso de !important: {stripped[:80]}',
                    'Resolver el problema de especificidad sin !important'
                ))

            # --- z-index literal (no variable) ---
            match_z = re.search(r'z-index\s*:\s*(-?\d+)', stripped)
            if match_z and 'var(--z-' not in stripped:
                valor = int(match_z.group(1))
                # Ignorar 0 y 1 en keyframes/partículas (uso legítimo)
                if valor not in {0, 1, -1} or 'variables.css' in rel:
                    if 'variables.css' not in rel:  # No reportar las definiciones
                        hallazgos.append(Hallazgo(
                            'css', 'MEDIA', 'inconsistencia', rel, i,
                            f'z-index literal ({valor}) en lugar de variable CSS',
                            f'Usar var(--z-*) del sistema de capas definido en variables.css'
                        ))

            # --- Breakpoint inconsistente ---
            if '@media' in stripped:
                # El breakpoint estándar es (max-width: 900px), (max-height: 600px)
                if 'max-width' in stripped or 'max-height' in stripped:
                    if '900px' not in stripped and '600px' not in stripped:
                        hallazgos.append(Hallazgo(
                            'css', 'MEDIA', 'inconsistencia', rel, i,
                            f'Breakpoint no estándar: {stripped[:80]}',
                            'El breakpoint del proyecto es (max-width: 900px), (max-height: 600px)'
                        ))

            # --- Colores hardcodeados (no variables) ---
            if re.search(r'(?:color|background|border|shadow)\s*:.*#[0-9a-fA-F]{3,8}', stripped):
                if 'var(--' not in stripped and 'variables.css' not in rel:
                    # No reportar en gradientes donde puede ser intencional
                    if 'gradient' not in stripped:
                        hallazgos.append(Hallazgo(
                            'css', 'BAJA', 'refactor', rel, i,
                            f'Color hex literal en lugar de variable CSS: {stripped[:60]}',
                            'Considerar usar un token de variables.css si el color pertenece a la paleta'
                        ))

    return hallazgos

# ─── CHECKS: JSON (escenas y desafíos) ─────────────────────────────

# Patrones anti-voseo (tuteo/ustedeo)
ANTI_VOSEO = re.compile(
    r'\b(quieres|puedes|tienes|debes|vienes|sabes|dices|haces|piensas'
    r'|necesitas|conoces|sientes|miras?(?!lo)|despiertas?|recuerdas?'
    r'|caminas?|decides|sigues|encuentras|hablas(?![oe])|escuchas'
    r'|tu(?:yo|ya|yos|yas)?(?:\s)|usted(?:es)?)\b',
    re.IGNORECASE
)

# Tipos de efecto válidos
TIPOS_EFECTO_VALIDOS = {'luciérnagas', 'polvo_hadas', 'nieve', 'destellos', 'sparkles'}


def check_json(archivos_filtro=None):
    """Ejecuta checks sobre JSONs de escenas y desafíos."""
    hallazgos = []

    # Buscar todas las historias
    dir_historias = RAIZ / 'historias'
    if not dir_historias.is_dir():
        return hallazgos

    for historia_dir in sorted(dir_historias.iterdir()):
        if not historia_dir.is_dir():
            continue

        # Escenas
        dir_escenas = historia_dir / 'datos' / 'escenas'
        if dir_escenas.is_dir():
            for f in sorted(dir_escenas.glob('*.json')):
                rel = ruta_relativa(f)
                if archivos_filtro and rel not in archivos_filtro:
                    continue
                hallazgos.extend(_check_escena_json(rel, f))

        # Desafíos
        dir_desafios = historia_dir / 'datos' / 'desafios'
        if dir_desafios.is_dir():
            for f in sorted(dir_desafios.glob('*.json')):
                rel = ruta_relativa(f)
                if archivos_filtro and rel not in archivos_filtro:
                    continue
                hallazgos.extend(_check_desafio_json(rel, f))

        # historia.json
        historia_json = historia_dir / 'historia.json'
        if historia_json.exists():
            rel = ruta_relativa(historia_json)
            if not archivos_filtro or rel in archivos_filtro:
                hallazgos.extend(_check_historia_json(rel, historia_json))

    return hallazgos


def _cargar_json(ruta):
    """Carga y parsea un JSON. Retorna (datos, error)."""
    try:
        with open(ruta, 'r', encoding='utf-8') as f:
            return json.load(f), None
    except json.JSONDecodeError as e:
        return None, str(e)
    except Exception as e:
        return None, str(e)


def _check_escena_json(rel, ruta):
    """Valida un JSON de escena."""
    hallazgos = []
    datos, error = _cargar_json(ruta)

    if error:
        hallazgos.append(Hallazgo('json', 'CRITICA', 'bug', rel, 0,
                                  f'JSON inválido: {error}', 'Corregir sintaxis JSON'))
        return hallazgos

    # Campos requeridos
    requeridos = ['id', 'tipo', 'fondo', 'texto', 'opciones']
    for campo in requeridos:
        if campo not in datos:
            hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                      f'Campo requerido faltante: "{campo}"',
                                      f'Agregar campo "{campo}" al JSON de escena'))

    # ID debe coincidir con nombre de archivo
    if 'id' in datos:
        nombre_esperado = ruta.stem
        if datos['id'] != nombre_esperado:
            hallazgos.append(Hallazgo('json', 'ALTA', 'inconsistencia', rel, 0,
                                      f'ID "{datos["id"]}" no coincide con nombre de archivo "{nombre_esperado}"',
                                      f'Renombrar ID a "{nombre_esperado}" o renombrar archivo'))

    # ID en UPPER_SNAKE_CASE
    if 'id' in datos and not re.match(r'^[A-Z][A-Z0-9_]*$', datos['id']):
        hallazgos.append(Hallazgo('json', 'MEDIA', 'inconsistencia', rel, 0,
                                  f'ID "{datos["id"]}" no sigue UPPER_SNAKE_CASE',
                                  'Renombrar ID a UPPER_SNAKE_CASE'))

    # Tipo debe ser "escena"
    if datos.get('tipo') not in ('escena', None):
        if datos.get('tipo') != 'escena':
            hallazgos.append(Hallazgo('json', 'MEDIA', 'inconsistencia', rel, 0,
                                      f'Tipo "{datos.get("tipo")}" inesperado para archivo en escenas/',
                                      'El tipo debe ser "escena"'))

    # Texto: check anti-voseo
    texto = datos.get('texto', '')
    if isinstance(texto, str):
        matches_voseo = ANTI_VOSEO.findall(texto)
        if matches_voseo:
            hallazgos.append(Hallazgo('json', 'ALTA', 'inconsistencia', rel, 0,
                                      f'Posible tuteo/ustedeo en texto: {", ".join(set(matches_voseo))}',
                                      'Reescribir en voseo rioplatense (ej: "querés", "podés", "tenés")'))

    # Opciones: validar estructura
    opciones = datos.get('opciones', [])
    if isinstance(opciones, list):
        for j, opcion in enumerate(opciones):
            if not isinstance(opcion, dict):
                continue
            # Cada opción debe tener texto
            if 'texto' not in opcion:
                hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                          f'Opción #{j+1} sin campo "texto"',
                                          'Agregar texto descriptivo a la opción'))
            # Check voseo en texto de opciones
            texto_op = opcion.get('texto', '')
            if isinstance(texto_op, str):
                matches_op = ANTI_VOSEO.findall(texto_op)
                if matches_op:
                    hallazgos.append(Hallazgo('json', 'ALTA', 'inconsistencia', rel, 0,
                                              f'Posible tuteo en opción #{j+1}: {", ".join(set(matches_op))}',
                                              'Reescribir en voseo rioplatense'))
            # target debe existir como archivo
            target = opcion.get('target')
            tipo_target = opcion.get('tipo_target', 'escena')
            if target:
                # Buscar en la misma historia
                base_historia = ruta.parent.parent  # datos/ -> historia_dir/datos
                if tipo_target == 'desafio':
                    target_path = base_historia / 'desafios' / f'{target}.json'
                else:
                    target_path = base_historia / 'escenas' / f'{target}.json'
                if not target_path.exists():
                    hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                              f'Target "{target}" ({tipo_target}) referencia archivo inexistente',
                                              f'Crear {ruta_relativa(target_path)} o corregir el target'))

    # Efectos: validar tipos
    efectos = datos.get('efectos', [])
    if isinstance(efectos, list):
        for efecto in efectos:
            if isinstance(efecto, dict):
                tipo_ef = efecto.get('tipo', '')
                if tipo_ef and tipo_ef not in TIPOS_EFECTO_VALIDOS:
                    hallazgos.append(Hallazgo('json', 'MEDIA', 'inconsistencia', rel, 0,
                                              f'Tipo de efecto desconocido: "{tipo_ef}"',
                                              f'Tipos válidos: {", ".join(sorted(TIPOS_EFECTO_VALIDOS))}'))

    # Campos en snake_case
    hallazgos.extend(_check_campos_snake_case(datos, rel))

    return hallazgos


def _check_desafio_json(rel, ruta):
    """Valida un JSON de desafío."""
    hallazgos = []
    datos, error = _cargar_json(ruta)

    if error:
        hallazgos.append(Hallazgo('json', 'CRITICA', 'bug', rel, 0,
                                  f'JSON inválido: {error}', 'Corregir sintaxis JSON'))
        return hallazgos

    # Campos requeridos
    requeridos = ['id', 'tipo', 'subtipo', 'instruccion', 'fondo', 'configuracion',
                  'resultado_exito', 'resultado_fallo']
    for campo in requeridos:
        if campo not in datos:
            hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                      f'Campo requerido faltante en desafío: "{campo}"',
                                      f'Agregar campo "{campo}" al JSON de desafío'))

    # ID debe coincidir con nombre de archivo
    if 'id' in datos:
        nombre_esperado = ruta.stem
        if datos['id'] != nombre_esperado:
            hallazgos.append(Hallazgo('json', 'ALTA', 'inconsistencia', rel, 0,
                                      f'ID "{datos["id"]}" no coincide con nombre de archivo "{nombre_esperado}"',
                                      f'Renombrar ID a "{nombre_esperado}" o renombrar archivo'))

    # Tipo debe ser "desafio"
    if datos.get('tipo') != 'desafio':
        hallazgos.append(Hallazgo('json', 'MEDIA', 'inconsistencia', rel, 0,
                                  f'Tipo "{datos.get("tipo")}" inesperado para archivo en desafios/',
                                  'El tipo debe ser "desafio"'))

    # Subtipos válidos
    subtipos_validos = {'pregunta_real', 'minijuego_observacion', 'minijuego_clicks'}
    subtipo = datos.get('subtipo', '')
    if subtipo and subtipo not in subtipos_validos:
        hallazgos.append(Hallazgo('json', 'MEDIA', 'inconsistencia', rel, 0,
                                  f'Subtipo desconocido: "{subtipo}"',
                                  f'Subtipos registrados: {", ".join(sorted(subtipos_validos))}'))

    # Check instrucción anti-voseo
    instruccion = datos.get('instruccion', '')
    if isinstance(instruccion, str):
        matches = ANTI_VOSEO.findall(instruccion)
        if matches:
            hallazgos.append(Hallazgo('json', 'ALTA', 'inconsistencia', rel, 0,
                                      f'Posible tuteo en instrucción: {", ".join(set(matches))}',
                                      'Reescribir en voseo rioplatense'))

    # resultado_exito/fallo deben tener target
    for campo_res in ['resultado_exito', 'resultado_fallo']:
        resultado = datos.get(campo_res, {})
        if isinstance(resultado, dict) and 'target' not in resultado:
            hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                      f'{campo_res} sin campo "target"',
                                      f'Agregar target al {campo_res}'))

    # Campos en snake_case
    hallazgos.extend(_check_campos_snake_case(datos, rel))

    return hallazgos


def _check_historia_json(rel, ruta):
    """Valida un historia.json."""
    hallazgos = []
    datos, error = _cargar_json(ruta)

    if error:
        hallazgos.append(Hallazgo('json', 'CRITICA', 'bug', rel, 0,
                                  f'JSON inválido: {error}', 'Corregir sintaxis JSON'))
        return hallazgos

    requeridos = ['id', 'titulo', 'portada', 'escena_inicial']
    for campo in requeridos:
        if campo not in datos:
            hallazgos.append(Hallazgo('json', 'ALTA', 'bug', rel, 0,
                                      f'Campo requerido faltante en historia.json: "{campo}"',
                                      f'Agregar campo "{campo}"'))

    # escena_inicial debe existir como archivo
    escena_ini = datos.get('escena_inicial')
    if escena_ini:
        dir_escenas = ruta.parent / 'datos' / 'escenas'
        if not (dir_escenas / f'{escena_ini}.json').exists():
            hallazgos.append(Hallazgo('json', 'CRITICA', 'bug', rel, 0,
                                      f'escena_inicial "{escena_ini}" no existe en datos/escenas/',
                                      f'Crear {escena_ini}.json o corregir el campo'))

    return hallazgos


def _check_campos_snake_case(datos, rel, path_prefix=''):
    """Verifica que todos los campos del JSON estén en snake_case."""
    hallazgos = []
    # snake_case: minúsculas, números y guiones bajos (primera letra minúscula)
    patron = re.compile(r'^[a-z][a-z0-9_]*$')
    # Excepciones conocidas (sin campos que mezclen formatos)
    excepciones = set()

    if isinstance(datos, dict):
        for clave in datos:
            if not patron.match(clave) and clave not in excepciones:
                hallazgos.append(Hallazgo('json', 'BAJA', 'inconsistencia', rel, 0,
                                          f'Campo "{clave}" no sigue snake_case',
                                          f'Renombrar a formato snake_case'))
            # Recursión para objetos anidados
            if isinstance(datos[clave], dict):
                hallazgos.extend(_check_campos_snake_case(datos[clave], rel, f'{path_prefix}{clave}.'))
            elif isinstance(datos[clave], list):
                for item in datos[clave]:
                    if isinstance(item, dict):
                        hallazgos.extend(_check_campos_snake_case(item, rel, f'{path_prefix}{clave}[].'))
    return hallazgos


# ─── CHECKS: PWA / Service Worker ──────────────────────────────────

def check_pwa(archivos_filtro=None):
    """Ejecuta checks sobre Service Worker y manifest."""
    hallazgos = []

    sw_path = RAIZ / 'service-worker.js'
    if not sw_path.exists():
        hallazgos.append(Hallazgo('pwa', 'CRITICA', 'bug', 'service-worker.js', 0,
                                  'service-worker.js no encontrado', 'Crear el Service Worker'))
        return hallazgos

    if archivos_filtro and 'service-worker.js' not in archivos_filtro and 'manifest.json' not in archivos_filtro:
        return hallazgos

    lineas_sw = leer_archivo('service-worker.js')
    contenido_sw = '\n'.join(lineas_sw)

    # --- Extraer archivos listados en RUTAS_CACHE ---
    archivos_en_sw = set()

    # Resolver constantes de ruta (ej: RUTA_EMBE = 'historias/...')
    constantes_ruta = {}
    for match in re.finditer(r"const\s+(\w+)\s*=\s*'([^']+)'", contenido_sw):
        nombre, valor = match.group(1), match.group(2)
        if '/' in valor and not valor.startswith('cache-'):
            constantes_ruta[nombre] = valor

    # Buscar strings entre comillas simples que parecen rutas de archivo
    for match in re.finditer(r"'([^']+\.[a-zA-Z]{2,5})'", contenido_sw):
        ruta_str = match.group(1)
        # Ignorar cache names, URLs externas, fragmentos parciales (empiezan con /)
        if ruta_str.startswith('cache-') or '://' in ruta_str or ruta_str.startswith('/'):
            continue
        archivos_en_sw.add(ruta_str)

    # Buscar concatenaciones con constantes de ruta (ej: RUTA_EMBE + '/datos/...')
    for nombre_const, valor_const in constantes_ruta.items():
        for match in re.finditer(rf"{nombre_const}\s*\+\s*'([^']+)'", contenido_sw):
            archivos_en_sw.add(valor_const + match.group(1))

    # Eliminar './' (es la raíz)
    archivos_en_sw.discard('./')

    # --- Buscar archivos huérfanos (en SW pero no en filesystem) ---
    for archivo_sw in sorted(archivos_en_sw):
        ruta_real = RAIZ / archivo_sw
        if not ruta_real.exists():
            hallazgos.append(Hallazgo('pwa', 'ALTA', 'pwa', 'service-worker.js', 0,
                                      f'Archivo huérfano en SW (no existe): {archivo_sw}',
                                      f'Eliminar la entrada del SW o crear el archivo'))

    # --- Buscar archivos reales no cacheados ---
    extensiones_cache = {'.html', '.css', '.js', '.json', '.webp', '.png', '.mp3',
                         '.jpg', '.jpeg', '.svg', '.ico', '.woff2'}

    # Carpetas y patrones a ignorar en el check de archivos no cacheados
    ignorar_carpetas = {
        '.agents/', 'node_modules/', 'documentacion/', '.git/',
        '.vscode/', '.github/',
    }
    # Archivos sueltos a ignorar (no necesitan caché)
    ignorar_archivos = {
        'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'README.md', 'LICENSE',
        'service-worker.js',  # El SW no se cachea a sí mismo
    }

    for ext in extensiones_cache:
        for f in RAIZ.rglob(f'*{ext}'):
            rel = ruta_relativa(f)
            # Ignorar carpetas de desarrollo/documentación
            if any(seg in rel for seg in ignorar_carpetas):
                continue
            if rel in ignorar_archivos:
                continue
            # Ignorar archivos .md (documentación, no recurso web)
            if rel.endswith('.md'):
                continue
            # Ignorar archivos de narrativa/concepto dentro de historias
            # (solo datos/, imagenes/ y audios/ necesitan caché)
            if 'historias/' in rel:
                partes = rel.split('/')
                if len(partes) >= 3:
                    subcarpeta = partes[1]  # id de la historia
                    # Solo auditar recursos que deberían estar cacheados
                    # Las subcarpetas válidas son: datos/, imagenes/, audios/, y historia.json
                    resto = '/'.join(partes[2:])
                    carpetas_validas = ('datos/', 'imagenes/', 'audios/', 'historia.json')
                    if not any(resto.startswith(cv) for cv in carpetas_validas):
                        continue
            if rel not in archivos_en_sw:
                hallazgos.append(Hallazgo('pwa', 'MEDIA', 'pwa', 'service-worker.js', 0,
                                          f'Archivo no cacheado en SW: {rel}',
                                          'Agregar al grupo de caché correspondiente o verificar si es necesario offline'))

    # --- Verificar manifest.json ---
    manifest = RAIZ / 'manifest.json'
    if manifest.exists():
        datos_manifest, error = _cargar_json(manifest)
        if error:
            hallazgos.append(Hallazgo('pwa', 'CRITICA', 'bug', 'manifest.json', 0,
                                      f'manifest.json inválido: {error}', 'Corregir sintaxis'))
        elif datos_manifest:
            # Verificar que todos los íconos estén cacheados
            iconos = datos_manifest.get('icons', [])
            for icono in iconos:
                src = icono.get('src', '')
                if src and src not in archivos_en_sw:
                    hallazgos.append(Hallazgo('pwa', 'ALTA', 'pwa', 'manifest.json', 0,
                                              f'Ícono del manifest no cacheado: {src}',
                                              'Agregar al grupo cache-biblioteca en service-worker.js'))

    # --- Verificar consistencia de propiedad version en grupos ---
    grupos_con_version = []
    grupos_sin_version = []
    # Buscar patrones de objetos de grupo en el SW
    en_grupo = False
    nombre_grupo_actual = ''
    tiene_version = False
    for i, linea in enumerate(lineas_sw, 1):
        stripped = linea.strip()
        if 'nombre:' in stripped and 'cache-' in stripped:
            en_grupo = True
            nombre_grupo_actual = stripped
            tiene_version = False
        if en_grupo and 'version:' in stripped:
            tiene_version = True
        if en_grupo and stripped == '},':
            if tiene_version:
                grupos_con_version.append(nombre_grupo_actual)
            else:
                grupos_sin_version.append(nombre_grupo_actual)
            en_grupo = False

    if grupos_con_version and grupos_sin_version:
        hallazgos.append(Hallazgo('pwa', 'BAJA', 'inconsistencia', 'service-worker.js', 0,
                                  f'{len(grupos_sin_version)} grupo(s) de caché sin propiedad "version" '
                                  f'mientras {len(grupos_con_version)} sí la tienen',
                                  'Agregar "version" a todos los grupos o eliminarla de todos'))

    return hallazgos

# ─── CHECKS: Cross-cutting ──────────────────────────────────────────

def check_cross(archivos_filtro=None):
    """Checks transversales que involucran múltiples tipos de archivo."""
    hallazgos = []

    # --- 1. Verificar que IDs de personaje en JSONs coincidan con carpetas ---
    dir_historias = RAIZ / 'historias'
    if dir_historias.is_dir():
        for historia_dir in sorted(dir_historias.iterdir()):
            if not historia_dir.is_dir():
                continue

            dir_personajes = historia_dir / 'imagenes' / 'personajes'
            carpetas_personajes = set()
            if dir_personajes.is_dir():
                carpetas_personajes = {d.name for d in dir_personajes.iterdir() if d.is_dir()}

            # Revisar escenas
            dir_escenas = historia_dir / 'datos' / 'escenas'
            if dir_escenas.is_dir():
                for f in sorted(dir_escenas.glob('*.json')):
                    rel = ruta_relativa(f)
                    if archivos_filtro and rel not in archivos_filtro:
                        continue
                    datos, _ = _cargar_json(f)
                    if not datos:
                        continue

                    # Verificar elementos de tipo personaje
                    elementos = datos.get('elementos', [])
                    if isinstance(elementos, list):
                        for elem in elementos:
                            if isinstance(elem, dict) and elem.get('tipo') == 'personaje':
                                id_personaje = elem.get('id', '')
                                if id_personaje and carpetas_personajes and id_personaje not in carpetas_personajes:
                                    hallazgos.append(Hallazgo('cross', 'ALTA', 'bug', rel, 0,
                                                              f'Personaje "{id_personaje}" no tiene carpeta en imagenes/personajes/',
                                                              f'Crear carpeta imagenes/personajes/{id_personaje}/ o corregir el ID'))

                                # Verificar que la imagen existe
                                imagen = elem.get('imagen', '')
                                if imagen and id_personaje:
                                    ruta_img = dir_personajes / id_personaje / imagen
                                    if not ruta_img.exists():
                                        hallazgos.append(Hallazgo('cross', 'ALTA', 'bug', rel, 0,
                                                                  f'Imagen "{imagen}" de personaje "{id_personaje}" no existe',
                                                                  f'Agregar {ruta_relativa(ruta_img)} o corregir nombre'))

                    # Verificar elementos de tipo objeto
                    if isinstance(elementos, list):
                        for elem in elementos:
                            if isinstance(elem, dict) and elem.get('tipo') == 'objeto':
                                imagen = elem.get('imagen', '')
                                if imagen:
                                    ruta_img = historia_dir / 'imagenes' / 'objetos' / imagen
                                    if not ruta_img.exists():
                                        hallazgos.append(Hallazgo('cross', 'ALTA', 'bug', rel, 0,
                                                                  f'Imagen de objeto "{imagen}" no existe',
                                                                  f'Agregar {ruta_relativa(ruta_img)} o corregir nombre'))

                    # Verificar fondo
                    fondo = datos.get('fondo', '')
                    if fondo:
                        ruta_fondo = historia_dir / 'imagenes' / 'fondos' / fondo
                        if not ruta_fondo.exists():
                            hallazgos.append(Hallazgo('cross', 'ALTA', 'bug', rel, 0,
                                                      f'Fondo "{fondo}" no existe',
                                                      f'Agregar {ruta_relativa(ruta_fondo)} o corregir nombre'))

    # --- 2. Verificar sincronización de duración de transición JS ↔ CSS ---
    lineas_sr = leer_archivo('js/SceneRenderer.js')
    duracion_js = None
    for i, linea in enumerate(lineas_sr, 1):
        match = re.search(r'#DURACION_TRANSICION\s*=\s*(\d+)', linea)
        if match:
            duracion_js = int(match.group(1))
            break

    lineas_vars = leer_archivo('css/variables.css')
    duracion_css = None
    for linea in lineas_vars:
        match = re.search(r'--transicion-escena\s*:\s*(\d+)ms', linea)
        if match:
            duracion_css = int(match.group(1))
            break

    if duracion_js and duracion_css and duracion_js != duracion_css:
        hallazgos.append(Hallazgo('cross', 'ALTA', 'inconsistencia',
                                  'js/SceneRenderer.js + css/variables.css', 0,
                                  f'Transición desincronizada: JS={duracion_js}ms, CSS={duracion_css}ms',
                                  f'Unificar a {duracion_css}ms o leer la variable CSS desde JS'))
    elif duracion_js and duracion_css and duracion_js == duracion_css:
        # Aún así es un valor duplicado
        hallazgos.append(Hallazgo('cross', 'BAJA', 'refactor',
                                  'js/SceneRenderer.js', 0,
                                  f'Duración de transición ({duracion_js}ms) duplicada entre JS y CSS',
                                  'Considerar leer el valor desde la custom property CSS para mantener una sola fuente'))

    # --- 3. Verificar que biblioteca/historias.json tenga todas las historias ---
    historias_json_path = RAIZ / 'biblioteca' / 'historias.json'
    if historias_json_path.exists():
        datos_bib, _ = _cargar_json(historias_json_path)
        if datos_bib:
            ids_registrados = set()
            historias_list = datos_bib.get('historias', [])
            for h in historias_list:
                if isinstance(h, dict) and 'id' in h:
                    ids_registrados.add(h['id'])

            # Verificar vs carpetas reales
            if dir_historias.is_dir():
                for d in sorted(dir_historias.iterdir()):
                    if d.is_dir() and (d / 'historia.json').exists():
                        if d.name not in ids_registrados:
                            hallazgos.append(Hallazgo('cross', 'ALTA', 'inconsistencia',
                                                      'biblioteca/historias.json', 0,
                                                      f'Historia "{d.name}" tiene historia.json pero no está en el catálogo',
                                                      'Agregar entrada en biblioteca/historias.json'))

    return hallazgos

# ─── Ejecución principal ────────────────────────────────────────────

CATEGORIAS = {
    'js': check_js,
    'css': check_css,
    'json': check_json,
    'pwa': check_pwa,
    'cross': check_cross,
}


def main():
    parser = argparse.ArgumentParser(
        description='Auditoría automática de código para La Biblioteca del Tío Pier.\n'
                    'Detecta bugs, hardcodeos, magic numbers, inconsistencias y más.\n'
                    'Es de SOLO LECTURA — no modifica archivos.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Categorías disponibles:
  js     Módulos JavaScript (magic numbers, hardcodeos, naming, etc.)
  css    Estilos CSS (z-index, !important, breakpoints, colores)
  json   JSONs de escenas y desafíos (schema, voseo, targets)
  pwa    Service Worker y manifest (caché, huérfanos, íconos)
  cross  Checks transversales (rutas de imágenes, transiciones, catálogo)

Ejemplos:
  python auditar.py                            # Todo
  python auditar.py --categoria js             # Solo JavaScript
  python auditar.py --archivo js/GameEngine.js # Archivo específico
  python auditar.py --resumen                  # Solo conteo
""")
    parser.add_argument('--categoria', '-c', choices=list(CATEGORIAS.keys()),
                        help='Auditar solo una categoría específica')
    parser.add_argument('--archivo', '-a', nargs='+',
                        help='Auditar archivo(s) específico(s) (rutas relativas)')
    parser.add_argument('--resumen', '-r', action='store_true',
                        help='Mostrar solo el resumen de conteos')
    parser.add_argument('--json', '-j', action='store_true',
                        help='Salida en formato JSON para consumo programático')
    args = parser.parse_args()

    # Normalizar archivos
    archivos_filtro = None
    if args.archivo:
        archivos_filtro = set()
        for a in args.archivo:
            # Normalizar separadores
            normalizado = a.replace('\\', '/')
            archivos_filtro.add(normalizado)

    # Ejecutar checks
    todos_hallazgos = []

    if args.categoria:
        fn = CATEGORIAS[args.categoria]
        todos_hallazgos.extend(fn(archivos_filtro))
    else:
        for nombre, fn in CATEGORIAS.items():
            todos_hallazgos.extend(fn(archivos_filtro))

    # --- Salida ---
    if args.json:
        resultado = {
            'raiz': str(RAIZ),
            'total': len(todos_hallazgos),
            'hallazgos': [h.to_dict() for h in todos_hallazgos],
        }
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
        return

    # Resumen
    conteo_cat = defaultdict(int)
    conteo_sev = defaultdict(int)
    conteo_tipo = defaultdict(int)
    for h in todos_hallazgos:
        conteo_cat[h.categoria] += 1
        conteo_sev[h.severidad] += 1
        conteo_tipo[h.tipo] += 1

    print(f"\n{'='*70}")
    print(f"  AUDITORÍA AUTOMÁTICA — La Biblioteca del Tío Pier")
    print(f"  Raíz: {RAIZ}")
    print(f"  Total de hallazgos: {len(todos_hallazgos)}")
    print(f"{'='*70}\n")

    # Conteos
    print("  Por categoría:", end='')
    for cat in ['js', 'css', 'json', 'pwa', 'cross']:
        if conteo_cat[cat]:
            print(f"  {cat}={conteo_cat[cat]}", end='')
    print()

    print("  Por severidad:", end='')
    for sev in ['CRITICA', 'ALTA', 'MEDIA', 'BAJA']:
        if conteo_sev[sev]:
            print(f"  {sev}={conteo_sev[sev]}", end='')
    print()

    print("  Por tipo:     ", end='')
    for tipo in ['bug', 'hardcodeo', 'magic_number', 'inconsistencia', 'refactor', 'dead_code', 'pwa']:
        if conteo_tipo[tipo]:
            print(f"  {tipo}={conteo_tipo[tipo]}", end='')
    print('\n')

    if args.resumen:
        return

    # Detalle
    cat_actual = ''
    for h in sorted(todos_hallazgos, key=lambda x: (x.categoria, x.severidad, x.archivo)):
        if h.categoria != cat_actual:
            cat_actual = h.categoria
            print(f"  ── {cat_actual.upper()} {'─'*55}")

        ubicacion = h.archivo
        if h.linea:
            ubicacion += f':{h.linea}'

        sev_icons = {'CRITICA': '🔴', 'ALTA': '🟠', 'MEDIA': '🟡', 'BAJA': '🔵'}
        icono = sev_icons.get(h.severidad, '⚪')

        print(f"  {icono} [{h.severidad}] [{h.tipo}] {ubicacion}")
        print(f"     {h.descripcion}")
        print(f"     → {h.sugerencia}")
        print()


if __name__ == '__main__':
    main()
