/**
 * DevPanel — Panel de desarrollo integrado al motor de juego.
 * 
 * Facilita testing y depuración: navegación rápida entre escenas,
 * inspector de escena/estado, manipulación de recompensas y toggles dev.
 * 
 * Impacto cero cuando está desactivado: se carga vía import() dinámico,
 * su CSS se inyecta/remueve condicionalmente, y no deja listeners ni DOM
 * residual al desactivarse.
 */
import { FeatureFlags } from './FeatureFlags.js';

export class DevPanel {

    /** @type {import('./GameEngine.js').GameEngine} */
    #engine;
    /** @type {import('./StateManager.js').StateManager} */
    #stateManager;
    /** @type {import('./AudioManager.js').AudioManager} */
    #audioManager;

    /** @type {HTMLDivElement|null} */
    #panelEl = null;
    /** @type {HTMLButtonElement|null} */
    #btnToggleEl = null;
    /** @type {HTMLLinkElement|null} */
    #linkCssEl = null;

    /** @type {boolean} */
    #abierto = false;
    /** @type {boolean} */
    #activo = false;

    /** Función de unsuscripción del callback onCambioEscena */
    #unsubCambioEscena = null;

    /** Datos cacheados de la escena/desafío actual */
    #escenaActualId = null;
    #escenaActualTipo = null;
    #escenaActualDatos = null;

