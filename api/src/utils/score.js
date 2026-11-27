/**
 * RN-02: calcula la nota (0-100) en el servidor. Cada pregunta cuenta una sola vez
 * (si llegan respuestas repetidas para la misma pregunta se usa la última) y las sin responder cuentan como error.
 */
export function calculateScore(preguntas, respuestas) {
  if (preguntas.length === 0) return 0;
  const seleccion = new Map(respuestas.map((r) => [r.preguntaId, r.indiceSeleccionado]));
  const aciertos = preguntas.filter((p) => seleccion.get(p.id) === p.indiceCorrecto).length;
  return Math.round((aciertos / preguntas.length) * 100);
}
