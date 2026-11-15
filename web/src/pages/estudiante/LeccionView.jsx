import React, { useState } from 'react';
import { completarLeccion } from '../../services/InscripcionService';
import { parseApiError } from '../../utils/apiError';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { FileText, Video, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
  return url;
};

const isEmbeddable = (url) => Boolean(url) && (url.includes('youtube.com/embed') || url.includes('player.vimeo'));

const VideoBlock = ({ titulo, videoUrl }) => {
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video shadow-inner">
      {isEmbeddable(embedUrl) ? (
        <iframe
          src={embedUrl}
          title={titulo}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
          <Video className="w-12 h-12 text-slate-400 mb-2" />
          <p className="text-sm font-medium mb-3">Enlace de video adjunto</p>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-indigo-300 hover:text-white underline">
            Abrir video en nueva pestaña <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      )}
    </div>
  );
};

/** RF-10, RF-12: lección de contenido; completarla desbloquea la siguiente (RN-01). */
export const LeccionView = ({ leccion, vecinas, onNavegar, onProgresoActualizado }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const completada = Boolean(leccion.progreso?.completada);
  const { anterior, siguiente } = vecinas;

  const handleCompletar = async () => {
    setLoading(true);
    setError(null);
    try {
      await completarLeccion(leccion.id);
      await onProgresoActualizado();
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Lección {leccion.orden} · Contenido</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-words">{leccion.titulo}</h1>
      </div>

      {leccion.videoUrl && <VideoBlock titulo={leccion.titulo} videoUrl={leccion.videoUrl} />}

      <div className="py-2 text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
        {leccion.contenido || 'Esta lección no tiene texto adicional.'}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {completada ? (
            <span className="inline-flex items-center text-sm font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              Lección completada
            </span>
          ) : (
            <p className="text-xs text-slate-500">Marca la lección como completada para desbloquear la siguiente.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {anterior && (
            <Button variant="ghost" size="md" onClick={() => onNavegar(anterior)} icon={ArrowLeft}>Anterior</Button>
          )}
          {!completada && (
            <Button variant="primary" size="md" isLoading={loading} onClick={handleCompletar} icon={CheckCircle2}>
              Marcar como completada
            </Button>
          )}
          {siguiente && (
            <Button
              variant="outline"
              size="md"
              disabled={!siguiente.desbloqueada}
              title={siguiente.desbloqueada ? undefined : 'Completa esta lección para desbloquear la siguiente'}
              onClick={() => onNavegar(siguiente)}
              icon={ArrowRight}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeccionView;
