import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Timer, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Input } from '@/components/common';
import { useResetPassword } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';
import type { ApiErrorPayload } from '@/types/api';

const schema = z
  .object({
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

export function ResetPasswordPage() {
  const { activePalette } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetComplete, setResetComplete] = useState(false);
  const resetPassword = useResetPassword();
  const error = resetPassword.error as AxiosError<ApiErrorPayload> | null;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const watchPassword = watch('password', '');
  const strength = getPasswordStrength(watchPassword);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ background: activePalette.gradient }}
            >
              <Timer className="h-5 w-5" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">MindSprint</span>
          </div>

          <Link
            to={paths.login}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>

        {resetComplete ? (
          <div className="space-y-5" role="status">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password Updated!</h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Your password has been successfully reset. You can now log in to your account with your new credentials.
              </p>
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
                Choose New Password
              </h1>
              <p className="mt-1 text-xs text-slate-500">Enter a secure password with at least 8 characters</p>
            </div>

            {!token ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                This reset link is invalid or missing a security token. Please request a new link.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit((values) =>
                  resetPassword.mutate({ ...values, token }, { onSuccess: () => setResetComplete(true) })
                )}
                className="space-y-4"
                noValidate
              >
                <div>
                  <Input
                    id="reset-password"
                    type="password"
                    label="New Password"
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
                  id="reset-confirm-password"
                  type="password"
                  label="Confirm New Password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                {resetPassword.isError ? (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400" role="alert">
                    {error?.response?.data?.message ?? 'Unable to reset your password. Please request a new link.'}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={resetPassword.isPending}
                  className="mt-2 w-full rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: activePalette.gradient }}
                >
                  {resetPassword.isPending ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

