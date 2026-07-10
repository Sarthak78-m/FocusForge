import { Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common';
import { paths } from '@/routes/paths';

export function SignupPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start a focused study workspace.</CardDescription>
          </div>
        </CardHeader>
        <Link className="text-sm font-medium text-brand-600 hover:text-brand-700" to={paths.login}>
          Already have an account
        </Link>
      </Card>
    </section>
  );
}
