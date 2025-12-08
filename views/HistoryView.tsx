import React from 'react';
import { useScamHistory } from '../hooks/useScamHistory';
import { Clock, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2, Search, History } from 'lucide-react';

const HistoryView: React.FC = () => {
  const { history, clearHistory } = useScamHistory();

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/50',
          badge: 'bg-red-500 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/50',
          badge: 'bg-amber-500 text-white',
          icon: <ShieldQuestion className="w-5 h-5 text-amber-500" />,
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          badge: 'bg-emerald-500 text-white',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        };
      default:
        return {
          bg: 'bg-stone-50 dark:bg-stone-800',
          border: 'border-stone-200 dark:border-stone-700',
          badge: 'bg-stone-500 text-white',
          icon: <ShieldQuestion className="w-5 h-5 text-stone-500" />,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-slide-up">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <History className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-txt dark:text-txt-dark">Analysis History</h2>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Review your past scam checks
          </p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium btn-press"
          >
            <Trash2 className="w-5 h-5" />
            Clear History
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full mb-6">
            <Search className="w-10 h-10 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-txt dark:text-txt-dark mb-2">
            No History Yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-lg">
            Messages you check will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const styles = getRiskStyles(item.analysis.risk_label);
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border-2 ${styles.border} ${styles.bg} transition-all hover-lift animate-slide-up`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Risk Icon */}
                  <div className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm">
                    {styles.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles.badge}`}>
                        {item.analysis.risk_label} RISK
                      </span>
                      <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <p className="text-txt dark:text-txt-dark font-medium text-lg line-clamp-2">
                      {item.analysis.summary_for_elder}
                    </p>
                    
                    {item.analysis.scam_type && (
                      <p className="text-stone-500 dark:text-stone-400 text-sm mt-2">
                        Type: <span className="font-medium">{item.analysis.scam_type}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
