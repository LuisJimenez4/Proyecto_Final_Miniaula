# AGENTS.md — controllers/

Capa HTTP: traduce la petición en una llamada al servicio y el resultado en una respuesta. Nada más (RT-B01).

## Reglas

- Archivo `<recurso>.controller.js`; cada acción es un `export const <accion> = async (req, res) => { ... }`.
- **Prohibido:** importar modelos, consultar la BD, reglas de negocio, `try/catch` (Express 5 propaga los errores).
- Guardar primero en variables locales lo que se lee de `req` (`const curso = req.object;`, `const data = req.body;`).
- Si existe `req.object`, usar su `id` (`curso.id`), no `req.params.id` (convención de clase).
- Guardar el resultado del servicio en una variable antes de responder; **nunca** `await` dentro de `res.json(...)`.
- Una llamada a servicio por acción. Si hacen falta dos, se crea una función en el servicio que las combine.
- Códigos: 200 lectura/edición · 201 creación · 204 borrado (`res.status(204).end()`).

## Ejemplo

```js
export const update = async (req, res) => {
  const curso = req.object;
  const data = req.body;
  const updatedCurso = await cursoService.updateCourse(curso.id, data);
  res.status(200).json(updatedCurso);
};
```
