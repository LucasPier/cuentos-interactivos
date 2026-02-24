/**
 * UIManager — Controles de interfaz permanentes.
 * 
 * Toggle de texto narrativo, botón de mute (stub), indicador de carga.
 */
export class UIManager {

    #btnToggleTexto;
    #btnMute;
    #btnFullscreen;
    #indicadorCarga;
    #logoCarga;
    #panelTexto;

    /** Estado del toggle de texto */
    #textoVisible = true;

    /** @type {import('./AudioManager.js').AudioManager} */
    #audioManager;

    /**
     * @param {import('./AudioManager.js').AudioManager} audioManager
     */
    constructor(audioManager) {
        this.#audioManager = audioManager;
        this.#btnToggleTexto = document.getElementById('btn-toggle-texto');
        this.#btnMute = document.getElementById('btn-mute');
        this.#btnFullscreen = document.getElementById('btn-fullscreen');
        this.#indicadorCarga = document.getElementById('indicador-carga');
        this.#logoCarga = document.getElementById('logo-carga');
        this.#panelTexto = document.getElementById('panel-texto');

        this.#inicializarEventos();
    }

    /* =========================================
       Private Setup
       ========================================= */

    #inicializarEventos() {
        // Toggle de texto narrativo
        this.#btnToggleTexto.addEventListener('click', () => {
            this.#textoVisible = !this.#textoVisible;
            this.#panelTexto.classList.toggle('oculto', !this.#textoVisible);
            this.#btnToggleTexto.setAttribute('aria-pressed', String(this.#textoVisible));
            this.#btnToggleTexto.textContent = this.#textoVisible ? '📖' : '👁️';
        });

        // Mute real usando AudioManager
        this.#btnMute.addEventListener('click', () => {
            const nuevoEstadoMute = this.#audioManager.toggleMute();

            this.#btnMute.setAttribute('aria-pressed', String(nuevoEstadoMute));
            this.#btnMute.textContent = nuevoEstadoMute ? '🔇' : '🔊';
        });

        // Fullscreen Toggle
        this.#btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.warn(`Error al activar fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        // Escuchar cambios nativos de fullscreen (ESC, F11)
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = !!document.fullscreenElement;
            this.#btnFullscreen.setAttribute('aria-pressed', String(isFullscreen));
            this.#btnFullscreen.textContent = isFullscreen ? '✕' : '⛶';
        });
    }

    /* =========================================
       Public Methods
       ========================================= */

    /**
     * Muestra el indicador de carga.
     */
    mostrarCarga() {
        this.#indicadorCarga.classList.remove('oculto');
    }

    /**
     * Oculta el indicador de carga.
     */
    ocultarCarga() {
        this.#indicadorCarga.classList.add('oculto');
    }

    /**
     * Establece el logo del indicador de carga (dinámico por historia).
     * @param {string} src — Ruta del logo
     */
    setLogoCarga(src) {
        this.#logoCarga.src = src || '';
    }

    /**
     * Resetea el estado del toggle de texto a visible.
     */
    resetearTexto() {
        this.#textoVisible = true;
        this.#panelTexto.classList.remove('oculto');
        this.#btnToggleTexto.setAttribute('aria-pressed', 'true');
        this.#btnToggleTexto.textContent = '📖';
    }

    /**
     * Muestra solo el botón de mute y fullscreen (para pantalla de inicio).
     */
    mostrarSoloMute() {
        this.#btnToggleTexto.parentElement.style.display = 'none';
        this.#btnMute.parentElement.style.display = '';
        // Aseguramos que el fullscreen también se vea si está en el mismo contenedor
        // (En el HTML actual, Mute y Fullscreen están en ui-controles--izquierda)
    }

    /**
     * Muestra todos los controles de UI.
     */
    mostrarControles() {
        this.#btnToggleTexto.parentElement.style.display = '';
        this.#btnMute.parentElement.style.display = '';
        // Fullscreen siempre visible con el contenedor izquierdo
    }

    /**
     * Oculta todos los controles de UI.
     */
    ocultarControles() {
        this.#btnToggleTexto.parentElement.style.display = 'none';
        this.#btnMute.parentElement.style.display = 'none';
        // Ocultar contenedor izquierdo completo si es necesario, 
        // pero UIManager actualmente maneja visibilidad por botón o por contenedor padre si quisiera.
        // Aquí ocultamos los padres directos si queremos ser específicos, 
        // o mejor, ocultamos los contenedores principales en layout.

        // Ajuste: Para ocultar REALMENTE todo (incluyendo fullscreen),
        // deberíamos ocultar los contenedores .ui-controles.
        // Pero siguiendo la lógica actual de ocultar botones individuales:
        document.querySelector('.ui-controles--izquierda').style.display = 'none';
        document.querySelector('.ui-controles--derecha').style.display = 'none';
    }

    /**
     * Restaura la visibilidad de los contenedores de controles (usado al mostrar).
     */
    restaurarControles() {
        document.querySelector('.ui-controles--izquierda').style.display = '';
        document.querySelector('.ui-controles--derecha').style.display = '';
    }
}

