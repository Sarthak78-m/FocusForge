import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Timer, CheckCircle2, Sparkles, ShieldCheck, Flame, Trophy } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input } from '@/components/common';
import { useRegister } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
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
  const { activePalette } = useTheme();
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Feature Branding Panel */}
      <div
        className="hidden flex-col justify-between p-12 lg:flex lg:w-[480px] text-white relative overflow-hidden"
        style={{ background: activePalette.gradient }}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-md">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">MindSprint</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-sm">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-bold text-white">Multi-View Task Studio</p>
            </div>
            <p className="mt-1 text-xs text-white/80">List View, Kanban Boards, and priority tag filters.</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-300" />
              <p className="text-sm font-bold text-white">Pomodoro Focus & Soundscapes</p>
            </div>
            <p className="mt-1 text-xs text-white/80">Ambient audio player with Rain, Space, and White Noise.</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-300" />
              <p className="text-sm font-bold text-white">24/7 AI Coach & Rewards</p>
            </div>
            <p className="mt-1 text-xs text-white/80">Instant study plans, flashcards, and streak XP badges.</p>
          </div>
        </div>

        <p className="text-xs text-white/70 relative z-10">© 2026 MindSprint AI Study Coach</p>
      </div>

      {/* Right Signup Form Box */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: activePalette.gradient }}
            >
              <Timer className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">MindSprint</span>
          </div>

          {registeredEmail ? (
            <div className="space-y-5" role="status">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <MailCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Created!</h1>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Your MindSprint study workspace is ready. You can log in directly with your email:
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{registeredEmail}</p>
              </div>
              <Link to={paths.login} className="block pt-2">
                <button
                  type="button"
                  className="w-full rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                  style={{ background: activePalette.gradient }}
                >
                  Proceed to Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Create Your Account
                </h1>
                <p className="mt-1 text-xs text-slate-500">Join MindSprint and build your study momentum</p>
              </div>

              <form onSubmit={handleSubmit((values) => registerAccount(values))} className="space-y-4" noValidate>
                <Input
                  id="signup-name"
                  type="text"
                  label="Full Name"
                  placeholder="Sarthak Sharma"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  id="signup-email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
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
                        <span className="text-slate-500">Password Strength</span>
                        <span className="text-slate-700 dark:text-slate-300">{strength.label}</span>
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
                  className="mt-2 w-full rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: activePalette.gradient }}
                >
                  {isPending ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
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

