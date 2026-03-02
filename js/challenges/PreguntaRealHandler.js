import { crearFondo } from '../FondoHelper.js';

/**
 * PreguntaRealHandler — Handler para desafíos de tipo "pregunta_real".
 * 
 * Renderiza instrucción + pregunta + botones de respuesta.
 * Éxito si elige la opción con correcta: true.
 */
export class PreguntaRealHandler {

    #audioManager;

    /** Ms de espera desde el feedback hasta resolver la promesa */
    #DELAY_RESOLVER_MS = 1500;

    /**
     * @param {import('../AudioManager.js').AudioManager} audioManager
     */
    constructor(audioManager) {
        this.#audioManager = audioManager;
    }

    /**
     * Ejecuta el desafío dentro del panel proporcionado.
     * @param {object} datos — Datos JSON del desafío
     * @param {HTMLElement} panelEl — Contenedor donde renderizar
     * @param {import('../ImagePreloader.js').ImagePreloader} preloader
     * @returns {Promise<boolean>} true si acertó, false si falló
     */
    ejecutar(datos, panelEl, preloader) {
        return new Promise((resolve) => {
            const contenido = document.createElement('div');
            contenido.className = 'desafio-contenido';

            // ── Fondo (imagen + video opcional) ──
            if (datos.fondo || datos.video) {
                const { contenedor } = crearFondo(preloader, datos.fondo, datos.video, 'desafio-fondo');
                contenido.appendChild(contenedor);
            }

            // ── Instrucción + Pregunta ──
            const instruccion = document.createElement('div');
            instruccion.className = 'desafio-instruccion';

            if (datos.instruccion) {
                const h2 = document.createElement('h2');
                h2.textContent = datos.instruccion;
                instruccion.appendChild(h2);
            }

            let preguntaActual = datos.configuracion;

            // Soporte para nuevo formato con múltiples preguntas aleatorias
            if (datos.configuracion?.preguntas && Array.isArray(datos.configuracion.preguntas) && datos.configuracion.preguntas.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * datos.configuracion.preguntas.length);
                preguntaActual = datos.configuracion.preguntas[indiceAleatorio];
            }

            if (preguntaActual?.pregunta) {
                const p = document.createElement('p');
                p.textContent = preguntaActual.pregunta;
                instruccion.appendChild(p);
            }

            contenido.appendChild(instruccion);

            // ── Opciones ──
            const opcionesDiv = document.createElement('div');
            opcionesDiv.className = 'desafio-opciones';

            const opciones = preguntaActual.opciones || [];
            for (const opcion of opciones) {
                const btn = document.createElement('button');
                btn.className = 'btn-opcion';
                btn.type = 'button';
                btn.textContent = opcion.texto;

                btn.addEventListener('click', () => {
                    // Deshabilitar todos los botones
                    const botones = opcionesDiv.querySelectorAll('.btn-opcion');
                    botones.forEach(b => {
                        b.disabled = true;
                        b.style.pointerEvents = 'none';
                    });

                    // Mostrar feedback
                    const feedback = document.createElement('div');
                    feedback.className = `desafio-feedback ${opcion.correcta ? 'exito' : 'fallo'}`;
                    feedback.textContent = opcion.correcta
                        ? '¡Correcto! 🎉'
                        : datos.resultado_fallo?.mensaje || '¡Incorrecto!';
                    contenido.appendChild(feedback);

                    // Reproducir sonido de éxito o fallo
                    if (opcion.correcta) {
                        const sonidoExito = datos.configuracion?.sonido_exito || datos.sonido_exito;
                        if (sonidoExito) {
                            this.#audioManager.reproducirEfecto(sonidoExito);
                        }
                    } else {
                        const sonidoFallo = datos.configuracion?.sonido_fallo || datos.sonido_fallo;
                        if (sonidoFallo) {
                            this.#audioManager.reproducirEfecto(sonidoFallo);
                        }
                    }

                    // Resolver después del feedback
                    setTimeout(() => resolve(opcion.correcta), this.#DELAY_RESOLVER_MS);
                });

                opcionesDiv.appendChild(btn);
            }

            contenido.appendChild(opcionesDiv);
            panelEl.appendChild(contenido);
        });
    }
}
