# Sistema de Capas y Estilos

## Sistema de Capas HTML

El contenedor `#juego` tiene las siguientes capas visuales, ordenadas por z-index:

| Z-index | Capa | Elemento | Descripción |
|---------|------|----------|-------------|
| 0 | Fondo | `#escena` | Composición visual (fondo + personajes) |
| 5 | Efectos | `.escena-efectos` | Contenedores dinámicos generados por EffectsRenderer |
| 100 | Texto | `#panel-texto` | Texto narrativo con glassmorphism |
| 200 | Opciones | `#panel-opciones` | Botones de decisión |
| 300 | Desafío | `#panel-desafio` | Overlay de minijuegos (cuando `.activo`) |
| 1000 | Inicio | `#pantalla-inicio` | Pantalla de inicio de historia (dinámica) |
| 1050 | Biblioteca | `#pantalla-biblioteca` | Selección de historias |
| 1100 | UI | `.ui-controles` | Botones permanentes (toggle texto, mute) |
| 1200 | Carga | `#indicador-carga` | Logo de la historia con animación fade-loop |

---

## Sistema de Estilos CSS

### Archivos y responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `reset.css` | `box-sizing: border-box`, prevención de zoom táctil, `body` fullscreen |
| `variables.css` | Design tokens en `:root` (colores, tipografía, espaciado, z-index, botones) |
| `layout.css` | Contenedor `#juego` 16:9 centrado con barras negras, logo de carga dinámico, controles UI |
| `biblioteca.css` | Pantalla de selección: fondo, overlay, tarjetas con hover/glow, título dorado, botón y versión PWA |
| `escena.css` | Fondo `object-fit: cover`, elementos con custom properties, panel texto glassmorphism, botones con gradientes esmeralda/dorado |
| `desafios.css` | Layout de minijuegos, área interactiva, feedback (éxito/fallo) |
| `animaciones.css` | `@keyframes` para float, bounce, shake, pulse, fadeIn/fadeOut, partículas del final secreto |
| `inicio.css` | Estilos para pantalla de inicio dinámica: overlay, logo, botón "Jugar" con shimmer, luciérnagas |
| `ui.css` | Estados de los botones toggle (texto visible/oculto) |

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-esmeralda` | `#065f46` | Fondo de botones, acentos principales |
| `--color-esmeralda-claro` | `#10b981` | Hover de botones, spinner |
| `--color-dorado` | `#d4a017` | Bordes de botones, brillo del título |
| `--color-dorado-claro` | `#fbbf24` | Efecto shimmer |
| `--color-violeta` | `#7c3aed` | Acentos mágicos |
| `--color-cyan-bio` | `#22d3ee` | Bioluminiscencia |
| `--color-rosa-magico` | `#f472b6` | Partículas del final secreto |

### Tipografía

- **Fuente**: Nunito (de Google Fonts), con weights 400–900.
- **Tamaños fluidos**: Todos usan `clamp()` para escalado responsive.
  - Base: `clamp(1rem, 2.8vw, 1.35rem)`
  - Título: `clamp(1.8rem, 5vw, 3rem)`
  - Botones: `clamp(1rem, 2.5vw, 1.2rem)`

### Layout 16:9

El contenedor `#juego` usa `max-width: calc(100vh * 16 / 9)` y `max-height: calc(100vw * 9 / 16)` con `margin: auto` para mantener proporción 16:9 centrada, con barras negras automáticas en pantallas que no coincidan.

### Responsive (Dispositivos Móviles)

El diseño incluye media queries (`max-width: 900px`, `max-height: 600px`) distribuidas en los archivos principales (`inicio.css`, `biblioteca.css`, `escena.css`, `desafios.css`, `layout.css`). 
Esto garantiza la jugabilidad fluida en dispositivos móviles (ej. en orientación horizontal a 667x375), reduciendo escalas tipográficas (`clamp`), paddings en paneles y achicando los botones permanentes de la UI para maximizar el área visible de juego.
Además, la altura límite en el `#panel-texto` utiliza `max-height: calc(100% - 70px)`, permitiendo extenderse adaptativamente y generar un scroll nativo sin solaparse con la interfaz superior en textos muy largos.

---

## Sistema de Desafíos

El `ChallengeManager` usa **Strategy Pattern con Registry**. Cada subtipo de desafío tiene un handler con un único método: `ejecutar(datos, panelEl, preloader) → Promise<boolean>`.

### Subtipos implementados

#### `pregunta_real` → `PreguntaRealHandler`
- **Concepto**: Pregunta aleatoria seleccionada de una lista que la nena debe responder (generalmente preguntándole a un adulto o resolviendo un acertijo).
- **Renderiza**: instrucción + una de las preguntas aleatorias + botones de respuesta múltiple.
- **Éxito**: La opción con `correcta: true`.
- **Feedback**: Mensaje "¡Correcto! 🎉" o "¡Incorrecto!" con delay de 1500ms.

#### `minijuego_observacion` → `ObservacionHandler`
- **Concepto**: Buscar un elemento oculto en la escena.
- **Renderiza**: fondo + elementos interactivos posicionados con custom properties `--x`, `--y`, `--ancho`.
- **Éxito**: Click en el elemento con `correcto: true`, o en un elemento al azar si el json tiene `"correcto_aleatorio": true`.
- **Feedback**: Pulse en acierto, shake + opacity reducida en error. Puede cambiar a `imagen_final` tras acierto.

