/**
 * FeatureFlags — Feature flags globales del motor.
 *
 * Módulo singleton que expone flags mutables para controlar
 * funcionalidades del motor, sobreescribibles desde el DevPanel
 * en modo desarrollo.
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
     * Habilitado por defecto en producción.
     * @type {boolean}
     */
    videosHabilitados: true
};
