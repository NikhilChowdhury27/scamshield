import React from 'react';
import { Chrome, Download, CheckCircle, ArrowRight, Shield } from 'lucide-react';

const ExtensionPromoView: React.FC = () => {
  
  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    // 1. Manifest
    const manifestCode = `{
  "manifest_version": 3,
  "name": "ScamShield",
  "version": "1.0",
  "description": "Analyze emails for scams directly in Gmail.",
  "permissions": ["sidePanel"],
  "host_permissions": ["https://mail.google.com/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://mail.google.com/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_title": "Open ScamShield"
  }
}`;

    // 2. Background Script
    const backgroundCode = `
// Allows opening the side panel when the action icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'open_side_panel') {
    // Open the side panel for the current window
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }
});
`;

    // 3. Content Script
    // NOTE: In a real app, you would verify the deployed URL. 
    // Here we assume localhost or the current origin with ?mode=extension
    const currentOrigin = window.location.origin;
    const contentScriptCode = `
// Identify Gmail toolbar to inject button
function injectButton() {
  // Gmail selectors are messy, we look for the generic action bar in an open email
  const toolbar = document.querySelector('.G-tF'); // Common toolbar class
  const existingBtn = document.getElementById('scam-shield-btn');

  if (toolbar && !existingBtn) {
    const btn = document.createElement('div');
    btn.id = 'scam-shield-btn';
    btn.innerHTML = '🛡️ Analyze Scam';
    btn.style.cssText = 'background: #2563eb; color: white; padding: 0 16px; height: 36px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; margin-left: 10px; font-family: Google Sans, Roboto, sans-serif; font-size: 14px;';
    
    btn.onclick = () => {
      // Send message to background to open side panel
      // For the side panel content, chrome extensions use the manifest "side_panel" key
      // But we need to configure it to point to our web app URL.
      // Since manifest side_panel usually points to a local HTML, 
      // we will use an iframe in that local HTML or just redirect.
      // For this demo, we assume the user configured the manifest to point to:
      // ${currentOrigin}?mode=extension
      alert("Please ensure the side_panel in manifest.json points to ${currentOrigin}?mode=extension");
    };
    
    toolbar.appendChild(btn);
  }
}

// Observe DOM for changes (Gmail is a SPA)
const observer = new MutationObserver(injectButton);
observer.observe(document.body, { childList: true, subtree: true });
`;

    // 4. Side Panel HTML (The glue)
    const sidePanelHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>ScamShield</title>
    <style>body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }</style>
  </head>
  <body>
    <iframe src="${currentOrigin}?mode=extension" style="width:100%; height:100%; border:none;"></iframe>
  </body>
</html>`;

    // Download them
    handleDownload('manifest.json', manifestCode.replace('"default_path": "sidepanel.html"', '"default_path": "sidepanel.html"').replace('"side_panel": {}', `"side_panel": { "default_path": "sidepanel.html" }`));
    setTimeout(() => handleDownload('background.js', backgroundCode), 200);
    setTimeout(() => handleDownload('content.js', contentScriptCode), 400);
    setTimeout(() => handleDownload('sidepanel.html', sidePanelHtml), 600);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add ScamShield to Gmail</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">Get real-time protection directly in your inbox.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col transition-colors">
           <div className="bg-gray-100 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-md text-xs text-gray-500 dark:text-gray-400 flex-grow text-center">
                 mail.google.com
              </div>
           </div>
           <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex-grow relative min-h-[300px]">
              {/* Mock Gmail Interface */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">URGENT: Verify your account</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Service Support &lt;support@fake-bank.com&gt;</p>
                      </div>
                      <div className="text-sm text-gray-400">10:42 AM</div>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-4"></div>
                  <div className="space-y-2">
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                  <div className="pt-6 flex gap-3">
                      <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-bold text-sm border border-gray-300 dark:border-gray-600">Reply</div>
                      <div className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-bold text-sm border border-gray-300 dark:border-gray-600">Forward</div>
                      
                      {/* The Feature Button */}
                      <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/50 flex items-center gap-2 animate-pulse">
                         <Shield className="w-4 h-4" />
                         Analyze Scam
                      </div>
                  </div>
              </div>

              {/* Sidebar Mockup */}
              <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl p-4 transform translate-x-2">
                 <div className="flex items-center gap-2 mb-4">
                     <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                     <span className="font-bold text-gray-900 dark:text-white">ScamShield</span>
                 </div>
                 <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-900/50 mb-2">
                     <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm mb-1">
                         <Shield className="w-4 h-4" /> HIGH RISK
                     </div>
                     <div className="h-2 bg-red-200 dark:bg-red-800 rounded w-3/4 mb-1"></div>
                     <div className="h-2 bg-red-200 dark:bg-red-800 rounded w-1/2"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/50">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Developer Preview</h3>
                <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">
                    Since this is a demo app, you can install the extension manually to try the sidebar integration.
                </p>
                <button 
                    onClick={downloadAll}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-transform transform hover:scale-105"
                >
                    <Download className="w-5 h-5" />
                    Download Extension Files
                </button>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 italic">
                    Downloads manifest.json, background.js, content.js, and sidepanel.html
                </p>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">How to Install</h4>
                
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">1</div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                        Create a new folder on your computer named <strong>ScamShield-Ext</strong> and move the 4 downloaded files into it.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">2</div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                        Open Chrome and go to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">chrome://extensions</code>
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">3</div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                        Enable <strong>Developer mode</strong> in the top right corner.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">4</div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                        Click <strong>Load unpacked</strong> and select your <strong>ScamShield-Ext</strong> folder.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
                        Open Gmail. You will see the ScamShield button appear in the toolbar when viewing emails!
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPromoView;