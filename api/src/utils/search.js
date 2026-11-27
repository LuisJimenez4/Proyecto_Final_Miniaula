/** Escapa los comodines de LIKE (% _ y la propia barra) para que `q` se busque como texto literal. */
export const escapeLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');
