# Formato del Informe de Auditoría

Todos los informes de auditoría deben seguir este formato para ser consistentes y fáciles de leer.

---

## Template

```markdown
## Informe de Auditoría — [nombre del documento]
**Fecha:** [fecha actual]
**Modo:** Particular | General
**Alcance:** [qué se analizó]
**Fuentes consultadas:** [archivos fuente que se leyeron para verificar]

---

### ✅ Conforme
[Lo que está correcto. Si todo está bien, decirlo explícitamente.]

---

### ⚠️ Hallazgos

| # | Severidad | Descripción | Ubicación | Corrección propuesta |
|---|-----------|-------------|-----------|----------------------|
| 1 | ALTA | [descripción del problema] | Línea ~X / Sección "Y" | [qué debería decir] |
| 2 | MEDIA | ... | ... | ... |
| 3 | BAJA | ... | ... | ... |

---

### 📋 Correcciones Propuestas

[Descripción narrativa de los cambios, si son varios o complejos.
Para cambios simples, la tabla de hallazgos es suficiente.]

---

¿Querés que aplique estas correcciones?
```

---

## Criterios de Severidad

| Severidad | Criterio |
|-----------|----------|
| **ALTA** | Información técnicamente incorrecta (haría fallar a un agente que la siga) |
| **MEDIA** | Información incompleta o parcialmente desactualizada (confunde pero no bloquea) |
| **BAJA** | Mejoras de claridad, typos, formato, links rotos sin impacto funcional |

---

## Informe Parcial (Auditoría General)

Cuando el agente procesa un documento a la vez en modo *Auditoría General*, usa esta variante compacta para los hallazgos intermedios:

```markdown
### 📄 [nombre del archivo] — Revisión parcial

✅ Correcto: [resumen de lo que está bien]

⚠️ Hallazgos: [lista breve de problemas encontrados]

*(Continúo con el siguiente documento...)*
```

Al final de la ronda completa, consolida todos los hallazgos en el template completo de arriba.
