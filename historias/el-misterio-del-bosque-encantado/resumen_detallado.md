# Resumen de la Historia: "El Misterio del Bosque Encantado"

Este documento resume la estructura narrativa completa, detallando todas las ramificaciones, escenas clave y finales posibles, basado fielmente en el guion definido en `historia.md`.

---

## **1. El Inicio: La Casa**
**Escena:** Cuarto de Irupé (`INICIO`).  
La historia introduce a la protagonista y plantea la primera gran decisión.
*   **Decisión Inicial:**
    *   **Opción A:** "Salir a explorar" → Avanza a `ENCUENTRO_PADRES`.
    *   **Opción B:** "Quedarme a jugar con mis juguetes" → **Final Corto 1:** Irupé decide no salir. Fin de la historia.

**Escena:** Cuarto de Irupé (`ENCUENTRO_PADRES`).  
Mamá y Papá plantean un desafío para validar que Irupé merece su "Licencia de Exploradora".
*   **Desafío (Pregunta Real):** Ej. "¿Cuándo es el cumpleaños de la abuela Tere?"
    *   **Respuesta Incorrecta (Invierno/Primavera):** → **Final Corto 2:** "Necesitás practicar más". Fin.
    *   **Respuesta Correcta (Verano):** → Avanza a `ENTRADA_BOSQUE`.

---

## **2. El Nudo: El Bosque Encantado**
**Escena:** Entrada del Bosque (`ENTRADA_BOSQUE`).  
Encuentro con la **Abuela Tere** (expone el misterio: "Los animalitos están perdiendo sus colores") y llegan las amigas **Indi y Nuria** para sumarse a la aventura.
*   **Decisión de Ruta (Ramificación Principal):**
    *   **Camino A:** Sendero de Flores brillantes → `ZONA_FLORES`.
    *   **Camino B:** Sendero del Río → `ZONA_RIO`.

### **Ruta A: Sendero de Flores (`ZONA_FLORES`)**
*   **Evento:** Indi tropieza con una raíz.
*   **Decisión de Ayuda:** "Ayudar a Indi" (`FLORES_AYUDA_INDI`) o "Seguir sin esperar" (`FLORES_NO_AYUDA_INDI`). Ambas opciones cambian el texto descriptivo, pero convergen en el mismo descubrimiento:
*   **Encuentro:** Hallan a la **Ardilla** completamente gris.
*   **Decisión Táctica:**
    *   *Hacerle cosquillas:* Fallo (`FLORES_COSQUILLAS`), la ardilla sigue igual, te fuerza a elegir de nuevo.
    *   *Preguntarle:* La ardilla acusa directamente a la **Bruja Romi** (`FLORES_PREGUNTAR`).
    *   *Buscar pistas:* Siguen un rastro de pétalos grises (`FLORES_PISTAS`) -> Encuentran un charco mágico (`FLORES_CHARCO`) -> Tienen una visión de la **Bruja Romi** robando colores (`FLORES_CHARCO_VISION`).
*   **Convergencia de avance:** Tanto preguntar como buscar pistas lleva hacia la escena de los hongos mágicos y el Tío Pier (`CAMINO_CASA_BRUJA`).

### **Ruta B: Sendero del Río (`ZONA_RIO`)**
*   **Encuentro:** Ven algunas flores completamente blancas y escuchan un sonido triste en los juncos (`ZONA_RIO`).
*   **Decisión:** Cualquiera de las opciones de investigación lleva a descubrir al animal afectado.
*   **Revelación:** Encuentran a un gran sapo destiñido que les cuenta cómo la Bruja Romi se robó sus colores (`RIO_SAPO`). Las niñas le agradecen y avanzan por el río.
*   **Encuentro:** Duende Milo (quien está pescando) y Hada Jazmín (`RIO_DUENDE` -> `RIO_HABLAR_DUENDE`). Las niñas explican su problema y acceden a la charla con el duende (`RIO_HABLAR_DUENDE_2`).
*   **Desafío (Acertijo):** Milo plantea una adivinanza sobre qué necesita para descansar.
    *   **Fallo (Cama/Árbol):** Milo las echa y siguen a pie (`RIO_DUENDE_FALLO`) → Lleva directo hacia la escena de los hongos mágicos y el **Tío Pier** (`CAMINO_CASA_BRUJA`).
    *   **Éxito (Silla):** Milo les da una piedra suave y plana (`RIO_DUENDE_RECOMPENSA`).
        *   **Minijuego (Clics):** Lanzar la piedra haciéndole 3 "sapitos" en el río.
        *   **Recompensa:** Aparece un puente de luz y flores de agua (`RIO_PUENTE_MAGICO`).
        *   **Atajo:** El puente las transporta **DIRECTO** a la puerta de la Casa de la Bruja (`CASA_BRUJA_EXTERIOR`), saltándose por completo al Tío Pier y perdiendo la chance de obtener la Flor de Luz.

---

## **3. Evento Especial: El Tío Pier (`ENCUENTRO_TIO_PIER`)**
*(Solo se accede desde la Ruta de Flores, o desde la Ruta del Río si se falló el acertijo).*

