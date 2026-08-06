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
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Left panel — branding */}
      <div className="hidden flex-col justify-between border-r border-[var(--color-border)] bg-white p-10 dark:bg-[var(--color-surface)] lg:flex lg:w-[420px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>
        <div>
          <blockquote className="text-base leading-relaxed text-text-secondary dark:text-[var(--color-text-secondary)] italic">
            "The secret of getting ahead is getting started."
          </blockquote>
          <p className="mt-2 text-sm font-medium text-text-secondary dark:text-[var(--color-text-secondary)]">— Mark Twain</p>
        </div>
        <p className="text-xs text-text-secondary dark:text-[var(--color-text-secondary)]">
          © {new Date().getFullYear()} MindSprint
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-elevated dark:bg-[var(--color-surface)]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500">
              <Timer className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
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

          <p className="mt-6 text-center text-sm text-text-secondary dark:text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link
              to={paths.signup}
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
