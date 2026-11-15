# AGENTS.md — schemas/

Esquemas Zod para **toda** entrada: body, params y query (RT-B04). Archivo: `<recurso>.schema.js`, exports con nombre.

## Reglas

- Nombres: `create<Recurso>Schema`, `update<Recurso>Schema`, `<recurso>QuerySchema`, `<algo>ParamsSchema`.
- Esquemas comunes (ID numérico, paginación `page`/`limit`) en `common.schema.js` y se reutilizan (B2-01).
- Params y query llegan como texto: usar `z.coerce.number().int().positive()`.
- Paginación: `page` ≥ 1 (por defecto 1), `limit` entre 1 y el máximo de `constants/` (por defecto 10).
- Mensajes de error en español y claros: se muestran tal cual en el frontend (`details`).
- Los valores de enumeraciones (roles, estados, niveles, tipos) se importan de `constants/` cuando exista (B2-03).
- Reglas entre campos con `.refine` / `.superRefine` y `path` para que el error apunte al campo
  (p. ej. `indiceCorrecto < opciones.length`, también al editar).
- Un esquema de edición total (`PUT`) exige los campos obligatorios; uno parcial (`PATCH`) los hace `.optional()`
  y exige al menos uno.
- `.strict()` en bodies para rechazar campos no permitidos (p. ej. que un estudiante envíe `rol` o `estado`).
- Los esquemas validan forma y formato. Las reglas que necesitan la BD (RN-xx) van en `services/`.
