import React from 'react';
import { Type, Moon, Sun, Settings, BookOpen, AlertTriangle, Sparkles } from 'lucide-react';

interface HelpSettingsViewProps {
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  isDarkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

const HelpSettingsView: React.FC<HelpSettingsViewProps> = ({ 
  fontSize, 
  setFontSize, 
  isDarkMode, 
  setDarkMode 
}) => {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      
      {/* Settings Section */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-txt dark:text-txt-dark">Settings</h2>
        </div>
        
        <div className="space-y-6">
          {/* Theme Setting */}
          <div className="bg-surface dark:bg-surface-dark p-6 rounded-3xl border border-border dark:border-border-dark shadow-sm transition-all hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                {isDarkMode ? (
                  <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Appearance</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Choose your preferred theme</p>
              </div>
            </div>
            
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 btn-press ${
                  !isDarkMode 
                    ? 'bg-white dark:bg-stone-700 text-txt dark:text-txt-dark shadow-md' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <Sun className="w-5 h-5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 btn-press ${
                  isDarkMode 
                    ? 'bg-stone-700 text-white shadow-md' 
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <Moon className="w-5 h-5" />
                Dark
              </button>
            </div>
          </div>

          {/* Text Size Setting */}
          <div className="bg-surface dark:bg-surface-dark p-6 rounded-3xl border border-border dark:border-border-dark shadow-sm transition-all hover-lift animate-slide-up stagger-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Type className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Text Size</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Make text easier to read</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button 
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-4 rounded-2xl border-2 font-medium transition-all btn-press ${
                    fontSize === size 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 shadow-sm' 
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800'
                  }`}
                >
                  <span className={`block ${
                    size === 'small' ? 'text-sm' : size === 'medium' ? 'text-lg' : 'text-xl'
                  } ${fontSize === size ? 'font-bold' : ''}`}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="animate-slide-up stagger-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl font-display font-bold text-txt dark:text-txt-dark">How to Use</h2>
        </div>
        
        <div className="bg-surface dark:bg-surface-dark p-8 rounded-3xl border border-border dark:border-border-dark shadow-sm space-y-5">
          {[
            { num: 1, text: "If you get a strange message or call, don't reply yet." },
            { num: 2, text: 'Open ScamShield and go to "Check Message".' },
            { num: 3, text: "Type what they said, or upload a picture or recording." },
            { num: 4, text: "Read our safety advice before doing anything else." }
          ].map((step, i) => (
            <div 
              key={step.num} 
              className="flex gap-4 items-start group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-md group-hover:scale-110 transition-transform">
                {step.num}
              </div>
              <p className="text-lg text-stone-700 dark:text-stone-300 pt-2">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Reminder */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50 animate-slide-up stagger-3">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-amber-800 dark:text-amber-300 mb-2">
              Important Reminder
            </h3>
            <p className="text-lg text-amber-900 dark:text-amber-200 leading-relaxed">
              We are an AI helper, not the police or your bank. If you are ever scared or have already sent money, 
              please call your bank immediately on a trusted number.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-stone-400 dark:text-stone-500 text-sm py-4 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Gemini AI</span>
        </div>
        <p>ScamShield v1.0 • For informational purposes only</p>
      </div>
    </div>
  );
};

export default HelpSettingsView;
