import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GraduationCap } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestão Escolar</h1>
          <p className="text-gray-500 mt-2">Entre com suas credenciais</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>
          <div>
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              {...register('senha')}
            />
            {errors.senha && (
              <span className="text-red-500 text-sm">{errors.senha.message}</span>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={loginMutation.isLoading}
          >
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Credenciais padrão: admin@escola.com / admin123
        </p>
      </div>
    </div>
  );
}
