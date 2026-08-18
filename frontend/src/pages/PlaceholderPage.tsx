import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: Props) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center animate-fade-in">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-5">
        {icon ?? <Construction className="h-6 w-6" />}
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
        {description}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          iconLeft={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
        <Button variant="primary" onClick={() => navigate('/notes')}>
          Browse Notes
        </Button>
      </div>

      <div className="mt-12 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-xs text-[var(--color-text-secondary)]">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        This page will be built in a future update
      </div>
    </div>
  );
}
