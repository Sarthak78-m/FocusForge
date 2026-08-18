import { PlaceholderPage } from './PlaceholderPage';
import { HelpCircle } from 'lucide-react';

export function HelpPage() {
  return (
    <PlaceholderPage
      icon={<HelpCircle className="h-6 w-6" />}
      title="Help & Documentation"
      description="Keyboard shortcuts, tips, and guides will live here."
    />
  );
}
