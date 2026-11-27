import { ZodError } from 'zod';
import AppError from '../errors/AppError.js';

const formatIssue = (issue) => (issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message);

/**
 * RT-B04: valida body, params o query con Zod.
 * ADR-05: en Express 5 `req.query` es de solo lectura, por eso el resultado se guarda en `req.validated[source]`
 * (y además se reescribe `req.body` y `req.params` para que los controladores reciban datos ya limpios).
 */
const schemaValidate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source] ?? {});
      req.validated = { ...req.validated, [source]: parsed };
      if (source !== 'query') req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, 'VALIDATION_ERROR', 'Datos de entrada inválidos', error.issues.map(formatIssue)));
      }
      return next(error);
    }
  };
};

export default schemaValidate;
