/**
 * ObservacionHandler — Handler para "minijuego_observacion".
 * 
 * Muestra un fondo con elementos interactivos posicionados.
 * El jugador debe encontrar el elemento correcto (correcto: true).
 */
export class ObservacionHandler {

    #audioManager;

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
            const contenido = document.createElement('div');
            contenido.className = 'desafio-contenido';

            // ── Fondo ──
            if (datos.fondo) {
                const fondoDiv = document.createElement('div');
                fondoDiv.className = 'desafio-fondo';
                const img = document.createElement('img');
                img.src = preloader.resolverRuta(datos.fondo, 'fondo');
                img.alt = 'Fondo del desafío';
                fondoDiv.appendChild(img);
                contenido.appendChild(fondoDiv);
            }

            // ── Instrucción ──
            const instruccion = document.createElement('div');
            instruccion.className = 'desafio-instruccion';

            // Aplicar posicionamiento configurado
            const ubicacion = datos.configuracion?.ubicacion_instrucciones;
            if (ubicacion === 'arriba') instruccion.classList.add('pos-arriba');
            if (ubicacion === 'abajo') instruccion.classList.add('pos-abajo');

            const h2 = document.createElement('h2');
            h2.textContent = datos.instruccion || 'Encontrá el elemento correcto';
            instruccion.appendChild(h2);
            contenido.appendChild(instruccion);

            // ── Área interactiva ──
            const area = document.createElement('div');
            area.className = 'desafio-area-interactiva';

            const elementos = datos.configuracion.elementos_interactivos || [];

            let idCorrecto = null;
            if (datos.configuracion.correcto_aleatorio && elementos.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * elementos.length);
                idCorrecto = elementos[indiceAleatorio].id;
            }

            // Pre-carga de imágenes finales
            elementos.forEach(elem => {
                if (elem.imagen_final) {
                    const imgFinal = new Image();
                    imgFinal.src = preloader.resolverRuta(elem.imagen_final, elem.tipo || 'objeto');
                }
            });

            for (const elem of elementos) {
                const esCorrecto = idCorrecto !== null ? (elem.id === idCorrecto) : !!elem.correcto;

                const div = document.createElement('div');
                div.className = 'desafio-elemento-interactivo';
                div.dataset.id = elem.id;
                div.dataset.correcto = String(esCorrecto);

                div.style.setProperty('--x', elem.x ?? 50);
                div.style.setProperty('--y', elem.y ?? 80);
                div.style.setProperty('--ancho', elem.ancho ?? 15);

                const img = document.createElement('img');
                img.src = preloader.resolverRuta(elem.imagen, elem.tipo || 'objeto');
                img.alt = elem.id;

                // Animación continua opcional
                if (elem.animacion) {
                    img.classList.add(`anim-${elem.animacion}`);
                }

                div.appendChild(img);

                div.addEventListener('click', () => {
                    // Reproducir sonido correspondiente
                    const config = datos.configuracion;
                    if (config.correcto_aleatorio && esCorrecto) {
                        if (config.sonido_correcto) {
                            this.#audioManager.reproducirEfecto(config.sonido_correcto);
                        }
                    } else {
                        if (elem.sonido) {
                            this.#audioManager.reproducirEfecto(elem.sonido);
                        }
                    }

                    if (esCorrecto) {
                        // ¡Encontrado!
                        div.classList.add('efecto-pulse');

                        // Cambio de imagen al finalizar la animación (si hay imagen_final)
                        if (elem.imagen_final) {
                            div.addEventListener('animationend', () => {
                                img.src = preloader.resolverRuta(elem.imagen_final, elem.tipo || 'objeto');
                            }, { once: true });
                        }

                        const feedback = document.createElement('div');
                        feedback.className = 'desafio-feedback exito';
                        feedback.textContent = '¡Lo encontraste! 🎉';
                        contenido.appendChild(feedback);

                        // Deshabilitar interacción
                        area.style.pointerEvents = 'none';

                        setTimeout(() => resolve(true), 1500);
                    } else {
                        // Incorrecto — feedback visual
                        div.classList.add('efecto-shake');
                        div.style.opacity = '0.5';
                        // Quitar clase shake para que se pueda re-aplicar
                        div.addEventListener('animationend', () => {
                            div.classList.remove('efecto-shake');
                        }, { once: true });
                    }
                });

                area.appendChild(div);
            }

            contenido.appendChild(area);
            panelEl.appendChild(contenido);
        });
    }
}
