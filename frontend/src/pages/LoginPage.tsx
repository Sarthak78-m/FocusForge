import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { paths } from '@/routes/paths';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (token) return <Navigate to={paths.dashboard} replace />;

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Left panel — branding */}
      <div className="hidden flex-col justify-between border-r border-stone-200 bg-white p-10 dark:border-stone-800 dark:bg-stone-950 lg:flex lg:w-[420px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
        </div>
        <div>
          <blockquote className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
            "The secret of getting ahead is getting started."
          </blockquote>
          <p className="mt-2 text-sm font-medium text-stone-400 dark:text-stone-500">— Mark Twain</p>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-600">
          © {new Date().getFullYear()} MindSprint
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Timer className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">Welcome back</h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              Log in to your study workspace
            </p>
          </div>

          <form onSubmit={handleSubmit((v) => login(v))} className="space-y-4" noValidate>
            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="login-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" isLoading={isPending}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            Don't have an account?{' '}
            <Link
              to={paths.signup}
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
