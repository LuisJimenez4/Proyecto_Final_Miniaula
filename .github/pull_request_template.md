## Qué hace

<!-- Una o dos frases. Una tarea por PR (ej. B3-02 — Cursos). -->

## Tarea y requisitos

- Tarea: <!-- ID de docs/plan-backend.md, p. ej. B3-02 -->
- Códigos de requisito: <!-- RF-xx, RN-xx, RT-Bxx, RT-Fxx -->

## Cómo probarlo

<!-- Pasos para que el revisor lo levante: docker compose up --build, npm run smoke, peticiones de ejemplo. -->

## Evidencia

<!-- Salida de curl / smoke o captura. Lo que no se verificó, dilo explícitamente. -->

## Lista de control

- [ ] La rama parte de `main` actualizado y se hizo `git rebase origin/main` antes de abrir el PR
- [ ] Probado con `docker compose up --build` (o `npm run smoke` contra la API en Docker)
- [ ] `git status` y `git diff --stat` revisados: no hay `.env`, `node_modules/`, `dist/` ni datos de MySQL
- [ ] Swagger y `docs/api-contrato.md` actualizados si cambió un endpoint
- [ ] `docs/requisitos.md` y `MEMORY.md` actualizados en el último commit
- [ ] Funciones cortas, constantes en lugar de números mágicos, mensajes en español

## Revisión (la completa el otro integrante)

- Lo levanté en mi máquina: <!-- sí / no -->
- Qué entendí del cambio (2 líneas):
