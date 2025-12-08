import React, { useState } from 'react';
import { useScamHistory } from '../hooks/useScamHistory';
import ResultCard from '../components/ResultCard';
import { ShieldAlert, ShieldCheck, ShieldQuestion, Trash2, ChevronRight, Search } from 'lucide-react';
import { HistoryItem } from '../types';

const HistoryView: React.FC = () => {
  const { history, clearHistory } = useScamHistory();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.analysis.risk_label === filter;
  });

  const getRiskIcon = (label: string) => {
    switch (label) {
      case 'HIGH': return <ShieldAlert className="w-6 h-6 text-red-500" />;
      case 'MEDIUM': return <ShieldQuestion className="w-6 h-6 text-orange-500" />;
      case 'LOW': return <ShieldCheck className="w-6 h-6 text-green-500" />;
      default: return <ShieldQuestion className="w-6 h-6 text-gray-400" />;
    }
  };

  if (history.length === 0) {
      return (
          <div className="text-center py-20">
              <div className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No History Yet</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Messages you check will appear here.</p>
          </div>
      )
  }

  // Detail View (Right column behavior on mobile handled by simply showing this if selected)
  if (selectedItem) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setSelectedItem(null)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 font-medium text-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors inline-block"
        >
          ← Back to List
        </button>
        <ResultCard analysis={selectedItem.analysis} timestamp={selectedItem.timestamp} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Scam History</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">Your recently checked messages.</p>
        </div>
        <button 
            onClick={() => { if(window.confirm('Clear all history?')) clearHistory() }}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
        >
            <Trash2 className="w-5 h-5" />
            Clear History
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${
                    filter === f 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
                {f === 'ALL' ? 'All Messages' : `${f} Risk`}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredHistory.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left flex items-center gap-4 group"
          >
            <div className={`p-3 rounded-full flex-shrink-0 ${
                item.analysis.risk_label === 'HIGH' ? 'bg-red-50 dark:bg-red-900/30' : 
                item.analysis.risk_label === 'MEDIUM' ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-green-50 dark:bg-green-900/30'
            }`}>
                {getRiskIcon(item.analysis.risk_label)}
            </div>
            
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                         item.analysis.risk_label === 'HIGH' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' : 
                         item.analysis.risk_label === 'MEDIUM' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200' : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                    }`}>
                        {item.analysis.risk_label} RISK
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg truncate">
                    {item.analysis.scam_type.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-base truncate">
                    {item.analysis.summary_for_elder}
                </p>
            </div>
            
            <ChevronRight className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-blue-500" />
          </button>
        ))}
        
        {filteredHistory.length === 0 && (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">No messages found for this filter.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;