*   **Encuentro:** Tío Pier preparando sopa de hongos coloridos en `CAMINO_CASA_BRUJA`. Lo saludan en `ENCUENTRO_TIO_PIER` y le explican que la bruja Romi robó los colores.
*   **Negociación:** Tío Pier ofrece ayudarlas a llegar a la casa rápidaente si le consiguen un ingrediente en `ENCUENTRO_TIO_PIER_2`.
*   **Desafío (Minijuego de Observación):** Encontrar y tocar el hongo que hace el sonido de risa entre varios.
*   **Recompensa Clave (`TIO_PIER_RECOMPENSA`):** El tío regala la **Flor de Luz**.
    *   La flor ilumina un atajo oculto hacia el claro de la casa de la Bruja (`CAMINO_SECRETO_CASA_BRUJA` -> `CASA_BRUJA_EXTERIOR`).
    *   Tener esta flor en el inventario/estado del juego es el requisito exclusivo para desbloquear el **Final Secreto**.

---

## **4. El Desenlace: La Casa de la Bruja Romi**
Llegada a la casa:
*   **Vía Tío Pier:** Usan la **Flor de Luz** para encontrar un atajo secreto que las deja en el claro (`CAMINO_SECRETO_CASA_BRUJA` -> `CASA_BRUJA_EXTERIOR`).
*   **Vía Puente Mágico:** Llegan directo al claro de la puerta (`CASA_BRUJA_EXTERIOR`).

Ambas ramas cruzan la puerta al interior (`INTERIOR_CASA_BRUJA`), luego hablan con ella (`HABLAR_CON_ROMI`), y finalmente deben elegir qué hacer en `DECISION_FINAL`.
*   **Encuentro:** Encuentran a Romi llorando de espaldas, con un reluciente frasco de colores sobre una mesa.
*   **Revelación:** Se acercan a hablar. Romi confiesa que robó los colores porque el bosque alegre la deprimía aún más ante su propia soledad.

**Decisión Final en `DECISION_FINAL` (Clímax de la Historia):**

1.  **Final Malo (Enojo):**  
    *   *Decisión:* "Enojarse con ella y exigir que devuelva los colores".
    *   *Resultado (`FINAL_MALO`):* Romi entrega el frasco y se encierra en su habitación. Las niñas salen y al abrirlo, los colores vuelven al bosque, pero sienten que algo no está bien porque Romi sigue sola. ¡Fin!
2.  **Final Bueno (Amistad):**  
    *   *Decisión:* "Invitarla a jugar con ellas para que no esté triste".
    *   *Resultado (`FINAL_BUENO`):* Romi libera los colores con una lágrima de felicidad. Los animales y el bosque recuperan brillo y cantan de alegría. Romi sale a jugar con las niñas. La Abuela Tere aparece y les dice: "La amistad es la magia más poderosa".
3.  **Final Secreto (Generosidad):**  
    *   *Requisito de Ocultamiento:* El botón de esta decisión **solo se muestra** si en pasos anteriores de la partida se consiguió la "Flor de Luz".
    *   *Decisión:* "Ofrecerle a Romi la flor de luz que te dio el tío Pier".
    *   *Resultado (`FINAL_SECRETO`):* Romi llora de emoción. Su lágrima ilumina la flor, abriendo el frasco y transformando su vieja casa en un lugar cálido lleno de flores y luz. El bosque brilla y la Abuela Tere les enseña que descubrieron "la magia más grande de todas: la generosidad".

---

### **Resumen de Estructura (Árbol de Decisión Pragmático)**

```text
INICIO
├── Quedarse a Jugar -> FINAL CORTO 1
└── Salir -> Pregunta Padres (INCORRECTO: FINAL CORTO 2)
              └── (CORRECTO: Bosque) -> ENTRADA BOSQUE

ENTRADA BOSQUE
├── Ruta Flores (Ardilla Gris)
│   ├── Preguntar -> CAMINO CASA BRUJA -> TÍO PIER (Flor Luz) -> Camino Secreto -> CASA BRUJA EXTERIOR
│   ├── Buscar Pistas -> Charco Mágico -> Visión Bruja -> CAMINO CASA BRUJA -> TÍO PIER (Flor Luz) -> Camino Secreto -> CASA BRUJA EXTERIOR
│   └── Cosquillas -> (Fallo: Reinicia decisión de la ardilla)
└── Ruta Río (Pasto Gris -> RIO_SAPO -> Sapo Acusa Bruja)
    ├── Acertijo Milo INCORRECTO -> CAMINO CASA BRUJA -> TÍO PIER (Flor Luz) -> Camino Secreto -> CASA BRUJA EXTERIOR
    └── Acertijo Milo CORRECTO -> Puente Mágico (Se Salta al Tío Pier -> SIN FLOR) -> CASA BRUJA EXTERIOR

CASA BRUJA EXTERIOR
└── Tocar puerta -> INTERIOR_CASA_BRUJA -> HABLAR_CON_ROMI -> DECISION_FINAL

DECISION_FINAL
├── Reclamar Enojada -> FINAL MALO
├── Invitar a Jugar -> FINAL BUENO
└── Regalar Flor (Solo si pasaste por Tío Pier) -> FINAL SECRETO
```
