# AGENTS.md — docs/ (OpenAPI)

`swagger.js` (componentes) compone `paths/<recurso>.js` (helpers en `helpers.js`) y exporta la especificación OpenAPI 3 servida en `/api/docs` (RT-B10, criterio "Diseño de la API").

## Reglas

- Todo endpoint de [`docs/api-contrato.md`](../../../docs/api-contrato.md) aparece aquí con: método, ruta,
  seguridad (`BearerAuth` si no es público), parámetros, body de ejemplo, respuesta de éxito y errores posibles.
- Los errores referencian el esquema común `ErrorResponse` (`{ error: { code, message, details } }`).
- Cambiar o crear un endpoint obliga a actualizar este archivo **y** `postman/miniaula.postman_collection.json` en la misma tarea.
- Ejemplos con los usuarios del seed para que el docente pueda probar sin inventar datos.
- Nunca incluir `indiceCorrecto` en respuestas de ejemplo para estudiantes.
