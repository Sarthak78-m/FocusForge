import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-6">
          <FileQuestion className="h-8 w-8" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-[var(--color-text)] mb-3">
          404
        </h1>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Page not found
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            iconLeft={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            variant="primary"
            iconLeft={<Home className="h-4 w-4" />}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
