import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapPin, Globe2, ShieldAlert, AlertTriangle, Clock, Link2, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { fetchScamNews, ScamNewsItem } from '../services/geminiService';

type NewsScope = 'auto' | 'city' | 'region' | 'country' | 'global';

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
  },
  {
    title: 'UPI “collect request” fraud in metros',
    summary: 'Fraudsters ask victims to “verify” refunds by accepting collect requests; money moves out instantly.',
    date: '2025-03-10',
    source: 'Payments Council Advisory',
    tags: ['global'],
    severity: 'high',
  },
  {
    title: 'Fake job offers on messaging apps',
    summary: '“Easy earnings” tasks lure users; after small payouts, larger deposits are coerced and then blocked.',
    date: '2025-01-12',
    source: 'Labor Watch',
    tags: ['global'],
    severity: 'medium',
  },
  {
    title: 'QR code parking scam in downtown areas',
    summary: 'Fraudulent stickers on meters redirect payments to attacker wallets.',
    date: '2025-02-28',
    source: 'City Safety Dept',
    tags: ['global'],
    severity: 'medium',
  },
  {
    title: 'Insurance policy lapsation calls',
    summary: 'Elders told their policy will lapse; scammers harvest PAN/Aadhaar/OTPs to open loan accounts.',
    date: '2025-01-30',
    source: 'Insurance Ombudsman',
    tags: ['global'],
    severity: 'high',
  },
  {
    title: 'Phishing emails mimic tax office',
    summary: 'Emails threaten penalties; links lead to fake portals that steal credentials.',
    date: '2025-02-22',
    source: 'Taxpayer Protection Wing',
    tags: ['global'],
    severity: 'medium',
  },
  {
    title: 'E-commerce returns refund scam',
    summary: '“Support” callers guide victims to install screen-share apps to process refunds, then siphon funds.',
    date: '2025-03-06',
    source: 'Consumer Watch',
    tags: ['global'],
    severity: 'medium',
  },
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

