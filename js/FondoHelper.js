/**
 * FondoHelper — Creación centralizada de fondos (imagen y/o video).
 * 
 * Genera el DOM de fondo para escenas y desafíos.
 * Si hay video Y la feature está habilitada (FeatureFlags.videosHabilitados),
 * lo muestra con fade-in al estar buffereado (canplaythrough),
 * usando la imagen de fondo como respaldo visible durante la carga.
 * 
 * En producción, los videos están deshabilitados por defecto y solo
 * pueden activarse desde el DevPanel (feature experimental).
 */
import { FeatureFlags } from './FeatureFlags.js';

/**
 * Crea el contenedor de fondo con imagen y, opcionalmente, video.
 * 
 * @param {import('./ImagePreloader.js').ImagePreloader} preloader
 * @param {string|null} nombreFondo — Nombre del archivo de imagen de fondo
 * @param {string|null} nombreVideo — Nombre del archivo de video (opcional)
 * @param {string} clase — Clase CSS del contenedor (ej: 'escena-fondo', 'desafio-fondo')
 * @returns {{ contenedor: HTMLDivElement, video: HTMLVideoElement|null }}
 */
export function crearFondo(preloader, nombreFondo, nombreVideo, clase) {
    const contenedor = document.createElement('div');
    contenedor.className = clase;

    // ── Imagen de fondo (siempre presente como base/fallback) ──
    if (nombreFondo) {
        const img = document.createElement('img');
        img.src = preloader.resolverRuta(nombreFondo, 'fondo');
        img.alt = 'Fondo';
        img.loading = 'eager';
        contenedor.appendChild(img);
    }

    // ── Video de fondo (loop, muted, sobre la imagen) ──
    // Solo se crea si la feature está explícitamente habilitada (DevPanel)
    let videoEl = null;

    if (nombreVideo && FeatureFlags.videosHabilitados) {
        videoEl = document.createElement('video');
        videoEl.src = preloader.resolverRutaVideo(nombreVideo);
        videoEl.loop = true;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.preload = 'auto';
        videoEl.setAttribute('playsinline', '');

        // Arranca invisible; la imagen de fondo se muestra debajo
        videoEl.style.opacity = '0';

        // Cuando el buffer está listo para reproducir sin interrupciones
        videoEl.addEventListener('canplaythrough', () => {
            videoEl.play().then(() => {
                // Fade-in del video (la transición está definida en CSS)
                videoEl.style.opacity = '1';
            }).catch(err => {
                console.warn('[FondoHelper] No se pudo reproducir el video:', err);
            });
        }, { once: true });

        contenedor.appendChild(videoEl);
    }

    return { contenedor, video: videoEl };
}
