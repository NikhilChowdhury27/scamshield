import { Settings, Sun, Moon, Monitor, Type, Bell, Eye } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences, fontSizeClasses } from '@/contexts/PreferencesContext';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const fontSizeOptions: { value: FontSize; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'medium', label: 'Medium', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize, preferences, updatePreferences } = usePreferences();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-txt">Settings</h1>
          <p className="text-txt-muted text-sm">Customize your experience</p>
        </div>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Sun className="w-5 h-5 text-txt-muted" />
            <h2 className="font-semibold text-txt">Appearance</h2>
          </div>
          <p className="text-sm text-txt-muted mb-4">
            Choose how ScamShield looks on your device
          </p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <option.icon
                  className={`w-6 h-6 ${
                    theme === option.value ? 'text-primary' : 'text-txt-muted'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === option.value ? 'text-primary' : 'text-txt'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size Settings */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-txt-muted" />
            <h2 className="font-semibold text-txt">Text Size</h2>
          </div>
          <p className="text-sm text-txt-muted mb-4">
            Adjust the text size for better readability
          </p>
          <div className="grid grid-cols-3 gap-3">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFontSize(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  fontSize === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span
                  className={`font-bold ${fontSizeClasses[option.value].heading} ${
                    fontSize === option.value ? 'text-primary' : 'text-txt'
                  }`}
                >
                  {option.preview}
                </span>
                <span
                  className={`text-sm font-medium ${
                    fontSize === option.value ? 'text-primary' : 'text-txt'
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-canvas rounded-lg">
            <p className="text-txt-muted text-sm mb-2">Preview:</p>
            <p className={`text-txt ${fontSizeClasses[fontSize].base}`}>
              This is how text will appear with your selected size.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-txt-muted" />
            <h2 className="font-semibold text-txt">Accessibility</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-txt">Reduce motion</span>
              <input
                type="checkbox"
                checked={preferences.accessibility?.reduceMotion || false}
                onChange={(e) =>
                  updatePreferences({
                    accessibility: {
                      ...preferences.accessibility!,
                      reduceMotion: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-txt">High contrast</span>
              <input
                type="checkbox"
                checked={preferences.accessibility?.highContrast || false}
                onChange={(e) =>
                  updatePreferences({
                    accessibility: {
                      ...preferences.accessibility!,
                      highContrast: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent>
          <h2 className="font-semibold text-txt mb-4">About ScamShield</h2>
          <div className="space-y-2 text-sm text-txt-muted">
            <p>Version 1.0.0</p>
            <p>
              ScamShield is an AI-powered assistant designed to help identify and prevent fraud
              by analyzing messages, images, and audio.
            </p>
            <p className="pt-2">
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
              {' · '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
