---
name: siguiente-tarea
description: Retoma el proyecto MiniAula y prepara o continúa la siguiente tarea del plan (odd/tasks). Usar cuando el usuario diga "qué sigue", "siguiente tarea", "continuemos", "sigamos", "retoma" o invoque /siguiente-tarea. Opcionalmente recibe un ID de tarea (p. ej. B1-01) para saltar a ella.
---

# Siguiente tarea — MiniAula

Objetivo: que el agente sepa **dónde está parado** y deje lista (o continúe) la tarea correcta sin que el
usuario tenga que explicar nada.

## 1. Ubicarse (solo lectura)

1. Leer `MEMORY.md` → tabla "Ahora mismo": **Tarea en curso**, **Siguiente tarea**, bloqueos.
2. Elegir la tarea objetivo:
   - Si el usuario pasó un ID como argumento, usar ese ID.
   - Si hay **Tarea en curso**, continuar esa.
   - Si no, tomar **Siguiente tarea**. Si está `bloqueada`, usar la alternativa que indique `MEMORY.md`.
3. Abrir `odd/tasks/<ID>-*.md`.
   - Si no existe: crearlo copiando `odd/PLANTILLA.md` y rellenarlo con los datos de esa tarea en
     `docs/plan-backend.md` (requisitos, archivos, criterio de aceptación) y con lo que diga `docs/requisitos.md`.
     Estado `preparada`.
4. Leer en el archivo de tarea: "Alcance de edición autorizado", "Criterios de aceptación" y **"Siguiente paso"**.
5. Leer el `AGENTS.md` de cada carpeta que aparece en el alcance autorizado.
6. Revisar "Pendientes de decisión" de `MEMORY.md` y la sección "Decisiones" de la tarea.

## 2. Presentar al usuario (antes de tocar código)

Resumen breve en español:
- **Tarea:** ID, título y estado.
- **Por qué:** requisito(s) y criterio de la rúbrica que mueve.
- **Archivos que voy a tocar:** lista del alcance autorizado.
- **Cómo sé que está hecha:** criterios de aceptación.
- **Necesito de ti:** decisiones o datos pendientes (si los hay).

Si hay decisiones pendientes → preguntar y esperar. Si el usuario ya dijo que la hiciera ("hazla", "dale",
"implementa") y no hay decisiones abiertas → seguir al punto 3 sin volver a preguntar.

## 3. Ejecutar

1. Poner `Estado: en curso` en el archivo de tarea y "Tarea en curso: <ID>" en `MEMORY.md`.
2. Hacer los pasos en orden, marcando `[x]` cada uno. Editar **solo** archivos del alcance autorizado;
   si hace falta otro, añadirlo al alcance y decírselo al usuario.
3. Registrar en "Progreso y evidencia" cada verificación real (comando → resultado). Nada de inventar resultados.
4. Si aparece un bloqueo: `Estado: bloqueada`, explicar en "Siguiente paso" qué falta y avisar al usuario.
5. Al cumplir los criterios de aceptación → usar la skill **cerrar-tarea**.

## Reglas

- Una tarea a la vez. No adelantar trabajo de otras tareas aunque se vea el problema (anotarlo en `MEMORY.md` → "Problemas conocidos").
- Respetar el orden de autoridad de `AGENTS.md` §2 (PDF > decisiones > código > repo de clase).
- Commits, push y PR solo si el usuario lo pide.
