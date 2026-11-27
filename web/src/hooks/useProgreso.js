import { useMemo } from 'react';

const idDe = (item) => item.leccionId ?? item.id;

/**
 * RT-F04: hook con la lógica de progreso de un curso a partir de `GET /cursos/:id/progreso`.
 * Todo lo que depende de reglas (desbloqueo RN-01, intentos RN-03) viene calculado por la API; aquí solo se resume.
 */
export const useProgreso = (leccionesProgreso = []) => {
  const stats = useMemo(() => {
    const lista = Array.isArray(leccionesProgreso) ? leccionesProgreso : [];
    const leccionesOrdenadas = [...lista].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    const total = leccionesOrdenadas.length;
    const completadas = leccionesOrdenadas.filter((l) => l.completada).length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
    return { total, completadas, porcentaje, leccionesOrdenadas };
  }, [leccionesProgreso]);

  const findLeccion = (leccionId) => stats.leccionesOrdenadas.find((l) => idDe(l) === Number(leccionId));

  const isLeccionDesbloqueada = (leccionId) => Boolean(findLeccion(leccionId)?.desbloqueada);

  /** Intentos restantes que informa la API para un cuestionario (null si no aplica). */
  const getIntentosRestantes = (leccionId) => findLeccion(leccionId)?.intentosRestantes ?? null;

  /** Lección anterior y siguiente en el orden actual del curso. */
  const getVecinas = (leccionId) => {
    const index = stats.leccionesOrdenadas.findIndex((l) => idDe(l) === Number(leccionId));
    return {
      anterior: index > 0 ? stats.leccionesOrdenadas[index - 1] : null,
      siguiente: index >= 0 ? stats.leccionesOrdenadas[index + 1] ?? null : null,
    };
  };

  /** Primera lección desbloqueada y sin completar (o la primera del curso si todo está al día). */
  const getLeccionActual = () =>
    stats.leccionesOrdenadas.find((l) => l.desbloqueada && !l.completada) ?? stats.leccionesOrdenadas[0] ?? null;

  return {
    ...stats,
    findLeccion,
    isLeccionDesbloqueada,
    getIntentosRestantes,
    getVecinas,
    getLeccionActual,
  };
};

export default useProgreso;
