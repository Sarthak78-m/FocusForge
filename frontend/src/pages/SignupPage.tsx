import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Timer, CheckCircle2, Flame, Trophy } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/common';
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

function getPasswordStrength(pass: string) {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
  if (score === 3) return { score: 75, label: 'Good', color: 'bg-sky-500' };
  return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
}

export function SignupPage() {
  const token = useAuthStore((state) => state.token);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { mutate: registerAccount, isPending } = useRegister({
    onRegistered: (response) => setRegisteredEmail(response.email),
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const watchPassword = watch('password', '');
  const strength = getPasswordStrength(watchPassword);

  if (token) return <Navigate to={paths.dashboard} replace />;

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] font-sans antialiased text-[var(--color-text-primary)]">
      {/* Left Feature Branding Panel (Warm Light Style) */}
      <div className="hidden flex-col justify-between p-12 lg:flex lg:w-[440px] text-[var(--color-text-primary)] relative overflow-hidden bg-[var(--color-surface-container)] border-r border-[var(--color-border)]">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-primary)] text-white font-bold text-xs shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">MindSprint</span>
        </div>

        <div className="space-y-4 relative z-10 max-w-xs">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Create your productivity workspace.
          </h2>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Free forever for users. Organize your tasks, stay in flow with Pomodoro sprint intervals, and keep connected Markdown notes.
          </p>
        </div>

        <p className="text-2xs text-[var(--color-text-tertiary)] relative z-10">MindSprint Workspace</p>
      </div>



      {/* Right Signup Form Box */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-xs dark:bg-slate-900">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-xs">
              <Timer className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">MindSprint</span>
          </div>

          {registeredEmail ? (
            <div className="space-y-5" role="status">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <MailCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Account Created!</h1>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  Your MindSprint productivity workspace is ready. You can log in directly with your email:
                </p>
                <p className="mt-2 text-sm font-bold text-[var(--color-text-primary)]">{registeredEmail}</p>
              </div>
              <Link to={paths.login} className="block pt-2">
                <button
                  type="button"
                  className="w-full rounded-full bg-[var(--color-primary)] py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-105"
                >
                  Proceed to Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  Create Your Account
                </h1>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">Join MindSprint and build your momentum</p>
              </div>

              <form onSubmit={handleSubmit((values) => registerAccount(values))} className="space-y-4" noValidate>
                <Input
                  id="signup-name"
                  type="text"
                  label="Full Name"
                  placeholder="Alex"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  id="signup-email"
                  type="email"
                  label="Email Address"
                  placeholder="alex@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <div>
                  <Input
                    id="signup-password"
                    type="password"
                    label="Password"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  {watchPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-[var(--color-text-tertiary)]">Password Strength</span>
                        <span className="text-[var(--color-text-primary)]">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full rounded-full bg-[var(--color-primary)] py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  {isPending ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs font-medium text-[var(--color-text-secondary)]">
                Already have an account?{' '}
                <Link to={paths.login} className="font-bold text-[var(--color-primary)] hover:underline">
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
