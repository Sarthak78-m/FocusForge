import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Button, Input } from '@/components/common';
import { useForgotPassword } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import type { ApiErrorPayload } from '@/types/api';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();
  const error = forgotPassword.error as AxiosError<ApiErrorPayload> | null;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-elevated dark:bg-[var(--color-surface)]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500">
            <Timer className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">MindSprint</span>
        </div>

        {submitted ? (
          <div className="space-y-5" role="status">
            <MailCheck className="h-10 w-10 text-success-600" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Check your email</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                If an account exists for that email, a password reset link has been sent.
              </p>
            </div>
            <Link to={paths.login} className="block">
              <Button className="w-full">Return to login</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Reset your password</h1>
              <p className="mt-1.5 text-sm text-text-secondary">We will send a secure reset link to your email.</p>
            </div>
            <form
              onSubmit={handleSubmit((values) => forgotPassword.mutate(values, { onSuccess: () => setSubmitted(true) }))}
              className="space-y-4"
              noValidate
            >
              <Input
                id="forgot-password-email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              {forgotPassword.isError ? (
                <p className="text-sm text-error-600" role="alert">
                  {error?.response?.data?.message ?? 'Unable to request a password reset. Please try again.'}
                </p>
              ) : null}
              <Button type="submit" className="w-full" isLoading={forgotPassword.isPending}>Send reset link</Button>
            </form>
            <p className="mt-6 text-center text-sm text-text-secondary">
              <Link to={paths.login} className="font-medium text-primary-600 hover:text-primary-700">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
