import { crearFondo } from './FondoHelper.js';

/**
 * SceneRenderer — Renderizado visual de escenas.
 * 
 * Compone: fondo + elementos posicionados + texto narrativo + opciones.
 * Maneja transiciones entre escenas y filtrado de opciones por condición.
 */
export class SceneRenderer {

    /** @type {HTMLElement} */
    #escenaEl;
    /** @type {HTMLElement} */
    #panelTextoEl;
    /** @type {HTMLElement} */
    #panelOpcionesEl;
    /** @type {HTMLElement} */
    #textoNarrativoEl;
    /** @type {import('./ImagePreloader.js').ImagePreloader} */
    #preloader;
    /** @type {import('./EffectsRenderer.js').EffectsRenderer} */
    #effectsRenderer;
    /** @type {HTMLVideoElement|null} Video de fondo activo */
    #videoActual = null;

    /** Duración de la transición en ms (sincronizado con CSS) */
    #DURACION_TRANSICION = 400;

    /**
     * @param {import('./ImagePreloader.js').ImagePreloader} preloader
     * @param {import('./EffectsRenderer.js').EffectsRenderer} effectsRenderer
     */
    constructor(preloader, effectsRenderer) {
        this.#escenaEl = document.getElementById('escena');
        this.#panelTextoEl = document.getElementById('panel-texto');
        this.#panelOpcionesEl = document.getElementById('panel-opciones');
        this.#textoNarrativoEl = this.#panelTextoEl.querySelector('.texto-narrativo');
        this.#preloader = preloader;
        this.#effectsRenderer = effectsRenderer;
    }

    /**
     * Renderiza una escena completa con transición.
     * @param {object} datos — Datos JSON de la escena
     * @param {import('./StateManager.js').StateManager} stateManager
     * @param {function} onNavegar — Callback (accion, target, tipoTarget) al elegir opción
     */
    async renderizar(datos, stateManager, onNavegar) {
        console.log(`[SceneRenderer] Renderizando escena: ${datos.id}`);
        // Fade-out de la escena anterior (solo si ya tiene contenido)
        const tieneContenidoPrevio = this.#escenaEl.children.length > 0;
        if (tieneContenidoPrevio) {
            this.#escenaEl.style.opacity = '0';
            await this.#delay(this.#DURACION_TRANSICION);
        } else {
            // Primera carga: arrancar invisible para fade-in
            this.#escenaEl.style.opacity = '0';
        }

        // Pausar video de fondo anterior (si había)
        if (this.#videoActual) {
            console.log("[SceneRenderer] Deteniendo video de fondo anterior");
            this.#videoActual.pause();
            this.#videoActual = null;
        }

        // Limpiar contenido anterior
        this.#escenaEl.innerHTML = '';
        this.#panelOpcionesEl.innerHTML = '';

        // Clase especial para final secreto
        this.#escenaEl.classList.toggle('final-secreto', datos.id === 'FINAL_SECRETO');

        // ── Capa 0: Fondo (imagen + video opcional) ──
        this.#renderizarFondo(datos.fondo, datos.video);

        // ── Capas N: Elementos + Efectos (mismo contenedor para z-index compartido) ──
        this.#renderizarElementos(datos.elementos, datos.efectos);

        // ── Texto narrativo ──
        this.#renderizarTexto(datos.texto);

        // ── Opciones ──
        this.#renderizarOpciones(datos.opciones, stateManager, onNavegar);

        // ── Ajustar padding-bottom del texto a la altura real de las opciones ──
        this.#ajustarPaddingTexto();

        // Pequeño delay para que el browser pinte el DOM antes del fade-in
        await this.#delay(50);

        // Fade-in
        this.#escenaEl.style.opacity = '1';
        await this.#delay(this.#DURACION_TRANSICION);
    }

    /**
     * Renderiza el fondo de la escena (imagen + video opcional).
     * @param {string} nombreFondo — Nombre del archivo de imagen de fondo
     * @param {string} [nombreVideo] — Nombre del archivo de video de fondo
     */
    #renderizarFondo(nombreFondo, nombreVideo) {
        if (!nombreFondo && !nombreVideo) return;

        const { contenedor, video } = crearFondo(
            this.#preloader, nombreFondo, nombreVideo, 'escena-fondo'
        );

