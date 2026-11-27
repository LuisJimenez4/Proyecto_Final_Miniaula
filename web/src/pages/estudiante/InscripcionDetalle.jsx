import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCursoById } from '../../services/CursoService';
import { getProgresoCurso } from '../../services/InscripcionService';
import { getLeccionById } from '../../services/LeccionService';
import { useFetch } from '../../hooks/useFetch';
import { useProgreso } from '../../hooks/useProgreso';
import { ERROR_CODES, TIPOS_LECCION } from '../../constants';
import LeccionView from './LeccionView';
import CuestionarioView from './CuestionarioView';
import LeccionBloqueada from './LeccionBloqueada';
import StatusFeedback from '../../components/StatusFeedback';
import { ArrowLeft, CheckCircle2, Lock, FileText, HelpCircle, Menu, X } from 'lucide-react';

const IconoLeccion = ({ item }) => {
  if (item.completada) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (!item.desbloqueada) return <Lock className="w-4 h-4 text-slate-400" />;
  if (item.tipo === TIPOS_LECCION.CUESTIONARIO) return <HelpCircle className="w-4 h-4 text-amber-600" />;
  return <FileText className="w-4 h-4 text-indigo-600" />;
};

/** Temario lateral: lecciones del curso con su estado (candado, completada, nota). */
const Temario = ({ items, activeId, porcentaje, completadas, total, onSelect, onClose }) => (
  <>
    <div className="flex items-center justify-between pb-4 border-b border-slate-100 lg:hidden">
      <span className="font-bold text-slate-900 text-sm">Temario del curso</span>
      <button type="button" onClick={onClose} aria-label="Cerrar temario" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="mt-2 lg:mt-0 mb-6 space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-700">Tu progreso</span>
        <span className="text-indigo-600">{porcentaje}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-[11px] text-slate-400 text-right">{completadas} de {total} completadas</p>
    </div>

    <div className="space-y-2 max-h-[calc(100vh-250px)] lg:max-h-[600px] overflow-y-auto pr-1">
      {items.map((item) => {
        const isActive = item.leccionId === activeId;
        const isLocked = !item.desbloqueada;
        return (
          <button
            key={item.leccionId}
            type="button"
            disabled={isLocked}
            onClick={() => onSelect(item)}
            aria-current={isActive ? 'true' : undefined}
            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
              isActive
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                : isLocked
                  ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0"><IconoLeccion item={item} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-400">#{item.orden}</span>
                {item.tipo === TIPOS_LECCION.CUESTIONARIO && item.mejorNota !== null && (
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">{item.mejorNota}</span>
                )}
              </div>
              <p className={`text-xs truncate ${isActive ? 'text-indigo-950 font-bold' : 'text-slate-800 font-semibold'}`}>{item.titulo}</p>
              <span className="text-[10px] text-slate-400 block">{item.tipo === TIPOS_LECCION.CUESTIONARIO ? 'Cuestionario' : 'Lectura'}</span>
            </div>
          </button>
        );
      })}
    </div>
  </>
);

/** Contenido de la lección activa: maneja 403 LESSON_LOCKED / NOT_ENROLLED y el resto de errores con Reintentar. */
const PanelLeccion = ({ leccionFetch, activeId, cursoId, vecinas, onNavegar, onProgresoActualizado }) => {
  const { data, loading, error, refetch } = leccionFetch;
  const leccion = data?.id === activeId ? data : null;

  if (error?.code === ERROR_CODES.LESSON_LOCKED) {
    return <LeccionBloqueada message={error.message} />;
  }
  if (error?.code === ERROR_CODES.NOT_ENROLLED) {
    return <LeccionBloqueada title="No estás inscrito" message={error.message} cursoId={cursoId} />;
  }

  const View = leccion?.tipo === TIPOS_LECCION.CUESTIONARIO ? CuestionarioView : LeccionView;

  return (
    <StatusFeedback loading={loading && !leccion} error={error} onRetry={refetch} loadingMessage="Cargando lección...">
      {leccion && (
        <View key={leccion.id} leccion={leccion} vecinas={vecinas} onNavegar={onNavegar} onProgresoActualizado={onProgresoActualizado} />
      )}
    </StatusFeedback>
  );
};

/** Aula del curso: /mis-cursos/:cursoId y /mis-cursos/:cursoId/lecciones/:leccionId. */
export const InscripcionDetalle = () => {
  const { cursoId, leccionId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cursoFetch = useFetch(() => getCursoById(cursoId), { deps: [cursoId] });
  const progresoFetch = useFetch(() => getProgresoCurso(cursoId), { deps: [cursoId] });
  const progreso = useProgreso(progresoFetch.data);

  const activeId = leccionId ? Number(leccionId) : progreso.getLeccionActual()?.leccionId ?? null;
  const leccionFetch = useFetch(() => getLeccionById(activeId), { deps: [activeId], immediate: activeId !== null });

  const irALeccion = (item) => {
    setSidebarOpen(false);
    navigate(`/mis-cursos/${cursoId}/lecciones/${item.leccionId}`);
  };

  const actualizarProgreso = () => Promise.all([progresoFetch.refetch(), leccionFetch.refetch()]);

  const progresoError = progresoFetch.error;
  const noInscrito = progresoError?.code === ERROR_CODES.NOT_ENROLLED;
  const titulo = cursoFetch.data?.titulo || 'Aula virtual';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-16 z-20">
        <div className="flex items-center space-x-3 min-w-0">
          <Link to="/mis-cursos" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100" title="Volver a Mis cursos" aria-label="Volver a Mis cursos">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{titulo}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {progreso.completadas} de {progreso.total} lecciones completadas ({progreso.porcentaje}%)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-xs"
        >
          <Menu className="w-4 h-4 mr-1.5" />
          Temario ({progreso.porcentaje}%)
        </button>
      </div>

      {noInscrito ? (
        <LeccionBloqueada title="No estás inscrito en este curso" message={progresoError.message} cursoId={cursoId} />
      ) : (
        <StatusFeedback loading={progresoFetch.loading && !progresoFetch.data} error={progresoError} onRetry={progresoFetch.refetch} loadingMessage="Cargando el aula...">
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <main className="lg:col-span-8 order-2 lg:order-1 min-w-0">
              {activeId ? (
                <PanelLeccion
                  leccionFetch={leccionFetch}
                  activeId={activeId}
                  cursoId={cursoId}
                  vecinas={progreso.getVecinas(activeId)}
                  onNavegar={irALeccion}
                  onProgresoActualizado={actualizarProgreso}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  Este curso aún no tiene lecciones.
                </div>
              )}
            </main>

            {sidebarOpen && <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
            <aside
              className={`fixed inset-y-0 right-0 z-30 w-80 max-w-[85vw] overflow-y-auto bg-white border-l border-slate-200 p-6 shadow-xl transform transition-transform duration-200 ease-in-out lg:static lg:w-auto lg:border lg:rounded-2xl lg:shadow-xs lg:transform-none lg:col-span-4 order-1 lg:order-2 ${
                sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`}
            >
              <Temario
                items={progreso.leccionesOrdenadas}
                activeId={activeId}
                porcentaje={progreso.porcentaje}
                completadas={progreso.completadas}
                total={progreso.total}
                onSelect={irALeccion}
                onClose={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        </StatusFeedback>
      )}
    </div>
  );
};

export default InscripcionDetalle;
