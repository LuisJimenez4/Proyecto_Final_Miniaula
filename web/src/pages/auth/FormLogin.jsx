import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { login as loginService } from '../../services/AuthService';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { parseApiError, applyFieldErrors } from '../../utils/apiError';
import { BookOpen, LogIn, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const FormLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await loginService(data);
      // Backend retorna: { token, user: { id, nombre, email, rol } }
      login(response.token, response.user);

      const redirectPath =
        location.state?.from?.pathname ||
        (response.user?.rol === 'instructor' ? '/instructor/cursos' : '/catalogo');

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setServerError(applyFieldErrors(setError, parseApiError(err), ['email', 'password']));
    } finally {
      setIsLoading(false);
    }
  };

  const setTestAccount = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
    setServerError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ingresa a tu cuenta para continuar con tu aprendizaje
          </p>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormInput
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              icon={LogIn}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Cuentas de prueba: solo en desarrollo (import.meta.env.DEV) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accesos rápidos de prueba (Seed):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTestAccount('garcia@miniaula.com')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
              >
                <p className="font-semibold text-slate-800">Prof. García</p>
                <p className="text-[11px] text-slate-500">Instructor</p>
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('ana@estudiante.com')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
              >
                <p className="font-semibold text-slate-800">Ana López</p>
                <p className="text-[11px] text-slate-500">Estudiante</p>
              </button>
            </div>
          </div>
          )}
        </div>

        <p className="text-center text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/registro"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FormLogin;
