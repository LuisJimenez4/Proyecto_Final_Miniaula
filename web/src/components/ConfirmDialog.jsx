import React from 'react';
import Button from './Button';

/** Confirmación modal; reemplaza a window.confirm. Se muestra solo cuando `open` es verdadero. */
export const ConfirmDialog = ({
  open,
  title = '¿Confirmar acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
        <h3 id="confirm-title" className="text-lg font-bold text-slate-900">{title}</h3>
        {message && <p className="text-sm text-slate-600 leading-relaxed">{message}</p>}
        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant} size="sm" onClick={onConfirm} isLoading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
