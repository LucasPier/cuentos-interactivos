/**
 * BibliotecaManager — Pantalla de selección de historias.
 * 
 * "La Biblioteca del Tío Pier": carga el catálogo de historias,
 * renderiza tarjetas interactivas, y delega al GameEngine
 * al seleccionar una historia.
 */
export class BibliotecaManager {

    /** @type {import('./GameEngine.js').GameEngine} */
    #engine;
    /** @type {import('./StateManager.js').StateManager} */
    #stateManager;
    /** @type {import('./AudioManager.js').AudioManager} */
    #audioManager;
    /** @type {import('./UIManager.js').UIManager} */
    #uiManager;

    /** @type {HTMLElement} */
    #pantallaEl;
    /** @type {HTMLElement} */
    #contenedorHistorias;

    /** Cache de configs cargadas: Map<id, {config, ruta}> */
    #historiasCache = new Map();

    /** @type {HTMLElement} */
    #btnInstalarPWA;
    /** @type {Event|null} */
    #eventoInstalacion = null;

    /**
     * @param {object} deps — Dependencias inyectadas
     * @param {import('./GameEngine.js').GameEngine} deps.engine
     * @param {import('./StateManager.js').StateManager} deps.stateManager
     * @param {import('./AudioManager.js').AudioManager} deps.audioManager
     * @param {import('./UIManager.js').UIManager} deps.uiManager
     */
    constructor({ engine, stateManager, audioManager, uiManager }) {
        this.#engine = engine;
        this.#stateManager = stateManager;
        this.#audioManager = audioManager;
        this.#uiManager = uiManager;
        this.#pantallaEl = document.getElementById('pantalla-biblioteca');
        this.#contenedorHistorias = document.getElementById('biblioteca-historias');
        this.#btnInstalarPWA = document.getElementById('btn-instalar-pwa');
    }

    /**
     * Inicializa la biblioteca: carga el catálogo y renderiza las tarjetas.
     */
    async inicializar() {
        try {
            // Ocultar todo lo demás
            this.#uiManager.ocultarControles();
            document.getElementById('pantalla-inicio').classList.add('oculto');
            document.getElementById('panel-texto').style.display = 'none';
            document.getElementById('panel-opciones').style.display = 'none';

            // Mostrar biblioteca
            this.#pantallaEl.classList.remove('oculto');

            // Cargar catálogo
            const respuesta = await fetch('biblioteca/historias.json');
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
            const catalogo = await respuesta.json();

            // Cargar cada historia.json
            const promesas = catalogo.historias.map(async (entrada) => {
                try {
                    const resp = await fetch(`${entrada.ruta}historia.json`);
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const config = await resp.json();
                    this.#historiasCache.set(config.id, { config, ruta: entrada.ruta });
                    return { config, ruta: entrada.ruta };
                } catch (error) {
                    console.error(`[BibliotecaManager] Error cargando historia "${entrada.id}":`, error);
                    return null;
                }
            });

            const historias = (await Promise.all(promesas)).filter(h => h !== null);

            // Renderizar tarjetas
            this.#renderizarTarjetas(historias);

            console.log(`[BibliotecaManager] Biblioteca inicializada con ${historias.length} historia(s)`);

        } catch (error) {
            console.error('[BibliotecaManager] Error al inicializar:', error);
        }
    }

    /**
     * Muestra la biblioteca (volver desde una historia).
     */
    mostrar() {
        this.#pantallaEl.classList.remove('oculto');
        this.#uiManager.ocultarControles();
        document.getElementById('panel-texto').style.display = 'none';
        document.getElementById('panel-opciones').style.display = 'none';
    }

    /**
     * Renderiza las tarjetas de historias disponibles.
     * @param {Array<{config: object, ruta: string}>} historias
     */
    #renderizarTarjetas(historias) {
        this.#contenedorHistorias.innerHTML = '';

