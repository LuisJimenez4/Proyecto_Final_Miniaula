---
name: estado-proyecto
description: Informe rápido y de solo lectura de dónde está parado el proyecto MiniAula (fase, tarea en curso, siguiente, avance de requisitos, bloqueos y riesgos para la nota). Usar cuando el usuario pregunte "en qué vamos", "cómo vamos", "dónde estamos", "estado del proyecto" o invoque /estado-proyecto. No modifica archivos.
---

# Estado del proyecto — MiniAula

**Solo lectura: no editar ningún archivo.**

1. Leer `MEMORY.md` (tabla "Ahora mismo", pendientes, problemas conocidos, últimas 3 líneas de la bitácora).
2. Contar en `docs/requisitos.md` cuántos códigos hay en ✅ / ⚠️ / ❌ por bloque (RF, RN, RT-B, buenas prácticas, entrega).
3. Contar en `docs/plan-backend.md` tareas `[x]` vs `[ ]` por fase.
4. Si hay tarea en curso, leer su "Siguiente paso" en `odd/tasks/`.

Responder en español, corto:

- **Fase y tarea:** fase actual, tarea en curso (o ninguna) y siguiente tarea.
- **Avance:** tabla pequeña de requisitos por bloque y tareas por fase.
- **Bloqueos:** decisiones que esperan al usuario.
- **Riesgo para la nota:** los ❌ que más puntos cuestan (Docker primero: si no levanta, Funcionalidad vale la mitad).
- **Para seguir:** decir `/siguiente-tarea`.
