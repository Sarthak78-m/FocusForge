import { useEffect, useRef } from 'react';
import { CheckCircle2, CircleX, Loader2, Timer, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useVerifyEmail } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { paths } from '@/routes/paths';
import type { ApiErrorPayload } from '@/types/api';

export function VerifyEmailPage() {
  const { activePalette } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasStarted = useRef(false);
  const verification = useVerifyEmail();
  const error = verification.error as AxiosError<ApiErrorPayload> | null;

  useEffect(() => {
    if (!token || hasStarted.current) {
      return;
    }
    hasStarted.current = true;
    verification.mutate(token);
  }, [token, verification.mutate]);

  useEffect(() => {
    if (!verification.isSuccess) {
      return;
    }
    const redirectId = window.setTimeout(() => navigate(paths.login, { replace: true }), 3000);
    return () => window.clearTimeout(redirectId);
  }, [navigate, verification.isSuccess]);

  const failed = !token || verification.isError;
  const failureMessage = !token
    ? 'This verification link is missing a valid security token.'
    : error?.response?.data?.message ?? 'This verification link is invalid or has expired.';

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
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            Log In
          </Link>
        </div>

        {verification.isPending ? (
          <div className="space-y-5" role="status">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[var(--color-primary)] dark:bg-indigo-950">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verifying Email...</h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">Please wait while we confirm your security credentials.</p>
            </div>
          </div>
        ) : null}

        {verification.isSuccess ? (
          <div className="space-y-5" role="status">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verified!</h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Your MindSprint account is verified. Redirecting you to login in 3 seconds...
              </p>
            </div>
            <Link to={paths.login} className="block pt-2">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105"
                style={{ background: activePalette.gradient }}
              >
                Proceed to Login Immediately
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        ) : null}

        {failed && !verification.isPending ? (
          <div className="space-y-5" role="alert">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <CircleX className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h1>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{failureMessage}</p>
            </div>
            <Link to={paths.login} className="block pt-2">
              <button
                type="button"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                Return to Login
              </button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

