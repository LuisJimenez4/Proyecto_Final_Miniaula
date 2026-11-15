import React from 'react';

const VARIANTS = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  // Niveles de curso (constants/NIVELES)
  Básico: 'bg-emerald-50 text-emerald-700',
  Intermedio: 'bg-amber-50 text-amber-700',
  Avanzado: 'bg-rose-50 text-rose-700',
};

/** Etiqueta pequeña para niveles, estados y categorías. `variant` acepta un tono o el nombre de un nivel. */
export const Badge = ({ variant = 'neutral', icon: Icon, className = '', children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${VARIANTS[variant] ?? VARIANTS.neutral} ${className}`}>
    {Icon && <Icon className="w-3 h-3 mr-1" />}
    {children}
  </span>
);

export default Badge;
