# Checks JavaScript — Criterios de Auditoría Semántica

Estos criterios los aplica el agente leyendo el código real. El script `auditar.py`
cubre la detección mecánica (magic numbers, `console.log`, etc.). Acá se describe
lo que requiere comprensión humana/IA.

---

## 1. Campos Privados (`#`)

**Regla:** Toda propiedad de estado de una clase debe usar `#` (private class fields).
Los únicos miembros públicos permitidos son los métodos de interfaz.

**Qué buscar:**
- Campos sin `#` que almacenen estado (`this.algo = ...` en constructor)
- Propiedades asignadas dinámicamente fuera del constructor
- Getters/setters públicos que expongan estado interno sin necesidad

**Excepción:** Métodos de interfaz pública (`inicializar()`, `ejecutar()`, etc.) son públicos por diseño.

---

## 2. Inyección de Dependencias

**Regla:** Los módulos NO instancian sus propias dependencias. Todo se inyecta desde `main.js`.

**Qué buscar:**
- `new ClaseX()` dentro de un módulo que no sea `main.js`
- `import { X } from './X.js'` seguido de instanciación directa
- Módulos que hacen `document.getElementById()` para obtener dependencias
  que deberían recibir inyectadas

**Patrón correcto:**
```javascript
// En main.js:
const modulo = new Modulo({ dep1, dep2, dep3 });

// En Modulo.js:
constructor({ dep1, dep2, dep3 }) {
    this.#dep1 = dep1;
    // ...
}
```

---

## 3. No Hardcodear Narrativa

**Regla de AGENTS.md:** "La narrativa, configuración de desafíos y lógica de ramificación
viven en los JSONs, NO hardcodeadas en JavaScript."

**Qué buscar:**
- IDs de escena/desafío como strings literales en JS (ej: `'FINAL_SECRETO'`)
- Textos narrativos embebidos en JS
- Lógica condicional basada en IDs de escena específicos
- Configuraciones de juego que deberían estar en el JSON

**Excepción:** IDs de elementos del DOM (`'pantalla-inicio'`, `'panel-texto'`) son legítimos.

---

## 4. Error Handling

**Regla:** Todo fetch debe tener manejo de error. Las precargas silencian errores
(fire-and-forget). Los errores críticos se muestran al usuario.

**Qué buscar:**
- `fetch()` o `ContentLoader.cargar()` sin `try/catch`
- Promesas sin `.catch()` que no estén en contexto de precarga
- `throw` sin un `catch` que lo atrape más arriba
- Errores capturados pero silenciados cuando deberían informarse
- Fallos silenciosos que dejen el juego en estado inconsistente

---

## 5. Guard Clauses y Doble-Click

**Regla:** Toda navegación y acción destructiva debe tener protección contra invocación múltiple.

**Qué buscar:**
- Handlers de click sin `disabled` o flag de guardia
- Navegación sin flag `#navegando` o equivalente
- Botones que no se deshabilitan tras la primera interacción
- Race conditions en operaciones async (ej: doble-click carga dos escenas)

---

## 6. Código Muerto (Dead Code)

**Qué buscar:**
- Métodos definidos pero nunca invocados (grep por nombre en todo el proyecto)
- Imports no utilizados
- Variables asignadas pero nunca leídas
- Ramas de código inalcanzables (`return` antes de código ejecutable)
- TODOs y FIXMEs abandonados (features incompletos)
- Métodos vacíos o con solo un comentario `// TODO`

---

## 7. Patrones de Diseño

**Qué buscar:**
- Strategy Pattern: los handlers de desafíos deben seguirlo (registry en ChallengeManager)
- Nuevos handlers deben registrarse en `main.js`, no instanciarse solos
- `switch` largos que deberían ser un Map/registry
- Duplicación de lógica entre handlers o módulos

---

## 8. Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Clases | PascalCase | `GameEngine`, `BibliotecaManager` |
| Métodos públicos | camelCase | `inicializar()`, `renderEscena()` |
| Métodos privados | #camelCase | `#cargarEscena()`, `#renderizarLuciernagas()` |
| Variables locales | camelCase | `escenaGuardada`, `contenido` |
| Constantes de clase | #UPPER_SNAKE | `#STORAGE_PREFIX`, `#DURACION_TRANSICION` |
| Idioma | Español | Nombres, métodos, comentarios, logs |

**Qué buscar:**
- Mezcla de inglés y español en el mismo módulo
- Variables en inglés (`data`, `response`, `callback`) en vez de español
- Constantes sin UPPER_SNAKE_CASE
- Información inconsistente entre JSDoc y la implementación

---

## 9. Rendimiento y Buenas Prácticas

**Qué buscar:**
- Listeners no removidos (memory leaks en SPAs)
- DOM queries repetidos que deberían cachearse
- `innerHTML` cuando `textContent` alcanza (seguridad + performance)
- Concatenación de strings donde template literals serían más claros
- `for...in` sobre arrays (debería ser `for...of` o `.forEach`)
- Falta de `const` donde la variable no se reasigna

---

## 10. Consistencia del Contrato de Handlers

Todos los challenge handlers deben cumplir:

```javascript
class NuevoHandler {
    #audioManager;
    constructor(audioManager) { this.#audioManager = audioManager; }
    async ejecutar(datos, panelEl, preloader) { /* → Promise<boolean> */ }
}
```

**Qué buscar:**
- Handlers que no devuelvan `Promise<boolean>`
- Handlers sin lógica de fallo (resultado siempre `true`)
- Handlers que no limpien su UI al finalizar
- Handlers que no deshabiliten interacción durante feedback
