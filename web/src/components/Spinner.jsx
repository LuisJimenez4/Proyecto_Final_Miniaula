import React from 'react';

const SIZES = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };

/** Indicador de carga accesible. */
export const Spinner = ({ size = 'lg', label = 'Cargando', className = '' }) => (
  <div role="status" aria-label={label} className={`rounded-full border-indigo-100 border-t-indigo-600 animate-spin ${SIZES[size] ?? SIZES.lg} ${className}`} />
);

export default Spinner;
