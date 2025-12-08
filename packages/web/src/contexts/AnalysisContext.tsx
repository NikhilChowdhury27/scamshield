import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { ScamAnalysis, HistoryItem, SearchVerification, ChatMessage } from '@scamshield/shared';
import { generateId } from '@scamshield/shared';

interface AnalysisState {
  isAnalyzing: boolean;
  currentAnalysis: ScamAnalysis | null;
  searchVerification: SearchVerification | null;
  chatMessages: ChatMessage[];
  error: string | null;
}

interface AnalysisContextValue extends AnalysisState {
  startAnalysis: () => void;
  setAnalysisResult: (analysis: ScamAnalysis) => void;
  setSearchVerification: (result: SearchVerification) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearCurrentAnalysis: () => void;
  setError: (error: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

interface AnalysisProviderProps {
  children: ReactNode;
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    currentAnalysis: null,
    searchVerification: null,
    chatMessages: [],
    error: null,
  });

  const startAnalysis = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      currentAnalysis: null,
      searchVerification: null,
      chatMessages: [],
      error: null,
    }));
  }, []);

  const setAnalysisResult = useCallback((analysis: ScamAnalysis) => {
    setState((prev) => ({
      ...prev,
      isAnalyzing: false,
      currentAnalysis: analysis,
      error: null,
    }));
  }, []);

  const setSearchVerification = useCallback((result: SearchVerification) => {
    setState((prev) => ({
      ...prev,
      searchVerification: result,
    }));
  }, []);

  const addChatMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMessage],
    }));
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      currentAnalysis: null,
      searchVerification: null,
      chatMessages: [],
      error: null,
    });
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      isAnalyzing: false,
      error,
    }));
  }, []);

  return (
    <AnalysisContext.Provider
      value={{
        ...state,
        startAnalysis,
        setAnalysisResult,
        setSearchVerification,
        addChatMessage,
        clearCurrentAnalysis,
        setError,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
