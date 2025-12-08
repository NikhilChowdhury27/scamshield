import React from 'react';
import { Shield, Clock, BookOpen, HelpCircle, Chrome, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const navItems = [
    { id: 'check', label: 'Check a Message', icon: Shield },
    { id: 'history', label: 'Scam History', icon: Clock },
    { id: 'learn', label: 'Learn About Scams', icon: BookOpen },
    { id: 'extension', label: 'Gmail Extension', icon: Chrome },
    { id: 'settings', label: 'Help & Settings', icon: HelpCircle },
  ];

  return (
    <div className="bg-surface dark:bg-surface-dark w-full md:w-64 flex-shrink-0 md:h-screen sticky top-0 md:border-r border-b md:border-b-0 border-border dark:border-border-dark flex flex-col z-20">
      <div className="p-6 border-b border-border dark:border-border-dark flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-txt dark:text-txt-dark leading-none">ScamShield</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Elder Fraud Protection</p>
        </div>
      </div>
      
      <nav className="p-4 space-y-2 flex-grow overflow-x-auto md:overflow-visible flex md:block">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-lg whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-canvas dark:hover:bg-canvas-dark'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border dark:border-border-dark hidden md:block">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-canvas dark:bg-canvas-dark hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors mb-4 group border border-border dark:border-border-dark"
        >
           <span className="flex items-center gap-3 text-txt dark:text-txt-dark font-medium">
             {isDarkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
             {isDarkMode ? 'Dark Mode' : 'Light Mode'}
           </span>
           <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
           </div>
        </button>

        <div className="text-xs text-gray-400 dark:text-gray-500">
          <p>© 2025 ScamShield</p>
          <p className="mt-1">For informational purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