        this.#videoActual = video;
        this.#escenaEl.appendChild(contenedor);
    }

    /**
     * Renderiza los elementos visuales (personajes, objetos) y los efectos
     * dentro del mismo contenedor para que compartan stacking context.
     * @param {Array} elementos — Array de elementos del JSON
     * @param {Array} [efectos] — Array de efectos del JSON
     */
    #renderizarElementos(elementos, efectos) {
        const contenedor = document.createElement('div');
        contenedor.className = 'escena-elementos';

        // Renderizar efectos dentro del contenedor de elementos (sin wrapper)
        if (efectos && efectos.length > 0) {
            this.#effectsRenderer.renderizar(efectos, contenedor, { envolver: false });
        }

        if (!elementos || !elementos.length) {
            this.#escenaEl.appendChild(contenedor);
            return;
        }

        for (const elem of elementos) {
            const div = document.createElement('div');
            div.className = 'elemento-visual';
            div.dataset.id = elem.id;

            // Custom properties para posicionamiento CSS
            const estilo = elem.estilo || {};
            div.style.setProperty('--x', estilo.x ?? 50);
            div.style.setProperty('--y', estilo.y ?? 100);
            div.style.setProperty('--ancho', estilo.ancho ?? 30);
            div.style.setProperty('--z-index', estilo.z_index ?? 10);

            // Efecto de entrada (aparecer_suave, rebote, etc)
            if (elem.efecto) {
                div.classList.add(`efecto-${elem.efecto}`);
            }

            const img = document.createElement('img');
            img.src = this.#preloader.resolverRuta(elem.imagen, elem.tipo, elem.id ?? null);
            img.alt = elem.id || 'Elemento';
            img.loading = 'eager';

            // Animación continua (flotacion, respiracion, aura, flotacion-aura, etc)
            if (elem.animacion) {
                img.classList.add(`anim-${elem.animacion}`);
            }

            div.appendChild(img);
            contenedor.appendChild(div);
        }

        this.#escenaEl.appendChild(contenedor);
    }

    /**
     * Renderiza el texto narrativo.
     * @param {string} texto 
     */
    #renderizarTexto(texto) {
        this.#textoNarrativoEl.textContent = texto || '';
        // Asegurar que el panel sea visible al cambiar de escena
        this.#panelTextoEl.classList.remove('oculto');
    }

    /**
     * Renderiza los botones de opciones.
     * Filtra por condición evaluada contra el state.
     * @param {Array} opciones — Array de opciones del JSON
     * @param {import('./StateManager.js').StateManager} stateManager
     * @param {function} onNavegar — Callback al elegir
     */
    #renderizarOpciones(opciones, stateManager, onNavegar) {
        if (!opciones || opciones.length === 0) return;

        for (const opcion of opciones) {
            // Evaluar condición: si no se cumple, no mostrar
            if (!stateManager.evaluarCondicion(opcion.condicion)) {
                continue;
            }

            const btn = document.createElement('button');
            btn.className = 'btn-opcion';
            btn.type = 'button';
            btn.textContent = opcion.texto;

            btn.addEventListener('click', () => {
                // Deshabilitar todos los botones para evitar doble-click
                this.#deshabilitarOpciones();
                onNavegar(opcion.accion, opcion.target, opcion.tipo_target);
            });

            this.#panelOpcionesEl.appendChild(btn);
        }
    }

    /**
     * Deshabilita todos los botones de opción.
     */
    #deshabilitarOpciones() {
        const botones = this.#panelOpcionesEl.querySelectorAll('.btn-opcion');
        for (const btn of botones) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        }
    }

    /**
     * Limpia la escena y los paneles.
     */
    limpiar() {
        this.#escenaEl.innerHTML = '';
        this.#escenaEl.className = '';
        this.#escenaEl.style.opacity = '1';
        this.#panelOpcionesEl.innerHTML = '';
        this.#textoNarrativoEl.textContent = '';
    }

    /**
     * Ajusta el padding-bottom del panel de texto para que no se superponga
     * con los botones de opciones, sin importar cuántos haya.
     */
    #ajustarPaddingTexto() {
        const alturaOpciones = this.#panelOpcionesEl.offsetHeight;
        const margen = 8;
        this.#panelTextoEl.style.paddingBottom = `${alturaOpciones + margen}px`;
    }

    // ─── Utilidades ─────────────────────────────────

    /**
     * Delay como promesa.
     * @param {number} ms
     * @returns {Promise<void>}
     */
    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
