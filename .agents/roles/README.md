# Roles de agente

Prompts entregados por el usuario; se guardan tal cual. No modificarlos sin que el usuario lo pida.

| Archivo | Rol | Modelo previsto | Estado |
|---|---|---|---|
| [`planner.md`](planner.md) | Planificación y arquitectura | Opus / Fable | Entregado (2026-11-15) |
| [`coder.md`](coder.md) | Implementación | Sonnet | Entregado (2026-11-15) |
| [`judge.md`](judge.md) | Verificación final adversarial | Opus | Entregado (2026-11-15) |

## Flujo de Trabajo en tu Terminal (Ejemplo Práctico)

1. Planeación: Invocas a Fable/Opus, le das el PDF de MiniAula y le pides que lea `.agents/roles/planner.md`. Él te genera el plan y tú lo anotas en `MEMORY.md`.
2. Codificación: Invocas a Sonnet. Le dices: "Lee `.agents/roles/coder.md` y ejecuta la tarea activa en `MEMORY.md`". Sonnet escribirá el código de la tarea.
3. Verificación: Abres una nueva sesión (o cambias de modelo a Opus) y le dices: "Lee `.agents/roles/judge.md` y revisa este código que acaba de escribir Sonnet".
   * Si Opus encuentra un error, le pasas el reporte de Opus a Sonnet para que lo arregle.
   * Si Opus dice que está perfecto, haces el commit de tu código y actualizas `MEMORY.md` marcando la tarea como terminada.

## Relación con las skills del proyecto

| Paso del flujo | Skill que lo apoya |
|---|---|
| 2. Codificación (Sonnet) | `/siguiente-tarea` — ubica la tarea activa y su archivo en `odd/tasks/` |
| 3. Verificación aprobada → marcar terminada | `/cerrar-tarea` — actualiza `MEMORY.md`, plan, requisitos y prepara la siguiente |
