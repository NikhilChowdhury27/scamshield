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
    <div className="space-y-10 max-w-2xl mx-auto pb-12">
      
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
        
        <div className="bg-surface dark:bg-surface-dark p-8 rounded-3xl border border-border dark:border-border-dark shadow-sm space-y-8">
          {[
            {
              title: "Paste Text to Scan",
              steps: [
                "Copy any suspicious email, SMS, or message",
                "Select \"Paste Text\" on the home screen",
                "Paste the content into the text field",
                "Click \"Analyze\" to get instant scam detection results"
              ]
            },
            {
              title: "Upload Screenshot to Scan",
              steps: [
                "Take a screenshot of the suspicious email or message",
                "Select \"Upload Screenshot\" on the home screen",
                "Choose the image from your device",
                "ScamShield will analyze and flag potential scam indicators"
              ]
            },
            {
              title: "Monitor a Live Phone Call",
              steps: [
                "Open ScamShield and select \"Monitor Phone Call\"",
                "Answer your incoming call",
                "Turn on speaker mode",
                "ScamShield will listen and detect scam patterns instantly"
              ]
            },
            {
              title: "Upload Phone Recording to Scan",
              steps: [
                "Record your phone conversation (if legally permitted)",
                "Select \"Upload Recording\" on the home screen",
                "Choose the audio file from your device",
                "ScamShield will transcribe and analyze for fraud patterns"
              ]
            }
          ].map((section, i) => (
            <div 
              key={i} 
              className="flex gap-4 items-start group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-md mt-1 group-hover:scale-105 transition-transform">
                {i + 1}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-txt dark:text-txt-dark">{section.title}</h3>
                <ul className="space-y-2">
                  {section.steps.map((step, sIdx) => (
                    <li key={sIdx} className="text-stone-600 dark:text-stone-300 flex gap-2 text-base leading-relaxed">
                       <span className="opacity-50 mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0" /> 
                       {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 md:p-8 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50 animate-slide-up stagger-3">
        <div className="flex items-start gap-5">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-grow">
            <h3 className="text-2xl font-display font-bold text-amber-800 dark:text-amber-300 mb-4">
              Important Disclaimer
            </h3>
            <div className="space-y-4 text-lg text-amber-900 dark:text-amber-200 leading-relaxed">
              <p>
                ScamShield is an AI-powered assistance tool designed to help identify potential scams. 
                We are not affiliated with law enforcement, financial institutions, or government agencies.
              </p>
              
              <div className="bg-amber-100/50 dark:bg-amber-900/30 p-4 rounded-xl">
                <p className="font-bold mb-2">If you have:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-amber-600">
                  <li>Already sent money or shared personal information</li>
                  <li>Been threatened or coerced</li>
                  <li>Suspect you are a victim of fraud</li>
                </ul>
              </div>

              <p className="font-bold text-amber-800 dark:text-amber-100">
                Take immediate action: Contact your bank using their official number and report the incident to local authorities. 
                This tool should supplement, not replace, professional guidance and official reporting procedures.
              </p>
            </div>
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