        for (const { config, ruta } of historias) {
            const tarjeta = document.createElement('button');
            tarjeta.className = 'biblioteca-tarjeta';
            tarjeta.type = 'button';
            tarjeta.setAttribute('aria-label', `Jugar: ${config.titulo}`);

            // Imagen de tarjeta (específica para la biblioteca)
            const img = document.createElement('img');
            img.src = ruta + config.tarjeta;
            img.alt = config.titulo; // Mantenemos el alt por accesibilidad
            img.className = 'biblioteca-tarjeta-img';
            img.loading = 'eager';
            tarjeta.appendChild(img);

            // Event: seleccionar historia
            tarjeta.addEventListener('click', () => {
                this.#seleccionarHistoria(config, ruta);
            });

            this.#contenedorHistorias.appendChild(tarjeta);
        }
    }

    /**
     * Maneja la selección de una historia.
     * @param {object} config — Datos del historia.json
     * @param {string} ruta — Ruta base de la historia
     */
    async #seleccionarHistoria(config, ruta) {
        if (this.#stateManager.tienePartidaGuardada(config.id)) {
            this.#mostrarModalRetomar(config, ruta);
        } else {
            await this.#cargarDirecto(config, ruta, false);
        }
    }

    /**
     * Muestra un modal alertando de juego guardado y pide acción.
     * @param {object} config 
     * @param {string} ruta 
     */
    #mostrarModalRetomar(config, ruta) {
        const overlay = document.createElement('div');
        overlay.className = 'biblioteca-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'biblioteca-modal';

        const titulo = document.createElement('h2');
        titulo.className = 'biblioteca-modal-titulo';
        titulo.textContent = 'Partida en curso';

        const mensaje = document.createElement('p');
        mensaje.className = 'biblioteca-modal-mensaje';
        mensaje.textContent = 'Tenés un juego guardado sin terminar. ¿Qué querés hacer?';

        const botonesContainer = document.createElement('div');
        botonesContainer.className = 'biblioteca-modal-botones';

        const btnContinuar = document.createElement('button');
        btnContinuar.className = 'btn-retomar btn-modal-primario';
        btnContinuar.textContent = 'Continuar desde donde estaba';
        btnContinuar.addEventListener('click', () => {
            overlay.remove();
            this.#cargarDirecto(config, ruta, false);
        });

        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'btn-nuevo-juego btn-modal-secundario';
        btnReiniciar.textContent = 'Empezar desde el principio';
        btnReiniciar.addEventListener('click', () => {
            overlay.remove();
            this.#cargarDirecto(config, ruta, true);
        });

        const btnCancelar = document.createElement('button');
        btnCancelar.className = 'btn-cancelar btn-modal-terciario';
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.addEventListener('click', () => {
            overlay.remove();
        });

        botonesContainer.appendChild(btnContinuar);
        botonesContainer.appendChild(btnReiniciar);
        botonesContainer.appendChild(btnCancelar);

        modal.appendChild(titulo);
        modal.appendChild(mensaje);
        modal.appendChild(botonesContainer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
    }

    /**
     * Carga internamente la historia, solicitando fullscreen.
     */
    async #cargarDirecto(config, ruta, resetear) {
        // Intentar activar pantalla completa (requiere interacción de usuario, aquí click)
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn('[BibliotecaManager] No se pudo entrar en pantalla completa:', err);
        }

        // Ocultar biblioteca
        this.#pantallaEl.classList.add('oculto');

        // Delegar al GameEngine
        await this.#engine.cargarHistoria(config, ruta, () => {
            // Callback: volver a la biblioteca
            this.mostrar();
        }, resetear);
    }

    /**
     * Muestra el botón de instalación y guarda el evento.
     * @param {Event} eventoInstalacion - El evento beforeinstallprompt original
     */
    mostrarBotonInstalacion(eventoInstalacion) {
        if (!this.#btnInstalarPWA) return;

        this.#eventoInstalacion = eventoInstalacion;
        this.#btnInstalarPWA.classList.remove('oculto');

        // Limpiamos los listeners por si hay múltiples llamadas
        this.#btnInstalarPWA.onclick = async () => {
            if (!this.#eventoInstalacion) return;

            // Mostrar prompt de instalación
            this.#eventoInstalacion.prompt();

            // Esperar a que el usuario responda
            const { outcome } = await this.#eventoInstalacion.userChoice;
            console.log(`[BibliotecaManager] Resultado de instalación PWA: ${outcome}`);

            // Independientemente del resultado, ya no necesitamos el evento
            this.#eventoInstalacion = null;

            if (outcome === 'accepted') {
                this.ocultarBotonInstalacion();
            }
        };
    }

    /**
     * Oculta el botón de instalación permanentemente.
     */
    ocultarBotonInstalacion() {
        if (this.#btnInstalarPWA) {
            this.#btnInstalarPWA.classList.add('oculto');
        }
        this.#eventoInstalacion = null;
    }
}
