import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const STYLES = {
  success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  error: { box: 'bg-rose-50 border-rose-200 text-rose-800', icon: AlertCircle, iconColor: 'text-rose-600' },
  warning: { box: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-600' },
  info: { box: 'bg-blue-50 border-blue-200 text-blue-800', icon: Info, iconColor: 'text-blue-600' },
};

/** Aviso en pantalla (éxito, error, advertencia o información); reemplaza a window.alert. */
export const Alert = ({ type = 'info', children, onClose = null, className = '' }) => {
  const style = STYLES[type] || STYLES.info;
  const Icon = style.icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`p-4 rounded-xl border flex items-start space-x-3 text-sm ${style.box} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1 font-medium break-words min-w-0">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="text-current opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
