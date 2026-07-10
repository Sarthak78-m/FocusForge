import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState, buttonClassName } from '@/components/common';
import { paths } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="The page you requested is not available."
        action={
          <Link to={paths.landing} className={buttonClassName({ variant: 'primary' })}>
            Go home
          </Link>
        }
      />
    </div>
  );
}
