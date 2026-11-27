---
name: cerrar-tarea
description: Cierra la tarea en curso de MiniAula aplicando la Definition of Done, actualiza la trazabilidad (plan, requisitos, contrato, MEMORY) y deja preparada la siguiente tarea. Usar cuando una tarea cumple sus criterios de aceptación, o cuando el usuario diga "cierra la tarea", "terminamos", "da por hecha" o invoque /cerrar-tarea.
---

# Cerrar tarea — MiniAula

## 1. Comprobar la Definition of Done (`AGENTS.md` §3)

Para la tarea de "Tarea en curso" en `MEMORY.md` (archivo `odd/tasks/<ID>-*.md`):

- [ ] Cada criterio de aceptación tiene evidencia real en "Progreso y evidencia".
- [ ] Solo se tocaron archivos del alcance autorizado.
- [ ] Se respetaron los `AGENTS.md` de las capas tocadas.
- [ ] Si cambió un endpoint: `api/src/docs/swagger.js` y `postman/miniaula.postman_collection.json` actualizados.

Si algo falla → **no cerrar**: dejar `Estado: en curso`, escribir en "Siguiente paso" lo que falta y avisar al usuario.

## 2. Actualizar la trazabilidad

1. **Archivo de tarea:** `Estado: cerrada`, pasos en `[x]`, "Siguiente paso: Cerrada. Continuar con <ID siguiente>".
2. **`docs/plan-backend.md`:** marcar `[x]` la tarea.
3. **`docs/requisitos.md`:** cambiar el estado (✅/⚠️/❌) de cada código que movió la tarea y la fecha de "Última revisión".
4. **`docs/api-contrato.md`:** actualizar columnas "Actual" y "Estado" si cambió alguna ruta.
5. **`docs/arquitectura.md`:** añadir/actualizar ADR si se tomó una decisión de arquitectura.
6. **`MEMORY.md`:**
   - "Última tarea cerrada" = esta tarea con fecha (AAAA-MM-DD).
   - "Tarea en curso" = —.
   - "Siguiente tarea" = la siguiente `[ ]` del plan que no esté bloqueada (y alternativa si lo está).
   - Contador de requisitos ✅ recalculado desde `docs/requisitos.md`.
   - Mover a "Decisiones tomadas" lo que se decidió; quitar de "Pendientes" lo resuelto; quitar de
     "Problemas conocidos" lo arreglado.
   - Una línea en la "Bitácora".
   - Mantener `MEMORY.md` en **150 líneas o menos**: si se pasa, resumir las filas antiguas de la bitácora por fase.

## 3. Preparar la siguiente

Crear `odd/tasks/<ID siguiente>-<slug>.md` desde `odd/PLANTILLA.md` si no existe (Estado `preparada`),
con alcance, criterios y un "Siguiente paso" concreto. Así `/siguiente-tarea` arranca sin investigar.

## 4. Informar al usuario

- Qué quedó hecho y la evidencia.
- Qué **no** se verificó.
- Discrepancias encontradas entre documentación y código (regla global del usuario).
- Cuál es la siguiente tarea y si necesita algo de él.
- Sugerir el commit `<tipo>(<ID>): <resumen>` pero **no** hacerlo salvo que lo pida.
