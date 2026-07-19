import { Outlet } from 'react-router-dom';

// Each public page (Landing, Login, Signup) manages its own layout/chrome.
export function PublicLayout() {
  return <Outlet />;
}
