import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCursoById, inscribirseCurso } from '../../services/CursoService';
import { getMisInscripciones } from '../../services/InscripcionService';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { parseApiError } from '../../utils/apiError';
import { ERROR_CODES, ROLES, TIPOS_LECCION } from '../../constants';
import StatusFeedback from '../../components/StatusFeedback';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { Layers, FileText, HelpCircle, CheckCircle2, ArrowLeft, GraduationCap, PlayCircle } from 'lucide-react';

const Temario = ({ lecciones }) => {
  if (lecciones.length === 0) {
    return <p className="text-sm text-slate-500 italic py-4">Este curso aún no tiene lecciones configuradas.</p>;
  }

  return (
    <div className="space-y-3">
      {lecciones.map((lec, idx) => (
        <div key={lec.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3.5 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {lec.orden || idx + 1}
            </span>
            <p className="text-sm font-semibold text-slate-800 truncate">{lec.titulo}</p>
          </div>
          {lec.tipo === TIPOS_LECCION.CUESTIONARIO ? (
            <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex-shrink-0">
              <HelpCircle className="w-3.5 h-3.5 mr-1" />
              Cuestionario
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex-shrink-0">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Contenido
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export const CursoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const isEstudiante = user?.rol === ROLES.ESTUDIANTE;

  const { data: curso, loading, error, refetch } = useFetch(() => getCursoById(id), { deps: [id] });
  const { data: inscripciones, refetch: refetchInscripciones } = useFetch(getMisInscripciones, { immediate: isEstudiante, deps: [isEstudiante] });

  const [isInscribiendo, setIsInscribiendo] = useState(false);
  const [aviso, setAviso] = useState(null);

  const yaInscrito = isEstudiante && Array.isArray(inscripciones) && inscripciones.some((ins) => ins.cursoId === Number(id));
  const lecciones = curso?.lecciones ?? [];

  const handleInscripcion = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/cursos/${id}` } } });
      return;
    }

    setIsInscribiendo(true);
    setAviso(null);
    try {
      await inscribirseCurso(id);
      navigate(`/mis-cursos/${id}`);
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === ERROR_CODES.ALREADY_ENROLLED) {
        refetchInscripciones();
        setAviso({ type: 'info', message: 'Ya estás inscrito en este curso.' });
      } else if (parsed.code === ERROR_CODES.COURSE_NOT_FOUND) {
        setAviso({ type: 'error', message: 'Este curso ya no está disponible.' });
      } else {
        setAviso({ type: 'error', message: parsed.message });
      }
    } finally {
      setIsInscribiendo(false);
    }
  };

  const renderAccion = () => {
    if (user?.rol === ROLES.INSTRUCTOR) {
      return (
        <div className="p-3.5 rounded-xl bg-slate-100 text-xs text-slate-600 text-center">
          Estás conectado como instructor. Gestiona tus cursos desde el menú Cursos.
        </div>
      );
    }
    if (yaInscrito) {
      return (
        <Link to={`/mis-cursos/${id}`}>
          <Button variant="success" fullWidth size="lg" icon={PlayCircle}>Continuar curso</Button>
        </Link>
      );
    }
    return (
      <Button variant="primary" fullWidth size="lg" isLoading={isInscribiendo} onClick={handleInscripcion} icon={GraduationCap}>
        {isLoggedIn ? 'Inscribirme ahora' : 'Ingresa para inscribirte'}
      </Button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link to="/catalogo" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Volver al Catálogo
        </Link>
      </div>

      <StatusFeedback loading={loading} error={error} onRetry={refetch}>
        {curso && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {curso.categoria}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Nivel {curso.nivel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight break-words">{curso.titulo}</h1>
                <p className="mt-4 text-base text-slate-600 leading-relaxed">{curso.descripcion}</p>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase">
                    {curso.instructor?.nombre?.charAt(0) || 'I'}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{curso.instructor?.nombre}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900">Temario del curso</h2>
                <p className="text-sm text-slate-500 mt-0.5 mb-6">
                  {lecciones.length} {lecciones.length === 1 ? 'lección' : 'lecciones'}
                </p>
                <Temario lecciones={lecciones} />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">Acceso libre</span>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">Gratuito</p>
                  <p className="mt-2 text-xs text-slate-500">Inscripción inmediata con seguimiento de tu progreso y calificaciones.</p>
                </div>

                {aviso && <Alert type={aviso.type}>{aviso.message}</Alert>}
                {renderAccion()}

                <div className="border-t border-slate-100 pt-5 space-y-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Las lecciones se desbloquean en orden</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Los cuestionarios tienen un máximo de intentos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </StatusFeedback>
    </div>
  );
};

export default CursoDetalle;
