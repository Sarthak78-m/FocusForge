import { Link } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/common';
import { paths } from '@/routes/paths';

export function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <div>
            <CardTitle>Login</CardTitle>
            <CardDescription>Return to your study workspace.</CardDescription>
          </div>
        </CardHeader>
        <Link className="text-sm font-medium text-brand-600 hover:text-brand-700" to={paths.landing}>
          Back to home
        </Link>
      </Card>
    </section>
  );
}
