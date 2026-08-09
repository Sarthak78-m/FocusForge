import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Timer } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input } from '@/components/common';
import { useRegister } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { useAuthStore } from '@/store/auth.store';

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const token = useAuthStore((state) => state.token);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { mutate: registerAccount, isPending } = useRegister({
    onRegistered: (response) => setRegisteredEmail(response.email),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (token) return <Navigate to={paths.dashboard} replace />;

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <div className="hidden flex-col justify-between border-r border-[var(--color-border)] bg-white p-10 dark:bg-[var(--color-surface)] lg:flex lg:w-[420px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 shadow-sm">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Task management</p>
            <p className="mt-1 text-sm text-text-secondary">Create, prioritize, and track every study task.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Pomodoro timer</p>
            <p className="mt-1 text-sm text-text-secondary">Stay focused with structured work and break sessions.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Progress overview</p>
            <p className="mt-1 text-sm text-text-secondary">See your completion trends at a glance.</p>
          </div>
        </div>
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

          {registeredEmail ? (
            <div className="space-y-5" role="status">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-950 dark:text-success-300">
                <MailCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Check your email</h1>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Account created. Check your email to verify your account before logging in.
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">{registeredEmail}</p>
              </div>
              <Link to={paths.login} className="block">
                <Button className="w-full">Go to login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Create an account</h1>
                <p className="mt-1.5 text-sm text-text-secondary">Start building your study momentum</p>
              </div>

              <form onSubmit={handleSubmit((values) => registerAccount(values))} className="space-y-4" noValidate>
                <Input
                  id="signup-name"
                  type="text"
                  label="Full name"
                  placeholder="Sarthak Sharma"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  id="signup-email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  id="signup-password"
                  type="password"
                  label="Password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  id="signup-confirm-password"
                  type="password"
                  label="Confirm password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <Button type="submit" className="w-full" isLoading={isPending}>Create account</Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to={paths.login} className="font-medium text-primary-600 hover:text-primary-700">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
