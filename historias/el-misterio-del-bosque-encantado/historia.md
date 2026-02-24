# **Guion y Mapa de la Historia: El Misterio del Bosque Encantado**

Este documento contiene la estructura narrativa completa, las escenas, los diálogos y las decisiones del cuento interactivo.

---

## **Mapa de Escenas (Flowchart)**

*   **INICIO:** Cuarto de Irupé.
    *   `Decisión:` ¿Salir del cuarto o quedarse jugando?
    *   `Quedarse jugando` -> **FINAL_CORTO_1** (Un final simple y rápido).
    *   `Salir del cuarto` -> **ENCUENTRO_PADRES**.
*   **ENCUENTRO_PADRES:** Encuentro con Mamá y Papá en el cuarto.
    *   `Desafío:` Superar un reto que proponen para poder ir al bosque.
    *   `Fallo` -> **FINAL_CORTO_2** (Otro final corto, "tendrás que esperar a mañana").
    *   `Éxito` -> **ENTRADA_BOSQUE**.
*   **ENTRADA_BOSQUE:** Encuentro con la Abuela Tere.
    *   `Narrativa:` La abuela explica el misterio (ej: "los animales están perdiendo su color").
    *   `Narrativa:` Las amigas Indi y Nuria se unen a la aventura.
    *   `Decisión:` ¿Qué camino tomar en el bosque?
    *   `Camino de flores` -> **ZONA_FLORES**.
    *   `Camino de piedras` -> **ZONA_RIO**.
*   **ZONA_FLORES:**
    *   `Evento:` Encuentran un animal sin color.
    *   `Decisión:` ...
*   **ZONA_RIO:**
    *   `Evento:` El pasto se vuelve gris y escuchan un sonido triste.
    *   `Decisión:` ¿Acercarse a los juncos o llamar en voz alta?
    *   `Cualquier opción` -> **RIO_SAPO**.
*   **RIO_SAPO:**
    *   `Evento:` Encuentran un sapo gris que acusa a la bruja Romi.
    *   `Decisión:` Seguir adelante -> **RIO_DUENDE**.
*   ... (Más escenas hasta llegar al **TIO_PIER** y la **BRUJA_ROMI**).

---

## **Guion Detallado**

### **ESCENA: `INICIO`**
*   **IMAGEN:** `cuarto_iru.webp`
*   **TEXTO:**
    > Irupé, es un día perfecto para una aventura. Desde la ventana se ve el bosque encantado. ¿Qué querés hacer?
*   **OPCIONES:**
    1.  **Botón 1:** "Salir a explorar" -> Va a `ENCUENTRO_PADRES`.
    2.  **Botón 2:** "Quedarme a jugar con mis juguetes" -> Va a `FINAL_CORTO_1`.

### **ESCENA: `FINAL_CORTO_1`**
*   **IMAGEN:** `cuarto_iru.webp` (Quizás con `iru_feliz.webp` superpuesto).
*   **TEXTO:**
    > ¡Qué divertido! Pasás la tarde jugando en tu cuarto. La aventura en el bosque puede esperar a otro día. ¡Fin!
*   **OPCIONES:**
    1.  **Botón 1:** "Volver a empezar" -> Va a `INICIO`.

### **ESCENA: `ENCUENTRO_PADRES`**
*   **IMAGEN:** `cuarto_iru.webp` (con `mama_papa.webp`).
*   **TEXTO:**
    > ¡Hola, Irupé!, te dice mamá. "El bosque está lleno de secretos, y para resolverlos hay que ser muy observadora. ¡Tenés que ganarte tu Licencia de Exploradora!", agrega papá, guiñándote un ojo. "Para conseguirla, tenés que demostrarnos que sos curiosa, que investigás y prestás atención a todo lo que pasa a tu alrededor. Preparate para la prueba..."
