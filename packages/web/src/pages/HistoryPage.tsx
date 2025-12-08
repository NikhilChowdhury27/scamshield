import { useState } from 'react';
import { History, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, Button, RiskBadge, Alert } from '@/components/ui';
import { ResultCard } from '@/components/features';
import { useHistory } from '@/hooks/useHistory';
import { formatDateTime, snakeToTitle } from '@scamshield/shared';
import type { RiskLevel, HistoryItem } from '@scamshield/shared';

type FilterOption = 'ALL' | RiskLevel;

export function HistoryPage() {
  const { items, clearAll, removeItem } = useHistory();
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.analysis.risk_label === filter;
  });

  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-txt">Analysis History</h1>
            <p className="text-txt-muted text-sm">{items.length} items</p>
          </div>
        </div>

        {items.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Clear Confirmation */}
      {showClearConfirm && (
        <Alert variant="warning" title="Clear all history?">
          <p className="mb-3">This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              Yes, Clear All
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
          </div>
        </Alert>
      )}

      {/* Filters */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-txt-muted" />
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as FilterOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === option
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-txt-muted hover:text-txt'
              }`}
            >
              {option === 'ALL' ? 'All' : option}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 text-txt-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-txt mb-2">No History Yet</h3>
            <p className="text-txt-muted">
              Your analyzed messages will appear here for reference.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Results for Filter */}
      {items.length > 0 && filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-txt-muted">No {filter.toLowerCase()} risk items found.</p>
          </CardContent>
        </Card>
      )}

      {/* History Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent>
              {/* Summary Row */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <RiskBadge level={item.analysis.risk_label} />
                  <div>
                    <p className="font-medium text-txt">
                      {snakeToTitle(item.analysis.scam_type)}
                    </p>
                    <p className="text-sm text-txt-muted">
                      {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                </div>
                {expandedId === item.id ? (
                  <ChevronUp className="w-5 h-5 text-txt-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-txt-muted" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <ResultCard analysis={item.analysis} searchVerification={item.searchResult} />
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      className="text-danger"
                    >
                      Remove from History
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
