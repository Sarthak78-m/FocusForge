import { Outlet } from 'react-router-dom';
import { TopHeader } from './TopHeader';
import { LeftSidebar } from './LeftSidebar';
import { MobileDrawer } from './MobileDrawer';
import { SearchModal } from './SearchModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function AppShell() {
  useKeyboardShortcuts();
  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-bg)] overflow-hidden">
      <TopHeader />
      <div className="flex-1 flex min-h-0">
        <LeftSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-bg)]">
          <Outlet />
        </main>
      </div>
      <MobileDrawer />
      <SearchModal />
    </div>
  );
}