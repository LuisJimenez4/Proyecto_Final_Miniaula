# F0-02 — Repositorio git y GitHub

| Campo | Valor |
|---|---|
| Estado | bloqueada (espera datos del usuario) |
| Fase | Fase 0 — Base del proyecto |
| Requisitos | Entrega (monorepo en GitHub con ramas y PRs); "Contribución en Git" (5 pts) |
| Rama | `main` |
| Responsable | ambos integrantes |

## Objetivo

Tener el proyecto versionado en un repositorio de GitHub compartido por la pareja, con `main` protegida
y el flujo rama por tarea + Pull Request.

## Problema y motivo

La carpeta no es un repositorio git. La rúbrica puntúa commits, PRs propios y revisiones al compañero,
y la entrega final es el enlace al repo con el tag `v1.0.0`. Cuanto antes empiece el historial, mejor.

## Alcance y restricciones

- Inicializar git en la raíz del monorepo (esta carpeta).
- No subir secretos: revisar `.gitignore` antes del primer commit.
- Mover el frontend a `web/` **no** entra aquí (es F0-03).

## Alcance de edición autorizado

- `.gitignore`
- `odd/tasks/F0-02-repositorio-git.md`, `MEMORY.md`, `docs/requisitos.md`, `docs/plan-backend.md`

## Pasos

- [ ] F0-02.1 — Completar `.gitignore` con lo que usa el docente: `.env.*` con `!.env.example`, `**/data/mysql/`, `coverage/`, `.idea/`, `desktop.ini`.
- [ ] F0-02.2 — `git init -b main` y comprobar con `git status` que no aparece ningún `.env` ni `node_modules`.
- [ ] F0-02.3 — Commit inicial `chore(F0-02): estado inicial del backend y documentación de trabajo`.
- [ ] F0-02.4 — Crear el repo en GitHub (el usuario) y añadir el remoto; `git push -u origin main`.
- [ ] F0-02.5 — Invitar al compañero; proteger `main` (PR obligatorio, 1 revisión).

## Criterios de aceptación

- `git log` muestra el commit inicial; `git status` limpio.
- El remoto existe y ambos integrantes tienen acceso de escritura.
- Ningún secreto versionado (`git ls-files | grep -i env` solo muestra `.env.example`).

## Verificaciones

- `git ls-files` revisado antes del push.

## Decisiones

- Pendiente: nombre del repositorio y cuentas de GitHub de la pareja.

## Progreso y evidencia

| Fecha | Qué se hizo | Evidencia (comando → resultado) |
|---|---|---|

## Entrega

Push y creación del repo solo con autorización explícita del usuario (acción externa).

## Siguiente paso

Pedir al usuario: nombre del repo en GitHub, si será público o privado, y el usuario de GitHub del compañero.
Si prefiere posponerlo, marcar esta tarea como bloqueada y pasar a [B1-01](B1-01-dockerfile-api.md).
