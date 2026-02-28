---
name: dev-server
description: |
  Levanta servidor HTTP local (Python) para servir el proyecto.
  Activar al pedir: servidor, dev server, abrir en navegador, probar en el browser.
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
