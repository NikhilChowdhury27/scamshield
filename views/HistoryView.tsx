import React from 'react';
import { useScamHistory } from '../hooks/useScamHistory';
import { Clock, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2, Search, History, Mail, TrendingUp, AlertTriangle, Briefcase, ShoppingBag, Headphones, HelpCircle, FileText } from 'lucide-react';

const HistoryView: React.FC = () => {
  const { history, clearHistory } = useScamHistory();

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/50',
          badge: 'bg-red-500 text-white',
          text: 'text-red-500',
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/50',
          badge: 'bg-amber-500 text-white',
          text: 'text-amber-500',
          icon: <ShieldQuestion className="w-5 h-5 text-amber-500" />,
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          badge: 'bg-emerald-500 text-white',
          text: 'text-emerald-500',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        };
      default:
        return {
          bg: 'bg-stone-50 dark:bg-stone-800',
          border: 'border-stone-200 dark:border-stone-700',
          badge: 'bg-stone-500 text-white',
          text: 'text-stone-500',
          icon: <ShieldQuestion className="w-5 h-5 text-stone-500" />,
        };
    }
  };

  const getScamTypeConfig = (type: string) => {
    const lowerType = type.toLowerCase();

    // Tech Support
    if (lowerType.includes('tech') || lowerType.includes('support')) {
      return {
        style: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800',
        icon: <Headphones className="w-3.5 h-3.5" /> // Tech support often associated with headsets
      };
    }
    // Phishing / Links
    if (lowerType.includes('phish') || lowerType.includes('link')) {
      return {
        style: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
        icon: <Mail className="w-3.5 h-3.5" />
      };
    }
    // Investment / Money
    if (lowerType.includes('invest') || lowerType.includes('crypto') || lowerType.includes('money')) {
      return {
        style: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
        icon: <TrendingUp className="w-3.5 h-3.5" />
      };
    }
    // Urgent / Threat
    if (lowerType.includes('urgent') || lowerType.includes('threat') || lowerType.includes('action')) {
      return {
        style: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
        icon: <AlertTriangle className="w-3.5 h-3.5" />
      };
    }
    // Job / Employment
    if (lowerType.includes('job') || lowerType.includes('employ') || lowerType.includes('work')) {
      return {
        style: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
        icon: <Briefcase className="w-3.5 h-3.5" />
      };
    }
    // Shopping
    if (lowerType.includes('shop') || lowerType.includes('buy') || lowerType.includes('sell')) {
      return {
        style: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800',
        icon: <ShoppingBag className="w-3.5 h-3.5" />
      };
    }
    // Default
    return {
      style: 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-600',
      icon: <FileText className="w-3.5 h-3.5" />
    };
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
                className="group relative bg-white dark:bg-[#1C1C1E] rounded-[1rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-stone-100 dark:border-stone-800 transition-all hover:scale-[1.01] animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Top Label */}
                <div className="mb-4">
                  <span className={`text-xs font-bold tracking-[0.2em] uppercase ${styles.text || 'text-stone-500'}`}>
                    {item.analysis.risk_label} RISK
                  </span>
                </div>

                <p className="text-stone-700 dark:text-stone-300 font-medium leading-relaxed text-sm mb-4">
                  {item.analysis.summary_for_elder}
                </p>

                <div className="mb-6">
                  {item.analysis.scam_type ? (
                    (() => {
                      const config = getScamTypeConfig(item.analysis.scam_type);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.style}`}>
                          {config.icon}
                          <span className="capitalize tracking-wide">{item.analysis.scam_type.replace(/_/g, ' ')}</span>
                        </span>
                      );
                    })()
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-stone-500 bg-stone-100 rounded-full text-xs font-bold">
                      Uncategorized
                    </span>
                  )}
                </div>

                {/* Grid Details */}
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 pt-4 border-t border-stone-100 dark:border-stone-800/50">
                  <div>
                    <span className="block text-[11px] font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-2">
                      DATE
                    </span>
                    <span className="text-base font-semibold text-stone-800 dark:text-stone-200">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-2">
                      TIME
                    </span>
                    <span className="text-base font-semibold text-stone-800 dark:text-stone-200">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase mb-2">
                      STATUS
                    </span>
                    <div className="flex items-center gap-2">
                      {styles.icon}
                      <span className="text-base font-semibold text-stone-800 dark:text-stone-200 capitalize">
                        {item.analysis.risk_label.toLowerCase()}
                      </span>
                    </div>
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
