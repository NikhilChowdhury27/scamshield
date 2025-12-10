import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  region: string | null;
  country: string | null;
  timezone: string | null;
}

interface LocationContextType {
  location: LocationData;
  localTime: Date | null;
  isLoading: boolean;
  error: string | null;
  getFormattedTime: () => string;
  getFormattedDate: () => string;
  getLocationString: () => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    city: null,
    region: null,
    country: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [localTime, setLocalTime] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPLocation = async () => {
        try {
            // Fallback to IP-based geolocation if native API fails or is blocked
            const response = await fetch('https://ipwho.is/');
            const data = await response.json();
            if (data.success) {
                setLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    timezone: data.timezone.id || Intl.DateTimeFormat().resolvedOptions().timeZone,
                });
                setError(null);
            } else {
                // If IP fallback also fails, we just silently keep defaults (timezone)
                console.warn('IP Geolocation fallback failed');
            }
        } catch (err) {
            console.error('Fallback location failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLocation = async () => {
      if (!navigator.geolocation) {
        await fetchIPLocation();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setLocation({
              latitude,
              longitude,
              city: data.address?.city || data.address?.town || data.address?.village || null,
              region: data.address?.state || null,
              country: data.address?.country || null,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            setIsLoading(false);
          } catch (err) {
            console.error('Error fetching reverse geocoding:', err);
            // Fallback to coordinates only if reverse geocoding fails, but keep loading false
            setLocation((prev) => ({ ...prev, latitude, longitude }));
            setIsLoading(false);
          }
        },
        async (geoError) => {
          console.warn('Geolocation access denied or failed. Switch to IP fallback.', geoError.message);
          // If native geolocation fails (policy or user denied), use IP fallback
          await fetchIPLocation();
        }
      );
    };

    fetchLocation();

    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getFormattedTime = () =>
    localTime ? localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const getFormattedDate = () =>
    localTime ? localTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A';

  const getLocationString = () => {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region && location.region !== location.city) parts.push(location.region);
    if (location.country && location.country !== location.region) parts.push(location.country);
    return parts.join(', ') || location.timezone || 'Unknown location';
  };

  return (
    <LocationContext.Provider
      value={{ location, localTime, isLoading, error, getFormattedTime, getFormattedDate, getLocationString }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
};