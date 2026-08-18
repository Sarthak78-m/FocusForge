import { PlaceholderPage } from './PlaceholderPage';
import { Link2 } from 'lucide-react';

export function BacklinksPage() {
  return (
    <PlaceholderPage
      icon={<Link2 className="h-6 w-6" />}
      title="Backlinks"
      description="See every note that links to another, in both directions."
    />
  );
}
