# Documentación del Motor — La Biblioteca del Tío Pier

> Motor de juego vanilla (HTML5 + CSS3 + JavaScript ES Modules) para cuentos interactivos tipo "Elige tu propia aventura", con soporte multi-historia y selección desde una biblioteca central. Requiere ser servido desde un servidor HTTP local (Apache, `python -m http.server`, Live Server, etc.).

---

La documentación técnica del proyecto se ha estructurado en diferentes módulos temáticos para facilitar su navegación. Si sos un nuevo agente trabajando en esto, por favor leé en el orden listado a continuación.

## Índice

1. **[Arquitectura, Módulos y PWA](arquitectura.md)**
   Estructura general, diagrama de dependencias, soporte PWA (Service Worker, Offline), Módulos JS y Flujo de Ejecución.
   
2. **[Sistema de Capas y Estilos](ui_estilos_capas.md)**
   Explicación de los archivos CSS, design tokens, tipografía, layour responsivo 16:9, sistema Z-Index (capas visuales), controles de UI y animaciones de elementos.

3. **[Estado, Recompensas y Caché](estado_recompensas.md)**
   Manejo y persistencia de estado con `localStorage`, funcionamiento de las recompensas, cómo funciona la evaluación de condiciones lógicas y los managers de precarga de JSON e imágenes.

4. **[Formato de Escenas y Desafíos](formato_escenas.md)**
   Definición técnica (schema) estricta de cómo crear una Escena Narrativa o un Minijuego usando archivos JSON estáticos.

5. **[Contrato de Datos y Extensibilidad](formato_historia.md)**
   Estructura global de `historias.json` (Catálogo), `historia.json` (Opciones y configuración visual de la historia) y las guías de cómo extender el motor agregando nuevos minijuegos, recompensas o variables sin tocar el core de JavaScript.
