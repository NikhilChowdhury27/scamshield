import React from 'react';
import { Chrome, Download, CheckCircle2, Mail, Shield, Sparkles } from 'lucide-react';

const ExtensionPromoView: React.FC = () => {
  const handleDownload = () => {
    // Create extension files as downloadable content
    const manifestJson = {
      manifest_version: 3,
      name: "ScamShield for Gmail",
      version: "1.0",
      description: "Protect yourself from email scams directly in Gmail",
      permissions: ["sidePanel", "activeTab"],
      side_panel: { default_path: "sidepanel.html" },
      action: { default_title: "Open ScamShield" },
      background: { service_worker: "background.js" },
      content_scripts: [{ matches: ["https://mail.google.com/*"], js: ["content.js"] }]
    };

    const backgroundJs = `
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    `.trim();

    const contentJs = `
console.log('ScamShield content script loaded for Gmail');
    `.trim();

    const sidepanelHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe src="${window.location.origin}?mode=extension"></iframe>
</body>
</html>
    `.trim();

    const files = [
      { name: 'manifest.json', content: JSON.stringify(manifestJson, null, 2), type: 'application/json' },
      { name: 'background.js', content: backgroundJs, type: 'text/javascript' },
      { name: 'content.js', content: contentJs, type: 'text/javascript' },
      { name: 'sidepanel.html', content: sidepanelHtml, type: 'text/html' },
    ];

    files.forEach(file => {
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const steps = [
    { num: 1, text: 'Create a new folder on your computer named "ScamShield-Ext" and move the 4 downloaded files into it.' },
    { num: 2, text: 'Open Chrome and go to chrome://extensions' },
    { num: 3, text: 'Enable "Developer mode" in the top right corner.' },
    { num: 4, text: 'Click "Load unpacked" and select your ScamShield-Ext folder.' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
          <Chrome className="w-4 h-4" />
          Browser Extension
        </div>
        <h2 className="text-4xl font-display font-bold text-txt dark:text-txt-dark tracking-tight mb-3">
          Add ScamShield to <span className="gradient-text">Gmail</span>
        </h2>
        <p className="text-xl text-stone-600 dark:text-stone-300">
          Get real-time protection directly in your inbox.
        </p>
      </div>

      {/* Preview Card */}
      <div className="grid md:grid-cols-2 gap-6 animate-slide-up stagger-1">
        {/* Gmail Preview */}
        <div className="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl">
          {/* Browser Chrome */}
          <div className="bg-stone-800 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-grow bg-stone-700 rounded-full px-4 py-1.5 text-stone-400 text-sm">
              mail.google.com
            </div>
          </div>
          
          {/* Gmail Content */}
          <div className="p-6 flex gap-4">
            {/* Email Preview */}
            <div className="flex-grow space-y-4">
              <div className="bg-stone-800 rounded-2xl p-4 border border-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    !
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-white font-bold">URGENT: Verify your account</h4>
                    <p className="text-stone-400 text-sm">Service Support &lt;support@fake-bank.com&gt;</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-stone-700 rounded w-full"></div>
                  <div className="h-3 bg-stone-700 rounded w-4/5"></div>
                  <div className="h-3 bg-stone-700 rounded w-3/5"></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-stone-700 text-stone-300 rounded-lg text-sm">Reply</button>
                  <button className="px-4 py-2 bg-stone-700 text-stone-300 rounded-lg text-sm">Forward</button>
                </div>
              </div>
            </div>
            
            {/* ScamShield Sidebar */}
            <div className="w-48 bg-stone-800 rounded-2xl p-4 border border-stone-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">ScamShield</span>
              </div>
              <div className="bg-red-900/50 border border-red-700 rounded-xl p-3 text-center">
                <span className="text-red-400 text-xs font-bold">HIGH</span>
                <span className="text-red-300 text-xs block">RISK</span>
                <div className="mt-2 h-1 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Developer Preview</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">Try the extension manually</p>
            </div>
          </div>
          
          <p className="text-stone-700 dark:text-stone-300 mb-6">
            Since this is a demo app, you can install the extension manually to try the sidebar integration.
          </p>
          
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all btn-press"
          >
            <Download className="w-6 h-6" />
            Download Extension Files
          </button>
          
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-3 text-center">
            Downloads: manifest.json, background.js, content.js, sidepanel.html
          </p>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="bg-surface dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-border dark:border-border-dark shadow-sm animate-slide-up stagger-2">
        <h3 className="text-2xl font-display font-bold text-txt dark:text-txt-dark mb-6 flex items-center gap-3">
          <Mail className="w-7 h-7 text-orange-500" />
          How to Install
        </h3>
        
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div 
              key={step.num} 
              className="flex gap-4 items-start group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-lg shadow-md group-hover:scale-110 transition-transform">
                {step.num}
              </div>
              <div className="pt-2">
                <p className="text-lg text-stone-700 dark:text-stone-300">
                  {step.text}
                </p>
                {step.num === 2 && (
                  <code className="mt-2 inline-block px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-sm font-mono text-stone-600 dark:text-stone-400">
                    chrome://extensions
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Success Message */}
        <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-700 dark:text-emerald-300">
            <strong>You're all set!</strong> Open Gmail. You will see the ScamShield button appear in the toolbar when viewing emails!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPromoView;