#### `minijuego_clicks` → `ClicksHandler`
- **Concepto**: Clickear un objeto N veces.
- **Renderiza**: fondo + objeto interactivo + mensajes de progreso.
- **Éxito**: Alcanzar `objetivo_clicks` clics.
- **Progreso**: Muestra `mensajes_progreso[i]` del JSON en cada clic.
- **Feedback**: Pulse en cada clic, "¡Completado! 🎉" al finalizar.

### Todos los handlers:
- Reciben el `panelEl` donde deben renderizar (no crean paneles propios).
- Devuelven un `Promise<boolean>` (`true` = éxito, `false` = fallo).
- Deshabilitan la interacción inmediatamente después del resultado para evitar doble-input.

---

## Transiciones Visuales

### Entre escenas

Las transiciones se controlan programáticamente con `opacity` + `setTimeout`, sincronizadas con la `transition` CSS en `#escena`:

```css
#escena {
    transition: opacity 400ms ease-in-out;
}
```

Flujo:
1. Si hay contenido previo: `opacity = 0` → esperar 400ms (fade-out)
2. Si es primera carga: `opacity = 0` (arrancar invisible)
3. Actualizar el DOM (fondo, elementos, texto, opciones)
4. Esperar 50ms (para que el browser pinte)
5. `opacity = 1` → esperar 400ms (fade-in)

**Nota técnica**: Se descartó el uso de `animationend` events porque causaba problemas de event bubbling — las animaciones de los elementos hijos (efecto-float, efecto-bounce) disparaban `animationend` en el contenedor padre antes de que la transición del contenedor terminara.

### Efectos y Animaciones de elementos

Los elementos visuales pueden tener campos en el JSON para controlar su comportamiento de animación:

#### 1. Efecto de entrada (`efecto`)
Agrega una clase CSS para controlar cómo aparece el elemento al entrar en la escena.
| Efecto | Clase CSS | Animación |
|--------|-----------|-----------|
| `aparecer_suave` | `.efecto-aparecer_suave` | Fade-in con scale de 0.9 a 1 |
| `flotar` | `.efecto-flotar` | Movimiento vertical suave (loop) |
| `rebote` | `.efecto-rebote` | Bounce sutil (loop) |

#### 2. Animación continua (`animacion`)
Aplica una rutina de movimiento o de brillo constante a la etiqueta `<img>` interna para no interferir con las interactividades (pulse/shake) o transiciones del contenedor `<div>`.
| Variable | Descripción |
|----------|-------------|
| `flotacion` | Desplazamiento sutil sobre el eje Y |
| `flotacion-3d` | Flotación con balanceo simulando perspectiva 3D |
| `respiracion` | Zoom in y out diminuto en bucle |
| `movimiento-sutil` | Animación extremadamente lenta (escala y translación mínimas) para separar del fondo |
| `movimiento-sutil-2` | Igual a movimiento-sutil pero desfasada a la mitad del tiempo |
| `aura` | Filtro drop-shadow muy suave blanco |
| `resplandor` | Filtro drop-shadow dorado brillante alternante |
| `flotacion-aura` | Combinación de Flotación y Aura |
| `respiracion-aura` | Combinación de Respiración y Aura |
| `movimiento-sutil-aura` | Combinación de Movimiento Sutil y Aura |
| `movimiento-sutil-2-aura` | Combinación de Movimiento Sutil 2 y Aura |
| `flotacion-3d-aura` | Combinación de Flotación 3D y Aura |
| `flotacion-resplandor` | Combinación de Flotación y Resplandor |
| `respiracion-resplandor`| Combinación de Respiración y Resplandor |
| `movimiento-sutil-resplandor`| Combinación de Movimiento Sutil y Resplandor |
| `movimiento-sutil-2-resplandor`| Combinación de Movimiento Sutil 2 y Resplandor |
| `flotacion-3d-resplandor` | Combinación de Flotación 3D y Resplandor |

### Feedback de desafíos

| Efecto | Uso | Animación |
|--------|-----|-----------|
| `.efecto-shake` | Error en minijuego | Sacudida horizontal rápida |
| `.efecto-pulse` | Acierto en minijuego | Escala 1 → 1.2 → 1 |
| `.desafio-feedback.exito` | Respuesta correcta | Slide-in + fondo verde |
| `.desafio-feedback.fallo` | Respuesta incorrecta | Slide-in + fondo rojo |

---

## Controles de Interfaz

### Indicador de carga (`#indicador-carga`)

- Fondo semi-transparente oscuro con el **logo de la historia activa** y animación `fade-loop` (opacity + scale).
- El logo se establece dinámicamente con `UIManager.setLogoCarga(src)` al cargar una historia.
- Clase `.oculto` → `display: none` (corte limpio, sin transición).
- Se muestra durante la carga de JSONs e imágenes.
- Si `src` está vacío, el `<img>` se oculta vía CSS `[src=""]`.

### Toggle de texto (`#btn-toggle-texto`)

- Posición: esquina superior derecha.
- Emoji: 📖 (visible) / 👁️ (oculto).
- Alterna clase `.oculto` en `#panel-texto`.
- Accesibilidad: `aria-pressed` y `aria-label`.

### Botón mute (`#btn-mute`)

- Posición: esquina superior izquierda.
- Emoji: 🔊 (sin mute) / 🔇 (muteado).
- Stub visual: alterna el emoji y `aria-pressed`, pero no hay audio implementado.

### Ambos son botones circulares (48px) con glassmorphism:

```css
.btn-ui {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(10, 15, 25, 0.85);
    backdrop-filter: blur(8px);
}
```