*   **DESAFÍO (PREGUNTA REAL ALEATORIA):**
    *   **Pregunta:** Ej. "¿Cuándo es el cumpleaños de la abuela Tere?"
    *   **NOTA PARA EL DESARROLLADOR:** Este es un desafío que requiere que Irupé obtenga la respuesta en la vida real. La respuesta correcta debe ser configurada en el código del juego.
    *   **OPCIONES:**
    1.  **Botón 1:** "Responder la pregunta" -> Va a desafío `DESAFIO_INICIAL`.


### **ESCENA: `FINAL_CORTO_2`**
*   **IMAGEN:** `cuarto_iru.webp`.
*   **TEXTO:**
    > "¡Casi!", dice papá. "Necesitás practicar un poco más. Mañana será otro día perfecto para una aventura". Te quedás en casa, pensando en los misterios del bosque. ¡Fin!
*   **OPCIONES:**
    1.  **Botón 1:** "Volver a empezar" -> Va a `INICIO`.

### **ESCENA: `ENTRADA_BOSQUE`**
*   **IMAGEN:** `entrada_bosque.webp` (con `abuela_tere.webp`).
*   **TEXTO:**
    > ¡Lo lograste! Llegás a la entrada del bosque. La abuela Tere te espera allí. "Irupé, algo extraño sucede", dice con voz misteriosa. "Los animalitos del bosque están perdiendo sus colores y su alegría. Necesitamos tu ayuda para resolver este misterio". En ese momento llegan tus amigas Indi y Nuria. "¡Vamos con vos!", dicen. Ahora las tres juntas deben decidir por dónde empezar.
*   **NARRATIVA ADICIONAL:**
    > En ese momento llegan tus amigas Indi y Nuria. "¡Vamos con vos!", dicen. Ahora las tres juntas deben decidir por dónde empezar.
*   **OPCIONES:**
    1.  **Botón 1:** "Seguir el camino de flores brillantes" -> Va a `ZONA_FLORES`.
    2.  **Botón 2:** "Tomar el sendero junto al río" -> Va a `ZONA_RIO`.

### **ESCENA: `ZONA_FLORES`**
*   **IMAGEN:** `bosque_flores.webp`
*   **TEXTO:**
    > Eligen el camino de las flores. El suelo está cubierto de pétalos que brillan con cada paso. De repente, Indi tropieza con una raíz y cae al suelo. "¡Ay!", se queja. Nuria se detiene a su lado. ¿Qué hacés?
*   **OPCIONES:**
    1.  **Botón 1:** "Ayudar a Indi a levantarse" -> Va a `FLORES_AYUDA_INDI`.
    2.  **Botón 2:** "Seguir adelante sin esperar" -> Va a `FLORES_NO_AYUDA_INDI`.

### **ESCENA: `FLORES_AYUDA_INDI`**
*   **IMAGEN:** `bosque_animales_sin_color.webp`
*   **TEXTO:**
    > Te detenés y ayudás a Indi a ponerse de pie. "¡Gracias!", dice ella con una sonrisa. Justo entonces, ven a una pequeña ardilla sentada en una rama. Pero... ¡es completamente gris! No tiene su color habitual. "Pobrecita, parece muy triste", dice Indi. "¿Qué podemos hacer para ayudarla?", pregunta Nuria.
*   **OPCIONES:**
    1.  **Botón 1:** "Intentar hacerle cosquillas con una flor" -> Va a `FLORES_COSQUILLAS`.
    2.  **Botón 2:** "Preguntarle a la ardilla qué le pasa" -> Va a `FLORES_PREGUNTAR`.
    3.  **Botón 3:** "Buscar pistas alrededor" -> Va a `FLORES_PISTAS`.

