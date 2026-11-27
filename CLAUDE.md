# CLAUDE.md

Claude Code carga este archivo al iniciar. Las reglas viven en `AGENTS.md` (formato común para cualquier agente)
y el estado en `MEMORY.md`; aquí solo se importan.

@AGENTS.md
@MEMORY.md
@api/AGENTS.md

- Punto de entrada del trabajo: skill `/siguiente-tarea` (o el usuario dice "qué sigue").
- La tarea activa está en `odd/tasks/<ID>-*.md`; su sección "Siguiente paso" dice qué hacer ahora.
- Antes de editar archivos en una carpeta de `api/src/`, leer el `AGENTS.md` de esa carpeta.
- Al terminar cada tarea: skill `/cerrar-tarea` (actualiza `MEMORY.md`, `docs/` y prepara la siguiente).
