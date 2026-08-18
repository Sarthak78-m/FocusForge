import { Suspense, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { LoadingSpinner, OfflineIndicator, ToastViewport } from '@/components/common';
import { queryClient } from '@/api/queryClient';
import { useTheme } from '@/hooks/useTheme';
import { useNoteStore } from '@/store/noteStore';
import { router } from '@/routes/router';

export function App() {
  useTheme();
  const initializeNotes = useNoteStore((s) => s.initialize);

  useEffect(() => {
    initializeNotes();
  }, [initializeNotes]);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]">
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

