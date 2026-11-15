# AGENTS.md — routes/

Define los endpoints. Una ruta **solo compone** middlewares y un controlador: sin lógica, sin consultas.

## Reglas

- Un archivo por recurso: `<recurso>.routes.js`, exporta un `Router`; se monta en `routes/index.js` bajo `/api`.
- Las rutas y métodos salen de [`docs/api-contrato.md`](../../../docs/api-contrato.md) (tabla del PDF). Nada de rutas inventadas.
- Orden fijo de middlewares:
  1. `userLoggedIn` (si no es pública)
  2. `requireRole('instructor' | 'estudiante')`
  3. `schemaValidate(schema, 'params')`, `schemaValidate(schema, 'query')`, `schemaValidate(schema, 'body')`
  4. `getObjectOr404(Model, 'param')` → deja el registro en `req.object`
  5. `ownsCourse` o verificación de inscripción
  6. controlador
- Rutas anidadas del PDF (`/cursos/:id/lecciones`, `/cursos/:id/lecciones/orden`, `/cursos/:id/progreso`)
  se declaran en el router del recurso padre (`curso.routes.js`) y llaman al controlador del recurso hijo.
- Cada ruta lleva un comentario de una línea con el código de requisito que cubre (`// RF-08, RN-07`).
- Rutas estáticas antes que dinámicas (`/mias` antes de `/:id`).

## Ejemplo

```js
// PUT /api/cursos/:id — RF-06, RN-07
router.put(
  '/:id',
  userLoggedIn,
  requireRole('instructor'),
  schemaValidate(idParamSchema, 'params'),
  schemaValidate(updateCursoSchema, 'body'),
  getObjectOr404(Curso),
  ownsCourse,
  cursoController.update,
);
```
