import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { UserPreferences } from '@scamshield/shared';

type FontSize = 'small' | 'medium' | 'large';

interface PreferencesContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  preferences: Partial<UserPreferences>;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = 'scamshield-preferences';

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
  fontSize: 'medium',
  language: 'en',
  notifications: {
    email: false,
    push: false,
    sms: false,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
  },
};

function getStoredPreferences(): Partial<UserPreferences> {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to parse stored preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>(getStoredPreferences);

  // Sync preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setFontSize = useCallback((size: FontSize) => {
    setPreferences((prev) => ({ ...prev, fontSize: size }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const fontSize = (preferences.fontSize as FontSize) || 'medium';

  return (
    <PreferencesContext.Provider
      value={{
        fontSize,
        setFontSize,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

// Font size class mappings for Tailwind
export const fontSizeClasses: Record<FontSize, { base: string; heading: string; label: string }> = {
  small: {
    base: 'text-sm',
    heading: 'text-lg',
    label: 'text-xs',
  },
  medium: {
    base: 'text-base',
    heading: 'text-xl',
    label: 'text-sm',
  },
  large: {
    base: 'text-lg',
    heading: 'text-2xl',
    label: 'text-base',
  },
};
