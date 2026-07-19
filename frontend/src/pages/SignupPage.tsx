import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { paths } from '@/routes/paths';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const token = useAuthStore((s) => s.token);
  const { mutate: register_, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (token) return <Navigate to={paths.dashboard} replace />;

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Left panel */}
      <div className="hidden flex-col justify-between border-r border-stone-200 bg-white p-10 dark:border-stone-800 dark:bg-stone-950 lg:flex lg:w-[420px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
        </div>
        <div className="space-y-6">
          {[
            { title: 'Task management', body: 'Create, prioritize, and track every study task.' },
            { title: 'Pomodoro timer', body: 'Stay focused with structured work and break sessions.' },
            { title: 'Progress overview', body: 'See your completion trends at a glance.' },
          ].map((f) => (
            <div key={f.title}>
              <p className="text-sm font-semibold text-stone-900 dark:text-white">{f.title}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{f.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-600">
          © {new Date().getFullYear()} MindSprint
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <Timer className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-stone-900 dark:text-white">MindSprint</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">Create an account</h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              Start building your study momentum
            </p>
          </div>

          <form
            onSubmit={handleSubmit((v) => register_(v))}
            className="space-y-4"
            noValidate
          >
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

            <Button type="submit" className="w-full" isLoading={isPending}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
            Already have an account?{' '}
            <Link
              to={paths.login}
              className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