### **ESCENA: `FLORES_NO_AYUDA_INDI`**
*   **IMAGEN:** `bosque_animales_sin_color.webp`
*   **TEXTO:**
    > Decidís seguir adelante. "¡Vamos, no nos detengamos!", decís. Justo en ese momento, ven a una pequeña ardilla sentada en una rama. Pero... ¡es completamente gris! Indi se levanta sola, sacudiéndose el polvo. "Pobrecita, parece muy triste", dice Indi. "¿Qué podemos hacer para ayudarla?", pregunta Nuria.
*   **OPCIONES:**
    1.  **Botón 1:** "Intentar hacerle cosquillas con una flor" -> Va a `FLORES_COSQUILLAS`.
    2.  **Botón 2:** "Preguntarle a la ardilla qué le pasa" -> Va a `FLORES_PREGUNTAR`.
    3.  **Botón 3:** "Buscar pistas alrededor" -> Va a `FLORES_PISTAS`.

### **ESCENA: `FLORES_COSQUILLAS`**
*   **IMAGEN:** `bosque_animales_sin_color.webp`
*   **TEXTO:**
    > Irupé toma una flor suave y le hace cosquillas a la ardilla en la panza. La ardilla hace "¡Achís!", pero sigue igual de gris. Parece que necesitarán otro plan.
*   **OPCIONES:**
    1.  **Botón 1:** "Preguntarle qué le pasa" -> Va a `FLORES_PREGUNTAR`.
    2.  **Botón 2:** "Buscar pistas alrededor" -> Va a `FLORES_PISTAS`.

### **ESCENA: `FLORES_PREGUNTAR`**
*   **IMAGEN:** `bosque_animales_sin_color.webp`
*   **TEXTO:**
    > Irupé se acerca y le pregunta a la ardilla por qué está tan triste. La ardilla, con voz bajita, responde: "La bruja Romi... se llevó todos los colores en un frasco de cristal". "¡Tenemos que ir a ver a esa bruja!", dice Indi.
*   **OPCIONES:**
    1.  **Botón 1:** "Seguir el camino hacia la casa de la bruja" -> Va a `CAMINO_CASA_BRUJA`.

### **ESCENA: `FLORES_PISTAS`**
*   **IMAGEN:** `bosque_general.webp`
*   **TEXTO:**
    > Las tres amigas deciden buscar pistas. Nuria encuentra un rastro de pétalos que han perdido su color y ahora son grises. "¡Sigamos el rastro!", dice. El camino las lleva más adentro en el bosque.
*   **OPCIONES:**
    1.  **Botón 1:** "Seguir el rastro de pétalos grises" -> Va a `FLORES_CHARCO`.

### **ESCENA: `FLORES_CHARCO`**
*   **IMAGEN:** `bosque_general.webp`
*   **TEXTO:**
    > El rastro de pétalos termina frente a un charco de agua extrañamente cristalina. La luna lo ilumina, pero en lugar de reflejar los árboles, el agua parece brillar con luz propia, como si fuera una pantalla mágica empezando a encenderse.
*   **OPCIONES:**
    1.  **Botón 1:** "Asomarse a ver el reflejo" -> Va a `FLORES_CHARCO_VISION`.

### **ESCENA: `FLORES_CHARCO_VISION`**
*   **IMAGEN:** `vision_bruja_charco.webp`
*   **TEXTO:**
    > En el reflejo del charco aparece una bruja robando los colores de las flores y los animalitos. "¡Es la Bruja Romi!", susurra Indira asustada. "No la imaginaba capaz de hacer esto". En el agua ven que la bruja Romi se llevó los colores atrapados en un frasco brillante.
*   **OPCIONES:**
    1.  **Botón 1:** "¡Tenemos que ir a la casa de la bruja!" -> Va a `CAMINO_CASA_BRUJA`.

### **ESCENA: `CAMINO_CASA_BRUJA`**
*   **IMAGEN:** `bosque_hongos_magicos.webp`
*   **TEXTO:**
    > Siguiendo el camino, llegan a una parte muy extraña del bosque. Hay hongos gigantes y luminosos por todas partes. Sentado sobre uno de ellos, encuentran al tío Pier, que está lamiendo un hongo de color azul.
