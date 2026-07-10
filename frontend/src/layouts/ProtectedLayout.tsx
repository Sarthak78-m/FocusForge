import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { OfflineIndicator, ToastViewport } from '@/components/common';
import { AppShell } from '@/layouts/AppShell';
import { paths } from '@/routes/paths';
import { useAuthStore } from '@/store/auth.store';

export function ProtectedLayout() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <ToastViewport />
      <OfflineIndicator />
    </>
  );
}
