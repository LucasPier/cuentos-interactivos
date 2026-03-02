import { crearFondo } from '../FondoHelper.js';

/**
 * ClicksHandler — Handler para "minijuego_clicks".
 * 
 * Muestra un objeto interactivo que debe ser clickeado N veces.
 * Muestra mensajes de progreso con cada clic.
 */
export class ClicksHandler {

    #audioManager;

    /** Ms de espera antes de mostrar el feedback de éxito */
    #DELAY_FEEDBACK_MS = 500;
    /** Ms de espera desde el feedback hasta resolver la promesa */
    #DELAY_RESOLVER_MS = 1200;

    /**
     * @param {import('../AudioManager.js').AudioManager} audioManager
     */
    constructor(audioManager) {
        this.#audioManager = audioManager;
    }

    /**
     * @param {object} datos — Datos JSON del desafío
     * @param {HTMLElement} panelEl
     * @param {import('../ImagePreloader.js').ImagePreloader} preloader
     * @returns {Promise<boolean>}
     */
    ejecutar(datos, panelEl, preloader) {
        return new Promise((resolve) => {
            const config = datos.configuracion;
            const objetivo = config.objetivo_clicks || 3;
            const mensajes = config.mensajes_progreso || [];
            let clicsActuales = 0;

            const contenido = document.createElement('div');
            contenido.className = 'desafio-contenido';

            // ── Fondo (imagen + video opcional) ──
            if (datos.fondo || datos.video) {
                const { contenedor } = crearFondo(preloader, datos.fondo, datos.video, 'desafio-fondo');
                contenido.appendChild(contenedor);
            }

            // ── Instrucción ──
            const instruccion = document.createElement('div');
            instruccion.className = 'desafio-instruccion';

            // Aplicar posicionamiento configurado
            const ubicacion = config.ubicacion_instrucciones;
            if (ubicacion === 'arriba') instruccion.classList.add('pos-arriba');
            if (ubicacion === 'abajo') instruccion.classList.add('pos-abajo');

            const h2 = document.createElement('h2');
            h2.textContent = datos.instruccion || `Tocá ${objetivo} veces`;
            instruccion.appendChild(h2);
            contenido.appendChild(instruccion);

            // ── Área interactiva ──
            const area = document.createElement('div');
            area.className = 'desafio-area-interactiva';

            // Objeto interactivo
            const obj = config.objeto_interactivo;
            if (obj) {
                const div = document.createElement('div');
                div.className = 'desafio-elemento-interactivo';

                div.style.setProperty('--x', obj.x ?? 50);
                div.style.setProperty('--y', obj.y ?? 80);
                div.style.setProperty('--ancho', obj.ancho ?? 15);

                const img = document.createElement('img');
                img.src = preloader.resolverRuta(obj.imagen, obj.tipo || 'objeto');
                img.alt = 'Objeto interactivo';

                // Animación continua opcional
                if (obj.animacion) {
                    img.classList.add(`anim-${obj.animacion}`);
                }

                div.appendChild(img);

                div.addEventListener('click', () => {
                    clicsActuales++;

                    if (obj.sonido) {
                        this.#audioManager.reproducirEfecto(obj.sonido);
                    }

                    // Efecto visual
                    div.classList.remove('efecto-pulse');
                    // Force reflow para re-triggerear la animación
                    void div.offsetWidth;
                    div.classList.add('efecto-pulse');

                    // Mensaje de progreso
                    const mensajeAnterior = contenido.querySelector('.desafio-mensaje-progreso');
                    if (mensajeAnterior) mensajeAnterior.remove();

                    const mensaje = document.createElement('div');
                    mensaje.className = 'desafio-mensaje-progreso';

                    if (clicsActuales <= mensajes.length) {
                        mensaje.textContent = mensajes[clicsActuales - 1];
                    } else {
                        mensaje.textContent = `¡${clicsActuales}!`;
                    }
                    contenido.appendChild(mensaje);

                    // ¿Completado?
                    if (clicsActuales >= objetivo) {
                        area.style.pointerEvents = 'none';

                        if (config.sonido_exito) {
                            this.#audioManager.reproducirEfecto(config.sonido_exito);
                        }

                        setTimeout(() => {
                            const feedback = document.createElement('div');
                            feedback.className = 'desafio-feedback exito';
                            feedback.textContent = '¡Completado! 🎉';
                            contenido.appendChild(feedback);

                            setTimeout(() => resolve(true), this.#DELAY_RESOLVER_MS);
                        }, this.#DELAY_FEEDBACK_MS);
                    }
                });

                area.appendChild(div);
            }

            contenido.appendChild(area);
            panelEl.appendChild(contenido);
        });
    }
}
