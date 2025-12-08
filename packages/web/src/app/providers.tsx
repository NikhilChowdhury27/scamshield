import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combines all app-level providers into a single component
 * for cleaner main.tsx organization
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AnalysisProvider>
          {children}
        </AnalysisProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
