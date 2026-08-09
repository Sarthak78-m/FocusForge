import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Timer } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input } from '@/components/common';
import { useLogin, useResendVerification } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const token = useAuthStore((state) => state.token);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin({ onUnverified: setUnverifiedEmail });
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (token) return <Navigate to={paths.dashboard} replace />;

  const resend = () => {
    if (unverifiedEmail) {
      resendVerification({ email: unverifiedEmail });
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <div className="hidden flex-col justify-between border-r border-[var(--color-border)] bg-white p-10 dark:bg-[var(--color-surface)] lg:flex lg:w-[420px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>
        <p className="text-base leading-relaxed text-text-secondary">Return to the study plan you are building.</p>
        <p className="text-xs text-text-secondary">MindSprint</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-elevated dark:bg-[var(--color-surface)]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500">
              <Timer className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-text-secondary">Log in to your study workspace</p>
          </div>

          <form
            onSubmit={handleSubmit((values) => {
              setUnverifiedEmail(null);
              login(values);
            })}
            className="space-y-4"
            noValidate
          >
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
              placeholder="Your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link to={paths.forgotPassword} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" isLoading={isPending}>Log in</Button>
          </form>

          {unverifiedEmail ? (
            <div className="mt-5 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-900 dark:bg-warning-950" role="alert">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-warning-700 dark:text-warning-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                    Please verify your email before logging in.
                  </p>
                  <button
                    type="button"
                    onClick={resend}
                    disabled={isResending}
                    className="mt-2 text-sm font-medium text-primary-700 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-60 dark:text-primary-300"
                  >
                    {isResending ? 'Sending verification email...' : 'Resend verification email'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-center text-sm text-text-secondary">
            Do not have an account?{' '}
            <Link to={paths.signup} className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
