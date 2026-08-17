import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Timer, Sparkles, KeyRound, ArrowRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/common';
import { useLogin, useResendVerification } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
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
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (token) return <Navigate to={paths.dashboard} replace />;

  const resend = () => {
    if (unverifiedEmail) {
      resendVerification({ email: unverifiedEmail });
    }
  };

  const fillDemoAccount = () => {
    setValue('email', 'alex.study@focusforge.ai');
    setValue('password', 'Password123!');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] font-sans antialiased text-[var(--color-text-primary)]">
      {/* Left Feature Branding Panel (Stitch Coral Red Gradient) */}
      <div className="hidden flex-col justify-between p-12 lg:flex lg:w-[480px] text-white relative overflow-hidden bg-gradient-to-br from-[#E44332] via-[#B31F14] to-[#782D40]">
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-sm">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">FocusForge</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-sm">
          <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <p className="text-sm font-bold text-white">Welcome Back to Your Workspace</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/90">
              Pick up where you left off. Continue your Pomodoro focus sprints, track daily deadlines, and consult your 24/7 AI Study Coach.
            </p>
          </div>
        </div>

        <p className="text-xs text-white/80 relative z-10">© 2026 FocusForge Pro Suite</p>
      </div>

      {/* Right Login Form Box (Stitch Design Container) */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-xs dark:bg-slate-900">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-xs">
              <Timer className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">FocusForge</span>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                Log In
              </h1>
              <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">Access your focus workspace</p>
            </div>

            {/* Quick Demo Fill Pill */}
            <button
              type="button"
              onClick={fillDemoAccount}
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-container)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary-light)]"
              title="Click to auto-fill demo credentials"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Demo Account
            </button>
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
              label="Email Address"
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
              <Link
                to={paths.forgotPassword}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-[var(--color-primary-hover)] hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              {isPending ? 'Logging in...' : 'Log In to Workspace'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {unverifiedEmail ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950" role="alert">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                    Please verify your email before logging in.
                  </p>
                  <button
                    type="button"
                    onClick={resend}
                    disabled={isResending}
                    className="mt-2 text-xs font-bold text-[var(--color-primary)] hover:underline"
                  >
                    {isResending ? 'Sending link...' : 'Resend verification email'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <p className="mt-6 text-center text-xs font-medium text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link to={paths.signup} className="font-bold text-[var(--color-primary)] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
