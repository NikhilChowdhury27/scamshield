import { NavLink } from 'react-router-dom';
import {
  MessageSquareWarning,
  History,
  BookOpen,
  Settings,
  Chrome,
} from 'lucide-react';

const navigation = [
  { name: 'Check', href: '/check', icon: MessageSquareWarning },
  { name: 'History', href: '/history', icon: History },
  { name: 'Learn', href: '/learn', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Extension', href: '/extension', icon: Chrome },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-inset">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-txt-muted hover:text-txt'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
