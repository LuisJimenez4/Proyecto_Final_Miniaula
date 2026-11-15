import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCursos } from '../../services/CursoService';
import { useFetch } from '../../hooks/useFetch';
import StatusFeedback from '../../components/StatusFeedback';
import Pagination from '../../components/Pagination';
import Button from '../../components/Button';
import { CATEGORIAS, NIVELES, CATALOGO_PAGE_SIZE } from '../../constants';
import { Search, Layers, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const SELECT_CLASS =
  'w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs';

const CursoCard = ({ curso }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
    <div className="p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
          {curso.categoria}
        </span>
        <span className="inline-flex items-center text-xs font-medium text-slate-500">
          <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {curso.nivel}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {curso.titulo}
      </h3>
      <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">{curso.descripcion}</p>
      <p className="mt-3 text-xs text-slate-500 flex items-center">
        <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
        {curso.totalLecciones} {Number(curso.totalLecciones) === 1 ? 'lección' : 'lecciones'}
      </p>
    </div>

    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
      <div className="flex items-center space-x-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
          {curso.instructor?.nombre?.charAt(0) || 'I'}
        </div>
        <span className="text-xs font-medium text-slate-700 truncate">{curso.instructor?.nombre || 'Instructor'}</span>
      </div>
      <Link to={`/cursos/${curso.id}`}>
        <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold p-1">
          Ver curso
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  </div>
);

export const CatalogoList = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ q: '', categoria: '', nivel: '' });

  const { data, loading, error, refetch } = useFetch(
    () => getCursos({ page, limit: CATALOGO_PAGE_SIZE, ...filters }),
    { deps: [page, filters.q, filters.categoria, filters.nivel] },
  );

  const cursos = data?.cursos ?? [];

  const updateFilters = (changes) => {
    setFilters((prev) => ({ ...prev, ...changes }));
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() });
  };

  const clearFilters = () => {
    setSearchInput('');
    updateFilters({ q: '', categoria: '', nivel: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-3 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
          Aprende a tu propio ritmo
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Catálogo de Cursos</h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600">
          Explora cursos con lecciones, videos y cuestionarios de evaluación.
        </p>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6 relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar curso por título o descripción..."
              aria-label="Buscar cursos"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="md:col-span-3">
            <select
              value={filters.categoria}
              onChange={(e) => updateFilters({ categoria: e.target.value })}
              aria-label="Filtrar por categoría"
              className={SELECT_CLASS}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={filters.nivel}
              onChange={(e) => updateFilters({ nivel: e.target.value })}
              aria-label="Filtrar por nivel"
              className={SELECT_CLASS}
            >
              <option value="">Todos los niveles</option>
              {NIVELES.map((nivel) => (
                <option key={nivel} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      <StatusFeedback
        loading={loading}
        error={error}
        isEmpty={!loading && cursos.length === 0}
        emptyTitle="No encontramos cursos con estos criterios"
        emptyMessage="Intenta ajustar tu búsqueda o cambiar los filtros de categoría y nivel."
        emptyAction={<Button variant="outline" size="sm" onClick={clearFilters}>Limpiar filtros</Button>}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <CursoCard key={curso.id} curso={curso} />
          ))}
        </div>
        <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
      </StatusFeedback>
    </div>
  );
};

export default CatalogoList;
