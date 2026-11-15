# odd/ — Documentos de tarea

Mismo sistema que usa el docente en el repo de la materia (`expressapi/odd/tasks`, `practicareact/odd/tasks`):
**cada tarea tiene un archivo propio** que dice qué se va a hacer, qué archivos se pueden tocar, cómo se verifica,
qué se hizo y **cuál es el siguiente paso**. Así cualquier agente o integrante retoma el trabajo sin adivinar.

## Cómo encaja con el resto

```text
MEMORY.md                 → ¿en qué tarea estamos y cuál sigue?  (puntero)
docs/plan-backend.md      → lista ordenada de todas las tareas    (hoja de ruta)
odd/tasks/<ID>-<slug>.md  → detalle, evidencia y siguiente paso   (la tarea en sí)
docs/requisitos.md        → estado de cada RF / RN / RT           (resultado)
```

## Ciclo de vida de una tarea

| Estado | Significa | Quién lo pone |
|---|---|---|
| `preparada` | Archivo creado con alcance y criterios; aún no se toca código | skill `cerrar-tarea` (deja lista la siguiente) o `siguiente-tarea` |
| `en curso` | Se está implementando | skill `siguiente-tarea` |
| `bloqueada` | Espera una decisión o dato del usuario (anotado en "Siguiente paso") | cualquiera |
| `cerrada` | Cumple los criterios y hay evidencia | skill `cerrar-tarea` |

## Reglas

- Nombre: `odd/tasks/<ID>-<slug>.md` con el ID de `docs/plan-backend.md` (`F0-02`, `B3-06`...). Plantilla: [`PLANTILLA.md`](PLANTILLA.md).
- Solo se editan los archivos de **"Alcance de edición autorizado"**. Si hace falta otro, se añade ahí antes y se avisa.
- "Progreso y evidencia" registra comandos ejecutados y su resultado real. Lo no verificado se dice tal cual.
- "Siguiente paso" nunca queda vacío: es lo primero que lee el agente al retomar.
- Prefijos: `F0` base del repo · `B1..B5` backend · `W` frontend (cuando empiece) · `E` entrega final.
