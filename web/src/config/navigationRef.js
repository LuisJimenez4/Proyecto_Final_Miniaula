/**
 * Permite realizar navegación programática con React Router fuera de los componentes React,
 * especialmente útil para el interceptor de Axios (401 Unauthorized).
 */
let navigateFunction = null;

export const setNavigate = (fn) => {
  navigateFunction = fn;
};

export const navigateTo = (path, options = {}) => {
  if (navigateFunction) {
    navigateFunction(path, options);
  } else {
    window.location.href = path;
  }
};

export default {
  setNavigate,
  navigateTo,
};
