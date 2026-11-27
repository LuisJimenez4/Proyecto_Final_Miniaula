// Única función que interpreta los errores de la API (RT-F05).
// Formato de la API: { error: { code, message, details } } con details = ["campo: mensaje", ...] | objeto | null.

const FIELD_DETAIL = /^([\w.]+): (.+)$/;

const NETWORK_MESSAGE = 'No se pudo conectar con el servidor';
const DEFAULT_MESSAGE = 'Ha ocurrido un error inesperado al procesar la solicitud.';

const splitDetails = (details) => {
  const fieldErrors = {};
  const general = [];
  if (!Array.isArray(details)) return { fieldErrors, general };

  details.forEach((detail) => {
    const match = typeof detail === 'string' ? detail.match(FIELD_DETAIL) : null;
    if (match) fieldErrors[match[1]] = fieldErrors[match[1]] ?? match[2];
    else general.push(String(detail));
  });
  return { fieldErrors, general };
};

/**
 * Convierte cualquier error de axios en { status, code, message, details, fieldErrors, generalDetails }.
 * Las decisiones de interfaz se toman por `code`, nunca por el texto del mensaje.
 */
export const parseApiError = (err) => {
  const apiError = err?.response?.data?.error;

  if (!err?.response) {
    const isNetwork = Boolean(err?.request) || err?.code === 'ERR_NETWORK';
    return {
      status: 0,
      code: isNetwork ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
      message: isNetwork ? NETWORK_MESSAGE : err?.message || DEFAULT_MESSAGE,
      details: [],
      fieldErrors: {},
      generalDetails: [],
    };
  }

  const details = Array.isArray(apiError?.details) ? apiError.details : [];
  const { fieldErrors, general } = splitDetails(details);
  return {
    status: err.response.status,
    code: apiError?.code || 'UNKNOWN_ERROR',
    message: apiError?.message || DEFAULT_MESSAGE,
    details,
    fieldErrors,
    generalDetails: general,
  };
};

/** Mensaje general para el aviso de la pantalla: el mensaje de la API más los detalles que no apuntan a un campo. */
export const getGeneralMessage = (parsed) => [parsed.message, ...parsed.generalDetails].join(' · ');

/**
 * Marca cada error de campo en React Hook Form. Los campos que el formulario no tiene
 * se suman al aviso general. Devuelve el texto del aviso general.
 */
export const applyFieldErrors = (setError, parsed, knownFields = []) => {
  const orphans = [];
  Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
    if (knownFields.includes(field)) setError(field, { type: 'server', message });
    else orphans.push(`${field}: ${message}`);
  });
  return [getGeneralMessage(parsed), ...orphans].join(' · ');
};
