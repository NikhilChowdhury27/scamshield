import React from 'react';
import { BookOpen, AlertTriangle, Sparkles } from 'lucide-react';

const HowToUseView: React.FC = () => {
  return (
    <div className="space-y-10 max-w-2xl mx-auto pb-12 animate-slide-up">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
          <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-display font-bold text-txt dark:text-txt-dark">How to Use</h2>
      </div>
      
      {/* How to Use Section */}
      <div className="bg-surface dark:bg-surface-dark p-8 rounded-3xl border border-border dark:border-border-dark shadow-sm space-y-8">
        <p className="text-lg text-stone-600 dark:text-stone-300">
          You can provide evidence using just one method, or combine all of them to give us the full picture.
        </p>

        {/* Step 1 */}
        <div className="flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-md mt-1 group-hover:scale-105 transition-transform">
              1
            </div>
            <div className="space-y-3 w-full">
              <h3 className="text-xl font-bold text-txt dark:text-txt-dark">Enter Your Info (Mix & Match)</h3>
              <p className="text-stone-600 dark:text-stone-300">Feel free to use one or all of the options below:</p>
              <ul className="space-y-3 mt-2">
                {[
                  { label: "Write or Paste", desc: "Type the details or paste the suspicious message directly into the text box." },
                  { label: "Add Photo", desc: "Upload a screenshot of the chat, email, or QR code." },
                  { label: "Upload Audio", desc: "Attach a recording of a phone call or voicemail." },
                  { label: "Record Audio", desc: "Tap the microphone to speak and describe what happened in your own words." }
                ].map((item, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-stone-600 dark:text-stone-300 text-base leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-100 dark:border-stone-700/50">
                      <span className="font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap flex-shrink-0">{item.label}:</span>
                      <span>{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4 items-start group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-md mt-1 group-hover:scale-105 transition-transform">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-txt dark:text-txt-dark">Start the Scan</h3>
              <p className="text-stone-600 dark:text-stone-300 text-base leading-relaxed">
                Once you have added the information you have, click "Analyze now". We will review everything together to detect potential risks.
              </p>
            </div>
        </div>

      </div>

      {/* Important Disclaimer */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 md:p-8 rounded-3xl border-2 border-amber-200 dark:border-amber-800/50 animate-slide-up stagger-1">
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

export default HowToUseView;