*   **OPCIONES:**
    1.  **Botón 1:** "Saludar al tío Pier" -> Va a `ENCUENTRO_TIO_PIER`.

### **ESCENA: `ENCUENTRO_TIO_PIER`**
*   **IMAGEN:** `bosque_hongos_magicos.webp` (con `tio_pier.webp`).
*   **TEXTO:**
    > "¡Hola, tío Pier!", exclama Irupé. El tío Pier se da la vuelta y sonríe. "¡Oh, Irupé! ¡Indi! ¡Nuria! ¡Qué sorpresa! ¿Qué andan haciendo por acá?", dice con voz alegre. "¡Tío Pier! La bruja Romi se robó los colores de los animalitos y las flores. ¡Estamos buscando su casa para recuperarlos!", le responde Indira, muy decidida.
*   **OPCIONES:**
    1.  **Botón 1:** "Continuar charlando" -> Va a `ENCUENTRO_TIO_PIER_2`.


### **ESCENA: `ENCUENTRO_TIO_PIER_2`**
*   **IMAGEN:** `bosque_hongos_magicos.webp` (con `tio_pier.webp`).
*   **TEXTO:**
    > El tío Pier se rasca la barbilla, pensativo. "Mmm, es un problema grave. Yo sé dónde vive la bruja, pero antes necesito un favor... Estoy haciendo mi famosa sopa de hongos de colores y me falta un ingrediente especial: un hongo que ríe. Si me ayudan a encontrarlo, las guiaré por un camino secreto", añade con un guiño.
*   **OPCIONES:**
    1.  **Botón 1:** "Buscar el hongo que ríe" -> Va a desafío `DESAFIO_BUSCAR_HONGO`.

*   **DESAFÍO (MINIJUEGO DE OBSERVACIÓN):**
    *   **Instrucción:** "Tocá los hongos hasta encontrar el que se ríe".
    *   **Mecánica:** En la pantalla aparecen varios hongos. Al hacer clic en cada uno, emiten diferentes sonidos. Solo uno se ríe ("je je je").
    *   **Resultado:** Al encontrar el hongo correcto -> Va a `TIO_PIER_RECOMPENSA`.

### **ESCENA: `TIO_PIER_RECOMPENSA`**
*   **IMAGEN:** `bosque_hongos_magicos.webp` (con `tio_pier.webp`).
*   **TEXTO:**
    > "¡Lo encontraste!", grita el tío Pier. "Sos muy lista, Irupé". El tío Pier saca de su bolsillo una flor brillante y mágica. "Esta es una flor de luz. Úsenla para iluminar el camino secreto que las llevará más rápido a la casa de la bruja Romi. ¡Buena suerte!".
*   **OPCIONES:**
    1.  **Botón 1:** "Agradecer al tío Pier y continuar" -> Va a `CAMINO_SECRETO_CASA_BRUJA`.

### **ESCENA: `CASA_BRUJA_EXTERIOR`**
*   **IMAGEN:** `casa_bruja.webp` (con puerta visible).
*   **TEXTO:**
    > Allí, entre árboles retorcidos, encuentran la casa de la bruja Romi. Es una casita vieja de madera con una puerta pequeña. Parece tranquila, aunque un poco triste.
*   **OPCIONES:**
    1.  **Botón 1:** "Tocar la puerta" -> Va a `INTERIOR_CASA_BRUJA`.

### **ESCENA: `CAMINO_SECRETO_CASA_BRUJA`**
*   **IMAGEN:** `camino_secreto.webp`
*   **TEXTO:**
    > Irupé levanta la flor mágica y esta comienza a brillar con una luz cálida. Sus destellos revelan un sendero oculto entre los árboles, lleno de polvo de hadas. «¡Mirá, un atajo!», exclama Nuria. Siguiendo el camino secreto iluminado por la flor, llegan rápidamente al claro donde vive la bruja.
