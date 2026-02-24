# **Concepto de la Historia: El Misterio del Bosque Encantado**

Este documento detalla los elementos conceptuales para el cuento interactivo "El Misterio del Bosque Encantado".

## **1. Protagonista**

*   **Nombre:** Irupé.
*   **Descripción:** La heroína de nuestra historia. Todas las decisiones giran en torno a ella.

## **2. Tema y Tono**

*   **Ambientación:** Un bosque encantado y misterioso.
*   **Elementos:** El bosque está habitado por animales que hablan, duendes traviesos, hongos mágicos y coloridos, y la bruja Romi. El tono es de aventura, misterio y fantasía.

## **3. Objetivo Principal**

*   **Misión:** Resolver el misterio del bosque: los animales están perdiendo sus colores y su alegría porque Romi, la bruja, se los llevó en un frasco de cristal al sentirse sola.

## **4. Personajes Secundarios y Roles**

*   **Mamá y Papá:**
    *   **Rol:** Guardianes del umbral. Al inicio de la historia, proponen a Irupé un desafío de conocimiento familiar (preguntas de la vida real) para "darle permiso" y entregarle su Licencia de Exploradora.
*   **Indi y Nuria (Amigas):**
    *   **Rol:** Compañeras de Aventura. Se unen a Irupé en su viaje por el bosque, ofreciendo apoyo y diferentes puntos de vista en las decisiones.
*   **Abuela Tere:**
    *   **Rol:** La que da la Misión. En la entrada del bosque, le explica a Irupé que los animalitos están perdiendo sus colores, dándole el propósito principal del juego. Al final de la historia, reflexiona sobre la lección aprendida.
*   **Tío Pier:**
    *   **Rol:** El Guía Pintoresco. Aparece en una zona llena de hongos mágicos. A través de un minijuego de observación (buscar el hongo que ríe), les entrega la "flor de luz", que es crucial para descubrir un camino secreto hacia la casa de la bruja y desbloquear el final secreto.
*   **Romi (La Bruja):**
    *   **Rol:** Personaje Incomprendido. Es la causante del misterio, pero no es malvada. Solo está triste y aislada. Resolver su problema emocional (acompañarla o regalarle la flor) es la clave para solucionar el enigma del bosque y liberar los colores.
*   **Milo (Duende) y Jazmín (Hada):**
    *   **Rol:** Guardianes del Río. Milo es un duende algo gruñón que plantea un acertijo, mientras que Jazmín es un hada dulce. Juntos, tras superar el acertijo, recompensan a las niñas con un minijuego de clics (lanzar una piedra) para invocar un puente mágico en el río como atajo.
*   **El Sapo Gris:**
    *   **Rol:** El Testigo del Río. Es el animal afectado por el misterio en el camino del río. Aparece luego de que las niñas notan que el pasto pierde su color. Interactuar con él revela directamente que la Bruja Romi robó los colores.
*   **La Ardilla:**
    *   **Rol:** El Testigo del Bosque. Es el animal afectado por el misterio en el camino de las flores (se volvió gris). Interactuar con ella revela de manera directa quién fue la causante del problema: la bruja Romi.

## **5. Integración de "Datos de la Vida Real"**

*   **Acción:** La historia integra datos familiares del mundo real para generar inmersión. Este mecanismo ya está implementado mediante el tipo de desafío `pregunta_real` al comienzo de la partida (ejemplo: fecha de cumpleaños de la Abuela Tere).

## **6. Alcance del Proyecto (Completado)**

*   **Estructura:** La historia cuenta con un hilo narrativo principal sólido y diferentes ramificaciones que llevan a distintos cierres:
    *   **Dos finales cortos:** Caminos cortados tempranamente si se decide no salir a explorar o si se falla el desafío inicial.
    *   **Tres finales principales:** Uno "Bueno" (comunicación asertiva), uno "Malo" (enojo) y un "Final Secreto" (que requiere haber obtenido la flor mágica del Tío Pier).
*   **Desafíos implementados:**
    1.  **Pregunta Real:** Examen de conocimiento familiar (Mamá y Papá).
    2.  **Acertijo + Minijuego de Clics:** Solución de la adivinanza de Milo y salto de piedras en el río con Jazmín.
    3.  **Minijuego de Observación:** Encontrar el hongo sonriente entre varios falsos (Tío Pier).

## **7. Guía de Estilo Visual (IA de Imágenes)**

Para generar imágenes (fondos, personajes, objetos) de esta historia, respetar:
*   **Estilo:** "Cinematic Epic Fantasy Concept Art". Estilo hiperdetallado, con gran profundidad de campo, iluminación volumétrica y una estética de renderizado estilo Unreal Engine 5.
*   **Atmósfera:** Bosque mágico profundo, con fuerte contraste entre sombras y luces. Uso intensivo de bioluminiscencia (hongos, flores, partículas que brillan con luz propia). Un aire de misterio etéreo y maravilla.
*   **Consistencia:** Los personajes están basados en personas reales. Se deberán integrar sus rasgos (de las fotos adjuntas) en este estilo hiperrealista de fantasía. Deben parecer personajes de una película de Disney/Pixar moderna o un RPG de alta gama, manteniendo la esencia de la persona pero con un toque épico.
