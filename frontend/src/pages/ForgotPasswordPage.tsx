import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Timer, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Input } from '@/components/common';
import { useForgotPassword } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';
import type { ApiErrorPayload } from '@/types/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { activePalette } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();
  const error = forgotPassword.error as AxiosError<ApiErrorPayload> | null;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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

        {submitted ? (
          <div className="space-y-5" role="status">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <MailCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Link Sent</h1>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                If an account exists for that email, we've sent instructions to reset your password.
              </p>
            </div>
            <Link to={paths.login} className="block pt-2">
              <button
                type="button"
                className="w-full rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                style={{ background: activePalette.gradient }}
              >
                Return to Login
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reset Password
              </h1>
              <p className="mt-1 text-xs text-slate-500">Enter your registered email to receive a password reset link</p>
            </div>

            <form
              onSubmit={handleSubmit((values) => forgotPassword.mutate(values, { onSuccess: () => setSubmitted(true) }))}
              className="space-y-4"
              noValidate
            >
              <Input
                id="forgot-password-email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              {forgotPassword.isError ? (
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400" role="alert">
                  {error?.response?.data?.message ?? 'Unable to request a password reset. Please try again.'}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="mt-2 w-full rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: activePalette.gradient }}
              >
                {forgotPassword.isPending ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

