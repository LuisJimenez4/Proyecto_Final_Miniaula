import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from '../../components/Button';

/** Panel que se muestra cuando la API responde 403 LESSON_LOCKED o NOT_ENROLLED al abrir una lección. */
export const LeccionBloqueada = ({ title = 'Lección bloqueada', message, action = null, cursoId = null }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-xl mx-auto my-12 shadow-xs">
    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
      <Lock className="w-7 h-7" />
    </div>
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
    {cursoId && (
      <Link to={`/cursos/${cursoId}`} className="inline-block mt-5">
        <Button variant="outline" size="sm">Ver detalle del curso</Button>
      </Link>
    )}
    {action}
  </div>
);

export default LeccionBloqueada;
