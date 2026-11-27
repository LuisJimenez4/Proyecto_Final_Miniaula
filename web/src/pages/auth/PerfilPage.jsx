import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { getPerfil, updatePerfil } from '../../services/UserService';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import StatusFeedback from '../../components/StatusFeedback';
import Alert from '../../components/Alert';
import { parseApiError, applyFieldErrors } from '../../utils/apiError';
import { Shield, Save, Lock } from 'lucide-react';

const perfilSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El correo es obligatorio').email('Formato de correo inválido'),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'Si cambia la contraseña, debe tener al menos 6 caracteres',
    }),
});

export const PerfilPage = () => {
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
    },
  });

  const fetchPerfilData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPerfil();
      reset({
        nombre: data.nombre || '',
        email: data.email || '',
        password: '',
      });
      updateUser(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfilData();
  }, []);

  const onSubmit = async (values) => {
    setIsSaving(true);
    setSaveError(null);
    setSuccessMsg(null);

    const payload = {
      nombre: values.nombre,
      email: values.email,
    };
    if (values.password && values.password.trim() !== '') {
      payload.password = values.password;
    }

    try {
      const updated = await updatePerfil(payload);
      updateUser(updated);
      setSuccessMsg('Perfil actualizado correctamente.');
      reset({
        nombre: updated.nombre,
        email: updated.email,
        password: '',
      });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.code === 'DUPLICATE_EMAIL') {
        setFieldError('email', { type: 'server', message: parsed.message });
      } else {
        setSaveError(applyFieldErrors(setFieldError, parsed, ['nombre', 'email', 'password']));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Administra la información personal de tu cuenta y credenciales
        </p>
      </div>

      <StatusFeedback loading={loading} error={error} onRetry={fetchPerfilData}>
        {successMsg && <Alert type="success" className="mb-6">{successMsg}</Alert>}
        {saveError && <Alert type="error" className="mb-6">{saveError}</Alert>}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          {/* Cabecera del Perfil */}
          <div className="p-6 sm:p-8 flex items-center space-x-5 bg-gradient-to-r from-indigo-50/50 to-white">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shadow-indigo-100 uppercase">
              {authUser?.nombre?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{authUser?.nombre}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-indigo-100 text-indigo-800">
                  <Shield className="w-3 h-3 mr-1" />
                  {authUser?.rol}
                </span>
                <span className="text-xs text-slate-400">ID: #{authUser?.id}</span>
              </div>
            </div>
          </div>

          {/* Formulario de Edición */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormInput
                label="Nombre completo"
                name="nombre"
                error={errors.nombre?.message}
                {...register('nombre')}
              />

              <FormInput
                label="Correo electrónico"
                name="email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center mb-3">
                <Lock className="w-4 h-4 mr-2 text-slate-400" />
                Seguridad y Contraseña
              </h3>
              <FormInput
                label="Nueva Contraseña (opcional)"
                name="password"
                type="password"
                placeholder="Dejar en blanco para mantener la actual"
                helperText="Solo ingresa una contraseña si deseas cambiarla (mínimo 6 caracteres)"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                disabled={!isDirty}
                icon={Save}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </StatusFeedback>
    </div>
  );
};

export default PerfilPage;
