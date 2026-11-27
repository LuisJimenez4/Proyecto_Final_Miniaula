import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { register as registerService, login as loginService } from '../../services/AuthService';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Alert from '../../components/Alert';
import { parseApiError, applyFieldErrors } from '../../utils/apiError';
import { ROLES } from '../../constants';
import { BookOpen, UserPlus } from 'lucide-react';

const registroSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(Object.values(ROLES), {
    errorMap: () => ({ message: 'Selecciona un rol válido' }),
  }),
});

export const FormRegistro = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      rol: ROLES.ESTUDIANTE,
    },
  });

  const selectedRol = watch('rol');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    try {
      await registerService(data);

      // Intento de auto-login para una experiencia fluida
      try {
        const loginRes = await loginService({
          email: data.email,
          password: data.password,
        });
        login(loginRes.token, loginRes.user);
        const destination = loginRes.user?.rol === ROLES.INSTRUCTOR ? '/instructor/cursos' : '/catalogo';
        navigate(destination, { replace: true });
        return;
      } catch {
        setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === 'DUPLICATE_EMAIL') {
        setError('email', { type: 'server', message: parsed.message });
        setServerError(null);
      } else {
        setServerError(applyFieldErrors(setError, parsed, ['nombre', 'email', 'password', 'rol']));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Crea tu cuenta en MiniAula
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Aprende o enseña con lecciones prácticas y micro-aprendizaje
          </p>
        </div>

        {serverError && <Alert type="error">{serverError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormInput
              label="Nombre completo"
              name="nombre"
              placeholder="Ej. Laura Méndez"
              error={errors.nombre?.message}
              {...register('nombre')}
            />

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
              placeholder="Mínimo 6 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRol === ROLES.ESTUDIANTE
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={ROLES.ESTUDIANTE}
                    className="sr-only"
                    {...register('rol')}
                  />
                  <span className="text-sm">Estudiante</span>
                  <span className="text-[11px] text-slate-500 font-normal">Aprende cursos</span>
                </label>

                <label
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRol === ROLES.INSTRUCTOR
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={ROLES.INSTRUCTOR}
                    className="sr-only"
                    {...register('rol')}
                  />
                  <span className="text-sm">Instructor</span>
                  <span className="text-[11px] text-slate-500 font-normal">Crea contenido</span>
                </label>
              </div>
              {errors.rol?.message && (
                <p className="text-xs text-rose-600 font-medium">{errors.rol.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              icon={UserPlus}
            >
              Crear Cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FormRegistro;
