import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-text-primary px-4 py-3 text-sm font-medium text-white shadow-elevated">
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      You are offline
    </div>
  );
}
