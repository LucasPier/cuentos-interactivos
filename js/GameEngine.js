/**
 * GameEngine — Orquestador principal del cuento interactivo.
 * 
 * Controla el flujo entre pantalla de inicio de historia, escenas, desafíos y finales.
 * Coordina todos los módulos del motor.
 * Soporta carga dinámica de historias desde configuración JSON.
 */
export class GameEngine {

    /** @type {import('./ContentLoader.js').ContentLoader} */
    #contentLoader;
    /** @type {import('./StateManager.js').StateManager} */
    #stateManager;
    /** @type {import('./ImagePreloader.js').ImagePreloader} */
    #preloader;
    /** @type {import('./SceneRenderer.js').SceneRenderer} */
    #sceneRenderer;
    /** @type {import('./ChallengeManager.js').ChallengeManager} */
    #challengeManager;
    /** @type {import('./UIManager.js').UIManager} */
    #uiManager;
    /** @type {import('./AudioManager.js').AudioManager} */
    #audioManager;

    /** @type {HTMLElement} */
    #pantallaInicioEl;

    /** Flag para prevenir navegación múltiple simultánea */
    #navegando = false;

    /** Callbacks registrados para cambio de escena/desafío */
    #onCambioEscenaCallbacks = [];

    /** Configuración de la historia activa */
    #configHistoria = null;
    /** Ruta base de la historia activa */
    #rutaBase = '';
    /** Callback para volver a la biblioteca */
    #onVolverBiblioteca = null;

    /**
     * @param {object} modulos — Objeto con todas las dependencias inyectadas
     */
    constructor({ contentLoader, stateManager, preloader, sceneRenderer, challengeManager, uiManager, audioManager }) {
        this.#contentLoader = contentLoader;
        this.#stateManager = stateManager;
        this.#preloader = preloader;
        this.#sceneRenderer = sceneRenderer;
        this.#challengeManager = challengeManager;
        this.#uiManager = uiManager;
        this.#audioManager = audioManager;

        this.#pantallaInicioEl = document.getElementById('pantalla-inicio');
    }

    /**
     * Carga una historia desde su configuración JSON.
     * Construye la pantalla de inicio dinámicamente.
     * @param {object} configHistoria — Datos del historia.json
     * @param {string} rutaBase — Ruta base de la historia (ej: "historias/el-misterio-del-bosque-encantado/")
     * @param {function} onVolverBiblioteca — Callback al presionar "Salir"
     * @param {boolean} resetear — Si es true, reinicia el estado antes de empezar
     */
    async cargarHistoria(configHistoria, rutaBase, onVolverBiblioteca, resetear = false) {
        this.#configHistoria = configHistoria;
        this.#rutaBase = rutaBase;
        this.#onVolverBiblioteca = onVolverBiblioteca;

        // Configurar módulos con la ruta de la historia
        this.#contentLoader.setRutaBase(rutaBase);
        this.#preloader.setRutaBase(rutaBase);
        this.#audioManager.setRutaBase(rutaBase);
        this.#stateManager.setHistoriaActual(configHistoria.id);

        // Establecer logo de carga de esta historia
        this.#uiManager.setLogoCarga(rutaBase + configHistoria.logo);

        // Construir pantalla de inicio
        this.#construirPantallaInicio(configHistoria, rutaBase);

        // Mostrar pantalla de inicio
        this.#pantallaInicioEl.classList.remove('oculto');
        this.#uiManager.mostrarSoloMute();

        // Ocultar paneles de juego
        document.getElementById('panel-texto').style.display = 'none';
        document.getElementById('panel-opciones').style.display = 'none';

        // Si hay estado guardado, continuar automáticamente
        if (resetear) {
            this.#stateManager.reiniciar();
        }

        const escenaGuardada = this.#stateManager.getEscenaActual();
        if (escenaGuardada) {
            this.#empezarJuego(escenaGuardada);
        } else {
            // Música de inicio solo si se va a mostrar la pantalla de inicio
            if (configHistoria.musica_inicio) {
                this.#audioManager.reproducirFondo(rutaBase + 'audios/' + configHistoria.musica_inicio);
            }
        }

        console.log(`[GameEngine] Historia cargada: "${configHistoria.titulo}"`);
    }

