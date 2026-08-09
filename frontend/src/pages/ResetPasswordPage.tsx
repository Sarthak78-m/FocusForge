import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Timer } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Button, Input } from '@/components/common';
import { useResetPassword } from '@/hooks/useAuth';
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

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetComplete, setResetComplete] = useState(false);
  const resetPassword = useResetPassword();
  const error = resetPassword.error as AxiosError<ApiErrorPayload> | null;
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

        {resetComplete ? (
          <div className="space-y-5" role="status">
            <CheckCircle2 className="h-10 w-10 text-success-600" aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Password updated</h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Your password has been reset. You can now log in.</p>
            </div>
            <Link to={paths.login} className="block">
              <Button className="w-full">Go to login</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Choose a new password</h1>
              <p className="mt-1.5 text-sm text-text-secondary">Use a password with at least 8 characters.</p>
            </div>
            {!token ? (
              <p className="rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700" role="alert">
                This reset link is missing a token.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit((values) => resetPassword.mutate(
                  { ...values, token },
                  { onSuccess: () => setResetComplete(true) },
                ))}
                className="space-y-4"
                noValidate
              >
                <Input
                  id="reset-password"
                  type="password"
                  label="New password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  id="reset-confirm-password"
                  type="password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                {resetPassword.isError ? (
                  <p className="text-sm text-error-600" role="alert">
                    {error?.response?.data?.message ?? 'Unable to reset your password. Please request a new link.'}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" isLoading={resetPassword.isPending}>Reset password</Button>
              </form>
            )}
            <p className="mt-6 text-center text-sm text-text-secondary">
              <Link to={paths.login} className="font-medium text-primary-600 hover:text-primary-700">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
