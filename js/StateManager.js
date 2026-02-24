/**
 * StateManager — Estado global del juego.
 * 
 * Gestiona recompensas, evaluación de condiciones, historial de escenas,
 * y persistencia en localStorage. Soporta múltiples historias con
 * claves separadas por historia.
 */
export class StateManager {

    /** Prefijo base de localStorage */
    #STORAGE_PREFIX = 'biblioteca';

    /** ID de la historia activa */
    #historiaActual = null;

    /** Estado interno */
    #estado = {
        escenaActual: null,
        recompensas: {},
        historial: []
    };

    constructor() {
        // No restauramos acá porque aún no sabemos qué historia está activa.
        // Se restaura al llamar setHistoriaActual().
    }

    // ─── Historia activa ─────────────────────────────

    /**
     * Establece la historia activa y restaura su estado.
     * @param {string} id — ID de la historia
     */
    setHistoriaActual(id) {
        this.#historiaActual = id;
        this.#restaurar();
    }

    /**
     * @returns {string|null} ID de la historia activa
     */
    getHistoriaActual() {
        return this.#historiaActual;
    }

    /**
     * Verifica si una historia tiene progreso guardado.
     * @param {string} idHistoria 
     * @returns {boolean} true si hay estado de juego guardado para la historia
     */
    tienePartidaGuardada(idHistoria) {
        if (!idHistoria) return false;
        try {
            const key = `${this.#STORAGE_PREFIX}_${idHistoria}`;
            const guardado = localStorage.getItem(key);
            if (guardado) {
                const datos = JSON.parse(guardado);
                return datos && datos.escenaActual !== null && datos.escenaActual !== undefined;
            }
        } catch (e) {
            // Ignorar errores de parseo o de storage
        }
        return false;
    }

    // ─── Escena actual ───────────────────────────────

    /**
     * Registra la escena actual.
     * @param {string} id — ID de la escena
     */
    setEscenaActual(id) {
        this.#estado.escenaActual = id;
        this.#estado.historial.push(id);
        this.#persistir();
    }

    /**
     * @returns {string|null} ID de la escena actual
     */
    getEscenaActual() {
        return this.#estado.escenaActual;
    }

    // ─── Recompensas ─────────────────────────────────

    /**
     * Otorga una recompensa al jugador.
     * @param {string} nombre — Nombre de la recompensa (ej: "flor_de_luz")
     */
    otorgarRecompensa(nombre) {
        if (!nombre) return;
        this.#estado.recompensas[nombre] = true;
        this.#persistir();
        console.log(`[StateManager] Recompensa otorgada: "${nombre}"`);
    }

    /**
     * Verifica si el jugador tiene una recompensa.
     * @param {string} nombre 
     * @returns {boolean}
     */
    tieneRecompensa(nombre) {
        return this.#estado.recompensas[nombre] === true;
    }

    /**
     * Evalúa una condición del JSON contra el estado actual.
     * 
     * Convención: las condiciones vienen como "tiene_X" donde X
     * es el nombre de la recompensa.
     * 
     * @param {string|null|undefined} condicion — Valor del campo "condicion" del JSON
     * @returns {boolean} true si la condición se cumple o no hay condición
     */
    evaluarCondicion(condicion) {
        // Sin condición = siempre visible
        if (!condicion) return true;

        // Convención: "tiene_X" → buscar recompensa "X"
        if (condicion.startsWith('tiene_')) {
            const recompensa = condicion.substring(6); // quitar "tiene_"
            return this.tieneRecompensa(recompensa);
        }

        // Condición no reconocida → la tratamos como no cumplida por seguridad
        console.warn(`[StateManager] Condición no reconocida: "${condicion}"`);
        return false;
    }

    // ─── Historial ────────────────────────────────────

    /**
     * @returns {string[]} Lista ordenada de IDs de escenas visitadas
     */
    getHistorial() {
        return [...this.#estado.historial];
    }

    // ─── Reinicio ─────────────────────────────────────

    /**
     * Limpia todo el estado del juego (escenas, recompensas).
     * Mantiene la historia activa configurada.
     */
    reiniciar() {
        this.#estado = {
            escenaActual: null,
            recompensas: {},
            historial: []
        };
        this.#persistir();
        console.log('[StateManager] Estado reiniciado');
    }

    // ─── Persistencia (localStorage) ────────────────

    /**
     * Clave de storage dinámica por historia.
     * @returns {string}
     */
    get #storageKey() {
        return this.#historiaActual
            ? `${this.#STORAGE_PREFIX}_${this.#historiaActual}`
            : this.#STORAGE_PREFIX;
    }

    #persistir() {
        try {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#estado));
        } catch (e) {
            // localStorage no disponible o lleno — no es crítico
        }
    }

    #restaurar() {
        try {
            const guardado = localStorage.getItem(this.#storageKey);
            if (guardado) {
                const datos = JSON.parse(guardado);
                this.#estado = {
                    escenaActual: datos.escenaActual || null,
                    recompensas: datos.recompensas || {},
                    historial: datos.historial || []
                };
            } else {
                // Historia nueva o sin estado guardado
                this.#estado = {
                    escenaActual: null,
                    recompensas: {},
                    historial: []
                };
            }
        } catch (e) {
            // Si falla la restauración, arrancamos limpio
            this.#estado = {
                escenaActual: null,
                recompensas: {},
                historial: []
            };
        }
    }
}
