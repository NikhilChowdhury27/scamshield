import React from 'react';
import Sidebar from './Sidebar';

interface LayoutShellProps {
  currentView: string;
  onNavigate: (view: any) => void;
  children: React.ReactNode;
  fontSize: 'small' | 'medium' | 'large';
}

const LayoutShell: React.FC<LayoutShellProps> = ({ currentView, onNavigate, children, fontSize }) => {
  const isExtensionMode = new URLSearchParams(window.location.search).get('mode') === 'extension';

  return (
    <div className={`h-screen bg-canvas dark:bg-canvas-dark flex flex-col md:flex-row text-txt dark:text-txt-dark relative overflow-hidden`}>
      {/* Background decoration - subtle gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-100/20 dark:from-orange-900/10 dark:to-amber-900/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-stone-200/40 to-stone-100/20 dark:from-stone-800/10 dark:to-stone-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-tl from-amber-100/30 to-orange-50/20 dark:from-amber-900/5 dark:to-orange-900/5 rounded-full blur-3xl" />
      </div>

      {!isExtensionMode && (
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
        />
      )}

      {/* Main content area scrolls independently */}
      <main 
        id="main-scroll-container"
        className={`flex-1 w-full h-full overflow-y-auto relative z-10 ${isExtensionMode ? 'p-2' : ''}`}
      >
        <div className={`mx-auto ${isExtensionMode ? 'p-2' : 'pt-24 px-4 md:p-8 lg:p-12 pb-24 max-w-6xl'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutShell;