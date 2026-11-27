import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { crearCurso, actualizarCurso, cambiarEstadoCurso } from '../../services/InstructorService';
import { getCursoById } from '../../services/CursoService';
import { reordenarLecciones, eliminarLeccion } from '../../services/LeccionService';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { parseApiError, applyFieldErrors, getGeneralMessage } from '../../utils/apiError';
import { CATEGORIAS, NIVELES, ESTADOS_CURSO, TIPOS_LECCION } from '../../constants';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusFeedback from '../../components/StatusFeedback';
import { BadgeEstado } from './InstructorCursosList';
import { ArrowLeft, Save, Plus, ArrowUp, ArrowDown, Edit, Trash2, BarChart2, Archive, Send, FileEdit } from 'lucide-react';

const FIELDS = ['titulo', 'descripcion', 'categoria', 'nivel'];

const cursoSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoria: z.string().min(1, 'La categoría es obligatoria'),
  nivel: z.enum(NIVELES, { errorMap: () => ({ message: 'Selecciona un nivel válido' }) }),
});

const SELECT_CLASS = 'w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white';

const ACCIONES_ESTADO = {
  [ESTADOS_CURSO.BORRADOR]: [{ estado: ESTADOS_CURSO.PUBLICADO, label: 'Publicar', icon: Send, variant: 'primary' }],
  [ESTADOS_CURSO.PUBLICADO]: [
    { estado: ESTADOS_CURSO.ARCHIVADO, label: 'Archivar', icon: Archive, variant: 'outline' },
    { estado: ESTADOS_CURSO.BORRADOR, label: 'Volver a borrador', icon: FileEdit, variant: 'ghost' },
  ],
  [ESTADOS_CURSO.ARCHIVADO]: [{ estado: ESTADOS_CURSO.PUBLICADO, label: 'Publicar de nuevo', icon: Send, variant: 'primary' }],
};

