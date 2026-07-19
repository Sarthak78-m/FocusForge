import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { LoadingSpinner, OfflineIndicator, ToastViewport } from '@/components/common';
import { queryClient } from '@/api/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { router } from '@/routes/router';

export function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner label="Loading MindSprint" />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <ToastViewport />
      <OfflineIndicator />
    </QueryClientProvider>
  );
}
