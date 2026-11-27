import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavigationHandler from './NavigationHandler';
import AuthenticatedRoute from './AuthenticatedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../constants';

// Páginas de Autenticación y Perfil
import FormLogin from '../pages/auth/FormLogin';
import FormRegistro from '../pages/auth/FormRegistro';
import PerfilPage from '../pages/auth/PerfilPage';

// Páginas de Catálogo Público
import CatalogoList from '../pages/catalogo/CatalogoList';
import CursoDetalle from '../pages/catalogo/CursoDetalle';

// Páginas del Estudiante
import MisCursosList from '../pages/estudiante/MisCursosList';
import InscripcionDetalle from '../pages/estudiante/InscripcionDetalle';

// Páginas del Instructor
import InstructorCursosList from '../pages/instructor/InstructorCursosList';
import EditorCurso from '../pages/instructor/EditorCurso';
import EditorLeccion from '../pages/instructor/EditorLeccion';
import PanelCurso from '../pages/instructor/PanelCurso';

export const RouterConfig = () => {
  return (
    <>
      <NavigationHandler />
      <Routes>
        {/* Redirección Inicial */}
        <Route path="/" element={<Navigate to="/catalogo" replace />} />

        {/* Rutas Públicas */}
        <Route path="/login" element={<FormLogin />} />
        <Route path="/registro" element={<FormRegistro />} />
        <Route path="/catalogo" element={<CatalogoList />} />
        <Route path="/cursos/:id" element={<CursoDetalle />} />

        {/* Rutas Autenticadas Comunes */}
        <Route element={<AuthenticatedRoute />}>
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* Rutas para Estudiantes */}
        <Route element={<RoleRoute allowedRoles={ROLES.ESTUDIANTE} />}>
          <Route path="/mis-cursos" element={<MisCursosList />} />
          <Route path="/mis-cursos/:cursoId" element={<InscripcionDetalle />} />
          <Route path="/mis-cursos/:cursoId/lecciones/:leccionId" element={<InscripcionDetalle />} />
        </Route>

        {/* Rutas para Instructores */}
        <Route element={<RoleRoute allowedRoles={ROLES.INSTRUCTOR} />}>
          <Route path="/instructor/cursos" element={<InstructorCursosList />} />
          <Route path="/instructor/cursos/nuevo" element={<EditorCurso />} />
          <Route path="/instructor/cursos/:id/editar" element={<EditorCurso />} />
          <Route
            path="/instructor/cursos/:cursoId/lecciones/nueva"
            element={<EditorLeccion />}
          />
          <Route
            path="/instructor/cursos/:cursoId/lecciones/:leccionId"
            element={<EditorLeccion />}
          />
          <Route path="/instructor/cursos/:id/resumen" element={<PanelCurso />} />
        </Route>

        {/* Ruta Fallback */}
        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </>
  );
};

export default RouterConfig;
