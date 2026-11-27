import React, { useState } from 'react';
import { crearPregunta, actualizarPregunta } from '../../services/PreguntaService';
import { parseApiError, getGeneralMessage } from '../../utils/apiError';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import Alert from '../../components/Alert';
import { X, Plus, Trash2 } from 'lucide-react';

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 6;
const OPCIONES_INICIALES = ['', '', '', ''];

/** Convierte lo escrito en el payload de la API; el índice correcto se recalcula sobre las opciones no vacías. */
const buildPayload = (enunciado, opciones, indiceCorrecto) => {
  if (enunciado.trim().length < 5) return { error: 'El enunciado debe tener al menos 5 caracteres.' };

  const validas = opciones.map((texto, index) => ({ texto: texto.trim(), index })).filter((o) => o.texto !== '');
  if (validas.length < MIN_OPCIONES) return { error: `Escribe al menos ${MIN_OPCIONES} opciones de respuesta.` };

  const nuevoIndice = validas.findIndex((o) => o.index === indiceCorrecto);
  if (nuevoIndice === -1) return { error: 'La opción marcada como correcta está vacía.' };

  return { payload: { enunciado: enunciado.trim(), opciones: validas.map((o) => o.texto), indiceCorrecto: nuevoIndice } };
};

/** RF-14: crea o edita una pregunta de un cuestionario. Recibe la pregunta con `indiceCorrecto` (solo ve el instructor dueño). */
export const PreguntaModal = ({ leccionId, pregunta = null, onClose, onSaved }) => {
  const [enunciado, setEnunciado] = useState(pregunta?.enunciado ?? '');
  const [opciones, setOpciones] = useState(pregunta?.opciones ?? OPCIONES_INICIALES);
  const [indiceCorrecto, setIndiceCorrecto] = useState(pregunta?.indiceCorrecto ?? 0);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const cambiarOpcion = (index, value) => setOpciones((prev) => prev.map((o, i) => (i === index ? value : o)));

  const quitarOpcion = (index) => {
    setOpciones((prev) => prev.filter((_, i) => i !== index));
    setIndiceCorrecto((prev) => (prev === index ? 0 : prev > index ? prev - 1 : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { payload, error: validationError } = buildPayload(enunciado, opciones, indiceCorrecto);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (pregunta) await actualizarPregunta(pregunta.id, payload);
      else await crearPregunta(leccionId, payload);
      await onSaved();
      onClose();
    } catch (err) {
      setError(getGeneralMessage(parseApiError(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div role="dialog" aria-modal="true" aria-labelledby="pregunta-title" className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 id="pregunta-title" className="text-lg font-bold text-slate-900">{pregunta ? 'Editar pregunta' : 'Nueva pregunta'}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Enunciado" name="enunciado" value={enunciado} onChange={(e) => setEnunciado(e.target.value)} placeholder="Ej. ¿Qué hook maneja efectos secundarios?" />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Opciones y respuesta correcta</legend>
            <p className="text-xs text-slate-500">Marca con el círculo la opción correcta (mínimo {MIN_OPCIONES}, máximo {MAX_OPCIONES}).</p>
            {opciones.map((opcion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" name="correcta" checked={indiceCorrecto === index} onChange={() => setIndiceCorrecto(index)} aria-label={`Opción ${index + 1} es la correcta`} className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500" />
                <input type="text" value={opcion} onChange={(e) => cambiarOpcion(index, e.target.value)} placeholder={`Opción ${index + 1}`} aria-label={`Texto de la opción ${index + 1}`} className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {opciones.length > MIN_OPCIONES && (
                  <button type="button" onClick={() => quitarOpcion(index)} aria-label={`Quitar opción ${index + 1}`} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            {opciones.length < MAX_OPCIONES && (
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setOpciones((prev) => [...prev, ''])}>Agregar opción</Button>
            )}
          </fieldset>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>Guardar pregunta</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreguntaModal;