*   **OPCIONES:**
    1.  **Botón 1:** "Avanzar por el claro" -> Va a `CASA_BRUJA_EXTERIOR`.

### **ESCENA: `INTERIOR_CASA_BRUJA`**
*   **IMAGEN:** `interior_casa_bruja.webp` (con `bruja_romi.webp` de espaldas).
*   **TEXTO:**
    > La puerta se abre con un crujido. Dentro, la casa no es aterradora, pero sí está muy desordenada. Hay libros por el suelo, pociones derramadas y plantas raras en las esquinas. Al fondo, ven a una mujer sentada en una silla, de espaldas. Es la bruja Romi. Está sollozando bajito. A su lado, sobre una mesa, brilla un frasco de cristal lleno de colores.
*   **OPCIONES:**
    1.  **Botón 1:** "Acercarse y hablar con Romi" -> Va a `HABLAR_CON_ROMI`.

### **ESCENA: `HABLAR_CON_ROMI`**
*   **IMAGEN:** `interior_casa_bruja.webp` (con `bruja_romi.webp` mirando hacia ellas, con lágrimas).
*   **TEXTO:**
    > Irupé se acerca con cuidado. "¿Romi?", pregunta con voz suave. La bruja se da la vuelta. Tiene los ojos rojos de tanto llorar. "¿Qué quieren?", dice con voz triste. Irupé le pregunta: "¿Por qué estás tan triste? ¿Y por qué te llevaste los colores del bosque?". Romi suspira. "Me sentía muy sola", confiesa. "El bosque estaba tan lleno de alegría y color que me hacía sentir aún más triste. Pensé que si me llevaba los colores, yo me sentiría mejor... pero no funcionó. Ahora me siento peor".
*   **OPCIONES:**
    1.  **Botón 1:** "Siguiente" -> Va a `DECISION_FINAL`.


### **ESCENA: `DECISION_FINAL`**
*   **IMAGEN:** `interior_casa_bruja.webp` (con `bruja_romi.webp`).
*   **TEXTO:**
    > Ahora que saben la verdad, Irupé y sus amigas deben decidir qué hacer. Romi no es mala, solo está muy triste y sola.
*   **OPCIONES:**
    1.  **Botón 1:** "Enojarse con ella y exigir que devuelva los colores" -> Va a `FINAL_MALO`.
    2.  **Botón 2:** "Invitarla a jugar con ellas para que no esté triste" -> Va a `FINAL_BUENO`.
    3.  **Botón 3 (solo si se tiene la flor de luz):** "Ofrecerle a Romi la flor de luz" -> Va a `FINAL_SECRETO`.

*   **NOTA PARA EL DESARROLLADOR:** El BOTÓN 3 solo debe aparecer si el jugador ha pasado por la escena `TIO_PIER_RECOMPENSA`.

### **ESCENA: `FINAL_BUENO`**
*   **IMAGEN:** `final_bosque_con_color.webp` (con todos los personajes sonriendo).
*   **TEXTO:**
    > Irupé se acerca a Romi carinosamente. "No tenés que estar sola", dice. "¿Querés jugar con nosotras?". Romi sonríe y una lágrima de felicidad libera los colores del frasco. El bosque recupera su brillo. La abuela Tere aparece y dice: "Lo hicieron muy bien, niñas. La amistad es la magia más poderosa". ¡Has completado la aventura con el mejor final!
*   **OPCIONES:**
    1.  **Botón 1:** "Volver a empezar" -> Va a `INICIO`.

### **ESCENA: `FINAL_SECRETO`**
*   **IMAGEN:** `final_secreto_transformacion.webp`
*   **TEXTO:**
    > Irupé le ofrece a Romi la flor de luz. Una lágrima de emoción cae sobre los pétalos y desata una magia poderosa. La casa oscura se llena de luz y flores. Romi sonríe radiante. "Gracias", dice. La abuela Tere aparece: "Han descubierto la magia más grande de todas: la generosidad". ¡Desbloqueaste el final secreto!
