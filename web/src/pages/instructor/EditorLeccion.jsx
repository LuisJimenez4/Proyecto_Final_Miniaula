import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getLeccionById, crearLeccion, actualizarLeccion } from '../../services/LeccionService';
import { eliminarPregunta } from '../../services/PreguntaService';
import { useFetch } from '../../hooks/useFetch';
import { parseApiError, applyFieldErrors, getGeneralMessage } from '../../utils/apiError';
import { TIPOS_LECCION, NOTA_MINIMA_DEFAULT } from '../../constants';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusFeedback from '../../components/StatusFeedback';
import PreguntaModal from './PreguntaModal';
import { ArrowLeft, Save, Plus, Trash2, Edit, HelpCircle, FileText } from 'lucide-react';

const FIELDS = ['titulo', 'contenido', 'videoUrl', 'notaMinima'];

const esUrl = (value) => {
  try {
    return Boolean(new URL(value));
  } catch {
    return false;
  }
};

const leccionSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  tipo: z.enum(Object.values(TIPOS_LECCION)),
  contenido: z.string().trim().optional(),
  videoUrl: z.string().trim().optional().refine((v) => !v || esUrl(v), 'Escribe una URL válida (https://...)'),
  notaMinima: z.coerce.number({ invalid_type_error: 'Escribe un número' }).int('Debe ser un entero').min(0, 'Entre 0 y 100').max(100, 'Entre 0 y 100').optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === TIPOS_LECCION.CONTENIDO && !data.contenido) {
    ctx.addIssue({ code: 'custom', path: ['contenido'], message: 'El contenido es obligatorio en lecciones de contenido' });
  }
});

const toDefaults = (leccion) => ({
  titulo: leccion?.titulo ?? '',
  tipo: leccion?.tipo ?? TIPOS_LECCION.CONTENIDO,
  contenido: leccion?.contenido ?? '',
  videoUrl: leccion?.videoUrl ?? '',
  notaMinima: leccion?.notaMinima ?? NOTA_MINIMA_DEFAULT,
});

/** Crear: contenido → { titulo, tipo, contenido, videoUrl? }; cuestionario → { titulo, tipo, notaMinima }. */
const toCreatePayload = (values) => {
  if (values.tipo === TIPOS_LECCION.CUESTIONARIO) return { titulo: values.titulo, tipo: values.tipo, notaMinima: Number(values.notaMinima) };
  return { titulo: values.titulo, tipo: values.tipo, contenido: values.contenido, ...(values.videoUrl && { videoUrl: values.videoUrl }) };
};

/** Editar: nunca lleva `tipo`; un videoUrl vacío se envía como null. */
const toUpdatePayload = (values, tipo) => ({
  titulo: values.titulo,
  contenido: tipo === TIPOS_LECCION.CONTENIDO ? values.contenido : null,
  videoUrl: tipo === TIPOS_LECCION.CONTENIDO ? values.videoUrl || null : null,
  notaMinima: tipo === TIPOS_LECCION.CUESTIONARIO ? Number(values.notaMinima) : undefined,
});

