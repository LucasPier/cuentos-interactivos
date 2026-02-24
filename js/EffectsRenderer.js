/**
 * EffectsRenderer — Procesador y renderizador de efectos visuales dinámicos.
 * 
 * Interpreta la configuración de "efectos" del JSON y crea los recuadros
 * y emisores de partículas correspondientes (ej: luciérnagas).
 */
export class EffectsRenderer {

    constructor() { }

    /**
     * Instancia y renderiza los efectos sobre un contenedor padre.
     * Si no hay efectos o el array está vacío, no hace nada.
     * @param {Array} efectos - Configuración desde el JSON
     * @param {HTMLElement} contenedorPadre - `#escena` o `#panel-desafio`
     * @returns {HTMLElement|null} El nodo `.escena-efectos` creado, o null
     */
    renderizar(efectos, contenedorPadre) {
        if (!efectos || !efectos.length) return null;

        const containerEfectos = document.createElement('div');
        containerEfectos.className = 'escena-efectos';

        for (const config of efectos) {
            if (config.tipo === 'luciérnagas') {
                this.#crearLuciernagas(config, containerEfectos);
            } else if (config.tipo === 'polvo_hadas' || config.tipo === 'nieve') {
                this.#crearPolvoHadas(config, containerEfectos);
            } else if (config.tipo === 'destellos' || config.tipo === 'sparkles') {
                this.#crearDestellos(config, containerEfectos);
            }
        }

        contenedorPadre.appendChild(containerEfectos);
        return containerEfectos;
    }

    /**
     * @param {object} config - Objeto con {estilo, cantidad, color}
     * @param {HTMLElement} mainContainer - `.escena-efectos`
     */
    #crearLuciernagas(config, mainContainer) {
        const wrapper = this.#crearContenedorBase(config.estilo);

        const cantidad = config.cantidad || 10;
        const color = config.color || 'dorado';

        const colorClass = `color-${color}`;

        for (let i = 0; i < cantidad; i++) {
            const luciernaga = document.createElement('div');
            luciernaga.className = `particula-luciernaga ${colorClass}`;

            // Randomizar posición inicial dentro del wrapper
            luciernaga.style.left = `${Math.random() * 100}%`;
            luciernaga.style.top = `${Math.random() * 100}%`;

            // Randomizar animaciones
            const dx = (Math.random() * 60 - 30) + 'px';
            const dy = (Math.random() * 60 - 40) + 'px';
            const duracion = (Math.random() * 4 + 4) + 's';

            luciernaga.style.setProperty('--dx', dx);
            luciernaga.style.setProperty('--dy', dy);
            luciernaga.style.setProperty('--duracion', duracion);

            // Delay aleatorio para desincronizar
            luciernaga.style.animationDelay = `-${Math.random() * 5}s`;

            wrapper.appendChild(luciernaga);
        }

        mainContainer.appendChild(wrapper);
    }

    /**
     * Crea un efecto de gravedad suave / lluvia mágica.
     * @param {object} config - Objeto con {estilo, cantidad, color, tamano}
     * @param {HTMLElement} mainContainer - `.escena-efectos`
     */
    #crearPolvoHadas(config, mainContainer) {
        const wrapper = this.#crearContenedorBase(config.estilo);

        const cantidad = config.cantidad || 20;
        const color = config.color || 'blanco';
        const tamano = config.tamano; // opcional, ej: "3px" o "5px"
        const colorClass = `color-${color}`;

        for (let i = 0; i < cantidad; i++) {
            const particula = document.createElement('div');
            particula.className = `particula-nieve ${colorClass}`;

            // Randomizar top negativo para que nazcan arrriba de la pantalla
            particula.style.left = `${Math.random() * 100}%`;
            particula.style.top = `-${Math.random() * 20 + 5}%`;

            if (tamano) particula.style.setProperty('--tamano', tamano);

            // Caída entre 6 y 12 segundos
            const duracion = (Math.random() * 6 + 6) + 's';
            // Sway de -30px a 30px
            const sway = (Math.random() * 60 - 30) + 'px';

            particula.style.setProperty('--duracion', duracion);
            particula.style.setProperty('--swayX', sway);

            particula.style.animationDelay = `-${Math.random() * 10}s`;

            wrapper.appendChild(particula);
        }

        mainContainer.appendChild(wrapper);
    }

    /**
     * Crea los destellos in-place estáticos.
     * @param {object} config - Objeto con {cantidad, color, tamano}
     * @param {HTMLElement} mainContainer - `.escena-efectos`
     */
    #crearDestellos(config, mainContainer) {
        const wrapper = this.#crearContenedorBase(config.estilo);

        const cantidad = config.cantidad || 10;
        const color = config.color || 'blanco';
        const colorClass = `color-${color}`;

        for (let i = 0; i < cantidad; i++) {
            const destello = document.createElement('div');
            destello.className = `particula-destello ${colorClass}`;

            destello.style.left = `${Math.random() * 100}%`;
            destello.style.top = `${Math.random() * 100}%`;

            if (config.tamano) destello.style.setProperty('--tamano', config.tamano);
            if (config.opacidad_max) destello.style.setProperty('--opacidad-max', config.opacidad_max);

            const duracion = (Math.random() * 2 + 2) + 's';
            destello.style.setProperty('--duracion', duracion);
            destello.style.animationDelay = `-${Math.random() * 3}s`;

            wrapper.appendChild(destello);
        }

        mainContainer.appendChild(wrapper);
    }

    // --- Helpers Utilitarios ---

    /**
     * Crea un wrapper `.efecto-contenedor` con la ubicación genérica X/Y/Ancho.
     */
    #crearContenedorBase(estiloConfig) {
        const wrapper = document.createElement('div');
        wrapper.className = 'efecto-contenedor';

        const estilo = estiloConfig || {};
        wrapper.style.setProperty('--x', estilo.x ?? 50);
        wrapper.style.setProperty('--y', estilo.y ?? 100);
        wrapper.style.setProperty('--ancho', estilo.ancho ?? 100);
        if (estilo.alto !== undefined) wrapper.style.setProperty('--alto', estilo.alto);
        wrapper.style.setProperty('--z-index', estilo.z_index ?? 5);

        return wrapper;
    }

    /**
     * Mapea un nombre de color de la paleta Bosque a su HEX (para gradientes dinámicos de neblina o luz).
     */
    #obtenerHexPorColorName(nombre) {
        const paleta = {
            'dorado': '#facc15', // dorado-brillante
            'esmeralda': '#10b981', // esmeralda-claro
            'cyan-bio': '#22d3ee',
            'violeta': '#a78bfa',
            'rosa': '#f472b6',
            'blanco': '#ffffff'
        };
        return paleta[nombre] || paleta['blanco'];
    }
}
