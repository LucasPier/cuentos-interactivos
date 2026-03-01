'use strict';
(() => {
    // Versión general de la aplicación 
    const VERSION_APP = "1.1.1";

    // Versiones de caché
    const CACHE_BIBLIOTECA = '2',
        CACHE_CSS = '5',
        CACHE_JS = '5',
        CACHE_CHALLENGES = '3',
        CACHE_EMBE_IMAGENES = '2',
        CACHE_EMBE_AUDIOS = '1',
        CACHE_EMBE_VIDEOS = '2',
        CACHE_EMBE_DATOS = '4',
        CACHE_FONTS = '1';

    const NOMBRE_CACHE_FONTS = `cache-fonts-v${CACHE_FONTS}`;

    // Ruta de El Misterio del Bosque Encantado
    const RUTA_EMBE = 'historias/el-misterio-del-bosque-encantado';

    // Matriz de cachés y sus archivos
    const RUTAS_CACHE = [
        {
            nombre: `cache-biblioteca-v${CACHE_BIBLIOTECA}`,
            archivos: [
                './',
                'index.html',
                'manifest.json',
                'biblioteca/historias.json',
                'biblioteca/imagenes/fondo.webp',
                'biblioteca/imagenes/iconos/favicon.png',
                'biblioteca/imagenes/iconos/icono_192.png',
                'biblioteca/imagenes/iconos/icono_180.png',
                'css/biblioteca.css',
                'js/BibliotecaManager.js'
            ]
        },
        {
            nombre: `cache-css-v${CACHE_CSS}`,
            archivos: [
                'css/animaciones.css',
                'css/desafios.css',
                'css/escena.css',
                'css/inicio.css',
                'css/layout.css',
                'css/reset.css',
                'css/ui.css',
                'css/variables.css'
            ]
        },
        {
            nombre: `cache-js-v${CACHE_JS}`,
            archivos: [
                'js/AudioManager.js',
                'js/ChallengeManager.js',
                'js/ContentLoader.js',
                'js/EffectsRenderer.js',
                'js/FeatureFlags.js',
                'js/FondoHelper.js',
                'js/GameEngine.js',
                'js/ImagePreloader.js',
                'js/main.js',
                'js/SceneRenderer.js',
                'js/StateManager.js',
                'js/UIManager.js'
            ]
        },
        {
            nombre: `cache-challenges-v${CACHE_CHALLENGES}`,
            archivos: [
                'js/challenges/ClicksHandler.js',
                'js/challenges/ObservacionHandler.js',
                'js/challenges/PreguntaRealHandler.js'
            ]
        },
        {
            nombre: `cache-embe-datos-v${CACHE_EMBE_DATOS}`,
            archivos: [
                RUTA_EMBE + '/historia.json',
                RUTA_EMBE + '/datos/desafios/DESAFIO_ACERTIJO_DUENDE.json',
                RUTA_EMBE + '/datos/desafios/DESAFIO_BUSCAR_HONGO.json',
                RUTA_EMBE + '/datos/desafios/DESAFIO_INICIAL.json',
                RUTA_EMBE + '/datos/desafios/DESAFIO_LANZAR_PIEDRA.json',
                RUTA_EMBE + '/datos/escenas/CAMINO_CASA_BRUJA.json',
                RUTA_EMBE + '/datos/escenas/CAMINO_SECRETO_CASA_BRUJA.json',
                RUTA_EMBE + '/datos/escenas/CASA_BRUJA_EXTERIOR.json',
                RUTA_EMBE + '/datos/escenas/DECISION_FINAL.json',
                RUTA_EMBE + '/datos/escenas/ENCUENTRO_PADRES.json',
                RUTA_EMBE + '/datos/escenas/ENCUENTRO_TIO_PIER.json',
                RUTA_EMBE + '/datos/escenas/ENCUENTRO_TIO_PIER_2.json',
                RUTA_EMBE + '/datos/escenas/ENTRADA_BOSQUE.json',
                RUTA_EMBE + '/datos/escenas/FINAL_BUENO.json',
                RUTA_EMBE + '/datos/escenas/FINAL_CORTO_1.json',
                RUTA_EMBE + '/datos/escenas/FINAL_CORTO_2.json',
                RUTA_EMBE + '/datos/escenas/FINAL_MALO.json',
                RUTA_EMBE + '/datos/escenas/FINAL_SECRETO.json',
                RUTA_EMBE + '/datos/escenas/FLORES_AYUDA_INDI.json',
                RUTA_EMBE + '/datos/escenas/FLORES_CHARCO.json',
                RUTA_EMBE + '/datos/escenas/FLORES_COSQUILLAS.json',
                RUTA_EMBE + '/datos/escenas/FLORES_NO_AYUDA_INDI.json',
                RUTA_EMBE + '/datos/escenas/FLORES_PISTAS.json',
                RUTA_EMBE + '/datos/escenas/FLORES_PREGUNTAR.json',
                RUTA_EMBE + '/datos/escenas/HABLAR_CON_ROMI.json',
                RUTA_EMBE + '/datos/escenas/INICIO.json',
                RUTA_EMBE + '/datos/escenas/INTERIOR_CASA_BRUJA.json',
                RUTA_EMBE + '/datos/escenas/RIO_DUENDE.json',
                RUTA_EMBE + '/datos/escenas/RIO_DUENDE_FALLO.json',
                RUTA_EMBE + '/datos/escenas/RIO_DUENDE_RECOMPENSA.json',
                RUTA_EMBE + '/datos/escenas/RIO_HABLAR_DUENDE.json',
                RUTA_EMBE + '/datos/escenas/RIO_HABLAR_DUENDE_2.json',
                RUTA_EMBE + '/datos/escenas/RIO_PUENTE_MAGICO.json',
                RUTA_EMBE + '/datos/escenas/RIO_SAPO.json',
                RUTA_EMBE + '/datos/escenas/TIO_PIER_RECOMPENSA.json',
                RUTA_EMBE + '/datos/escenas/FLORES_CHARCO_VISION.json',
                RUTA_EMBE + '/datos/escenas/ZONA_FLORES.json',
                RUTA_EMBE + '/datos/escenas/ZONA_RIO.json'
            ],
            version: CACHE_EMBE_DATOS
        },
        {
            nombre: `cache-embe-audios-v${CACHE_EMBE_AUDIOS}`,
            archivos: [
                RUTA_EMBE + '/audios/aventuras.mp3',
                RUTA_EMBE + '/audios/boing.mp3',
                RUTA_EMBE + '/audios/bosque.mp3',
                RUTA_EMBE + '/audios/celebracion.mp3',
                RUTA_EMBE + '/audios/el_misterio_del_bosque_encantado.mp3',
                RUTA_EMBE + '/audios/exploracion.mp3',
                RUTA_EMBE + '/audios/magico.mp3',
                RUTA_EMBE + '/audios/piedra.mp3',
                RUTA_EMBE + '/audios/piedra_agua.mp3',
                RUTA_EMBE + '/audios/plop.mp3',
                RUTA_EMBE + '/audios/respuesta_correcta.mp3',
                RUTA_EMBE + '/audios/respuesta_incorrecta.mp3',
                RUTA_EMBE + '/audios/risa_hongo.mp3',
                RUTA_EMBE + '/audios/suspenso.mp3',
                RUTA_EMBE + '/audios/triste.mp3',
                RUTA_EMBE + '/audios/uiii.mp3'
            ],
            version: CACHE_EMBE_AUDIOS
        },
        {
            nombre: `cache-embe-imagenes-v${CACHE_EMBE_IMAGENES}`,
            archivos: [
                RUTA_EMBE + '/imagenes/fondos/bosque_animales_sin_color.webp',
                RUTA_EMBE + '/imagenes/fondos/bosque_charco.webp',
                RUTA_EMBE + '/imagenes/fondos/bosque_flores.webp',
                RUTA_EMBE + '/imagenes/fondos/bosque_general.webp',
                RUTA_EMBE + '/imagenes/fondos/bosque_hongos_magicos.webp',
                RUTA_EMBE + '/imagenes/fondos/camino_secreto.webp',
                RUTA_EMBE + '/imagenes/fondos/casa_bruja.webp',
                RUTA_EMBE + '/imagenes/fondos/cuarto_iru.webp',
                RUTA_EMBE + '/imagenes/fondos/cuarto_iru_normal.webp',
                RUTA_EMBE + '/imagenes/fondos/entrada_bosque.webp',
                RUTA_EMBE + '/imagenes/fondos/final_bosque_con_color.webp',
                RUTA_EMBE + '/imagenes/fondos/final_secreto_transformacion.webp',
                RUTA_EMBE + '/imagenes/fondos/interior_casa_bruja.webp',
                RUTA_EMBE + '/imagenes/fondos/rio_duende_hada.webp',
                RUTA_EMBE + '/imagenes/fondos/rio_puente_magico.webp',
                RUTA_EMBE + '/imagenes/fondos/rio_sapo.webp',
                RUTA_EMBE + '/imagenes/fondos/rio_sin_puente_magico.webp',
                RUTA_EMBE + '/imagenes/fondos/vision_bruja_charco.webp',
                RUTA_EMBE + '/imagenes/fondos/zona_rio.webp',
                RUTA_EMBE + '/imagenes/logo/logo.png',
                RUTA_EMBE + '/imagenes/logo/logo_s.png',
                RUTA_EMBE + '/imagenes/logo/logo_s.webp',
                RUTA_EMBE + '/imagenes/objetos/fin.png',
                RUTA_EMBE + '/imagenes/objetos/fin.webp',
                RUTA_EMBE + '/imagenes/objetos/flor_de_luz.webp',
                RUTA_EMBE + '/imagenes/objetos/hongo_que_no_rie.webp',
                RUTA_EMBE + '/imagenes/objetos/hongo_que_no_rie_2.webp',
                RUTA_EMBE + '/imagenes/objetos/hongo_que_rie.webp',
                RUTA_EMBE + '/imagenes/objetos/hongo_que_rie_2.webp',
                RUTA_EMBE + '/imagenes/objetos/piedra_magica.webp',
                RUTA_EMBE + '/imagenes/personajes/abuela_tere/abuela_tere.webp',
                RUTA_EMBE + '/imagenes/personajes/ardilla_gris/ardilla_gris.webp',
                RUTA_EMBE + '/imagenes/personajes/bruja_romi/bruja_romi_feliz.webp',
                RUTA_EMBE + '/imagenes/personajes/bruja_romi/bruja_romi_sentada.webp',
                RUTA_EMBE + '/imagenes/personajes/bruja_romi/bruja_romi_triste.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_enojado.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_espaldas.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_saludando.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_serio.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_serio_2.webp',
                RUTA_EMBE + '/imagenes/personajes/duende_milo/duende_milo_sospecha.webp',
                RUTA_EMBE + '/imagenes/personajes/hada_jazmin/hada_jazmin.webp',
                RUTA_EMBE + '/imagenes/personajes/hada_jazmin/hada_jazmin_espaldas.webp',
                RUTA_EMBE + '/imagenes/personajes/indira/indira.webp',
                RUTA_EMBE + '/imagenes/personajes/indira/indira_caminando.webp',
                RUTA_EMBE + '/imagenes/personajes/indira/indira_espaldas_1.webp',
                RUTA_EMBE + '/imagenes/personajes/indira/indira_espaldas_2.webp',
                RUTA_EMBE + '/imagenes/personajes/indira/indira_tropieza.webp',
                RUTA_EMBE + '/imagenes/personajes/irupe/irupe.webp',
                RUTA_EMBE + '/imagenes/personajes/irupe/irupe_caminando.webp',
                RUTA_EMBE + '/imagenes/personajes/irupe/irupe_espaldas_1.webp',
                RUTA_EMBE + '/imagenes/personajes/irupe/irupe_espaldas_2.webp',
                RUTA_EMBE + '/imagenes/personajes/irupe/irupe_normal.webp',
                RUTA_EMBE + '/imagenes/personajes/mama_papa/mama_papa.webp',
                RUTA_EMBE + '/imagenes/personajes/nuria/nuria.webp',
                RUTA_EMBE + '/imagenes/personajes/nuria/nuria_caminando.webp',
                RUTA_EMBE + '/imagenes/personajes/nuria/nuria_espaldas_1.webp',
                RUTA_EMBE + '/imagenes/personajes/nuria/nuria_espaldas_2.webp',
                RUTA_EMBE + '/imagenes/personajes/nuria/nuria_espaldas_3.webp',
                RUTA_EMBE + '/imagenes/personajes/sapo_blanco/sapo_blanco.webp',
                RUTA_EMBE + '/imagenes/personajes/tio_pier/tio_pier.webp',
                RUTA_EMBE + '/imagenes/personajes/tio_pier/tio_pier_pensativo.webp',
                RUTA_EMBE + '/imagenes/personajes/tio_pier/tio_pier_flor_de_luz.webp',
                RUTA_EMBE + '/imagenes/personajes/tio_pier/tio_pier_sentado.webp',
                RUTA_EMBE + '/imagenes/tarjeta/tarjeta.webp'
            ],
            version: CACHE_EMBE_IMAGENES
        },
        {
            nombre: `cache-embe-videos-v${CACHE_EMBE_VIDEOS}`,
            archivos: [
                RUTA_EMBE + '/videos/bosque_hongos_magicos.mp4',
                RUTA_EMBE + '/videos/bosque_hongos_magicos_720.mp4',
                RUTA_EMBE + '/videos/rio_duende_hada.mp4',
                RUTA_EMBE + '/videos/rio_duende_hada_720.mp4'
            ],
            version: CACHE_EMBE_VIDEOS
        }
    ];

    // Instalación: Pre-caché de todos los recursos
    self.addEventListener('install', event => {
        event.waitUntil(
            (async () => {
                for (const grupo of RUTAS_CACHE) {
                    const cache = await caches.open(grupo.nombre);
                    // Fetch forzando evasión de caché del navegador usando la versión
                    const requests = grupo.archivos.map(archivo => {
                        const url = new URL(archivo, self.location.href);
                        url.searchParams.append('v', grupo.version);
                        return new Request(url, { cache: 'no-store' }); // Asegura que se baje fresco
                    });

                    // Descargamos y metemos a la caché manualmente
                    for (let i = 0; i < requests.length; i++) {
                        try {
                            const response = await fetch(requests[i]);
                            if (response.ok) {
                                // Guardamos en la caché usando la URL original (sin el ?v=X)
                                // para que los match() más adelante coincidan exactamente
                                // alternativamente podemos usar ignoreSearch: true
                                await cache.put(grupo.archivos[i], response);
                            } else {
                                console.warn(`[Service Worker] Falló caché de: ${grupo.archivos[i]}`);
                            }
                        } catch (error) {
                            console.error(`[Service Worker] Error al precachear ${grupo.archivos[i]}:`, error);
                        }
                    }
                }
                // Saltar espera
                return self.skipWaiting();
            })()
        );
    });

    // Activación: Limpieza y notificación a clientes
    self.addEventListener('activate', event => {
        event.waitUntil(
            (async () => {
                // Obtener los nombres actuales de cachés válidas
                const nombresValidos = RUTAS_CACHE.map(g => g.nombre);
                nombresValidos.push(NOMBRE_CACHE_FONTS);
                const nombresActuales = await caches.keys();

                // Borrar cachés viejas
                await Promise.all(
                    nombresActuales.map(nombre => {
                        if (!nombresValidos.includes(nombre)) {
                            console.log(`[Service Worker] Borrando caché obsoleta: ${nombre}`);
                            return caches.delete(nombre);
                        }
                    })
                );

                // Reclamar clientes
                await self.clients.claim();

                // Avisar a todos los clientes conectados la versión
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        tipo: 'VERSION_UPDATE',
                        version: VERSION_APP
                    });
                });
            })()
        );
    });

    // Escuchar peticiones desde el cliente (js)
    self.addEventListener('message', event => {
        if (event.data && event.data.tipo === 'GET_VERSION') {
            event.source.postMessage({
                tipo: 'VERSION_UPDATE',
                version: VERSION_APP
            });
        }
    });

    // Estrategia Cache First y Manejo de Fuentes
    self.addEventListener('fetch', event => {
        // Ignorar peticiones que no son GET
        if (event.request.method !== 'GET') return;

        const url = new URL(event.request.url);

        // --- MANEJO ESPECIAL PARA GOOGLE FONTS (CORS / Opaque) ---
        if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
            event.respondWith(
                caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse; // Cache First para fuentes
                    }

                    // No está en caché, la buscamos en la red
                    return fetch(event.request).then(networkResponse => {
                        // Verificamos respuesta válida (soporta respuestas opacas: type === 'opaque' o status 200)
                        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                            // Clonar para guardar sin consumir la respuesta original
                            const clonedResponse = networkResponse.clone();
                            caches.open(NOMBRE_CACHE_FONTS).then(cache => {
                                cache.put(event.request, clonedResponse);
                            });
                        }
                        return networkResponse;
                    }).catch(err => {
                        console.error('[Service Worker] Falló descarga de fuente:', err);
                        // No rompemos la app, simplemente la fuente no cargará
                    });
                })
            );
            return;
        }

        // --- MANEJO ESPECIAL PARA RANGE REQUESTS (AUDIO OFFLINE) ---
        // El browser pide audio con "Range: bytes=0-" o similares.
        // caches.match() no encuentra esas requests aunque el archivo esté cacheado
        // (porque fue guardado sin el header Range). Hay que resolverlo manualmente.
        const rangeHeader = event.request.headers.get('Range');
        if (rangeHeader) {
            event.respondWith((async () => {
                // Buscar el archivo completo en caché (sin Range header)
                const cachedFull = await caches.match(event.request.url, { ignoreSearch: true });
                if (!cachedFull) {
                    // No está en caché, intentar red
                    return fetch(event.request).catch(() => {
                        console.warn(`[Service Worker] No se pudo obtener de red ni de caché (range): ${event.request.url}`);
                        return new Response(null, { status: 503, statusText: 'Service Unavailable' });
                    });
                }

                // Parsear el rango solicitado: "bytes=inicio-fin" o "bytes=inicio-"
                const arrayBuffer = await cachedFull.clone().arrayBuffer();
                const totalBytes = arrayBuffer.byteLength;

                const [, startStr, endStr] = /bytes=(\d*)-(\d*)/.exec(rangeHeader) || [];
                const start = startStr ? parseInt(startStr, 10) : 0;
                const end = endStr ? parseInt(endStr, 10) : totalBytes - 1;
                const slicedBuffer = arrayBuffer.slice(start, end + 1);

                return new Response(slicedBuffer, {
                    status: 206,
                    statusText: 'Partial Content',
                    headers: {
                        'Content-Type': cachedFull.headers.get('Content-Type') || 'audio/mpeg',
                        'Content-Range': `bytes ${start}-${end}/${totalBytes}`,
                        'Content-Length': String(slicedBuffer.byteLength)
                    }
                });
            })());
            return;
        }

        // --- ESTRATEGIA NORMAL (APP CACHE FIRST) ---
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
                // Return la respuesta en caché si existe, sino ir a la red
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Si no está en caché, probar red como fallback
                return fetch(event.request).catch(() => {
                    console.warn(`[Service Worker] No se pudo obtener de red ni de caché: ${event.request.url}`);
                    // Un catch sin return devuelve undefined, y eso tira TypeError en el browser
                    return new Response(null, { status: 503, statusText: 'Service Unavailable' });
                });
            })
        );
    });

})();
