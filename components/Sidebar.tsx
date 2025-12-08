import React from 'react';
import { Shield, Clock, BookOpen, HelpCircle, Chrome, Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const navItems = [
    { id: 'check', label: 'Check Message', icon: Shield, description: 'Analyze suspicious content' },
    { id: 'history', label: 'History', icon: Clock, description: 'Past analyses' },
    { id: 'learn', label: 'Learn', icon: BookOpen, description: 'Common scam types' },
    { id: 'extension', label: 'Gmail', icon: Chrome, description: 'Browser extension' },
    { id: 'settings', label: 'Settings', icon: HelpCircle, description: 'Preferences & help' },
  ];

  return (
    <div className="bg-surface/80 dark:bg-surface-dark/80 glass w-full md:w-72 flex-shrink-0 md:h-screen sticky top-0 md:border-r border-b md:border-b-0 border-border dark:border-border-dark flex flex-col z-20">
      {/* Logo Section */}
      <div className="p-6 border-b border-border dark:border-border-dark">
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
              Elder Protection
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-1 flex-grow overflow-x-auto md:overflow-visible flex md:block gap-2">
        {navItems.map((item, index) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium whitespace-nowrap relative overflow-hidden btn-press animate-slide-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Active background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20" />
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-r-full" />
              )}
              
              <div className={`relative p-2 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md' 
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
              }`}>
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <div className="relative text-left hidden md:block">
                <span className={`block text-base ${
                  isActive 
                    ? 'text-orange-600 dark:text-orange-400 font-semibold' 
                    : 'text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
                <span className="block text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border dark:border-border-dark hidden md:block space-y-4">
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
          <div className={`w-12 h-7 rounded-full p-1 transition-all ${
            isDarkMode 
              ? 'bg-indigo-500' 
              : 'bg-amber-400'
          }`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
              isDarkMode ? 'translate-x-5' : 'translate-x-0'
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
  );
};

export default Sidebar;
