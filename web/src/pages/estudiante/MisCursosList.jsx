import React from 'react';
import { Link } from 'react-router-dom';
import { getMisInscripciones } from '../../services/InscripcionService';
import { useFetch } from '../../hooks/useFetch';
import StatusFeedback from '../../components/StatusFeedback';
import Button from '../../components/Button';
import { ArrowRight, CheckCircle2, Compass } from 'lucide-react';

const accionDe = (porcentaje) => {
  if (porcentaje >= 100) return { label: 'Repasar', variant: 'outline' };
  if (porcentaje === 0) return { label: 'Empezar', variant: 'primary' };
  return { label: 'Continuar', variant: 'primary' };
};

const InscripcionCard = ({ inscripcion }) => {
  const { curso, progresoPorcentaje: porcentaje, completadas, totalLecciones, cursoId } = inscripcion;
  const completado = porcentaje >= 100;
  const accion = accionDe(porcentaje);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {curso.categoria}
          </span>
          {completado && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Completado
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{curso.titulo}</h3>
        <p className="mt-1 text-xs text-slate-500">Por {curso.instructor?.nombre}</p>
        <p className="mt-2 text-xs text-slate-500 line-clamp-2">{curso.descripcion}</p>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Progreso del curso</span>
            <span className="font-bold text-slate-900">{porcentaje}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={`h-full transition-all duration-500 rounded-full ${completado ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">{completadas} de {totalLecciones} lecciones</p>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Nivel: {curso.nivel}</span>
        <Link to={`/mis-cursos/${cursoId}`}>
          <Button variant={accion.variant} size="sm">
            {accion.label}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const MisCursosList = () => {
  const { data, loading, error, refetch } = useFetch(getMisInscripciones);
  const inscripciones = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Cursos</h1>
          <p className="text-sm text-slate-500 mt-1">Continúa tus lecciones y sigue tu avance.</p>
        </div>
        <Link to="/catalogo">
          <Button variant="outline" size="sm" icon={Compass}>Explorar más cursos</Button>
        </Link>
      </div>

      <StatusFeedback
        loading={loading}
        error={error}
        isEmpty={!loading && inscripciones.length === 0}
        emptyTitle="Aún no estás inscrito en ningún curso"
        emptyMessage="Empieza a aprender hoy inscribiéndote en uno de los cursos del catálogo."
        emptyAction={
          <Link to="/catalogo">
            <Button variant="primary" size="md" icon={Compass}>Ver catálogo de cursos</Button>
          </Link>
        }
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscripciones.map((inscripcion) => (
            <InscripcionCard key={inscripcion.id} inscripcion={inscripcion} />
          ))}
        </div>
      </StatusFeedback>
    </div>
  );
};

export default MisCursosList;
