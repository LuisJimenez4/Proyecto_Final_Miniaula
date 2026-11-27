import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResumenCurso } from '../../services/InstructorService';
import { getCursoById } from '../../services/CursoService';
import { useFetch } from '../../hooks/useFetch';
import StatusFeedback from '../../components/StatusFeedback';
import Alert from '../../components/Alert';
import { ArrowLeft, Users, CheckCircle2, TrendingUp, Award, AlertTriangle, BarChart3 } from 'lucide-react';

const KPI = ({ label, value, hint, icon: Icon, tone }) => (
  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className={`p-2 rounded-xl ${tone}`}><Icon className="w-5 h-5" /></div>
    </div>
    <p className="text-3xl font-extrabold text-slate-900 mt-3">{value}</p>
    <span className="text-[11px] text-slate-400 mt-1 block">{hint}</span>
  </div>
);

const MayorCaida = ({ caida }) => (
  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex items-start space-x-4">
    <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 flex-shrink-0"><AlertTriangle className="w-6 h-6" /></div>
    <div>
      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Lección de mayor caída</span>
      <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 break-words">Lección {caida.orden}: {caida.titulo}</h3>
      <p className="text-sm text-slate-700 mt-1">
        <strong>{caida.detenidos}</strong> {caida.detenidos === 1 ? 'estudiante se detiene' : 'estudiantes se detienen'} aquí.
        Revisa la dificultad de esta lección o refuerza el material anterior.
      </p>
    </div>
  </div>
);

const Embudo = ({ avance, inscritos, caida }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
    <div>
      <h2 className="text-lg font-bold text-slate-900">Avance por lección</h2>
      <p className="text-xs text-slate-500 mt-0.5">Cuántos de los inscritos llegaron a cada lección (completaron la anterior).</p>
    </div>
    {avance.map((lec) => {
      const pct = inscritos > 0 ? Math.round((lec.llegaron / inscritos) * 100) : 0;
      const esCaida = caida?.leccionId === lec.leccionId;
      return (
        <div key={lec.leccionId} className={`p-4 rounded-xl border ${esCaida ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-slate-200 bg-slate-50/40'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center space-x-3 min-w-0">
              <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center flex-shrink-0">#{lec.orden}</span>
              <span className="text-sm font-bold text-slate-900 truncate">{lec.titulo}</span>
            </div>
            <div className="flex items-center space-x-3 text-xs flex-shrink-0">
              <span className="text-slate-500"><strong className="text-slate-800">{lec.llegaron}</strong> / {inscritos} estudiantes</span>
              <span className="font-bold text-indigo-600 text-sm">{pct}%</span>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full transition-all duration-500 ${esCaida ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    })}
  </div>
);

/** RF-16: panel del curso con inscritos, progreso, nota promedio, avance por lección y lección de mayor caída. */
export const PanelCurso = () => {
  const { id: cursoId } = useParams();
  const resumenFetch = useFetch(() => getResumenCurso(cursoId), { deps: [cursoId] });
  const cursoFetch = useFetch(() => getCursoById(cursoId), { deps: [cursoId] });

  const resumen = resumenFetch.data;
  const avance = [...(resumen?.avancePorLeccion ?? [])].sort((a, b) => a.orden - b.orden);
  const tasa = resumen?.inscritos > 0 ? Math.round((resumen.completaron / resumen.inscritos) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link to="/instructor/cursos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver a mis cursos
      </Link>

      <StatusFeedback loading={resumenFetch.loading && !resumen} error={resumenFetch.error} onRetry={resumenFetch.refetch}>
        {resumen && (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2 border border-indigo-100">
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Métricas del curso
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-words">Panel: {cursoFetch.data?.titulo || `Curso ${cursoId}`}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KPI label="Estudiantes inscritos" value={resumen.inscritos} hint="Total histórico" icon={Users} tone="bg-indigo-50 text-indigo-600" />
              <KPI label="Completaron el curso" value={resumen.completaron} hint={`${tasa}% de los inscritos`} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
              <KPI label="Progreso promedio" value={`${resumen.progresoPromedio}%`} hint="Avance medio de los inscritos" icon={TrendingUp} tone="bg-blue-50 text-blue-600" />
              <KPI label="Nota promedio" value={resumen.inscritos > 0 ? resumen.notaPromedio : '—'} hint="Mejor nota por cuestionario" icon={Award} tone="bg-amber-50 text-amber-600" />
            </div>

            {resumen.inscritos === 0 && <Alert type="info">Aún no hay estudiantes inscritos: las métricas aparecerán cuando alguien empiece el curso.</Alert>}
            {resumen.leccionMayorCaida && <MayorCaida caida={resumen.leccionMayorCaida} />}
            {resumen.inscritos > 0 && !resumen.leccionMayorCaida && <Alert type="success">Ningún estudiante se ha detenido en una lección todavía.</Alert>}
            {avance.length > 0 && <Embudo avance={avance} inscritos={resumen.inscritos} caida={resumen.leccionMayorCaida} />}
          </div>
        )}
      </StatusFeedback>
    </div>
  );
};

export default PanelCurso;
