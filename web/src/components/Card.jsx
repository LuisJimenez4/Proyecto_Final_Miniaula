import React from 'react';

/** Contenedor base: borde, esquinas redondeadas y sombra. `hover` añade elevación para tarjetas clicables. */
export const Card = ({ hover = false, className = '', children, ...props }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 shadow-xs ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