    /**
     * Construye el contenido de la pantalla de inicio dinámicamente.
     * @param {object} config — Datos del historia.json
     * @param {string} rutaBase — Ruta base de la historia
     */
    #construirPantallaInicio(config, rutaBase) {
        this.#pantallaInicioEl.innerHTML = '';

        // ── Fondo ──
        const fondoDiv = document.createElement('div');
        fondoDiv.className = 'inicio-fondo';
        const fondoImg = document.createElement('img');
        fondoImg.src = rutaBase + config.portada;
        fondoImg.alt = config.titulo;
        fondoDiv.appendChild(fondoImg);
        this.#pantallaInicioEl.appendChild(fondoDiv);

        // ── Overlay ──
        const overlay = document.createElement('div');
        overlay.className = 'inicio-overlay';
        this.#pantallaInicioEl.appendChild(overlay);

        // ── Efectos decorativos ──
        if (config.efectos?.luciernagas) {
            this.#renderizarLuciernagas();
        }

        // ── Contenido ──
        const contenido = document.createElement('div');
        contenido.className = 'inicio-contenido';

        // Logo
        const titulo = document.createElement('h1');
        titulo.className = 'inicio-titulo';
        const logoImg = document.createElement('img');
        logoImg.src = rutaBase + config.logo;
        logoImg.alt = config.titulo;
        titulo.appendChild(logoImg);
        contenido.appendChild(titulo);

        // Subtítulo
        if (config.subtitulo) {
            const subtitulo = document.createElement('p');
            subtitulo.className = 'inicio-subtitulo';
            subtitulo.innerHTML = config.subtitulo.replace(/\n/g, '<br>');
            if (config.colores?.subtitulo_color) {
                subtitulo.style.color = config.colores.subtitulo_color;
            }
            contenido.appendChild(subtitulo);
        }

        // Botón Jugar
        const btnJugar = document.createElement('button');
        btnJugar.id = 'btn-jugar';
        btnJugar.className = 'btn-jugar';
        btnJugar.type = 'button';
        btnJugar.textContent = 'Jugar';

        // Colores personalizados
        if (config.colores?.boton_jugar_bg) {
            btnJugar.style.background = config.colores.boton_jugar_bg;
            btnJugar.style.backgroundSize = '200% 200%';
        }
        if (config.colores?.boton_jugar_borde) {
            btnJugar.style.borderColor = config.colores.boton_jugar_borde;
        }
        if (config.colores?.boton_jugar_color) {
            btnJugar.style.color = config.colores.boton_jugar_color;
        }

        btnJugar.addEventListener('click', () => {
            this.#empezarJuego(config.escena_inicial);
        });

        contenido.appendChild(btnJugar);

        // Botón Salir (volver a biblioteca)
        const btnSalir = document.createElement('button');
        btnSalir.className = 'btn-salir-historia';
        btnSalir.type = 'button';
        btnSalir.textContent = '← Volver a la biblioteca';
        btnSalir.addEventListener('click', () => {
            this.#audioManager.detenerFondo();
            this.#audioManager.detener();
            this.#pantallaInicioEl.classList.add('oculto');
            this.#pantallaInicioEl.innerHTML = '';
            this.#configHistoria = null;
            if (this.#onVolverBiblioteca) {
                this.#onVolverBiblioteca();
            }
        });
        contenido.appendChild(btnSalir);

