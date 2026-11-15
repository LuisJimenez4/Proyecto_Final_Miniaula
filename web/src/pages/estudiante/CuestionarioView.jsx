import React, { useState } from 'react';
import { enviarIntento } from '../../services/InscripcionService';
import { parseApiError } from '../../utils/apiError';
import { ERROR_CODES, NOTA_MINIMA_DEFAULT } from '../../constants';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { HelpCircle, CheckCircle2, XCircle, Award, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

const ResultadoIntento = ({ resultado }) => (
  <div
    className={`p-6 rounded-2xl border text-center ${
      resultado.aprobado ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
    }`}
    role="status"
  >
    <div className="inline-flex p-3 rounded-full mb-3 shadow-xs bg-white">
      {resultado.aprobado ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <XCircle className="w-8 h-8 text-rose-600" />}
    </div>
    <h3 className="text-xl font-bold">{resultado.aprobado ? 'Aprobado' : 'Reprobado'}</h3>
    <p className="mt-1 text-sm">
      Tu nota en este intento fue <strong className="text-base">{resultado.nota}</strong> (mínima: {resultado.notaMinima}).
    </p>
    <p className="mt-1 text-xs opacity-80">
      Mejor nota: <strong>{resultado.mejorNota}</strong>
      {resultado.intentosRestantes > 0 && (
        <> · Te quedan <strong>{resultado.intentosRestantes}</strong> {resultado.intentosRestantes === 1 ? 'intento' : 'intentos'}</>
      )}
    </p>
  </div>
);

const Pregunta = ({ pregunta, numero, seleccion, disabled, onSelect }) => (
  <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
    <h3 className="text-base font-semibold text-slate-900 flex items-start">
      <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">{numero}</span>
      <span className="break-words min-w-0">{pregunta.enunciado}</span>
    </h3>
    <div className="space-y-2.5 sm:ml-9">
      {pregunta.opciones.map((opcion, index) => {
        const checked = seleccion === index;
        return (
          <label
            key={index}
            className={`flex items-center p-3 rounded-xl border text-sm transition-all ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'} ${
              checked ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-medium ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              checked={checked}
              disabled={disabled}
              onChange={() => onSelect(pregunta.id, index)}
              className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 mr-3 flex-shrink-0"
            />
            <span className="break-words min-w-0">{opcion}</span>
          </label>
        );
      })}
    </div>
  </div>
);

/** RF-15: cuestionario. La nota y los intentos los calcula y limita la API (RN-02, RN-03); aquí nunca se lee `indiceCorrecto`. */
export const CuestionarioView = ({ leccion, vecinas, onNavegar, onProgresoActualizado }) => {
  const progreso = leccion.progreso ?? {};
  const preguntas = leccion.preguntas ?? [];
  const notaMinima = leccion.notaMinima ?? NOTA_MINIMA_DEFAULT;
  const { anterior, siguiente } = vecinas;

  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [agotado, setAgotado] = useState(false);

  const intentosRestantes = agotado ? 0 : resultado?.intentosRestantes ?? progreso.intentosRestantes ?? 0;
  const mejorNota = resultado?.mejorNota ?? progreso.mejorNota ?? null;
  const aprobada = Boolean(resultado?.completada || progreso.completada);
  const puedeEnviar = intentosRestantes > 0 && !enviando;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(respuestas).length < preguntas.length) {
      setAviso({ type: 'warning', message: `Responde todas las preguntas (${Object.keys(respuestas).length} de ${preguntas.length}).` });
      return;
    }

    setEnviando(true);
    setAviso(null);
    try {
      const payload = Object.entries(respuestas).map(([preguntaId, indice]) => ({
        preguntaId: Number(preguntaId),
        indiceSeleccionado: indice,
      }));
      const res = await enviarIntento(leccion.id, payload);
      setResultado(res);
      setRespuestas({});
      await onProgresoActualizado();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === ERROR_CODES.MAX_ATTEMPTS_REACHED) setAgotado(true);
      setAviso({ type: 'error', message: parsed.message });
    } finally {
      setEnviando(false);
    }
  };

  const estadoIntentos = () => {
    if (aprobada) return <span className="font-semibold text-emerald-700 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" />Cuestionario aprobado</span>;
    if (intentosRestantes > 0) return <span className="font-medium text-amber-700">Te quedan {intentosRestantes} {intentosRestantes === 1 ? 'intento' : 'intentos'}</span>;
    return <span className="font-semibold text-rose-700 flex items-center"><ShieldAlert className="w-4 h-4 mr-1" />Intentos agotados</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Lección {leccion.orden} · Cuestionario</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-words">{leccion.titulo}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">Nota mínima: {notaMinima}</span>
            {mejorNota !== null && (
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Award className="w-3.5 h-3.5 mr-1" />Mejor nota: {mejorNota}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-700">Intentos realizados: {resultado?.intentos ?? progreso.intentos ?? 0}</span>
        {estadoIntentos()}
      </div>

      {resultado && <ResultadoIntento resultado={resultado} />}
      {aviso && <Alert type={aviso.type}>{aviso.message}</Alert>}

      {preguntas.length === 0 ? (
        <Alert type="info">El docente aún no ha agregado preguntas a este cuestionario.</Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {preguntas.map((pregunta, index) => (
            <Pregunta
              key={pregunta.id}
              pregunta={pregunta}
              numero={index + 1}
              seleccion={respuestas[pregunta.id]}
              disabled={!puedeEnviar}
              onSelect={(preguntaId, indice) => setRespuestas((prev) => ({ ...prev, [preguntaId]: indice }))}
            />
          ))}

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {anterior && <Button variant="ghost" size="md" onClick={() => onNavegar(anterior)} icon={ArrowLeft}>Anterior</Button>}
              {siguiente && (
                <Button variant="outline" size="md" disabled={!siguiente.desbloqueada} onClick={() => onNavegar(siguiente)} icon={ArrowRight}>
                  Siguiente
                </Button>
              )}
            </div>
            <Button type="submit" variant="primary" size="md" isLoading={enviando} disabled={!puedeEnviar}>
              {intentosRestantes > 0 ? 'Enviar respuestas' : 'Sin intentos disponibles'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CuestionarioView;
