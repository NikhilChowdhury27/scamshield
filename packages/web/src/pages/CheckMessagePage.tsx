import { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { InputSection, ResultCard, FollowUpChat } from '@/components/features';
import { Card, CardContent, Spinner } from '@/components/ui';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useHistory } from '@/hooks/useHistory';
import { analyzeContent, verifyWithSearch, askFollowUp, speakText } from '@/services/geminiService';
import type { FileType, ChatMessage } from '@scamshield/shared';
import { generateId } from '@scamshield/shared';

interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  type: FileType;
}

export function CheckMessagePage() {
  const {
    isAnalyzing,
    currentAnalysis,
    searchVerification,
    chatMessages,
    startAnalysis,
    setAnalysisResult,
    setSearchVerification,
    addChatMessage,
    setError,
    error,
  } = useAnalysis();

  const { addItem } = useHistory();
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSubmit = useCallback(
    async (text: string, files: FileItem[]) => {
      startAnalysis();

      try {
        // Perform analysis
        const analysis = await analyzeContent(
          text,
          files.map((f) => f.file)
        );

        // Add ID and timestamp
        const fullAnalysis = {
          ...analysis,
          id: generateId(),
          created_at: new Date(),
        };

        setAnalysisResult(fullAnalysis);

        // Save to history
        addItem({
          id: generateId(),
          timestamp: new Date(),
          analysis: fullAnalysis,
          input: {
            text: text || undefined,
            fileTypes: files.map((f) => f.type),
          },
        });

        // Perform web verification for medium/high risk
        if (analysis.risk_score >= 0.4) {
          try {
            const searchResult = await verifyWithSearch(
              `${analysis.scam_type} scam ${text.slice(0, 200)}`
            );
            setSearchVerification({
              query: text.slice(0, 200),
              result: searchResult.text,
              sources: searchResult.sources,
              verified_at: new Date(),
            });
          } catch (searchError) {
            console.error('Search verification failed:', searchError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      }
    },
    [startAnalysis, setAnalysisResult, setSearchVerification, setError, addItem]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!currentAnalysis) return;

      // Add user message
      addChatMessage({ role: 'user', content: message });
      setIsChatLoading(true);

      try {
        const response = await askFollowUp(currentAnalysis, message);
        addChatMessage({ role: 'assistant', content: response });
      } catch (err) {
        addChatMessage({
          role: 'assistant',
          content: 'Sorry, I had trouble processing your question. Please try again.',
        });
      } finally {
        setIsChatLoading(false);
      }
    },
    [currentAnalysis, addChatMessage]
  );

  const handleSpeak = useCallback(async (text: string) => {
    try {
      await speakText(text);
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    }
  }, []);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-txt">Check a Message</h1>
        <p className="text-txt-muted mt-2">
          Paste a suspicious message, upload a screenshot, or record a phone call
        </p>
      </div>

      {/* Input Section */}
      {!currentAnalysis && !isAnalyzing && (
        <Card>
          <CardContent>
            <InputSection onSubmit={handleSubmit} isLoading={isAnalyzing} />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-txt-muted mt-4">Analyzing for potential scams...</p>
              <p className="text-sm text-txt-muted mt-1">This may take a few seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent>
            <p className="text-danger text-center">{error}</p>
            <button
              onClick={() => setError(null)}
              className="btn-secondary mt-4 mx-auto block"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentAnalysis && (
        <>
          <ResultCard
            analysis={currentAnalysis}
            searchVerification={searchVerification}
            onSpeak={handleSpeak}
          />

          <FollowUpChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
          />

          <div className="text-center">
            <button
              onClick={() => {
                setAnalysisResult(null as any);
                setSearchVerification(null as any);
              }}
              className="text-primary hover:underline"
            >
              Check Another Message
            </button>
          </div>
        </>
      )}
    </div>
  );
}
