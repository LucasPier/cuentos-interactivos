/**
 * ImagePreloader — Precarga de imágenes pesadas.
 * 
 * Usa new Image() para forzar la descarga anticipada.
 * Soporta rutas dinámicas por historia activa.
 */
export class ImagePreloader {

    /** Ruta base de la historia activa */
    #rutaBaseHistoria = '';

    /** Rutas relativas dentro de cada historia */
    #rutasRelativas = {
        fondos: 'imagenes/fondos/',
        personajes: 'imagenes/personajes/',
        objetos: 'imagenes/objetos/'
    };

    /** Set de URLs ya precargadas (evita trabajo duplicado) */
    #precargadas = new Set();

    /**
     * Configura la ruta base de la historia activa.
     * Limpia las precargadas al cambiar de historia.
     * @param {string} rutaBase — Ruta base (ej: "historias/el-misterio-del-bosque-encantado/")
     */
    setRutaBase(rutaBase) {
        if (this.#rutaBaseHistoria !== rutaBase) {
            this.#precargadas.clear();
        }
        this.#rutaBaseHistoria = rutaBase;
    }

    /**
     * Resuelve el nombre de archivo a una ruta completa.
     * @param {string} nombre — Nombre del archivo (ej: "irupe.webp")
     * @param {string} tipo — Tipo de imagen ("fondo", "personaje", "objeto"). Default: "fondo"
     * @param {string|null} id — ID del elemento (requerido para tipo "personaje")
     * @returns {string} Ruta relativa completa
     */
    resolverRuta(nombre, tipo = 'fondo', id = null) {
        const base = this.#rutaBaseHistoria;

        if (tipo === 'personaje') {
            if (!id) {
                console.warn(`[ImagePreloader] resolverRuta: tipo "personaje" requiere un id. Imagen: ${nombre}`);
            }
            return base + this.#rutasRelativas.personajes + (id ?? '') + '/' + nombre;
        }

        if (tipo === 'objeto') {
            return base + this.#rutasRelativas.objetos + nombre;
        }

        // fondo (default) y cualquier otro tipo desconocido
        return base + this.#rutasRelativas.fondos + nombre;
    }

    /**
     * Precarga un conjunto de URLs de imágenes.
     * @param {string[]} urls — Array de URLs completas o nombres de archivo
     * @param {function} [onProgreso] — Callback (cargadas, total) para progreso
     * @returns {Promise<void>} Se resuelve cuando todas las imágenes se cargaron
     */
    async precargar(urls, onProgreso = null) {
        const urlsNuevas = urls.filter(url => !this.#precargadas.has(url));

        if (urlsNuevas.length === 0) {
            if (onProgreso) onProgreso(1, 1);
            return;
        }

        let cargadas = 0;
        const total = urlsNuevas.length;

        const promesas = urlsNuevas.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.#precargadas.add(url);
                    cargadas++;
                    if (onProgreso) onProgreso(cargadas, total);
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`[ImagePreloader] No se pudo cargar: ${url}`);
                    cargadas++;
                    if (onProgreso) onProgreso(cargadas, total);
                    resolve(); // No rechazamos — la imagen fallida no bloquea
                };
                img.src = url;
            });
        });

        await Promise.all(promesas);
    }

    /**
     * Extrae las URLs de imágenes de los datos de una escena o desafío.
     * @param {object} datos — Datos JSON de la escena/desafío
     * @returns {string[]} Array de rutas resueltas
     */
    extraerImagenes(datos) {
        const imagenes = [];

        // Fondo
        if (datos.fondo) {
            imagenes.push(this.resolverRuta(datos.fondo, 'fondo'));
        }

        // Elementos (personajes, objetos)
        if (datos.elementos && Array.isArray(datos.elementos)) {
            for (const elem of datos.elementos) {
                if (elem.imagen) {
                    imagenes.push(this.resolverRuta(elem.imagen, elem.tipo, elem.id ?? null));
                }
            }
        }

        // Elementos interactivos de desafíos
        if (datos.configuracion) {
            const config = datos.configuracion;

            // minijuego_observacion
            if (config.elementos_interactivos) {
                for (const elem of config.elementos_interactivos) {
                    if (elem.imagen) {
                        imagenes.push(this.resolverRuta(elem.imagen, elem.tipo || 'objeto'));
                    }
                    if (elem.imagen_final) {
                        imagenes.push(this.resolverRuta(elem.imagen_final, elem.tipo || 'objeto'));
                    }
                }
            }

            // minijuego_clicks
            if (config.objeto_interactivo && config.objeto_interactivo.imagen) {
                imagenes.push(this.resolverRuta(config.objeto_interactivo.imagen, config.objeto_interactivo.tipo || 'objeto'));
            }
        }

        return imagenes;
    }

    /**
     * Limpia el tracking de imágenes precargadas.
     */
    limpiar() {
        this.#precargadas.clear();
    }
}
