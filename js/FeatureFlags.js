/**
 * FeatureFlags — Feature flags globales del motor.
 *
 * Módulo singleton que expone flags mutables para controlar
 * funcionalidades experimentales o en desarrollo.
 *
 * Las features deshabilitadas por defecto son ignoradas por el motor
 * y solo pueden activarse desde el DevPanel (modo desarrollo).
 *
 * Consumidores:
 *   - FondoHelper.js: consulta `videosHabilitados` antes de crear <video>
 *
 * Productores:
 *   - DevPanel.js: setea los flags via toggles de "Configuración Dev"
 */
export const FeatureFlags = {
    /**
     * Habilita la reproducción de videos de fondo en escenas y desafíos.
     * Feature en fase experimental — deshabilitado por defecto en producción.
     * @type {boolean}
     */
    videosHabilitados: false
};
