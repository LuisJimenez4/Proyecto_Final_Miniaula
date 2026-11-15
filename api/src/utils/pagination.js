/** Calcula offset y limit para Sequelize a partir de page y limit ya validados. */
export const getPagination = ({ page, limit }) => ({
  limit,
  offset: (page - 1) * limit,
});

/** Metadatos de paginación de la respuesta: total, página actual y total de páginas (mínimo 1). */
export const buildPageMeta = (total, { page, limit }) => ({
  total,
  page,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
