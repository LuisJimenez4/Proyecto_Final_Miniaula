import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user?.rol)) {
    // Redirige al destino adecuado según su rol real
    const fallback = user?.rol === ROLES.INSTRUCTOR ? '/instructor/cursos' : '/catalogo';
    return <Navigate to={fallback} replace />;
  }

  return children ? children : <Outlet />;
};

export default RoleRoute;
