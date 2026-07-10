import { Outlet } from 'react-router-dom';
import { Footer } from '@/layouts/Footer';
import { Navbar } from '@/layouts/Navbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