const isValidLink = (link?: string) =>
  typeof link === 'string' && /^https?:\/\//i.test(link.trim());

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
  const [scope, setScope] = useState<NewsScope>('auto');
  const [news, setNews] = useState<ScamNewsItem[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number>(6);
  const [scopeChanging, setScopeChanging] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshId, setRefreshId] = useState<number>(0);
  const loadingRef = useRef(false);

  // Load news with Caching
  useEffect(() => {
    // Unique cache key based on location details
    const cacheKey = `scam-news-${location.city || 'x'}-${location.region || 'x'}-${location.country || 'x'}`;
    
    const load = async () => {
      // Try to load from cache first if not refreshing
      if (refreshId === 0) {
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log("Loaded news from cache");
              setNews(parsed);
              return;
            }
          }
        } catch (e) {
          console.warn("Cache read error", e);
        }
      }

      setLoading(true);
      loadingRef.current = true;
      setError(null);
      const { items, warning, error } = await fetchScamNews({
        city: location.city,
        region: location.region,
        country: location.country,
      });

      setWarning(warning);
      if (error) setError(error);

      if (items && items.length > 0) {
        setNews(items);
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
      setLoading(false);
      loadingRef.current = false;
    };

    load().catch((err) => {
      console.error('News load error', err);
      setError(err?.message || 'Could not fetch latest news.');
      setNews(FALLBACK_NEWS);
      setLoading(false);
      loadingRef.current = false;
    });
  }, [location.city, location.region, location.country, refreshId]);

  // Reset visible count and show loader when scope/location changes
  useEffect(() => {
    setDisplayCount(6);
    setScopeChanging(true);
    // Brief delay to show loading state
    const timer = setTimeout(() => setScopeChanging(false), 300);
    return () => clearTimeout(timer);
  }, [scope, location.city, location.region, location.country, refreshId]);

  const keywords = useMemo(() => {
    const tokens: { scope: NewsScope; value: string }[] = [];
    if (location.city) tokens.push({ scope: 'city', value: location.city });
    if (location.region) tokens.push({ scope: 'region', value: location.region });
    if (location.country) tokens.push({ scope: 'country', value: location.country });
    return tokens;
  }, [location.city, location.region, location.country]);

  const sortedNews = useMemo(() => {
    return [...news].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return db - da; // descending
    });
  }, [news]);

  const filteredNews = useMemo(() => {
    const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, '');
    const available = keywords.map(k => ({ scope: k.scope, key: normalize(k.value) }));
    const orderedScopes: NewsScope[] =
      scope === 'auto'
        ? available.map(a => a.scope).concat(['country', 'global']).filter((v, i, arr) => arr.indexOf(v) === i) as NewsScope[]
        : [scope, 'country', 'global'];

    const pool: ScamNewsItem[] = [];
    // Helper to avoid dupes
    const seen = new Set<string>();

    for (const s of orderedScopes) {
      const matchKey = available.find(k => k.scope === s)?.key;
      const scoped = sortedNews.filter(item => {
        if (seen.has(item.title)) return false;
        if (!item.tags || item.tags.length === 0) return s === 'global';
        
        // If searching specifically for global
        if (s === 'global') return item.tags.some(t => t.startsWith('global'));
        
        // If searching for city/region/country
        if (!matchKey) return false;
        return item.tags.some(t => normalize(t) === `${s}:${matchKey}`);
      });
      
      scoped.forEach(i => seen.add(i.title));
      pool.push(...scoped);
    }

    // If still very few, fill from any remaining global items
    const globalExtras = sortedNews.filter(n => n.tags?.includes('global') && !seen.has(n.title));
    const combined = pool.concat(globalExtras);

    return combined;
  }, [keywords, scope, sortedNews]);

  // Infinite Scroll Logic with Looping
  const visibleItems = useMemo(() => {
      if (filteredNews.length === 0) return [];
      
      const result = [];
      for (let i = 0; i < displayCount; i++) {
          const item = filteredNews[i % filteredNews.length];
          // We add a virtual index to the key to make React treat duplicates as unique list items
          result.push({ ...item, virtualId: `${item.title}-${i}` });
      }
      return result;
  }, [filteredNews, displayCount]);

  const loadMoreItems = () => {
    setLoadingMore(true);
    // Add artificial delay for UX and to show the loader
    setTimeout(() => {
        setDisplayCount((prev) => prev + 6);
        setLoadingMore(false);
    }, 800);
  };

  // Infinite scroll listener
  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (!scrollContainer) return;

    const onScroll = () => {
      if (loadingMore || loadingRef.current || scopeChanging || filteredNews.length === 0) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Trigger when within 200px of bottom
      const threshold = scrollHeight - clientHeight - 200;

      if (scrollTop >= threshold) {
        loadMoreItems();
      }
    };
    
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [loadingMore, scopeChanging, filteredNews.length]);


  const pills: { id: NewsScope; label: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'city', label: 'City' },
    { id: 'region', label: 'State/Region' },
    { id: 'country', label: 'Country' },
    { id: 'global', label: 'Global' },
  ];

  const handleRefresh = () => {
      // Clear cache and trigger reload
      const cacheKey = `scam-news-${location.city || 'x'}-${location.region || 'x'}-${location.country || 'x'}`;
      sessionStorage.removeItem(cacheKey);
      setNews([]);
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
              We surface the top scam alerts reported this year, tailored to your city, state, or country.
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
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
        {(loading || scopeChanging) && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        
        {(warning || error) && !loading && !scopeChanging && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border dark:border-border-dark bg-surface/70 dark:bg-surface-dark/70 p-4 text-sm text-stone-600 dark:text-stone-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            {warning || error}
          </div>
        )}
        
        {!loading && !scopeChanging && visibleItems.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border dark:border-border-dark bg-surface/60 dark:bg-surface-dark/60 p-12 text-center text-stone-600 dark:text-stone-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-orange-500" />
            <p className="text-lg font-medium">No local alerts found</p>
            <p className="text-sm">Try expanding the scope to 'Country' or 'Global'.</p>
          </div>
        )}
        
        {!scopeChanging && visibleItems.map((item) => (
          <div
            key={item.virtualId}
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

            {isValidLink(item.link) && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold text-sm transition-colors group-hover:bg-orange-500/20"
              >
                Read more <Link2 className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
        
        {loadingMore && (
          <>
             <SkeletonCard />
             <SkeletonCard />
          </>
        )}
      </div>

      {/* Manual Load More fallback */}
      {!loading && !scopeChanging && !loadingMore && visibleItems.length > 0 && (
          <div className="flex justify-center pt-6 opacity-80 hover:opacity-100 transition-opacity">
              <button 
                  onClick={loadMoreItems}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all font-semibold text-sm"
              >
                  <ChevronDown className="w-4 h-4" />
                  Load More
              </button>
          </div>
      )}
    </div>
  );
};

export default NewsView;