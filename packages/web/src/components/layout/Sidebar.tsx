import { NavLink } from 'react-router-dom';
import {
  Shield,
  MessageSquareWarning,
  History,
  BookOpen,
  Settings,
  Chrome,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { APP_NAME } from '@scamshield/shared';

const navigation = [
  { name: 'Check Message', href: '/check', icon: MessageSquareWarning },
  { name: 'History', href: '/history', icon: History },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Extension', href: '/extension', icon: Chrome },
];

export function Sidebar() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-txt">{APP_NAME}</h1>
          <p className="text-xs text-txt-muted">Fraud Prevention</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle & Footer */}
      <div className="px-3 py-4 border-t border-border space-y-3">
        <button
          onClick={toggleTheme}
          className="nav-item w-full"
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <p className="text-xs text-txt-muted text-center">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </div>
  );
}