*   **OPCIONES:**
    1.  **Botón 1:** "Volver a empezar" -> Va a `INICIO`.

### **ESCENA: `FINAL_MALO`**
*   **IMAGEN:** `interior_casa_bruja.webp` (con `bruja_romi.webp` llorando más fuerte).
*   **TEXTO:**
    > Irupé se cruza de brazos y dice en voz fuerte: "¡Devolvé los colores ahora mismo! ¡Lo que hiciste estuvo mal!". Romi se asusta y comienza a llorar más fuerte. Toma el frasco y se lo entrega a Irupé. Luego corre y se encierra en su habitación. Irupé, Indi y Nuria salen de la casa con el frasco. Al abrirlo, los colores vuelven al bosque... pero algo no se siente bien. Romi sigue sola. ¡Fin!
*   **OPCIONES:**
    1.  **Botón 1:** "Volver a empezar" -> Va a `INICIO`.

---

### **ESCENA: `ZONA_RIO`**
*   **IMAGEN:** `zona_rio.webp`
*   **TEXTO:**
    > Deciden tomar el sendero junto al río. A medida que avanzan, notan algo muy extraño: entre el pasto brillante, algunas flores están completamente blancas, como si hubieran perdido todo su color. El agua cristalina hace un sonido relajante, pero de pronto escuchan un "croac... croac..." muy bajito y tristón que viene de la orilla.
*   **OPCIONES:**
    1.  **Botón 1:** "Acercarse despacito a investigar la orilla" -> Va a `RIO_SAPO`.
    2.  **Botón 2:** "Llamar en voz alta para ver quién está triste" -> Va a `RIO_SAPO`.

### **ESCENA: `RIO_SAPO`**
*   **IMAGEN:** `rio_sapo.webp`
*   **TEXTO:**
    > En la orilla del río descubren a un sapo grande y regordete, ¡pero es completamente blanco! El sapo las mira suspirando: "¡Ay de mí! Estaba lo más pancho descansando y pasó la Bruja Romi. Me sacó todo mi color verde y se fue volando. ¡Se robó mis colores!"
*   **OPCIONES:**
    1.  **Botón 1:** "Consolarlo y seguir por el camino del río" -> Va a `RIO_DUENDE`.

### **ESCENA: `RIO_DUENDE`**
*   **IMAGEN:** `rio_duende_hada.webp`
*   **TEXTO:**
    > El agua cristalina corre y hace un sonido relajante. Mientras avanzan, descubren a dos figuras al costado del río: el pequeño duende Milo de sombrero de hojas y el hada Jazmín de alas brillantes. Él observa el agua con gesto serio, mientras ella sonríe con dulzura.
*   **OPCIONES:**
    1.  **Botón 1:** "Saludar a Milo y Jazmín" -> Va a `RIO_HABLAR_DUENDE`.

### **ESCENA: `RIO_HABLAR_DUENDE`**
*   **IMAGEN:** `rio_duende_hada.webp` (con `duende_milo.webp` y `hada_jazmin.webp`).
*   **TEXTO:**
    > "¡Hola!", saludas con amabilidad. "La bruja Romi se robó los colores del bosque y necesitamos encontrar su casa para recuperarlos". Milo las mira de pies a cabeza con desconfianza.
*   **OPCIONES:**
    1.  **Botón 1:** "Esperar la respuesta de Milo" -> Va a `RIO_HABLAR_DUENDE_2`.

### **ESCENA: `RIO_HABLAR_DUENDE_2`**
*   **IMAGEN:** `rio_duende_hada.webp` (con `duende_milo.webp` y `hada_jazmin.webp`).
*   **TEXTO:**
    > "Soy Milo, y estoy muy ocupado", te responde el duende de mala gana. "A menos que puedan resolver mi acertijo, no molesten". Jazmín revolotea cerca y agrega: "¡Es divertido! Si lo resuelven, las ayudaremos a llegar a la casa de la bruja".
