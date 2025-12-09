import { useState, useEffect } from 'react';
import { HistoryItem, ScamAnalysis } from '../types';

export const useScamHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('scamShieldHistory');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const addToHistory = (analysis: ScamAnalysis) => {
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      timestamp: Date.now(),
      analysis,
    };
    const updated = [newItem, ...history];
    setHistory(updated);
    try {
      localStorage.setItem('scamShieldHistory', JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('scamShieldHistory');
  };

  return { history, addToHistory, clearHistory };
};
