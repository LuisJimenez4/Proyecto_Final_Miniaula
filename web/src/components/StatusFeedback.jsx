import React from 'react';
import { Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Componente canónico de estados de interfaz (RT-F06)
 * Maneja Loading, Error con Reintento y Empty State. `error` puede ser texto o el objeto de parseApiError.
 */
export const StatusFeedback = ({
  loading = false,
  error = null,
  isEmpty = false,
  emptyTitle = 'No hay elementos para mostrar',
  emptyMessage = 'Aún no se han registrado datos en esta sección.',
  emptyAction = null,
  loadingMessage = 'Cargando datos...',
  onRetry = null,
  children,
}) => {
  // 1. Estado de Carga (Loading)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Loader2 className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">{loadingMessage}</p>
      </div>
    );
  }

  // 2. Estado de Error (Error)
  if (error) {
    return (
      <div className="my-6 mx-auto max-w-lg p-6 bg-rose-50 border border-rose-200 rounded-xl text-center shadow-sm">
        <div className="inline-flex p-3 rounded-full bg-rose-100 text-rose-600 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-rose-900 mb-1">
          Ocurrió un problema
        </h3>
        <p className="text-sm text-rose-700 mb-5 break-words">
          {typeof error === 'string' ? error : error?.message || 'No fue posible completar la solicitud.'}
        </p>
        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            icon={RefreshCw}
          >
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  // 3. Estado Vacío (Empty State)
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed border-slate-300 rounded-xl my-4">
        <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-base font-semibold text-slate-800">{emptyTitle}</h4>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  // 4. Contenido renderizado
  return <>{children}</>;
};

export default StatusFeedback;
