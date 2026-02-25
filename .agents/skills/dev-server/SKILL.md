---
name: dev-server
description: |
  Levanta un servidor HTTP local con Python para servir el proyecto "La Biblioteca del Tío Pier".
  Activar cuando el usuario pida: iniciar servidor, levantar servidor, abrir el proyecto en el navegador,
  servidor de desarrollo, probar en el browser, correr el servidor, lanzar servidor, servidor local,
  ver el proyecto, abrir la app, iniciar la app, http.server, python server, servidor python,
  dev server, servidor de prueba.
---

# dev-server

Levanta un servidor HTTP local con Python en el directorio raíz del proyecto.

## Instrucción

Ejecutar el siguiente comando en la raíz del proyecto (el directorio raíz del workspace):

```
python -m http.server 8000
```

Usar `run_command` con `WaitMsBeforeAsync: 1500` para mandar el proceso al fondo y detectar
si falla en el intento (por ejemplo, puerto ocupado).

- **Si el servidor arranca sin errores:** Informar al usuario que el servidor está disponible
  en **[http://localhost:8000](http://localhost:8000)** y que puede abrir ese link en su navegador.
- **Si el comando falla** (ej: `OSError: [Errno 98] Address already in use` o puerto ocupado):
  Informar el error al usuario y sugerirle que cierre el proceso que usa el puerto 8000,
  o que pruebe con otro puerto (ej: `python -m http.server 8001`).

> **Nota:** El proyecto usa ES Modules nativos. No funciona abriendo `index.html` directo
> desde el sistema de archivos — SIEMPRE necesita un servidor HTTP.
