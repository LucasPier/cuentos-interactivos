/**
 * AudioManager — Stub para sistema de audio futuro.
 * 
 * Interfaz completa, implementación vacía.
 * Se rellena cuando haya archivos de audio disponibles.
 */
export class AudioManager {

    #muteado = false;

    /**
     * Objeto de Audio actual.
     */
    #bgm = null;

    /**
     * Ruta relativa del archivo de audio actual.
     */
    #bgmSrc = null;

    /** Ruta base para resolver archivos de audio */
    #rutaBase = '';

    /**
     * Configura la ruta base de la historia activa.
     * @param {string} rutaBase
     */
    setRutaBase(rutaBase) {
        this.#rutaBase = rutaBase;
    }

    /**
     * Reproduce música de fondo en loop.
     * @param {string} archivo — Ruta del archivo o nombre del archivo (si se configuró rutaBase)
     */
    reproducirFondo(archivo) {
        if (this.#bgmSrc === archivo && this.#bgm !== null) {
            // Ya estamos reproduciendo este mismo archivo, evitamos el reinicio
            return;
        }

        this.detenerFondo(); // Detener anterior si existe

        this.#bgmSrc = archivo;
        this.#bgm = new Audio(archivo);
        this.#bgm.loop = true;
        this.#bgm.volume = 0.5; // Volumen inicial razonable

        if (this.#muteado) {
            this.#bgm.muted = true;
        }

        // Promesa para manejar politicas de autoplay
        this.#bgm.play().catch(e => {
            console.log('[AudioManager] Autoplay bloqueado o error:', e);
        });
    }

    /**
     * Detiene la música de fondo actual.
     */
    detenerFondo() {
        if (this.#bgm) {
            this.#bgm.pause();
            this.#bgm.currentTime = 0;
            this.#bgm = null;
            this.#bgmSrc = null;
        }
    }

    /**
     * Reproduce la narración de una escena.
     * @param {string} _archivo
     */
    reproducirNarracion(_archivo) {
        // TODO: implementar
    }

    /**
     * Reproduce un efecto de sonido.
     * @param {string} archivo — Nombre del archivo del efecto de sonido
     */
    reproducirEfecto(archivo) {
        if (!archivo) return;
        const rutaCompleta = this.#rutaBase ? (this.#rutaBase + 'audios/' + archivo) : archivo;
        const sfx = new Audio(rutaCompleta);
        sfx.volume = 0.8;
        if (this.#muteado) {
            sfx.muted = true;
        }
        sfx.play().catch(e => {
            console.log('[AudioManager] Error al reproducir efecto:', e);
        });
    }

    /**
     * Pausa toda la reproducción.
     */
    pausar() {
        if (this.#bgm) this.#bgm.pause();
    }

    /**
     * Detiene toda la reproducción.
     */
    detener() {
        this.detenerFondo();
    }

    /**
     * Alterna el estado de mute global.
     * @returns {boolean} Nuevo estado de mute
     */
    toggleMute() {
        this.#muteado = !this.#muteado;
        if (this.#bgm) {
            this.#bgm.muted = this.#muteado;
        }
        return this.#muteado;
    }

    /**
     * @returns {boolean} true si está muteado
     */
    get muteado() {
        return this.#muteado;
    }
}
