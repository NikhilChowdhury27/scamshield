import React, { useState } from 'react';
import LayoutShell from './components/LayoutShell';
import CheckMessageView from './views/CheckMessageView';
import HistoryView from './views/HistoryView';
import LearnView from './views/LearnView';
import HelpSettingsView from './views/HelpSettingsView';
import ExtensionPromoView from './views/ExtensionPromoView';
import { useTheme } from './context/ThemeContext';

type ViewType = 'check' | 'history' | 'learn' | 'settings' | 'extension';
type FontSize = 'small' | 'medium' | 'large';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('check');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSetDarkMode = (enabled: boolean) => {
    if (enabled !== isDarkMode) {
      toggleTheme();
    }
  };
  
  const renderView = () => {
    switch (currentView) {
      case 'check':
        return <CheckMessageView />;
      case 'history':
        return <HistoryView />;
      case 'learn':
        return <LearnView />;
      case 'settings':
        return (
          <HelpSettingsView 
            fontSize={fontSize} 
            setFontSize={setFontSize} 
            isDarkMode={isDarkMode}
            setDarkMode={handleSetDarkMode}
          />
        );
      case 'extension':
        return <ExtensionPromoView />;
      default:
        return <CheckMessageView />;
    }
  };

  return (
    <LayoutShell 
      currentView={currentView} 
      onNavigate={(view) => setCurrentView(view as ViewType)}
      fontSize={fontSize}
    >
      {renderView()}
    </LayoutShell>
  );
};

export default App;

