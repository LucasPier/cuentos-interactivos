/**
 * ChallengeManager — Despacho de desafíos por subtipo.
 * 
 * Usa el Strategy Pattern (Registry) para que agregar un nuevo
 * subtipo sea crear un handler y registrarlo, sin tocar el motor.
 */
export class ChallengeManager {

    /** @type {Map<string, object>} Registry de handlers por subtipo */
    #handlers = new Map();

    /** Delay en ms entre el feedback visual del desafío y su cierre */
    #DELAY_POST_DESAFIO = 800;

    /** @type {HTMLElement} */
    #panelDesafioEl;

    /** @type {import('./ImagePreloader.js').ImagePreloader} */
    #preloader;
    /** @type {import('./EffectsRenderer.js').EffectsRenderer} */
    #effectsRenderer;

    /**
     * @param {import('./ImagePreloader.js').ImagePreloader} preloader
     * @param {import('./EffectsRenderer.js').EffectsRenderer} effectsRenderer
     */
    constructor(preloader, effectsRenderer) {
        this.#panelDesafioEl = document.getElementById('panel-desafio');
        this.#preloader = preloader;
        this.#effectsRenderer = effectsRenderer;
    }

    /**
     * Registra un handler para un subtipo de desafío.
     * @param {string} subtipo — Ej: "pregunta_real", "minijuego_observacion"
     * @param {object} handler — Objeto con método ejecutar(datos, panelEl, preloader)
     */
    registrar(subtipo, handler) {
        this.#handlers.set(subtipo, handler);
    }

    /**
     * Ejecuta un desafío: muestra el panel, despacha al handler correcto.
     * @param {object} datosDesafio — Datos JSON del desafío
     * @param {import('./StateManager.js').StateManager} stateManager
     * @returns {Promise<{exito: boolean, target: string, recompensa: string|null}>}
     */
    async ejecutar(datosDesafio, stateManager) {
        const handler = this.#handlers.get(datosDesafio.subtipo);
        if (!handler) {
            throw new Error(`[ChallengeManager] Subtipo desconocido: "${datosDesafio.subtipo}"`);
        }

        // Mostrar panel de desafío
        this.#panelDesafioEl.innerHTML = '';

        // Renderizar efectos globales si los hay
        if (datosDesafio.efectos && datosDesafio.efectos.length > 0) {
            this.#effectsRenderer.renderizar(datosDesafio.efectos, this.#panelDesafioEl);
        }

        this.#panelDesafioEl.classList.add('activo');

        try {
            // El handler crea .desafio-contenido sincrónicamente dentro del executor del Promise.
            // Obtenemos la promesa sin awaitarla, insertamos los elementos (el DOM ya existe),
            // y recién después awaitamos el resultado del desafío.
            const promesaDesafio = handler.ejecutar(datosDesafio, this.#panelDesafioEl, this.#preloader);

            // Renderizar elementos visuales decorativos si los hay (personajes, objetos)
            // En este punto .desafio-contenido ya está en el DOM (creado síncronamente por el handler)
            if (datosDesafio.elementos && datosDesafio.elementos.length > 0) {
                this.#renderizarElementos(datosDesafio.elementos);
            }

            const exito = await promesaDesafio;

            if (exito) {
                // Otorgar recompensa si la hay
                const recompensa = datosDesafio.resultado_exito?.recompensa;
                if (recompensa) {
                    stateManager.otorgarRecompensa(recompensa);
                }

                return {
                    exito: true,
                    target: datosDesafio.resultado_exito.target,
                    recompensa: datosDesafio.resultado_exito.recompensa || null
                };
            } else {
                return {
                    exito: false,
                    target: datosDesafio.resultado_fallo.target,
                    recompensa: null
                };
            }
        } finally {
            // Ocultar panel después de un breve delay para el feedback visual
            await this.#delay(this.#DELAY_POST_DESAFIO);
            this.#panelDesafioEl.classList.remove('activo');
            this.#panelDesafioEl.innerHTML = '';
        }
    }

    /**
     * Verifica si un subtipo tiene handler registrado.
     * @param {string} subtipo 
     * @returns {boolean}
     */
    tieneHandler(subtipo) {
        return this.#handlers.has(subtipo);
    }

    /**
     * Cierra el panel de desafío de forma inmediata.
     * Uso: navegación imperativa desde DevPanel mientras hay un desafío activo.
     */
    salir() {
        this.#panelDesafioEl.classList.remove('activo');
        this.#panelDesafioEl.innerHTML = '';
    }

    /**
     * Renderiza elementos visuales decorativos (personajes, objetos) en el panel de desafío.
     * Replica la lógica de SceneRenderer.#renderizarElementos().
     * Los elementos se renderizan como pointer-events:none, sin interferir con la mecánica.
     * @param {Array} elementos — Array de elementos del JSON del desafío
     */
    #renderizarElementos(elementos) {
        const contenedor = document.createElement('div');
        contenedor.className = 'escena-elementos';

        for (const elem of elementos) {
            const div = document.createElement('div');
            div.className = 'elemento-visual';
            if (elem.id) div.dataset.id = elem.id;

            const estilo = elem.estilo || {};
            div.style.setProperty('--x', estilo.x ?? 50);
            div.style.setProperty('--y', estilo.y ?? 100);
            div.style.setProperty('--ancho', estilo.ancho ?? 30);
            div.style.setProperty('--z-index', estilo.z_index ?? 10);

            if (elem.efecto) {
                div.classList.add(`efecto-${elem.efecto}`);
            }

            const img = document.createElement('img');
            img.src = this.#preloader.resolverRuta(elem.imagen, elem.tipo, elem.id ?? null);
            img.alt = elem.id || 'Elemento';
            img.loading = 'eager';

            if (elem.animacion) {
                img.classList.add(`anim-${elem.animacion}`);
            }

            div.appendChild(img);
            contenedor.appendChild(div);
        }

        const contenidoEl = this.#panelDesafioEl.querySelector('.desafio-contenido');
        if (contenidoEl) {
            const fondoEl = contenidoEl.querySelector('.desafio-fondo');
            contenidoEl.insertBefore(contenedor, fondoEl);
        } else {
            // Fallback defensivo: si el handler no creó un .desafio-contenido
            this.#panelDesafioEl.appendChild(contenedor);
        }
    }

    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
