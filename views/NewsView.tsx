import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { MapPin, Globe2, ShieldAlert, AlertTriangle, Clock, Link2, Sparkles, RefreshCw, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { fetchScamNews, ScamNewsItem } from '../services/geminiService';

type NewsScope = 'all' | 'city' | 'region' | 'country' | 'global';

// Use a smaller set of fallback news since we are fetching smaller batches anyway
const FALLBACK_NEWS: ScamNewsItem[] = [
  {
    title: 'Bank “video KYC” spoofing scam targets seniors',
    summary: 'Fraudsters impersonate bank reps over video calls, asking elders to scan debit cards and OTPs for “re-KYC”.',
    date: '2025-02-18',
    source: 'Reserve Bank Consumer Desk',
    tags: ['global'],
    severity: 'high',
  },
  {
    title: 'Courier customs scam spreads via WhatsApp voice notes',
    summary: 'Victims get voice notes claiming unpaid customs; callers demand UPI payments to release “stuck” parcels.',
    date: '2025-03-02',
    source: 'Consumer Cyber Cell',
    tags: ['global'],
    severity: 'medium',
  },
  {
    title: 'Electricity bill fraud spikes',
    summary: 'Attackers send SMS with disconnection threats and fake app links; once installed, malware drains accounts.',
    date: '2025-01-27',
    source: 'Utility Safety Board',
    tags: ['global'],
    severity: 'high',
  },
  {
    title: 'Romance-investment hybrid scam reported',
    summary: 'Scammers build trust over weeks, then push fake crypto dashboards showing “guaranteed” returns.',
    date: '2025-02-04',
    source: 'Cyber Helpline',
    tags: ['global'],
    severity: 'medium',
  }
];

const severityColor = (severity: ScamNewsItem['severity']) => {
  switch (severity) {
    case 'high':
      return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'medium':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    default:
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  }
};

// Improved Skeleton Component
const SkeletonCard = () => (
  <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 flex flex-col gap-4 relative overflow-hidden h-[280px]">
    {/* Shimmer Effect */}
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-stone-200/20 dark:via-stone-700/20 to-transparent z-10" />
    
    <div className="flex items-center justify-between">
      <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
      <div className="h-5 w-20 bg-stone-200 dark:bg-stone-800 rounded-full" />
    </div>
    
    <div className="space-y-3 mt-2 flex-grow">
      <div className="h-7 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
      <div className="h-7 w-1/2 bg-stone-200 dark:bg-stone-800 rounded-md" />
    </div>
    
    <div className="space-y-2 mt-2">
      <div className="h-4 w-full bg-stone-100 dark:bg-stone-800/50 rounded-md" />
      <div className="h-4 w-full bg-stone-100 dark:bg-stone-800/50 rounded-md" />
      <div className="h-4 w-2/3 bg-stone-100 dark:bg-stone-800/50 rounded-md" />
    </div>
    
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed border-stone-100 dark:border-stone-800">
      <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
      <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded-md" />
    </div>
  </div>
);

const NewsView: React.FC = () => {
  const { location, getLocationString } = useLocation();
  const { addToast } = useToast();
  const [scope, setScope] = useState<NewsScope>('all');
  const [news, setNews] = useState<ScamNewsItem[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [refreshId, setRefreshId] = useState<number>(0);
  
  // Pagination & Scroll refs
  const loadingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(true); // Assuming there's always more unless API errors consistently

  // Load Initial News (First 6 items)
  useEffect(() => {
    // Unique cache key based on location details
    const cacheKey = `scam-news-${location.city || 'x'}-${location.region || 'x'}-${location.country || 'x'}`;
    
    const loadInitial = async () => {
      // Try to load from cache first if not refreshing
      if (refreshId === 0) {
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log("Loaded news from cache");
              setNews(parsed);
              setInitialLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Cache read error", e);
        }
      }

      setInitialLoading(true);
      setError(null);
      
      const { items, warning, error } = await fetchScamNews({
        city: location.city,
        region: location.region,
        country: location.country,
      }, [], 6); // Fetch 6 items

      setWarning(warning);
      if (error) {
          setError(error);
          addToast(`Failed to load news: ${error}`, 'error');
      }

      if (items && items.length > 0) {
        setNews(items);
        hasMoreRef.current = true;
        // Save to cache
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(items));
        } catch (e) {
          console.warn("Cache write error", e);
        }
      } else {
        setNews(FALLBACK_NEWS);
        if (!warning) {
          setWarning('Showing fallback news for now.');
        }
      }
      setInitialLoading(false);
    };

    loadInitial().catch((err) => {
      console.error('News load error', err);
      const msg = err?.message || 'Could not fetch latest news.';
      setError(msg);
      addToast(msg, 'error');
      setNews(FALLBACK_NEWS);
      setInitialLoading(false);
    });
  }, [location.city, location.region, location.country, refreshId, addToast]);

  // Load More Function (Next Batch)
  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    
    loadingRef.current = true;
    setIsLoadingMore(true);

    // Get current titles to exclude
    const existingTitles = news.map(i => i.title);

    try {
        const { items, error } = await fetchScamNews({
            city: location.city,
            region: location.region,
            country: location.country,
        }, existingTitles, 6);

        if (error) {
           console.warn("Error fetching more news:", error);
           addToast(`Error loading more news: ${error}`, 'error');
           // Don't disable hasMore immediately on error, might be transient
        }

        if (items && items.length > 0) {
             setNews(prev => {
                const updated = [...prev, ...items];
                // Update cache
                const cacheKey = `scam-news-${location.city || 'x'}-${location.region || 'x'}-${location.country || 'x'}`;
                sessionStorage.setItem(cacheKey, JSON.stringify(updated));
                return updated;
             });
        } else {
             hasMoreRef.current = false; // Stop if no items returned
        }
    } catch (e: any) {
        console.error("Failed to load more news", e);
        addToast(e.message || "Failed to load more news", 'error');
    } finally {
        loadingRef.current = false;
        setIsLoadingMore(false);
    }
  }, [news, location, addToast]);


  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !initialLoading) {
            handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleLoadMore, initialLoading]);


  const filteredNews = useMemo(() => {
    let result = [...news];

    // STRICT FILTERING LOGIC
    if (scope === 'all') {
      // Show everything, but prioritize local implicitly by API ranking
    } else {
      result = result.filter(item => {
        // If the news item has no tags, treat it as global
        if (!item.tags || item.tags.length === 0) return scope === 'global';
        
        // Check if the item's tags match the requested scope
        if (scope === 'city') return item.tags.includes('city');
        if (scope === 'region') return item.tags.includes('region') || item.tags.includes('city');
        if (scope === 'country') return item.tags.includes('country');
        if (scope === 'global') return item.tags.includes('global');
        
        return false;
      });
    }

    return result;
  }, [news, scope]);

  const pills: { id: NewsScope; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'city', label: 'City' },
    { id: 'region', label: 'State' },
    { id: 'country', label: 'Country' },
    { id: 'global', label: 'Global' },
  ];

  const handleRefresh = () => {
      // Clear cache and trigger reload
      const cacheKey = `scam-news-${location.city || 'x'}-${location.region || 'x'}-${location.country || 'x'}`;
      sessionStorage.removeItem(cacheKey);
      setNews([]);
      hasMoreRef.current = true;
      setRefreshId(prev => prev + 1);
  }

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border dark:border-border-dark bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-orange-500/10 dark:from-indigo-500/15 dark:via-fuchsia-500/15 dark:to-orange-500/15 p-6 md:p-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 text-indigo-700 dark:text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              Local Scam Radar
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-txt dark:text-txt-dark tracking-tight leading-tight">
              Stay ahead of scams near you
            </h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl">
              We surface top scam alerts, categorized by your location.
            </p>
            <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border dark:border-border-dark bg-surface/70 dark:bg-surface-dark/70 text-sm text-stone-700 dark:text-stone-200">
                <MapPin className="w-4 h-4 text-orange-500" />
                {getLocationString() || 'Locating...'}
                </div>
                <button 
                  onClick={handleRefresh}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500 active:scale-95"
                  title="Refresh News"
                >
                    <RefreshCw className={`w-4 h-4 ${initialLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pills.map(pill => (
              <button
                key={pill.id}
                onClick={() => setScope(pill.id)}
                className={`px-3 py-2 rounded-full text-sm font-semibold border transition-all ${
                  scope === pill.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                    : 'border-border dark:border-border-dark text-stone-700 dark:text-stone-200 hover:border-orange-400/60'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {initialLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        
        {(warning || error) && !initialLoading && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border dark:border-border-dark bg-surface/70 dark:bg-surface-dark/70 p-4 text-sm text-stone-600 dark:text-stone-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {warning || error}
          </div>
        )}
        
        {!initialLoading && filteredNews.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border dark:border-border-dark bg-surface/60 dark:bg-surface-dark/60 p-12 text-center text-stone-600 dark:text-stone-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
            <p className="text-lg font-medium">No alerts found for {scope === 'all' ? 'this location' : scope}</p>
            <p className="text-sm mt-1 mb-4">Try switching to "All" or "Global" to see broader news.</p>
            <button 
                onClick={handleLoadMore} 
                className="px-4 py-2 bg-stone-200 dark:bg-stone-700 rounded-full text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
            >
                Load General News
            </button>
          </div>
        )}
        
        {filteredNews.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="group rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 flex flex-col gap-3 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 relative h-full"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 group-hover:text-orange-500 transition-colors">
                <ShieldAlert className="w-4 h-4" />
                <span>Alert</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${severityColor(item.severity)}`}>
                {item.severity === 'high' ? 'High Risk' : item.severity === 'medium' ? 'Medium Risk' : 'Info'}
              </span>
            </div>

            <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {item.title}
            </h3>
            
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed line-clamp-3">
              {item.summary}
            </p>

            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-stone-500 dark:text-stone-500 border-t border-border dark:border-border-dark">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{item.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      {!initialLoading && (
        <div ref={observerTarget} className="flex justify-center py-6 h-24 items-center">
            {isLoadingMore ? (
                <div className="flex flex-col items-center gap-2 text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-medium">Loading more stories...</span>
                </div>
            ) : hasMoreRef.current && (
                <button 
                    onClick={handleLoadMore}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all font-semibold text-sm opacity-60 hover:opacity-100"
                >
                    <ChevronDown className="w-4 h-4" />
                    Load More
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default NewsView;