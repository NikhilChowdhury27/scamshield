import React from 'react';
import { Type, Moon, Sun } from 'lucide-react';

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
    <div className="space-y-10 animate-fade-in max-w-2xl mx-auto">
      
      {/* Settings Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Theme Setting */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              {isDarkMode ? (
                 <Moon className="w-6 h-6 text-purple-400" />
              ) : (
                 <Sun className="w-6 h-6 text-orange-500" />
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">Choose a light or dark theme.</p>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  !isDarkMode 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <Sun className="w-5 h-5" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Moon className="w-5 h-5" />
                Dark
              </button>
            </div>
          </div>

          {/* Text Size Setting */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Type className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Text Size</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">Make the text easier to read.</p>
            
            <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={() => setFontSize('small')}
                 className={`flex-1 py-4 rounded-2xl border-2 font-medium transition-all ${
                   fontSize === 'small' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                 }`}
               >
                 <span className="text-base">Small</span>
               </button>
               <button 
                 type="button"
                 onClick={() => setFontSize('medium')}
                 className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                   fontSize === 'medium' 
                     ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                     : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                 }`}
               >
                 <span className="text-xl">Medium</span>
               </button>
               <button 
                 type="button"
                 onClick={() => setFontSize('large')}
                 className={`flex-1 py-4 rounded-2xl border-2 font-extrabold transition-all ${
                   fontSize === 'large' 
                     ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400' 
                     : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                 }`}
               >
                 <span className="text-2xl">Large</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to use ScamShield</h2>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 transition-colors">
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-lg">1</div>
                <p className="text-lg text-gray-800 dark:text-gray-200">If you get a strange message or call, don't reply yet.</p>
            </div>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-lg">2</div>
                <p className="text-lg text-gray-800 dark:text-gray-200">Open ScamShield and go to "Check a Message".</p>
            </div>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-lg">3</div>
                <p className="text-lg text-gray-800 dark:text-gray-200">Type what they said, or upload a picture or recording.</p>
            </div>
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-lg">4</div>
                <p className="text-lg text-gray-800 dark:text-gray-200">Read our safety advice before doing anything else.</p>
            </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-3xl border border-yellow-200 dark:border-yellow-800/50">
         <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">Important Reminder</h3>
         <p className="text-lg text-yellow-900 dark:text-yellow-200 leading-relaxed">
            We are an AI helper, not the police or your bank. If you are ever scared or have already sent money, please call your bank immediately on a trusted number.
         </p>
      </div>
    </div>
  );
};

export default HelpSettingsView;