import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { usePreferences, fontSizeClasses } from '@/contexts/PreferencesContext';

export function Layout() {
  const { fontSize } = usePreferences();
  const fontClasses = fontSizeClasses[fontSize];

  return (
    <div className={`flex h-full ${fontClasses.base}`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
