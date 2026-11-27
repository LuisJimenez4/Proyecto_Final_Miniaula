import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCursosInstructor, cambiarEstadoCurso, eliminarCurso } from '../../services/InstructorService';
import { useFetch } from '../../hooks/useFetch';
import { parseApiError, getGeneralMessage } from '../../utils/apiError';
import { ERROR_CODES, ESTADOS_CURSO } from '../../constants';
import StatusFeedback from '../../components/StatusFeedback';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Plus, BookOpen, Users, Edit, BarChart2, Trash2, Archive, FileCheck } from 'lucide-react';

export const BadgeEstado = ({ estado }) => {
  if (estado === ESTADOS_CURSO.PUBLICADO) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><FileCheck className="w-3 h-3 mr-1" />Publicado</span>;
  }
  if (estado === ESTADOS_CURSO.ARCHIVADO) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"><Archive className="w-3 h-3 mr-1" />Archivado</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Borrador</span>;
};

const EstadoSelect = ({ curso, onChange }) => (
  <select
    value={curso.estado}
    onChange={(e) => onChange(curso, e.target.value)}
    aria-label={`Estado de ${curso.titulo}`}
    className="text-xs border border-slate-200 rounded-lg p-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  >
    <option value={ESTADOS_CURSO.BORRADOR}>Borrador</option>
    <option value={ESTADOS_CURSO.PUBLICADO}>Publicado</option>
    <option value={ESTADOS_CURSO.ARCHIVADO}>Archivado</option>
  </select>
);

const Acciones = ({ curso, onDelete }) => (
  <div className="inline-flex items-center space-x-1">
    <Link to={`/instructor/cursos/${curso.id}/resumen`}>
      <Button variant="ghost" size="sm" title="Panel de métricas" icon={BarChart2}>Métricas</Button>
    </Link>
    <Link to={`/instructor/cursos/${curso.id}/editar`}>
      <Button variant="outline" size="sm" title="Editar curso y temario" icon={Edit}>Editar</Button>
    </Link>
    <Button variant="ghost" size="sm" onClick={() => onDelete(curso)} title="Eliminar curso" aria-label={`Eliminar ${curso.titulo}`} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

const Totales = ({ curso }) => (
  <div className="flex items-center gap-4 text-slate-700 text-sm">
    <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5 text-slate-400" /><strong>{curso.totalLecciones ?? 0}</strong>&nbsp;lecc.</span>
    <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-slate-400" /><strong>{curso.totalInscripciones ?? 0}</strong>&nbsp;alumnos</span>
  </div>
);

export const InstructorCursosList = () => {
  const { data, loading, error, refetch, setData } = useFetch(getCursosInstructor);
  const cursos = Array.isArray(data) ? data : [];

  const [aviso, setAviso] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const handleCambiarEstado = async (curso, estado) => {
    setAviso(null);
    try {
      const actualizado = await cambiarEstadoCurso(curso.id, estado);
      setData((prev) => prev.map((c) => (c.id === curso.id ? { ...c, estado: actualizado.estado } : c)));
      setAviso({ type: 'success', message: `"${curso.titulo}" ahora está ${estado}.` });
    } catch (err) {
      setAviso({ type: 'error', message: getGeneralMessage(parseApiError(err)) });
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarCurso(aEliminar.id);
      setData((prev) => prev.filter((c) => c.id !== aEliminar.id));
      setAviso({ type: 'success', message: 'Curso eliminado.' });
    } catch (err) {
      const parsed = parseApiError(err);
      const archivable = parsed.code === ERROR_CODES.COURSE_HAS_STUDENTS ? aEliminar : null;
      setAviso({ type: 'error', message: parsed.message, archivar: archivable });
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis cursos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona tus cursos, lecciones y cuestionarios, y revisa el avance de tus alumnos.</p>
        </div>
        <Link to="/instructor/cursos/nuevo">
          <Button variant="primary" size="md" icon={Plus}>Crear curso</Button>
        </Link>
      </div>

      {aviso && (
        <div className="mb-6">
          <Alert type={aviso.type} onClose={() => setAviso(null)}>
            <p>{aviso.message}</p>
            {aviso.archivar && (
              <Button variant="outline" size="sm" className="mt-2" icon={Archive} onClick={() => handleCambiarEstado(aviso.archivar, ESTADOS_CURSO.ARCHIVADO)}>
                Archivar este curso
              </Button>
            )}
          </Alert>
        </div>
      )}

      <StatusFeedback
        loading={loading && !data}
        error={error}
        isEmpty={!loading && cursos.length === 0}
        emptyTitle="Aún no has creado ningún curso"
        emptyMessage="Comienza creando tu primer curso con lecciones y cuestionarios."
        emptyAction={<Link to="/instructor/cursos/nuevo"><Button variant="primary" size="md" icon={Plus}>Crear mi primer curso</Button></Link>}
        onRetry={refetch}
      >
        {/* Escritorio: tabla */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Curso</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Totales</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cursos.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 line-clamp-1">{c.titulo}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{c.categoria} · Nivel {c.nivel}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="flex items-center space-x-2"><BadgeEstado estado={c.estado} /><EstadoSelect curso={c} onChange={handleCambiarEstado} /></div></td>
                  <td className="py-4 px-4 whitespace-nowrap"><Totales curso={c} /></td>
                  <td className="py-4 px-6 text-right whitespace-nowrap"><Acciones curso={c} onDelete={setAEliminar} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil: tarjetas */}
        <div className="md:hidden space-y-4">
          {cursos.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 break-words">{c.titulo}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{c.categoria} · Nivel {c.nivel}</p>
              </div>
              <div className="flex items-center justify-between gap-2"><BadgeEstado estado={c.estado} /><EstadoSelect curso={c} onChange={handleCambiarEstado} /></div>
              <Totales curso={c} />
              <div className="pt-2 border-t border-slate-100 flex justify-end"><Acciones curso={c} onDelete={setAEliminar} /></div>
            </div>
          ))}
        </div>
      </StatusFeedback>

      <ConfirmDialog
        open={Boolean(aEliminar)}
        title="Eliminar curso"
        message={aEliminar ? `¿Eliminar permanentemente "${aEliminar.titulo}"? Si tiene estudiantes inscritos no se podrá eliminar y tendrás la opción de archivarlo.` : ''}
        confirmLabel="Eliminar"
        loading={eliminando}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
};

export default InstructorCursosList;