*   **OPCIONES:**
    1.  **Botón 1:** "Escuchar el acertijo" -> Va a desafío `DESAFIO_ACERTIJO_DUENDE`.

*   **DESAFÍO (ACERTIJO):**
    *   **Pregunta:** "Todos me quieren para descansar. ¡Si ya te lo he dicho! No lo pensés más. ¿Qué soy?"
    *   **OPCIONES DEL ACERTIJO:**
        *   "Una cama" -> Va a `RIO_DUENDE_FALLO`.
        *   "Una silla" -> Va a `RIO_DUENDE_RECOMPENSA`.
        *   "Un árbol" -> Va a `RIO_DUENDE_FALLO`.

### **ESCENA: `RIO_DUENDE_FALLO`**
*   **IMAGEN:** `rio_duende_hada.webp` (con `duende_milo.webp` de espaldas y `hada_jazmin.webp` mirando preocupada).
*   **TEXTO:**
    > "¡Incorrecto!", gruñe Milo. "No tienen tiempo para nuestros juegos. Sigan su camino". Milo les da la espalda y sigue pescando. Jazmín les sonríe y les desea suerte. Las niñas deben seguir solas.
*   **OPCIONES:**
    1.  **Botón 1:** "Seguir caminando por el río" -> Va a `CAMINO_CASA_BRUJA`.

### **ESCENA: `RIO_DUENDE_RECOMPENSA`**
*   **IMAGEN:** `rio_duende_hada.webp` (con `duende_milo.webp` sonriendo y `hada_jazmin.webp` aplaudiendo).
*   **TEXTO:**
    > "¡Correcto!", dice Milo sonriendo. Jazmín aplaude. "¡Qué listas son! Como recompensa, les daremos un atajo". Milo les entrega una piedra plana. "Lancen esta piedra tres veces en el río y aparecerá un puente mágico que las llevará directo a la casa de la bruja".
*   **OPCIONES:**
    1.  **Botón 1:** "Lanzar la piedra al río" -> Va a desafío `DESAFIO_LANZAR_PIEDRA`.

*   **DESAFÍO (MINIJUEGO DE LANZAR LA PIEDRA):**
    *   **INSTRUCCIÓN:** "Tocá la piedra tres veces para lanzarla al río".
    *   **MECÁNICA:** En la pantalla aparece una piedra mágica brillante. El jugador debe hacer clic sobre ella tres veces. Con cada clic:
        *   **1er CLIC:** La piedra hace "PLOP" y aparecen ondas en el agua. Mensaje: "¡UNA VEZ!".
        *   **2do CLIC:** La piedra hace "PLOP" de nuevo. Mensaje: "¡DOS VECES!".
        *   **3er CLIC:** La piedra hace "PLOP" y comienza a brillar el agua. Mensaje: "¡TRES VECES! ¡MIRA, APARECE EL PUENTE!".
    *   **RESULTADO:** Al completar los 3 clics -> Aparece un puente mágico brillante -> Va a `RIO_PUENTE_MAGICO`.

### **ESCENA: `RIO_PUENTE_MAGICO`**
*   **IMAGEN:** `rio_puente_magico.webp` (nueva imagen del puente brillante sobre el río).
*   **TEXTO:**
    > Del agua surge un hermoso puente hecho de luz y flores acuáticas. Milo y Jazmín despiden a las niñas con una sonrisa. Las tres amigas cruzan el puente, que las lleva directo a un claro en el bosque.
*   **OPCIONES:**
    1.  **Botón 1:** "Cruzar el puente hacia la casa de la bruja" -> Va a `CASA_BRUJA_EXTERIOR`.


---
*(Aquí se podrían añadir más ramas si fuera necesario).*
