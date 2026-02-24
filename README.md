<div align="center">
  <h1>La Biblioteca del Tío Pier 📖✨</h1>
  <p><i>Un motor web de cuentos interactivos tipo "Elige tu propia aventura", pensado para las niñeces.</i></p>
  <img src="biblioteca/imagenes/juego_biblioteca.webp" alt="Pantalla de inicio" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 100%;">
</div>

## ¿Qué es este proyecto? (El Alma)

Este proyecto nace de un regalo muy especial. La historia inicial, **"El Misterio del Bosque Encantado"**, fue creada pura y exclusivamente como un obsequio para mi sobrina Irupé, para celebrar y acompañar el momento en el que aprendió a leer. 

El objetivo es ofrecer una experiencia de lectura interactiva, donde niños y niñas no sean solo espectadores, sino protagonistas que deciden el rumbo de la aventura. El proyecto creció y se convirtió en un **motor genérico**, lo que permite crear múltiples historias independientes bajo la misma aplicación.

### ¡Jugalo ahora!

Si querés vivir la experiencia y jugar las historias disponibles, podés hacerlo directamente desde acá:
👉 **[https://lucaspier.github.io/cuentos-interactivos](https://lucaspier.github.io/cuentos-interactivos)**

---

## Características Principales 🚀

No hace falta entender de código para ver lo que hace esta aplicación:

*   **Múltiples historias:** Un solo lugar, muchos cuentos. El motor soporta una variedad infinita de historias independientes seleccionables desde una biblioteca central (por el momento el repositorio incluye una única historia, ¡pero la idea es ir sumando nuevas próximamente!).
*   **Toma de decisiones:** En cada paso, los chicos y las chicas eligen qué camino tomar. ¡Cada decisión cambia la historia!
*   **Minijuegos y desafíos:** La lectura se rompe con interacción. Hay desafíos de observación, tocar la pantalla varias veces o incluso "preguntas reales" para hacerle a un adulto.
*   **100% Offline (Modo Avión):** ¿Te vas de viaje y no hay señal? No pasa nada. Entrá a la página antes de salir de casa; la aplicación se descarga, y podés jugarla en el medio de la nada sin gastar ni un solo dato de internet.
*   **Seguro y sin distracciones:** Cero publicidades, cero recolección de datos, sin tener que crearte una cuenta. Pura lectura y diversión.

---

## Para Creadores: ¡Armá tu propia historia! ✍️

Este código es **completamente libre** (licencia GPLv3). La idea es que cualquiera pueda descargarlo, modificarlo y armar los cuentos que quiera para sus hijos e hijas, sobrinos y sobrinas, alumnos o quien sea.

Toda la lógica de qué dice un personaje, a dónde vas y qué imágenes ves, **está guardada en archivos de texto simples (JSON)** separados del código duro del motor. ¡Con cambiar unos textos y un par de imágenes, podés crear un mundo totalmente nuevo!

Animate a descargar el repositorio, revisar cómo están estructuradas las carpetas en `historias/` y ¡empezá a escribir tu aventura!

---

## Bajo el Capot (Para los freaks del código) 💻

Si querés meter mano en el motor del juego, te cuento rápido cómo está armado:

*   **Stack pragmático:** HTML5, CSS3, JavaScript Vainilla (ES Modules nativos). Nada de node modules que pesan gigas, nada de frameworks de moda ni dependencias externas. Una sola fuente externa: la fuente *Nunito* de Google Fonts.
*   **Progressive Web App (PWA):** Está servido con un Service Worker usando una estrategia "Cache First", asegurando disponibilidad offline y permitiendo instalación local como una app nativa.
*   **Arquitectura Desacoplada:** El motor (`main.js`, `GameEngine.js`, renderizadores, etc.) se mantiene ciego ante las narrativas. Las historias se inyectan en tiempo de ejecución de manera dinámica a través de promesas (Fetch API).
*   **Persistencia Local:** Todo el progreso del jugador y recompensas ganadas se gestionan con estado aislado en `localStorage`.

¿Querés saber más sobre la arquitectura, el flujo de eventos, capas de UI, o el contrato de los JSON? 
👉 **[Entrá en la documentación técnica haciendo click acá](documentacion/index.md)**.

---

<p align="center"><i>Construido con ganas de fomentar la lectura a través del juego. Licenciado bajo GPLv3.</i></p>
