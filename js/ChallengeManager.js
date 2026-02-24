/**
 * ChallengeManager — Despacho de desafíos por subtipo.
 * 
 * Usa el Strategy Pattern (Registry) para que agregar un nuevo
 * subtipo sea crear un handler y registrarlo, sin tocar el motor.
 */
export class ChallengeManager {

    /** @type {Map<string, object>} Registry de handlers por subtipo */
    #handlers = new Map();

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
            // El handler renderiza dentro del panel y resuelve con el resultado
            const exito = await handler.ejecutar(datosDesafio, this.#panelDesafioEl, this.#preloader);

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
            await this.#delay(800);
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

    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