const FormCurso = ({ curso, isNuevo, onSaved }) => {
  const [aviso, setAviso] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const categorias = curso && !CATEGORIAS.includes(curso.categoria) ? [curso.categoria, ...CATEGORIAS] : CATEGORIAS;

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      titulo: curso?.titulo ?? '',
      descripcion: curso?.descripcion ?? '',
      categoria: curso?.categoria ?? CATEGORIAS[0],
      nivel: curso?.nivel ?? NIVELES[0],
    },
  });

  const onSubmit = async (values) => {
    setIsSaving(true);
    setAviso(null);
    try {
      const saved = isNuevo ? await crearCurso(values) : await actualizarCurso(curso.id, values);
      if (!isNuevo) setAviso({ type: 'success', message: 'Curso actualizado.' });
      onSaved(saved);
    } catch (err) {
      setAviso({ type: 'error', message: applyFieldErrors(setError, parseApiError(err), FIELDS) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <h2 className="text-lg font-bold text-slate-900">Información general</h2>
      {aviso && <Alert type={aviso.type}>{aviso.message}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FormInput label="Título del curso" name="titulo" placeholder="Ej. Introducción a React 19" error={errors.titulo?.message} {...register('titulo')} />
        <FormInput as="textarea" rows={4} label="Descripción" name="descripcion" placeholder="Objetivos de aprendizaje, requisitos y contenido del curso..." error={errors.descripcion?.message} {...register('descripcion')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormInput as="select" label="Categoría" name="categoria" className="" error={errors.categoria?.message} {...register('categoria')}>
            {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </FormInput>
          <FormInput as="select" label="Nivel de dificultad" name="nivel" error={errors.nivel?.message} {...register('nivel')}>
            {NIVELES.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
          </FormInput>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isSaving} icon={Save}>
            {isNuevo ? 'Crear curso y continuar' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
};

const FilaLeccion = ({ leccion, index, total, cursoId, bloqueado, onMover, onEliminar }) => (
  <div className="flex items-center justify-between gap-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
    <div className="flex items-center space-x-3 min-w-0">
      <div className="flex flex-col space-y-1">
        <button type="button" disabled={index === 0 || bloqueado} onClick={() => onMover(index, -1)} aria-label="Mover arriba" title="Mover arriba" className="p-1 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed">
          <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button type="button" disabled={index === total - 1 || bloqueado} onClick={() => onMover(index, 1)} aria-label="Mover abajo" title="Mover abajo" className="p-1 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed">
          <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
      <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">#{index + 1}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{leccion.titulo}</p>
        <span className="text-xs text-slate-400">{leccion.tipo === TIPOS_LECCION.CUESTIONARIO ? 'Cuestionario' : 'Contenido'}</span>
      </div>
    </div>
    <div className="flex items-center space-x-1 flex-shrink-0">
      <Link to={`/instructor/cursos/${cursoId}/lecciones/${leccion.id}`}><Button variant="ghost" size="sm" icon={Edit} title="Editar lección" aria-label={`Editar ${leccion.titulo}`} /></Link>
      <Button variant="ghost" size="sm" onClick={() => onEliminar(leccion)} title="Eliminar lección" aria-label={`Eliminar ${leccion.titulo}`} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const Temario = ({ cursoId, lecciones, setLecciones, onAviso }) => {
  const [reordenando, setReordenando] = useState(false);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // RF-09: reordena en pantalla y confirma con la API; si falla, vuelve al orden anterior (INVALID_LESSON_ORDER u otro).
  const mover = async (index, direccion) => {
    const anterior = lecciones;
    const nuevas = [...lecciones];
    const [movida] = nuevas.splice(index, 1);
    nuevas.splice(index + direccion, 0, movida);

    setLecciones(nuevas);
    setReordenando(true);
    try {
      const ordenadas = await reordenarLecciones(cursoId, nuevas.map((l) => l.id));
      setLecciones(ordenadas);
    } catch (err) {
      setLecciones(anterior);
      onAviso({ type: 'error', message: `No se pudo guardar el nuevo orden. ${getGeneralMessage(parseApiError(err))}` });
    } finally {
      setReordenando(false);
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarLeccion(aEliminar.id);
      setLecciones((prev) => prev.filter((l) => l.id !== aEliminar.id).map((l, i) => ({ ...l, orden: i + 1 })));
    } catch (err) {
      onAviso({ type: 'error', message: getGeneralMessage(parseApiError(err)) });
    } finally {
      setEliminando(false);
      setAEliminar(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Temario</h2>
          <p className="text-xs text-slate-500 mt-0.5">Usa las flechas para cambiar el orden en que los estudiantes desbloquean las lecciones.</p>
        </div>
        <Link to={`/instructor/cursos/${cursoId}/lecciones/nueva`}><Button variant="primary" size="sm" icon={Plus}>Agregar lección</Button></Link>
      </div>

      {lecciones.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-3">Este curso aún no tiene lecciones. Necesitas al menos una para publicarlo.</p>
          <Link to={`/instructor/cursos/${cursoId}/lecciones/nueva`}><Button variant="outline" size="sm" icon={Plus}>Crear primera lección</Button></Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {lecciones.map((leccion, index) => (
            <FilaLeccion key={leccion.id} leccion={leccion} index={index} total={lecciones.length} cursoId={cursoId} bloqueado={reordenando} onMover={mover} onEliminar={setAEliminar} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(aEliminar)}
        title="Eliminar lección"
        message={aEliminar ? `¿Eliminar "${aEliminar.titulo}"? Se borra también el progreso de los estudiantes en esta lección y las demás se reordenan.` : ''}
        confirmLabel="Eliminar"
        loading={eliminando}
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
};

const BarraEstado = ({ curso, onEstado, cambiando }) => (
  <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
    <span className="text-sm text-slate-600">Estado:</span>
    <BadgeEstado estado={curso.estado} />
    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
      <Link to={`/instructor/cursos/${curso.id}/resumen`}><Button variant="ghost" size="sm" icon={BarChart2}>Métricas</Button></Link>
      {(ACCIONES_ESTADO[curso.estado] ?? []).map(({ estado, label, icon, variant }) => (
        <Button key={estado} variant={variant} size="sm" icon={icon} isLoading={cambiando === estado} disabled={Boolean(cambiando)} onClick={() => onEstado(estado)}>{label}</Button>
      ))}
    </div>
  </div>
);

export const EditorCurso = () => {
  const { id } = useParams();
  const isNuevo = !id || id === 'nuevo';
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: curso, loading, error, refetch, setData } = useFetch(() => getCursoById(id), { immediate: !isNuevo, deps: [id] });
  const [lecciones, setLecciones] = useState([]);
  const [aviso, setAviso] = useState(null);
  const [cambiando, setCambiando] = useState(null);

  // El temario local solo se reinicia al cargar otro curso (no al guardar datos), para no perder un reordenamiento.
  useEffect(() => {
    setLecciones([...(curso?.lecciones ?? [])].sort((a, b) => a.orden - b.orden));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso?.id]);

  const handleSaved = (saved) => {
    if (isNuevo) navigate(`/instructor/cursos/${saved.id}/editar`, { replace: true });
    else setData((prev) => ({ ...prev, ...saved }));
  };

  // RF-07: la API decide si se puede publicar (422 COURSE_EMPTY / QUIZ_WITHOUT_QUESTIONS); aquí solo se muestra su respuesta.
  const handleEstado = async (estado) => {
    setCambiando(estado);
    setAviso(null);
    try {
      const actualizado = await cambiarEstadoCurso(curso.id, estado);
      setData((prev) => ({ ...prev, estado: actualizado.estado }));
      setAviso({ type: 'success', message: `El curso ahora está ${actualizado.estado}.` });
    } catch (err) {
      setAviso({ type: 'error', message: getGeneralMessage(parseApiError(err)) });
    } finally {
      setCambiando(null);
    }
  };

  const esAjeno = Boolean(curso) && curso.instructorId !== user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link to="/instructor/cursos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver a mis cursos
      </Link>

      <StatusFeedback loading={loading && !curso} error={error} onRetry={refetch}>
        {esAjeno ? (
          <Alert type="warning">Este curso no es tuyo: solo su instructor puede editarlo.</Alert>
        ) : (
          <>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{isNuevo ? 'Crear curso' : 'Configurar curso y temario'}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {isNuevo ? 'Define la información básica. Al crearlo podrás agregar lecciones y cuestionarios.' : 'Edita los datos del curso, organiza sus lecciones y publícalo cuando esté listo.'}
              </p>
            </div>

            {!isNuevo && curso && <BarraEstado curso={curso} onEstado={handleEstado} cambiando={cambiando} />}
            {aviso && <Alert type={aviso.type} onClose={() => setAviso(null)}>{aviso.message}</Alert>}

            <FormCurso key={curso?.id ?? 'nuevo'} curso={curso} isNuevo={isNuevo} onSaved={handleSaved} />
            {!isNuevo && curso && <Temario cursoId={curso.id} lecciones={lecciones} setLecciones={setLecciones} onAviso={setAviso} />}
          </>
        )}
      </StatusFeedback>
    </div>
  );
};

export default EditorCurso;