        this.#pantallaInicioEl.appendChild(contenido);
    }

    /**
     * Renderiza las luciérnagas decorativas en la pantalla de inicio.
     */
    #renderizarLuciernagas() {
        const luciernagas = [
            { top: '15%', left: '10%', dx: '40px', dy: '-25px', duracion: '5s' },
            { top: '30%', left: '80%', dx: '-30px', dy: '20px', duracion: '7s' },
            { top: '60%', left: '25%', dx: '25px', dy: '-35px', duracion: '6s' },
            { top: '45%', left: '65%', dx: '-20px', dy: '15px', duracion: '8s' },
            { top: '75%', left: '50%', dx: '35px', dy: '-10px', duracion: '5.5s' },
            { top: '20%', left: '45%', dx: '-15px', dy: '30px', duracion: '9s' }
        ];

        for (const l of luciernagas) {
            const div = document.createElement('div');
            div.className = 'inicio-luciérnaga';
            div.style.top = l.top;
            div.style.left = l.left;
            div.style.setProperty('--dx', l.dx);
            div.style.setProperty('--dy', l.dy);
            div.style.setProperty('--duracion', l.duracion);
            this.#pantallaInicioEl.appendChild(div);
        }
    }

    /**
     * Inicia el juego desde una escena específica.
     * @param {string} escenaInicial
     */
    async #empezarJuego(escenaInicial) {
        try {
            this.#uiManager.mostrarCarga();

            // Ocultar pantalla de inicio
            this.#pantallaInicioEl.classList.add('oculto');

            // Mostrar paneles de juego
            document.getElementById('panel-texto').style.display = '';
            document.getElementById('panel-opciones').style.display = '';

            // Mostrar controles UI
            this.#uiManager.mostrarControles();

            // Navegar a la primera escena
            await this.#cargarEscena(escenaInicial);
        } catch (error) {
            console.error('[GameEngine] Error al empezar juego:', error);
        } finally {
            this.#uiManager.ocultarCarga();
        }
    }

    /**
     * Carga y renderiza una escena.
     * @param {string} id — ID de la escena
     */
    async #cargarEscena(id) {
        try {
            this.#uiManager.mostrarCarga();

            // Cargar el JSON
            const datos = await this.#contentLoader.cargarEscena(id);

            // Pre-cargar las imágenes de esta escena
            const imagenes = this.#preloader.extraerImagenes(datos);
            await this.#preloader.precargar(imagenes);

            // Registrar en state
            this.#stateManager.setEscenaActual(id);

            // Notificar a observadores (DevPanel, etc.)
            this.#notificarCambioEscena(id, 'escena', datos);

            // Resetear toggle de texto antes de renderizar
            this.#uiManager.resetearTexto();

            // Renderizar
            await this.#sceneRenderer.renderizar(datos, this.#stateManager, (accion, target, tipoTarget) => {
                this.#manejarNavegacion(accion, target, tipoTarget);
            });

            // Audio de fondo específico para esta escena
            if (datos.audio) {
                this.#audioManager.reproducirFondo(this.#rutaBase + 'audios/' + datos.audio);
            } else {
                this.#audioManager.detenerFondo();
            }

            // Audio narración
            if (datos.audio_narracion) {
                this.#audioManager.reproducirNarracion(datos.audio_narracion);
            }

            // Pre-cargar escenas siguientes (fire and forget)
            this.#precargarSiguientes(datos.opciones);

            this.#uiManager.ocultarCarga();

        } catch (error) {
            console.error(`[GameEngine] Error cargando escena "${id}":`, error);
            this.#uiManager.ocultarCarga();
        }
    }

    /**
     * Carga y ejecuta un desafío.
     * @param {string} id — ID del desafío
     */
    async #cargarDesafio(id) {
        try {
            this.#uiManager.mostrarCarga();

            // Cargar el JSON
            const datos = await this.#contentLoader.cargarDesafio(id);

            // Pre-cargar imágenes del desafío
            const imagenes = this.#preloader.extraerImagenes(datos);
            await this.#preloader.precargar(imagenes);

            this.#uiManager.ocultarCarga();

            // Notificar a observadores (DevPanel, etc.)
            this.#notificarCambioEscena(id, 'desafio', datos);

            // Audio de fondo específico para este desafío
            if (datos.audio) {
                this.#audioManager.reproducirFondo(this.#rutaBase + 'audios/' + datos.audio);
            } else {
                this.#audioManager.detenerFondo();
            }

            // Ejecutar el desafío
            const resultado = await this.#challengeManager.ejecutar(datos, this.#stateManager);

            // Navegar a la escena resultante
            await this.#cargarEscena(resultado.target);

        } catch (error) {
            console.error(`[GameEngine] Error ejecutando desafío "${id}":`, error);
            this.#uiManager.ocultarCarga();
        }
    }

    /**
     * Maneja la navegación al elegir una opción.
     * @param {string} accion — "navegar" | "reiniciar"
     * @param {string} target — ID del destino
     * @param {string} tipoTarget — "escena" | "desafio"
     */
    async #manejarNavegacion(accion, target, tipoTarget) {
        if (this.#navegando) return;
        this.#navegando = true;

        try {
            if (accion === 'reiniciar') {
                this.#reiniciar();
                return;
            }

            if (tipoTarget === 'desafio') {
                await this.#cargarDesafio(target);
            } else {
                await this.#cargarEscena(target);
            }
        } finally {
            this.#navegando = false;
        }
    }

    /**
     * Reinicia el juego: limpia estado, vuelve a la pantalla de inicio de la historia.
     */
    #reiniciar() {
        this.#stateManager.reiniciar();
        this.#sceneRenderer.limpiar();
        this.#uiManager.resetearTexto();
        this.#audioManager.detener();

        // Volver a la pantalla de inicio de ESTA historia
        this.cargarHistoria(this.#configHistoria, this.#rutaBase, this.#onVolverBiblioteca);
        this.#navegando = false;
    }

    // ─── API pública para DevPanel / extensiones ─────

    /**
     * Configuración de la historia activa (solo lectura).
     * @returns {object|null}
     */
    get configActual() {
        return this.#configHistoria;
    }

    /**
     * Registra un callback que se invoca al cambiar de escena o desafío.
     * @param {function(string, string, object)} callback — Recibe (id, tipo, datosJSON)
     * @returns {function} Función para desuscribirse
     */
    onCambioEscena(callback) {
        this.#onCambioEscenaCallbacks.push(callback);
        return () => {
            this.#onCambioEscenaCallbacks = this.#onCambioEscenaCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Navega a una escena o desafío arbitrario (uso dev/testing).
     * Ignora el flag de navegación para permitir saltos libres.
     * Si el juego no había arrancado (pantalla de inicio visible), lo inicia.
     * @param {string} id — ID de la escena o desafío
     * @param {string} tipo — 'escena' o 'desafio'
     */
    async navegarA(id, tipo = 'escena') {
        this.#navegando = false;

        // Si la pantalla de inicio está activa, preparar el juego antes de navegar
        if (!this.#pantallaInicioEl.classList.contains('oculto')) {
            this.#pantallaInicioEl.classList.add('oculto');
            document.getElementById('panel-texto').style.display = '';
            document.getElementById('panel-opciones').style.display = '';
            this.#uiManager.mostrarControles();
        }

        if (tipo === 'desafio') {
            await this.#cargarDesafio(id);
        } else {
            await this.#cargarEscena(id);
        }
    }

    /**
     * Notifica a todos los callbacks registrados sobre un cambio de escena/desafío.
     * @param {string} id
     * @param {string} tipo
     * @param {object} datos
     */
    #notificarCambioEscena(id, tipo, datos) {
        for (const cb of this.#onCambioEscenaCallbacks) {
            try {
                cb(id, tipo, datos);
            } catch (e) {
                console.error('[GameEngine] Error en callback onCambioEscena:', e);
            }
        }
    }

    /**
     * Pre-carga las escenas/desafíos referenciadas en las opciones actuales.
     * @param {Array} opciones
     */
    #precargarSiguientes(opciones) {
        if (!opciones || opciones.length === 0) return;

        for (const opcion of opciones) {
            if (!opcion.target) continue;

            const tipo = opcion.tipo_target || 'escena';

            // Pre-cargar el JSON
            this.#contentLoader.precargar(tipo, opcion.target);

            // Pre-cargar las imágenes del siguiente contenido (async)
            this.#contentLoader.cargar(tipo, opcion.target).then(datos => {
                const imagenes = this.#preloader.extraerImagenes(datos);
                this.#preloader.precargar(imagenes);
            }).catch(() => {
                // No es crítico si falla la precarga
            });
        }
    }
}
