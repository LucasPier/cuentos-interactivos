/**
 * ContentLoader — Carga de JSONs bajo demanda con cache en memoria.
 * 
 * Centraliza todos los fetch() a escenas y desafíos.
 * Soporta rutas dinámicas por historia activa.
 * Una vez cargado un JSON, queda en cache y no se vuelve a pedir.
 */
export class ContentLoader {

    /** @type {Map<string, object>} Cache de contenido ya cargado */
    #cache = new Map();

    /** Ruta base de la historia activa (ej: "historias/el-misterio-del-bosque-encantado/") */
    #rutaBaseHistoria = '';

    /** Rutas relativas dentro de cada historia */
    #rutasRelativas = {
        escena: 'datos/escenas/',
        desafio: 'datos/desafios/'
    };

    /**
     * Configura la ruta base de la historia activa.
     * Limpia la cache al cambiar de historia.
     * @param {string} rutaBase — Ruta base (ej: "historias/el-misterio-del-bosque-encantado/")
     */
    setRutaBase(rutaBase) {
        if (this.#rutaBaseHistoria !== rutaBase) {
            this.#cache.clear();
        }
        this.#rutaBaseHistoria = rutaBase;
    }

    /**
     * Carga contenido (escena o desafío) por tipo e ID.
     * @param {'escena'|'desafio'} tipo 
     * @param {string} id — ID del archivo (sin extensión)
     * @returns {Promise<object>} Datos parseados del JSON
     */
    async cargar(tipo, id) {
        const clave = `${tipo}:${id}`;

        if (this.#cache.has(clave)) {
            return this.#cache.get(clave);
        }

        const rutaRelativa = this.#rutasRelativas[tipo];
        if (!rutaRelativa) {
            throw new Error(`[ContentLoader] Tipo desconocido: "${tipo}"`);
        }

        const url = `${this.#rutaBaseHistoria}${rutaRelativa}${id}.json`;

        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) {
                throw new Error(`HTTP ${respuesta.status} al cargar ${url}`);
            }
            const datos = await respuesta.json();
            this.#cache.set(clave, datos);
            return datos;
        } catch (error) {
            console.error(`[ContentLoader] Error cargando ${url}:`, error);
            throw error;
        }
    }

    /**
     * Atajo para cargar una escena.
     * @param {string} id 
     * @returns {Promise<object>}
     */
    async cargarEscena(id) {
        return this.cargar('escena', id);
    }

    /**
     * Atajo para cargar un desafío.
     * @param {string} id 
     * @returns {Promise<object>}
     */
    async cargarDesafio(id) {
        return this.cargar('desafio', id);
    }

    /**
     * Pre-carga un contenido sin esperar (fire-and-forget).
     * Útil para anticipar la carga de escenas futuras.
     * @param {'escena'|'desafio'} tipo 
     * @param {string} id 
     */
    precargar(tipo, id) {
        const clave = `${tipo}:${id}`;
        if (!this.#cache.has(clave)) {
            this.cargar(tipo, id).catch(() => {
                // Silenciamos errores de precarga — no son críticos
            });
        }
    }

    /**
     * Limpia la cache. Útil al reiniciar el juego.
     */
    limpiarCache() {
        this.#cache.clear();
    }
}
