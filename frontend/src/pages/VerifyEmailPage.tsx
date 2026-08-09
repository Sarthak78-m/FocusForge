import { useEffect, useRef } from 'react';
import { CheckCircle2, CircleX, Loader2, Timer } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Button } from '@/components/common';
import { useVerifyEmail } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import type { ApiErrorPayload } from '@/types/api';

export function VerifyEmailPage() {
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
    ? 'This verification link is missing a token.'
    : error?.response?.data?.message ?? 'This verification link is invalid or has expired.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-elevated dark:bg-[var(--color-surface)]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500">
            <Timer className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>

        {verification.isPending ? (
          <div className="space-y-4" role="status">
            <Loader2 className="h-9 w-9 animate-spin text-primary-600" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Verifying your email</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Please wait while we confirm your email address.</p>
            </div>
          </div>
        ) : null}

        {verification.isSuccess ? (
          <div className="space-y-5" role="status">
            <CheckCircle2 className="h-10 w-10 text-success-600" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Email verified</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Your account is ready. Redirecting you to login.</p>
            </div>
            <Link to={paths.login} className="block">
              <Button className="w-full">Go to login</Button>
            </Link>
          </div>
        ) : null}

        {failed ? (
          <div className="space-y-5" role="alert">
            <CircleX className="h-10 w-10 text-error-600" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Verification unavailable</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{failureMessage}</p>
            </div>
            <Link to={paths.login} className="block">
              <Button variant="secondary" className="w-full">Return to login</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
