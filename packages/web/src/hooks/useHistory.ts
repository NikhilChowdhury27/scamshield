import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem } from '@scamshield/shared';

const STORAGE_KEY = 'scamshield-history';
const MAX_HISTORY_ITEMS = 50;

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      // Convert date strings back to Date objects
      return items.map((item: HistoryItem) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        analysis: {
          ...item.analysis,
          created_at: new Date(item.analysis.created_at),
        },
      }));
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
  return [];
}

function saveHistory(items: HistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    const loaded = loadHistory();
    setItems(loaded);
    setIsLoaded(true);
  }, []);

  // Save history when items change
  useEffect(() => {
    if (isLoaded) {
      saveHistory(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: HistoryItem) => {
    setItems((prev) => {
      // Add to beginning, limit total items
      const newItems = [item, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return newItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const getItem = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    items,
    isLoaded,
    addItem,
    removeItem,
    clearAll,
    getItem,
  };
}