    /** Config dev persistida en sessionStorage */
    #devConfig = {
        sinFullscreen: false,
        sinTransiciones: false,
        sinAudio: false,
        conVideos: false
    };

    /** Referencia original a requestFullscreen para restaurar */
    #requestFullscreenOriginal = null;

    constructor({ engine, stateManager, audioManager }) {
        this.#engine = engine;
        this.#stateManager = stateManager;
        this.#audioManager = audioManager;
    }

    // ─── API Pública ────────────────────────────────

    /**
     * Activa el modo desarrollo: inyecta CSS, crea panel, registra eventos.
     * Es async porque espera a que el CSS cargue antes de crear el DOM
     * (evita transición visible al insertar el panel cerrado sin estilos).
     */
    async activar() {
        if (this.#activo) return;
        this.#activo = true;

        this.#restaurarDevConfig();
        await this.#inyectarCSS();
        this.#crearPanel();
        this.#crearBotonToggle();
        this.#suscribirEventos();
        this.#aplicarDevConfig();

        console.log('%c[DevPanel] Modo desarrollo activado 🛠️', 'color: #a7f3d0; font-weight: bold;');
    }

    /**
     * Desactiva completamente el modo desarrollo.
     */
    desactivar() {
        if (!this.#activo) return;

        this.cerrar();
        this.#desuscribirEventos();
        this.#restaurarFullscreen();
        this.#restaurarTransiciones();
        this.#restaurarAudio();

        // Remover elementos del DOM
        if (this.#panelEl) {
            this.#panelEl.remove();
            this.#panelEl = null;
        }
        if (this.#btnToggleEl) {
            this.#btnToggleEl.remove();
            this.#btnToggleEl = null;
        }
        if (this.#linkCssEl) {
            this.#linkCssEl.remove();
            this.#linkCssEl = null;
        }

        this.#activo = false;
        delete window.devPanel;

        console.log('%c[DevPanel] Modo desarrollo desactivado', 'color: #fca5a5; font-weight: bold;');
    }

    /**
     * Abre el panel (solo si hay historia activa).
     */
    abrir() {
        if (!this.#activo || this.#abierto) return;
        if (!this.#engine.configActual) return;
        this.#abierto = true;
        this.#panelEl.classList.remove('dev-panel--cerrado');
        this.#refrescarTodo();
    }

    /**
     * Cierra el panel.
     */
    cerrar() {
        if (!this.#abierto) return;
        this.#abierto = false;
        if (this.#panelEl) {
            this.#panelEl.classList.add('dev-panel--cerrado');
        }
    }

    /**
     * Indica si el panel está abierto (solo lectura, para toggle externo).
     * @returns {boolean}
     */
    get _abierto() {
        return this.#abierto;
    }

    /**
     * Navega a una escena o desafío.
     * @param {string} id
     * @param {string} tipo — 'escena' o 'desafio'
     */
    async ir(id, tipo = 'escena') {
        if (!this.#engine.configActual) {
            console.warn('[DevPanel] No hay historia cargada. Entrá a una historia primero.');
            return;
        }
        await this.#engine.navegarA(id, tipo);
    }

    /**
     * Imprime el estado actual en consola.
     */
    estado() {
        const data = {
            historia: this.#stateManager.getHistoriaActual(),
            escenaActual: this.#stateManager.getEscenaActual(),
            recompensas: this.#stateManager.getRecompensas(),
            historial: this.#stateManager.getHistorial()
        };
        console.table(data);
        return data;
    }

    /**
     * Otorga una recompensa.
     * @param {string} nombre
     */
    otorgar(nombre) {
        this.#stateManager.otorgarRecompensa(nombre);
        if (this.#abierto) this.#refrescarEstado();
    }

    /**
     * Revoca una recompensa.
     * @param {string} nombre
     */
    revocar(nombre) {
        this.#stateManager.revocarRecompensa(nombre);
        if (this.#abierto) this.#refrescarEstado();
    }

    // ─── Inyección de CSS ───────────────────────────

    #inyectarCSS() {
        if (this.#linkCssEl) return Promise.resolve();
        return new Promise((resolve) => {
            this.#linkCssEl = document.createElement('link');
            this.#linkCssEl.rel = 'stylesheet';
            this.#linkCssEl.href = 'css/dev-panel.css';
            this.#linkCssEl.id = 'dev-panel-css';
            this.#linkCssEl.onload = resolve;
            this.#linkCssEl.onerror = resolve; // No bloquear si falla la carga
            document.head.appendChild(this.#linkCssEl);
        });
    }

    // ─── Creación del Panel ─────────────────────────

    #crearPanel() {
        this.#panelEl = document.createElement('div');
        this.#panelEl.id = 'panel-dev';
        this.#panelEl.classList.add('dev-panel--cerrado');

        this.#panelEl.innerHTML = this.#generarHTML();

        document.getElementById('juego').appendChild(this.#panelEl);

        // Bind de eventos internos
        this.#bindEventosPanel();
    }

    #generarHTML() {
        return `
            <div class="dev-panel-header">
                <h2>🛠️ DevPanel</h2>
                <button class="dev-panel-cerrar" data-dev-action="cerrar" title="Cerrar">✕</button>
            </div>

            <!-- Sección: Navegación Rápida -->
            <div class="dev-seccion abierta" data-dev-seccion="nav">
                <div class="dev-seccion-header">
                    <h3>Navegación Rápida</h3>
                    <span class="dev-seccion-flecha">▶</span>
                </div>
                <div class="dev-seccion-contenido">
                    <div class="dev-fila">
                        <input type="text" class="dev-input" id="dev-nav-input" placeholder="ID (ej: ZONA_RIO)">
                        <button class="dev-btn dev-btn--primario" data-dev-action="ir-input">Ir</button>
                    </div>
                    <div class="dev-label">Escenas</div>
                    <div class="dev-fila">
                        <select class="dev-select" id="dev-nav-escenas">
                            <option value="">— Seleccionar —</option>
                        </select>
                        <button class="dev-btn" data-dev-action="ir-escena">Ir</button>
                    </div>
                    <div class="dev-label">Desafíos</div>
                    <div class="dev-fila">
                        <select class="dev-select" id="dev-nav-desafios">
                            <option value="">— Seleccionar —</option>
                        </select>
                        <button class="dev-btn" data-dev-action="ir-desafio">Ir</button>
                    </div>
                    <div id="dev-nav-mensaje" class="dev-sin-historia" style="display:none;"></div>
                </div>
            </div>

            <!-- Sección: Inspector de Escena -->
            <div class="dev-seccion abierta" data-dev-seccion="inspector">
                <div class="dev-seccion-header">
                    <h3>Inspector de Escena</h3>
                    <span class="dev-seccion-flecha">▶</span>
                </div>
                <div class="dev-seccion-contenido" id="dev-inspector-contenido">
                    <div class="dev-sin-historia">Navegá a una escena para inspeccionar.</div>
                </div>
            </div>

            <!-- Sección: Inspector de Estado -->
            <div class="dev-seccion" data-dev-seccion="estado">
                <div class="dev-seccion-header">
                    <h3>Estado (localStorage)</h3>
                    <span class="dev-seccion-flecha">▶</span>
                </div>
                <div class="dev-seccion-contenido" id="dev-estado-contenido">
                    <div class="dev-sin-historia">Sin historia activa.</div>
                </div>
            </div>

            <!-- Sección: Configuración -->
            <div class="dev-seccion" data-dev-seccion="config">
                <div class="dev-seccion-header">
                    <h3>Configuración Dev</h3>
                    <span class="dev-seccion-flecha">▶</span>
                </div>
                <div class="dev-seccion-contenido" id="dev-config-contenido">
                    <div class="dev-toggle-fila">
                        <span class="dev-toggle-label">Deshabilitar fullscreen</span>
                        <label class="dev-toggle">
                            <input type="checkbox" id="dev-toggle-fullscreen">
                            <span class="dev-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="dev-toggle-fila">
                        <span class="dev-toggle-label">Deshabilitar transiciones</span>
                        <label class="dev-toggle">
                            <input type="checkbox" id="dev-toggle-transiciones">
                            <span class="dev-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="dev-toggle-fila">
                        <span class="dev-toggle-label">Deshabilitar audio</span>
                        <label class="dev-toggle">
                            <input type="checkbox" id="dev-toggle-audio">
                            <span class="dev-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="dev-toggle-fila">
                        <span class="dev-toggle-label">Habilitar videos <small style="opacity:0.55;font-size:10px">(experimental)</small></span>
                        <label class="dev-toggle">
                            <input type="checkbox" id="dev-toggle-videos">
                            <span class="dev-toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    // ─── Botón Toggle (🛠️) ──────────────────────────

    #crearBotonToggle() {
        this.#btnToggleEl = document.createElement('button');
        this.#btnToggleEl.id = 'btn-dev-panel';
        this.#btnToggleEl.classList.add('btn-ui');
        this.#btnToggleEl.textContent = '🛠️';
        this.#btnToggleEl.title = 'Panel de Desarrollo (Ctrl+Shift+D)';
        this.#btnToggleEl.addEventListener('click', () => {
            if (this.#abierto) this.cerrar();
            else this.abrir();
        });

        const controles = document.querySelector('.ui-controles--izquierda');
        if (controles) {
            controles.appendChild(this.#btnToggleEl);
        }
    }

    // ─── Eventos del Panel ──────────────────────────

    #bindEventosPanel() {
        // Delegación de eventos en el panel
        this.#panelEl.addEventListener('click', (e) => {
            const target = e.target.closest('[data-dev-action]');
            if (target) {
                this.#manejarAccion(target.dataset.devAction, target);
                return;
            }

            // Toggle de secciones (acordeón)
            const header = e.target.closest('.dev-seccion-header');
            if (header) {
                const seccion = header.closest('.dev-seccion');
                seccion.classList.toggle('abierta');
                return;
            }
        });

        // Enter en el input de navegación
        const navInput = this.#panelEl.querySelector('#dev-nav-input');
        if (navInput) {
            navInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.#manejarAccion('ir-input');
                }
            });
        }

        // Toggles de configuración
        this.#panelEl.querySelector('#dev-toggle-fullscreen')?.addEventListener('change', (e) => {
            this.#devConfig.sinFullscreen = e.target.checked;
            this.#aplicarToggleFullscreen();
            this.#persistirDevConfig();
        });

        this.#panelEl.querySelector('#dev-toggle-transiciones')?.addEventListener('change', (e) => {
            this.#devConfig.sinTransiciones = e.target.checked;
            this.#aplicarToggleTransiciones();
            this.#persistirDevConfig();
        });

        this.#panelEl.querySelector('#dev-toggle-audio')?.addEventListener('change', (e) => {
            this.#devConfig.sinAudio = e.target.checked;
            this.#aplicarToggleAudio();
            this.#persistirDevConfig();
        });

        this.#panelEl.querySelector('#dev-toggle-videos')?.addEventListener('change', (e) => {
            this.#devConfig.conVideos = e.target.checked;
            this.#aplicarToggleVideos();
            this.#persistirDevConfig();
        });
    }

    #manejarAccion(accion, targetEl) {
        switch (accion) {
            case 'cerrar':
                this.cerrar();
                break;

            case 'ir-input': {
                const input = this.#panelEl.querySelector('#dev-nav-input');
                const id = input?.value.trim().toUpperCase();
                if (!id) return;
                // Heurística: si empieza con DESAFIO_ es un desafío
                const tipo = id.startsWith('DESAFIO_') ? 'desafio' : 'escena';
                this.ir(id, tipo);
                break;
            }

            case 'ir-escena': {
                const select = this.#panelEl.querySelector('#dev-nav-escenas');
                if (select?.value) this.ir(select.value, 'escena');
                break;
            }

            case 'ir-desafio': {
                const select = this.#panelEl.querySelector('#dev-nav-desafios');
                if (select?.value) this.ir(select.value, 'desafio');
                break;
            }

            case 'otorgar-recompensa': {
                const input = this.#panelEl.querySelector('#dev-recompensa-input');
                const nombre = input?.value.trim();
                if (!nombre) return;
                this.otorgar(nombre);
                input.value = '';
                break;
            }

            case 'revocar-recompensa': {
                const nombre = targetEl?.dataset.devRecompensa;
                if (nombre) this.revocar(nombre);
                break;
            }

            case 'limpiar-estado':
                this.#stateManager.reiniciar();
                this.#refrescarEstado();
                console.log('[DevPanel] Estado de la historia reiniciado');
                break;

            case 'limpiar-todo':
                this.#limpiarTodoLocalStorage();
                this.#refrescarEstado();
                console.log('[DevPanel] Todo el localStorage limpiado');
                break;
        }
    }

    // ─── Suscripción a Eventos ──────────────────────

    #suscribirEventos() {
        // Callback de cambio de escena
        this.#unsubCambioEscena = this.#engine.onCambioEscena((id, tipo, datos) => {
            this.#escenaActualId = id;
            this.#escenaActualTipo = tipo;
            this.#escenaActualDatos = datos;

            if (this.#abierto) {
                this.#refrescarInspector();
                this.#refrescarEstado();
                this.#refrescarSelectsNavegacion();
            }
        });
    }

    #desuscribirEventos() {
        if (this.#unsubCambioEscena) {
            this.#unsubCambioEscena();
            this.#unsubCambioEscena = null;
        }
    }

    // ─── Refresco de contenido ──────────────────────

    #refrescarTodo() {
        this.#refrescarSelectsNavegacion();
        this.#refrescarInspector();
        this.#refrescarEstado();
        this.#refrescarTogglesConfig();
    }

    // ── Navegación ──

    #refrescarSelectsNavegacion() {
        const config = this.#engine.configActual;
        const msgEl = this.#panelEl.querySelector('#dev-nav-mensaje');

        if (!config) {
            // Sin historia cargada
            msgEl.textContent = 'Entrá a una historia primero.';
            msgEl.style.display = '';
            return;
        }

        msgEl.style.display = 'none';

        // Poblar select de escenas
        const selectEscenas = this.#panelEl.querySelector('#dev-nav-escenas');
        if (selectEscenas && config.escenas) {
            const valorActual = selectEscenas.value;
            selectEscenas.innerHTML = '<option value="">— Seleccionar —</option>';
            for (const id of config.escenas) {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = id;
                if (id === this.#escenaActualId && this.#escenaActualTipo === 'escena') {
                    opt.textContent = `▸ ${id}`;
                }
                selectEscenas.appendChild(opt);
            }
            selectEscenas.value = valorActual;
        }

        // Poblar select de desafíos
        const selectDesafios = this.#panelEl.querySelector('#dev-nav-desafios');
        if (selectDesafios && config.desafios) {
            const valorActual = selectDesafios.value;
            selectDesafios.innerHTML = '<option value="">— Seleccionar —</option>';
            for (const id of config.desafios) {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = id;
                if (id === this.#escenaActualId && this.#escenaActualTipo === 'desafio') {
                    opt.textContent = `▸ ${id}`;
                }
                selectDesafios.appendChild(opt);
            }
            selectDesafios.value = valorActual;
        }
    }

    // ── Inspector de Escena ──

    #refrescarInspector() {
        const contenedor = this.#panelEl.querySelector('#dev-inspector-contenido');
        if (!contenedor) return;

        if (!this.#escenaActualDatos) {
            contenedor.innerHTML = '<div class="dev-sin-historia">Navegá a una escena para inspeccionar.</div>';
            return;
        }

        const datos = this.#escenaActualDatos;
        const tipo = this.#escenaActualTipo;
        let html = '';

        // Datos básicos
        html += this.#htmlDato('ID', this.#escenaActualId);
        html += this.#htmlDato('Tipo', tipo);
        if (tipo === 'desafio' && datos.subtipo) {
            html += this.#htmlDato('Subtipo', datos.subtipo);
        }
        if (datos.fondo) {
            html += this.#htmlDato('Fondo', datos.fondo);
        }
        html += this.#htmlDato('Audio', datos.audio || 'Sin audio');

        // Elementos (escenas)
        if (datos.elementos && datos.elementos.length > 0) {
            html += '<div class="dev-separador"></div>';
            html += '<div class="dev-label">Elementos</div>';
            html += '<ul class="dev-lista">';
            for (const el of datos.elementos) {
                const pos = el.estilo ? `(${el.estilo.x}%, ${el.estilo.y}%)` : '';
                const ancho = el.estilo?.ancho ? ` w:${el.estilo.ancho}%` : '';
                const anim = el.animacion ? ` 🎬${el.animacion}` : '';
                html += `<li><span>${el.tipo || '?'}:${el.id || el.imagen || '?'}</span><span style="opacity:0.5">${pos}${ancho}${anim}</span></li>`;
            }
            html += '</ul>';
        }

        // Efectos
        if (datos.efectos && datos.efectos.length > 0) {
            html += '<div class="dev-separador"></div>';
            html += '<div class="dev-label">Efectos</div>';
            html += '<ul class="dev-lista">';
            for (const ef of datos.efectos) {
                html += `<li>${ef.tipo} — ${ef.color || ''} ×${ef.cantidad || ''}</li>`;
            }
            html += '</ul>';
        }

        // Opciones (escenas)
        if (datos.opciones && datos.opciones.length > 0) {
            html += '<div class="dev-separador"></div>';
            html += '<div class="dev-label">Opciones</div>';
            for (const op of datos.opciones) {
                const visible = this.#stateManager.evaluarCondicion(op.condicion);
                const clasesOculta = visible ? '' : ' dev-opcion--oculta';
                html += `<div class="dev-opcion${clasesOculta}">`;
                html += `<div>${visible ? '✅' : '🚫'} ${this.#escape(op.texto)}</div>`;
                html += `<div class="dev-opcion-target">→ ${op.target || '?'} (${op.tipo_target || op.accion || 'escena'})</div>`;
                if (op.condicion) {
                    html += `<div class="dev-opcion-condicion">condición: ${op.condicion} ${visible ? '✓' : '✗'}</div>`;
                }
                html += '</div>';
            }
        }

        // Respuesta correcta (desafíos)
        if (tipo === 'desafio' && datos.configuracion) {
            html += '<div class="dev-separador"></div>';
            html += this.#renderRespuestaCorrecta(datos);
        }

        // Destinos (desafíos)
        if (tipo === 'desafio') {
            html += '<div class="dev-separador"></div>';
            html += '<div class="dev-label">Destinos</div>';
            if (datos.resultado_exito) {
                html += this.#htmlDato('Éxito →', datos.resultado_exito.target || '?');
                if (datos.resultado_exito.recompensa) {
                    html += this.#htmlDato('Recompensa', datos.resultado_exito.recompensa);
                }
            }
            if (datos.resultado_fallo) {
                html += this.#htmlDato('Fallo →', datos.resultado_fallo.target || '?');
            }
        }

        contenedor.innerHTML = html;
    }

    #renderRespuestaCorrecta(datos) {
        const config = datos.configuracion;
        let html = '<div class="dev-label">Respuesta Correcta</div>';

        switch (datos.subtipo) {
            case 'pregunta_real': {
                if (config.preguntas) {
                    for (const p of config.preguntas) {
                        const correcta = p.opciones?.find(o => o.correcta);
                        html += '<div class="dev-respuesta-correcta">';
                        html += `<div style="font-size:11px;opacity:0.7;margin-bottom:2px">${this.#escape(p.pregunta)}</div>`;
                        html += `<strong>${correcta ? this.#escape(correcta.texto) : '?'}</strong>`;
                        html += '</div>';
                    }
                }
                break;
            }

            case 'minijuego_observacion': {
                const objetivo = config.objetivo || '?';
                const aleatorio = config.correcto_aleatorio ? ' (aleatorio)' : '';
                html += `<div class="dev-respuesta-correcta"><strong>Objetivo:</strong> ${this.#escape(objetivo)}${aleatorio}</div>`;
                if (config.elementos_interactivos) {
                    html += '<div class="dev-label" style="margin-top:4px">Elementos interactivos</div>';
                    html += '<ul class="dev-lista">';
                    for (const ei of config.elementos_interactivos) {
                        html += `<li>${ei.id} — (${ei.x}%, ${ei.y}%) w:${ei.ancho}%</li>`;
                    }
                    html += '</ul>';
                }
                break;
            }

            case 'minijuego_clicks': {
                html += `<div class="dev-respuesta-correcta"><strong>Clicks necesarios:</strong> ${config.objetivo_clicks || '?'}</div>`;
                if (config.mensajes_progreso) {
                    html += '<ul class="dev-lista">';
                    for (let i = 0; i < config.mensajes_progreso.length; i++) {
                        html += `<li>${i + 1}. ${this.#escape(config.mensajes_progreso[i])}</li>`;
                    }
                    html += '</ul>';
                }
                break;
            }

            default:
                html += `<div class="dev-respuesta-correcta"><em>Subtipo desconocido: ${datos.subtipo || '?'}</em></div>`;
        }

        return html;
    }

    // ── Inspector de Estado ──

    #refrescarEstado() {
        const contenedor = this.#panelEl.querySelector('#dev-estado-contenido');
        if (!contenedor) return;

        const historiaId = this.#stateManager.getHistoriaActual();
        if (!historiaId) {
            contenedor.innerHTML = '<div class="dev-sin-historia">Sin historia activa.</div>';
            return;
        }

        const config = this.#engine.configActual;
        const recompensas = this.#stateManager.getRecompensas();
        const historial = this.#stateManager.getHistorial();
        const escenaActual = this.#stateManager.getEscenaActual();

        let html = '';

        // Info de historia
        html += this.#htmlDato('Historia', config?.titulo || historiaId);
        html += this.#htmlDato('ID', historiaId);
        html += this.#htmlDato('Escena actual', escenaActual || 'Ninguna');

        // Historial
        html += '<div class="dev-separador"></div>';
        html += '<div class="dev-label">Historial</div>';
        if (historial.length > 0) {
            html += '<ul class="dev-lista">';
            for (let i = historial.length - 1; i >= 0; i--) {
                const esActual = historial[i] === escenaActual && i === historial.length - 1;
                html += `<li class="${esActual ? 'dev-lista-actual' : ''}">${i + 1}. ${historial[i]}</li>`;
            }
            html += '</ul>';
        } else {
            html += '<div style="font-size:11px;opacity:0.4;padding:4px 0;">Vacío</div>';
        }

        // Recompensas
        html += '<div class="dev-separador"></div>';
        html += '<div class="dev-label">Recompensas</div>';
        const nombresRecompensas = Object.keys(recompensas);
        if (nombresRecompensas.length > 0) {
            html += '<ul class="dev-lista">';
            for (const nombre of nombresRecompensas) {
                html += `<li class="dev-recompensa">
                    <span>✅ ${this.#escape(nombre)}</span>
                    <button class="dev-recompensa-borrar" data-dev-action="revocar-recompensa" data-dev-recompensa="${this.#escape(nombre)}" title="Revocar">✕</button>
                </li>`;
            }
            html += '</ul>';
        } else {
            html += '<div style="font-size:11px;opacity:0.4;padding:4px 0;">Sin recompensas</div>';
        }

        // Input para otorgar
        html += '<div class="dev-fila" style="margin-top:6px;">';
        html += '<input type="text" class="dev-input" id="dev-recompensa-input" placeholder="nombre_recompensa">';
        html += '<button class="dev-btn" data-dev-action="otorgar-recompensa">Otorgar</button>';
        html += '</div>';

        // Enter en el input de recompensa
        html += '<div class="dev-separador"></div>';

        // Botones de limpieza
        html += '<div class="dev-fila">';
        html += '<button class="dev-btn dev-btn--peligro" data-dev-action="limpiar-estado">Limpiar estado</button>';
        html += '<button class="dev-btn dev-btn--peligro" data-dev-action="limpiar-todo">Limpiar todo</button>';
        html += '</div>';

        contenedor.innerHTML = html;

        // Rebind del enter en input de recompensa
        const recompInput = contenedor.querySelector('#dev-recompensa-input');
        if (recompInput) {
            recompInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.#manejarAccion('otorgar-recompensa');
                }
            });
        }
    }

    // ── Configuración Dev ──

    #refrescarTogglesConfig() {
        const tFullscreen = this.#panelEl.querySelector('#dev-toggle-fullscreen');
        const tTransiciones = this.#panelEl.querySelector('#dev-toggle-transiciones');
        const tAudio = this.#panelEl.querySelector('#dev-toggle-audio');
        const tVideos = this.#panelEl.querySelector('#dev-toggle-videos');

        if (tFullscreen) tFullscreen.checked = this.#devConfig.sinFullscreen;
        if (tTransiciones) tTransiciones.checked = this.#devConfig.sinTransiciones;
        if (tAudio) tAudio.checked = this.#devConfig.sinAudio;
        if (tVideos) tVideos.checked = this.#devConfig.conVideos;
    }

    #aplicarDevConfig() {
        this.#aplicarToggleFullscreen();
        this.#aplicarToggleTransiciones();
        this.#aplicarToggleAudio();
        this.#aplicarToggleVideos();
    }

    #aplicarToggleVideos() {
        FeatureFlags.videosHabilitados = this.#devConfig.conVideos;
        console.log(`[DevPanel] Videos de fondo: ${this.#devConfig.conVideos ? 'habilitados ▶' : 'deshabilitados ✕'}`);
    }

    #aplicarToggleFullscreen() {
        if (this.#devConfig.sinFullscreen) {
            if (!this.#requestFullscreenOriginal) {
                this.#requestFullscreenOriginal = Element.prototype.requestFullscreen;
                Element.prototype.requestFullscreen = function () {
                    console.log('[DevPanel] requestFullscreen bloqueado');
                    return Promise.resolve();
                };
            }
        } else {
            this.#restaurarFullscreen();
        }
    }

    #restaurarFullscreen() {
        if (this.#requestFullscreenOriginal) {
            Element.prototype.requestFullscreen = this.#requestFullscreenOriginal;
            this.#requestFullscreenOriginal = null;
        }
    }

    #aplicarToggleTransiciones() {
        const root = document.documentElement.style;
        if (this.#devConfig.sinTransiciones) {
            root.setProperty('--transicion-escena', '0ms');
            root.setProperty('--transicion-base', '0ms');
            root.setProperty('--transicion-lenta', '0ms');
        } else {
            this.#restaurarTransiciones();
        }
    }

    #restaurarTransiciones() {
        const root = document.documentElement.style;
        root.removeProperty('--transicion-escena');
        root.removeProperty('--transicion-base');
        root.removeProperty('--transicion-lenta');
    }

    #aplicarToggleAudio() {
        this.#audioManager.devSilenciado = this.#devConfig.sinAudio;
    }

    #restaurarAudio() {
        this.#audioManager.devSilenciado = false;
    }

    // ─── Persistencia dev config ────────────────────

    #persistirDevConfig() {
        try {
            sessionStorage.setItem('dev_config', JSON.stringify(this.#devConfig));
        } catch (e) { /* no crítico */ }
    }

    #restaurarDevConfig() {
        try {
            const guardado = sessionStorage.getItem('dev_config');
            if (guardado) {
                const datos = JSON.parse(guardado);
                this.#devConfig = {
                    sinFullscreen: datos.sinFullscreen ?? false,
                    sinTransiciones: datos.sinTransiciones ?? false,
                    sinAudio: datos.sinAudio ?? false,
                    conVideos: datos.conVideos ?? false
                };
            }
        } catch (e) { /* no crítico */ }
    }

    // ─── Utilidades ─────────────────────────────────

    #limpiarTodoLocalStorage() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('biblioteca')) {
                keys.push(key);
            }
        }
        for (const key of keys) {
            localStorage.removeItem(key);
        }
    }

    #htmlDato(key, value) {
        return `<div class="dev-dato"><span class="dev-dato-key">${key}:</span><span class="dev-dato-value">${this.#escape(String(value))}</span></div>`;
    }

    #escape(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
