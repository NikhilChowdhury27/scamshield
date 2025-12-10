import React from 'react';
import { Shield, Clock, BookOpen, HelpCircle, Moon, Sun, Sparkles, Newspaper, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { getLocationString, isLoading } = useLocation();

  const navItems = [
    { id: 'check', label: 'Check Message', icon: Shield, description: 'Analyze suspicious content' },
    { id: 'history', label: 'History', icon: Clock, description: 'Past analyses' },
    { id: 'learn', label: 'Learn', icon: BookOpen, description: 'Common scam types' },
    { id: 'news', label: 'News', icon: Newspaper, description: 'Local scam alerts' },
    { id: 'settings', label: 'Settings', icon: HelpCircle, description: 'Preferences & help' },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 dark:bg-surface-dark/80 glass border-b border-border dark:border-border-dark p-4 pt-safe-top">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl blur-lg opacity-50 animate-pulse-slow" />
            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-txt dark:text-txt-dark tracking-tight">
              ScamShield
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-surface/80 dark:bg-surface-dark/80 glass w-full md:w-72 flex-shrink-0 fixed bottom-0 md:relative md:h-full border-t md:border-t-0 md:border-r border-border dark:border-border-dark flex flex-col z-50 md:z-20 pb-safe md:pb-0">
        {/* Logo Section - Desktop */}
        <div className="hidden md:block p-6 border-b border-border dark:border-border-dark flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-lg opacity-50 animate-pulse-slow" />
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg">
                <Shield className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-txt dark:text-txt-dark tracking-tight">
                ScamShield
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium tracking-wide uppercase">
                Detect Scams
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="h-full md:h-auto md:flex-1 p-2 md:p-4 flex justify-between md:block gap-1 md:gap-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex-1 md:flex-none md:w-full flex items-center justify-center md:justify-start gap-3 px-2 py-3 md:px-4 md:py-3.5 rounded-2xl transition-all font-medium relative overflow-hidden btn-press animate-slide-in min-w-0`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Active background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20" />
                )}

                {/* Active indicator - Desktop */}
                {isActive && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-r-full" />
                )}

                {/* Active indicator - Mobile (Top dot) */}
                {isActive && (
                  <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-b-full" />
                )}

                <div className={`relative p-2 rounded-xl transition-all flex-shrink-0 ${isActive
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md'
                  : 'bg-transparent md:bg-stone-100 md:dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
                  }`}>
                  <item.icon className="w-6 h-6 md:w-5 md:h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div className="relative text-left hidden md:block flex-1 min-w-0">
                  <span className={`block text-base truncate ${isActive
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white'
                    }`}>
                    {item.label}
                  </span>
                  <span className="block text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border dark:border-border-dark hidden md:block space-y-4 flex-shrink-0">
          
          {/* Location Badge */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
             <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wide font-bold">Your Location</p>
                <p className="text-sm font-medium text-txt dark:text-txt-dark truncate">
                    {isLoading ? 'Locating...' : getLocationString()}
                </p>
             </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all group btn-press"
          >
            <span className="flex items-center gap-3 text-stone-700 dark:text-stone-300 font-medium">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-12 h-7 rounded-full p-1 transition-all ${isDarkMode
              ? 'bg-indigo-500'
              : 'bg-amber-400'
              }`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
            </div>
          </button>

          {/* Footer text */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Gemini AI</span>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              © 2025 ScamShield
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;