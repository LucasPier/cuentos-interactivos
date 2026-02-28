/**
 * main.js — Bootstrap del motor del cuento interactivo.
 * 
 * Instancia todos los módulos, registra los handlers de desafíos,
 * e inicializa la Biblioteca del Tío Pier.
 */
import { ContentLoader } from './ContentLoader.js';
import { StateManager } from './StateManager.js';
import { ImagePreloader } from './ImagePreloader.js';
import { SceneRenderer } from './SceneRenderer.js';
import { ChallengeManager } from './ChallengeManager.js';
import { UIManager } from './UIManager.js';
import { AudioManager } from './AudioManager.js';
import { GameEngine } from './GameEngine.js';
import { BibliotecaManager } from './BibliotecaManager.js';
import { EffectsRenderer } from './EffectsRenderer.js';

// Handlers de desafíos
import { PreguntaRealHandler } from './challenges/PreguntaRealHandler.js';
import { ObservacionHandler } from './challenges/ObservacionHandler.js';
import { ClicksHandler } from './challenges/ClicksHandler.js';

// ─── Inicialización ──────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // 1. Instanciar módulos base
    const contentLoader = new ContentLoader();
    const stateManager = new StateManager();
    const preloader = new ImagePreloader();
    const audioManager = new AudioManager();
    const uiManager = new UIManager(audioManager);
    const effectsRenderer = new EffectsRenderer();

    // 2. Instanciar renderizadores
    const sceneRenderer = new SceneRenderer(preloader, effectsRenderer);
    const challengeManager = new ChallengeManager(preloader, effectsRenderer);

    // 3. Registrar handlers de desafíos
    challengeManager.registrar('pregunta_real', new PreguntaRealHandler(audioManager));
    challengeManager.registrar('minijuego_observacion', new ObservacionHandler(audioManager));
    challengeManager.registrar('minijuego_clicks', new ClicksHandler(audioManager));

    // 4. Instanciar el motor de juego
    const engine = new GameEngine({
        contentLoader,
        stateManager,
        preloader,
        sceneRenderer,
        challengeManager,
        uiManager,
        audioManager
    });

    // 5. Instanciar y arrancar la biblioteca
    const biblioteca = new BibliotecaManager({
        engine,
        stateManager,
        audioManager,
        uiManager,
        onMostrarBiblioteca: () => {
            if (devPanel?._abierto) devPanel.cerrar();
        }
    });

    biblioteca.inicializar();

    console.log('[main] La Biblioteca del Tío Pier — Motor inicializado ✨');

    // ─── DevPanel: Modo Desarrollo (lazy) ────────────

    let devPanel = null;

    async function activarDevPanel() {
        if (devPanel) return;
        const { DevPanel } = await import('./DevPanel.js');
        devPanel = new DevPanel({ engine, stateManager });
        await devPanel.activar();
        window.devPanel = devPanel;
    }

    function toggleDevPanel() {
        // No permitir DevPanel si no hay historia cargada
        if (!engine.configActual) return;
        if (!devPanel) {
            activarDevPanel();
        } else {
            // Toggle: si está abierto cerrar, si cerrado abrir
            if (devPanel._abierto) {
                devPanel.cerrar();
            } else {
                devPanel.abrir();
            }
        }
    }

    // Detección por URL (?dev=true)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
        activarDevPanel();
    }

    // Atajo global: Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleDevPanel();
        }
    });

    // 6. Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        let isFirstInstall = true;

        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('[Service Worker] Registrado con éxito:', registration.scope);

                // Si ya había un controlador al registrar, no es la primera instalación
                if (navigator.serviceWorker.controller) {
                    isFirstInstall = false;
                    navigator.serviceWorker.controller.postMessage({ tipo: 'GET_VERSION' });
                }
            })
            .catch(error => {
                console.error('[Service Worker] Falló el registro:', error);
            });

        // Escuchar el mensaje de actualización de versión
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.tipo === 'VERSION_UPDATE') {
                const divVersion = document.getElementById('version-app');
                if (divVersion) {
                    divVersion.textContent = `v${event.data.version}`;
                    divVersion.classList.add('visible');
                }
            }
        });

        // Escuchar cuando el SW toma el control para refrescar la app,
        // evitando el reload infinito en la primera carga
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!isFirstInstall) {
                console.log('[Service Worker] Nueva versión instalada, recargando...');
                window.location.reload();
            }
        });
    }

    // 7. Manejo del Prompt de Instalación (PWA)
    window.addEventListener('beforeinstallprompt', (e) => {
        // Evitamos que el navegador muestre el prompt nativo
        e.preventDefault();
        console.log('[main] beforeinstallprompt interceptado');

        // Le pasamos el control a la biblioteca
        biblioteca.mostrarBotonInstalacion(e);
    });

    // 8. Ocultar el botón si la app ya fue instalada o si se instala
    window.addEventListener('appinstalled', () => {
        console.log('[main] PWA instalada exitosamente');
        biblioteca.ocultarBotonInstalacion();
    });
});
