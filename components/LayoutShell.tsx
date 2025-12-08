import React from 'react';
import Sidebar from './Sidebar';

interface LayoutShellProps {
  currentView: string;
  onNavigate: (view: any) => void;
  children: React.ReactNode;
  fontSize: 'small' | 'medium' | 'large';
}

const LayoutShell: React.FC<LayoutShellProps> = ({ currentView, onNavigate, children, fontSize }) => {
  // Check if we are running in "Extension Mode" (Side Panel)
  const isExtensionMode = new URLSearchParams(window.location.search).get('mode') === 'extension';

  // Map font size setting to CSS classes for scaling
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return '';
      case 'medium': return 'text-lg'; // Tailwind text-lg is 1.125rem
      case 'large': return 'text-xl'; // Tailwind text-xl is 1.25rem
      default: return 'text-lg';
    }
  };

  return (
    <div className={`min-h-screen bg-canvas dark:bg-canvas-dark flex flex-col md:flex-row font-sans text-txt dark:text-txt-dark ${getFontSizeClass()}`}>
      {!isExtensionMode && (
        <Sidebar 
          currentView={currentView} 
          onNavigate={onNavigate} 
        />
      )}
      
      <main className={`flex-grow md:h-screen md:overflow-y-auto w-full ${isExtensionMode ? 'p-2' : ''}`}>
        <div className={`mx-auto ${isExtensionMode ? 'p-2' : 'p-4 md:p-8 lg:p-12 pb-24 max-w-4xl'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutShell;
