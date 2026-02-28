# Checks CSS — Criterios de Auditoría Semántica

Criterios que el agente aplica leyendo los estilos. El script `auditar.py`
cubre detección mecánica (z-index literales, `!important`, breakpoints).

---

## 1. Sistema de Z-index

**Regla:** Todo z-index debe usar variables definidas en `variables.css`.

| Variable | Valor | Uso esperado |
|----------|-------|--------------|
| `--z-fondo` | 0 | `#escena`, fondos base |
| `--z-efectos` | 5 | Partículas, efectos visuales |
| `--z-elementos` | 10 | Personajes, objetos interactivos |
| `--z-panel-texto` | 100 | Panel narrativo |
| `--z-panel-opciones` | 200 | Botones de decisión |
| `--z-panel-desafio` | 300 | Overlay de minijuegos |
| `--z-pantalla-inicio` | 1000 | Portada de historia |
| `--z-pantalla-biblioteca` | 1050 | Selección de historias |
| `--z-ui-controles` | 1100 | Botones permanentes |
| `--z-indicador-carga` | 1200 | Logo animado de carga |

**Qué buscar:**
- Valores numéricos literales en `z-index` que no usen `var(--z-*)`
- Valores fuera de la tabla (ej: `z-index: 2000`) no documentados
- Capas que se superponen incorrectamente por valor inadecuado
- Nuevos componentes que necesiten su propio nivel pero usan uno existente

**Excepción aceptable:** `z-index: 1` / `z-index: -1` dentro de `@keyframes` o
para posicionamiento relativo interno de un componente (partículas, pseudo-elementos).

---

## 2. Uso de !important

**Regla:** Prohibido salvo justificación documentada con comentario.

**Qué buscar:**
- Cualquier `!important` sin comentario que explique por qué es necesario
- Problemas de especificidad que se resuelven mejor reestructurando selectores
- `!important` en propiedades que podrían resolverse con un selector más específico

---

## 3. Custom Properties (Design Tokens)

**Regla:** Usar los tokens de `variables.css` para colores, tipografía, espaciado y transiciones.

**Qué buscar:**
- Colores hex/rgb literales que pertenezcan a la paleta pero no usen la variable
- Tamaños de fuente `px`/`rem` que no usen los tokens `--tamano-*`
- Margins/paddings que no usen `--espaciado-*` cuando el valor coincide
- Transiciones con duración literal que debería ser `var(--transicion-*)`

**Excepción:** Valores muy específicos de un componente que no tienen token global
(ej: `border-radius: 50%` para botones circulares).

---

## 4. Responsive Design

**Regla:** El proyecto usa un único breakpoint: `@media (max-width: 900px), (max-height: 600px)`.

**Qué buscar:**
- Media queries con valores diferentes al estándar
- Componentes nuevos que no tengan adaptación responsive
- `clamp()` usado correctamente para tipografía (ya definido en tokens)
- Reglas responsive que anulan tokens en vez de ajustarlos

---

## 5. Glassmorphism

**Regla:** Siempre usar ambas propiedades para compatibilidad:
```css
backdrop-filter: blur(Xpx);
-webkit-backdrop-filter: blur(Xpx);
```

**Qué buscar:**
- `backdrop-filter` sin el prefijo `-webkit-`
- Valores de blur inconsistentes entre componentes similares
- Glassmorphism sin `background` semi-transparente (no funciona visualmente)

---

## 6. Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| IDs | kebab-case | `#pantalla-biblioteca`, `#panel-texto` |
| Clases | kebab-case con prefijo | `.biblioteca-tarjeta`, `.inicio-fondo` |
| Custom props | kebab-case con `--` | `--color-esmeralda`, `--z-panel-texto` |
| Keyframes | kebab-case descriptivo | `float`, `bounce`, `fadeIn` |

**Qué buscar:**
- Clases sin prefijo de componente (ej: `.tarjeta` suelto sin `.biblioteca-`)
- IDs o clases en camelCase o UPPER_CASE
- Custom properties que no sigan el patrón `--tipo-nombre`
- Duplicación de nombres de keyframe entre archivos

---

## 7. Selectores y Especificidad

**Qué buscar:**
- Selectores excesivamente específicos (más de 3 niveles de anidamiento)
- Selectores de tipo que deberían ser de clase (ej: `div > p` suelto)
- Selectores duplicados entre archivos CSS diferentes
- Reglas sin efecto (sobreescritas más abajo sin propósito)

---

## 8. Consistencia Visual

**Qué buscar:**
- Bordes redondeados con valores inconsistentes (mezcla de `12px`, `16px`, `50%`, etc.)
- Sombras con formatos diferentes para el mismo tipo de componente
- Transiciones con duraciones mezcladas sin usar tokens
- Opacidades hardcodeadas que deberían ser consistentes

---

## 9. Safe Areas y Accesibilidad

**Qué buscar:**
- Contenido interactivo sin `safe-area-inset-*` en dispositivos con notch
- Tamaños de target táctil menores a 44x44px (regla de accesibilidad)
- Contraste de texto insuficiente sobre fondos semi-transparentes
- `:hover` sin equivalente `:focus-visible` para navegación por teclado