const OpcionTipo = ({ value, icon: Icon, title, hint, color, selected, disabled, register }) => (
  <label className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${selected ? `${color} ring-1 font-semibold` : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
    <input type="radio" value={value} disabled={disabled} className="sr-only" {...register('tipo')} />
    <Icon className="w-5 h-5 flex-shrink-0" />
    <div>
      <span className="text-sm">{title}</span>
      <p className="text-[11px] text-slate-500 font-normal">{hint}</p>
    </div>
  </label>
);

const FormLeccion = ({ leccion, cursoId, isNueva, onSaved }) => {
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: zodResolver(leccionSchema),
    defaultValues: toDefaults(leccion),
  });
  const tipo = watch('tipo');

  const onSubmit = async (values) => {
    setIsSaving(true);
    setAviso(null);
    try {
      if (isNueva) {
        const nueva = await crearLeccion(cursoId, toCreatePayload(values));
        navigate(`/instructor/cursos/${cursoId}/lecciones/${nueva.id}`, { replace: true });
        return;
      }
      await actualizarLeccion(leccion.id, toUpdatePayload(values, leccion.tipo));
      setAviso({ type: 'success', message: 'Lección guardada.' });
      onSaved();
    } catch (err) {
      setAviso({ type: 'error', message: applyFieldErrors(setError, parseApiError(err), FIELDS) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {aviso && <Alert type={aviso.type}>{aviso.message}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormInput label="Título de la lección" name="titulo" placeholder="Ej. Introducción a los Hooks" error={errors.titulo?.message} {...register('titulo')} />

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Tipo de lección</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <OpcionTipo value={TIPOS_LECCION.CONTENIDO} icon={FileText} title="Contenido" hint="Lecturas y video" color="border-indigo-600 bg-indigo-50/60 ring-indigo-600 text-indigo-900" selected={tipo === TIPOS_LECCION.CONTENIDO} disabled={!isNueva} register={register} />
            <OpcionTipo value={TIPOS_LECCION.CUESTIONARIO} icon={HelpCircle} title="Cuestionario" hint="Preguntas y nota mínima" color="border-amber-600 bg-amber-50/60 ring-amber-600 text-amber-900" selected={tipo === TIPOS_LECCION.CUESTIONARIO} disabled={!isNueva} register={register} />
          </div>
          {!isNueva && <p className="text-xs text-slate-500">El tipo no se puede cambiar una vez creada la lección.</p>}
        </div>

        {tipo === TIPOS_LECCION.CONTENIDO && (
          <div className="space-y-5 pt-3 border-t border-slate-100">
            <FormInput label="URL del video (opcional)" name="videoUrl" placeholder="https://www.youtube.com/watch?v=..." helperText="Enlace a YouTube, Vimeo o un video público" error={errors.videoUrl?.message} {...register('videoUrl')} />
            <FormInput as="textarea" rows={6} label="Texto de la lección" name="contenido" placeholder="Escribe aquí la explicación de la lección..." error={errors.contenido?.message} {...register('contenido')} />
          </div>
        )}

        {tipo === TIPOS_LECCION.CUESTIONARIO && (
          <div className="pt-3 border-t border-slate-100">
            <FormInput type="number" label="Nota mínima para aprobar (0 a 100)" name="notaMinima" helperText="Los estudiantes aprueban con esta nota o más." error={errors.notaMinima?.message} {...register('notaMinima')} />
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} icon={Save}>{isNueva ? 'Crear lección' : 'Guardar lección'}</Button>
        </div>
      </form>
    </div>
  );
};

const PreguntaCard = ({ pregunta, numero, onEdit, onDelete }) => (
  <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start space-x-3 min-w-0">
        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{numero}</span>
        <h4 className="text-sm font-bold text-slate-900 break-words">{pregunta.enunciado}</h4>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(pregunta)} icon={Edit} aria-label="Editar pregunta" />
        <Button variant="ghost" size="sm" onClick={() => onDelete(pregunta)} aria-label="Eliminar pregunta" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:ml-9">
      {pregunta.opciones.map((opcion, index) => {
        const correcta = pregunta.indiceCorrecto === index;
        return (
          <div key={index} className={`text-xs px-3 py-2 rounded-lg border flex items-center justify-between gap-2 ${correcta ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold' : 'border-slate-200 bg-white text-slate-600'}`}>
            <span className="break-words min-w-0">{opcion}</span>
            {correcta && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex-shrink-0">Correcta</span>}
          </div>
        );
      })}
    </div>
  </div>
);

const GestorPreguntas = ({ leccion, onChanged }) => {
  const [modal, setModal] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const preguntas = leccion.preguntas ?? [];

  const confirmarEliminar = async () => {
    setEliminando(true);
    setAviso(null);
    try {
      await eliminarPregunta(aEliminar.id);
      await onChanged();
    } catch (err) {
      setAviso(getGeneralMessage(parseApiError(err)));
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Preguntas del cuestionario</h2>
          <p className="text-xs text-slate-500 mt-0.5">Solo tú ves la respuesta correcta; los estudiantes nunca la reciben.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModal({ pregunta: null })} icon={Plus}>Agregar pregunta</Button>
      </div>

      {aviso && <Alert type="error" onClose={() => setAviso(null)}>{aviso}</Alert>}

      {preguntas.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-3">Aún no hay preguntas. Un curso con cuestionarios vacíos no se puede publicar.</p>
          <Button variant="outline" size="sm" onClick={() => setModal({ pregunta: null })} icon={Plus}>Crear primera pregunta</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {preguntas.map((pregunta, index) => (
            <PreguntaCard key={pregunta.id} pregunta={pregunta} numero={index + 1} onEdit={(p) => setModal({ pregunta: p })} onDelete={setAEliminar} />
          ))}
        </div>
      )}

      {modal && <PreguntaModal leccionId={leccion.id} pregunta={modal.pregunta} onClose={() => setModal(null)} onSaved={onChanged} />}
      <ConfirmDialog open={Boolean(aEliminar)} title="Eliminar pregunta" message="¿Seguro que deseas eliminar esta pregunta?" confirmLabel="Eliminar" loading={eliminando} onConfirm={confirmarEliminar} onCancel={() => setAEliminar(null)} />
    </div>
  );
};

export const EditorLeccion = () => {
  const { cursoId, leccionId } = useParams();
  const isNueva = !leccionId || leccionId === 'nueva';
  const { data: leccion, loading, error, refetch } = useFetch(() => getLeccionById(leccionId), { immediate: !isNueva, deps: [leccionId] });

  // La key reinicia el formulario solo al cambiar de lección, no al refrescar las preguntas.
  const formKey = useEffectiveKey(leccion, isNueva);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link to={`/instructor/cursos/${cursoId}/editar`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver al curso
      </Link>

      <StatusFeedback loading={loading && !leccion} error={error} onRetry={refetch}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{isNueva ? 'Nueva lección' : 'Editar lección'}</h1>
          <p className="text-sm text-slate-500 mt-1">Configura el contenido o el cuestionario de esta lección.</p>
        </div>

        <FormLeccion key={formKey} leccion={leccion} cursoId={cursoId} isNueva={isNueva} onSaved={refetch} />
        {!isNueva && leccion?.tipo === TIPOS_LECCION.CUESTIONARIO && <GestorPreguntas leccion={leccion} onChanged={refetch} />}
      </StatusFeedback>
    </div>
  );
};

/** Clave estable del formulario: cambia solo con la lección cargada. */
function useEffectiveKey(leccion, isNueva) {
  const [key, setKey] = useState('nueva');
  useEffect(() => {
    setKey(isNueva ? 'nueva' : `leccion-${leccion?.id ?? 'cargando'}`);
  }, [leccion?.id, isNueva]);
  return key;
}

export default EditorLeccion;
