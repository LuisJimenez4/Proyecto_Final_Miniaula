import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants';
import { BookOpen, GraduationCap, LayoutDashboard, User, LogOut, Menu, X, Compass, ChevronDown, PlusCircle, List } from 'lucide-react';
import Button from './Button';

/** Entradas del menú según el rol. Una entrada con `children` se muestra como submenú. */
const getMenu = (user) => {
  const items = [{ to: '/catalogo', label: 'Catálogo', icon: Compass }];
  if (user?.rol === ROLES.ESTUDIANTE) {
    items.push({ to: '/mis-cursos', label: 'Mis cursos', icon: GraduationCap });
  }
  if (user?.rol === ROLES.INSTRUCTOR) {
    items.push({
      label: 'Cursos',
      icon: LayoutDashboard,
      children: [
        { to: '/instructor/cursos', label: 'Mis cursos', icon: List, end: true },
        { to: '/instructor/cursos/nuevo', label: 'Crear curso', icon: PlusCircle },
      ],
    });
  }
  return items;
};

const desktopLink = ({ isActive }) =>
  `inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`;

const mobileLink = ({ isActive }) =>
  `flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`;

/** Cierra un menú desplegable al hacer clic fuera o pulsar Escape. */
const useDismiss = (open, setOpen) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);
  return ref;
};

const Submenu = ({ item }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
        <item.icon className="w-4 h-4 mr-1.5" />
        {item.label}
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-50">
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} end={child.end} role="menuitem" onClick={() => setOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <child.icon className="w-4 h-4 mr-2 text-slate-400" />
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

/** Avatar con menú: perfil y cerrar sesión. */
const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, setOpen);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">{user?.nombre ? user.nombre.charAt(0) : 'U'}</div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[120px]">{user?.nombre}</span>
          <span className="text-[10px] capitalize text-indigo-600 font-medium">{user?.rol}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-50">
          <Link to="/perfil" role="menuitem" onClick={() => setOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
            <User className="w-4 h-4 mr-2 text-slate-400" />
            Mi perfil
          </Link>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export const Navbar = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menu = getMenu(isLoggedIn ? user : null);
  const closeMobile = () => setMobileMenuOpen(false);

  // logout ya redirige a /login (AuthContext)
  const handleLogout = () => {
    closeMobile();
    logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900">Mini<span className="text-indigo-600">Aula</span></span>
                <span className="text-[10px] text-slate-400 -mt-1 font-medium uppercase tracking-wider">Micro-aprendizaje</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 ml-8" aria-label="Navegación principal">
              {menu.map((item) =>
                item.children ? (
                  <Submenu key={item.label} item={item} />
                ) : (
                  <NavLink key={item.to} to={item.to} className={desktopLink}>
                    <item.icon className="w-4 h-4 mr-1.5" />
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
                <Link to="/registro"><Button variant="primary" size="sm">Registrarse</Button></Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-expanded={mobileMenuOpen} aria-label="Abrir menú de navegación">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1" aria-label="Navegación móvil">
            {menu.map((item) =>
              item.children ? (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                  {item.children.map((child) => (
                    <NavLink key={child.to} to={child.to} end={child.end} className={mobileLink} onClick={closeMobile}>
                      <child.icon className="w-5 h-5 mr-3 text-slate-500" />
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink key={item.to} to={item.to} className={mobileLink} onClick={closeMobile}>
                  <item.icon className="w-5 h-5 mr-3 text-slate-500" />
                  {item.label}
                </NavLink>
              )
            )}

            {isLoggedIn && (
              <NavLink to="/perfil" className={mobileLink} onClick={closeMobile}>
                <User className="w-5 h-5 mr-3 text-slate-500" />
                Mi perfil ({user?.nombre})
              </NavLink>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {isLoggedIn ? (
              <Button variant="danger" fullWidth size="md" onClick={handleLogout} icon={LogOut}>Cerrar sesión</Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={closeMobile}><Button variant="outline" fullWidth size="md">Ingresar</Button></Link>
                <Link to="/registro" onClick={closeMobile}><Button variant="primary" fullWidth size="md">Registrarse</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
