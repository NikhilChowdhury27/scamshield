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
    const fetchLocation = async () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setIsLoading(false);
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
          } catch (err) {
            console.error('Error fetching location details:', err);
            setError('Could not retrieve detailed location. Using timezone only.');
            setLocation((prev) => ({ ...prev, latitude, longitude }));
          } finally {
            setIsLoading(false);
          }
        },
        (geoError) => {
          // Log specific message to avoid [object Object]
          console.error('Geolocation error:', geoError.message || geoError);
          const msg = geoError.message || 'Unknown geolocation error';
          setError(`Geolocation denied or unavailable: ${msg}. Using timezone only.`);
          setIsLoading(false);
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