import React, { useState } from 'react';
import LayoutShell from './components/LayoutShell';
import CheckMessageView from './views/CheckMessageView';
import HistoryView from './views/HistoryView';
import LearnView from './views/LearnView';
import NewsView from './views/NewsView';
import HelpSettingsView from './views/HelpSettingsView';
import { useTheme } from './context/ThemeContext';

type ViewType = 'check' | 'history' | 'learn' | 'news' | 'settings';
type FontSize = 'small' | 'medium' | 'large';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('currentView');
    return (savedView as ViewType) || 'check';
  });
  
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const savedSize = localStorage.getItem('scamShieldFontSize');
    return (savedSize as FontSize) || 'medium';
  });
  
  const { isDarkMode, toggleTheme } = useTheme();

  React.useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  // Apply global font scaling
  React.useEffect(() => {
    localStorage.setItem('scamShieldFontSize', fontSize);
    const root = document.documentElement;
    switch (fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium': // Default
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '20px';
        break;
    }
  }, [fontSize]);

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
      case 'news':
        return <NewsView />;
      case 'settings':
        return (
          <HelpSettingsView
            fontSize={fontSize}
            setFontSize={setFontSize}
            isDarkMode={isDarkMode}
            setDarkMode={handleSetDarkMode}
          />
        );
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