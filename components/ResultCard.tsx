import React, { useState } from 'react';
import { ScamAnalysis, SearchVerificationResult } from '../types';
import { generateSpeech } from '../services/geminiService';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  AlertTriangle, 
  Phone, 
  Share2, 
  Check,
  Copy,
  Clock,
  Mic,
  Globe,
  Volume2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface ResultCardProps {
  analysis: ScamAnalysis;
  searchResult?: SearchVerificationResult;
  timestamp?: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ analysis, searchResult, timestamp }) => {
  const [copiedFamilyText, setCopiedFamilyText] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-900/50',
          text: 'text-red-900 dark:text-red-200',
          badgeBg: 'bg-red-600',
          icon: <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />,
          title: 'High Scam Risk'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-900/50',
          text: 'text-orange-900 dark:text-orange-200',
          badgeBg: 'bg-orange-500',
          icon: <ShieldQuestion className="w-12 h-12 text-orange-500" />,
          title: 'Suspicious'
        };
      case 'LOW':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-900/50',
          text: 'text-green-900 dark:text-green-200',
          badgeBg: 'bg-green-600',
          icon: <ShieldCheck className="w-12 h-12 text-green-600 dark:text-green-500" />,
          title: 'Likely Safe'
        };
      default:
        return {
          bg: 'bg-canvas dark:bg-gray-800',
          border: 'border-border dark:border-gray-700',
          text: 'text-txt dark:text-gray-100',
          badgeBg: 'bg-gray-600',
          icon: <ShieldQuestion className="w-12 h-12 text-gray-600 dark:text-gray-400" />,
          title: 'Unknown Risk'
        };
    }
  };

  const styles = getRiskStyles(analysis.risk_label);

  const handleCopyFamilyText = () => {
    navigator.clipboard.writeText(analysis.family_alert_text);
    setCopiedFamilyText(true);
    setTimeout(() => setCopiedFamilyText(false), 2000);
  };

  const handleReadAloud = async () => {
    if (isPlayingAudio) return;
    
    setIsGeneratingAudio(true);
    try {
        const base64Audio = await generateSpeech(analysis.summary_for_elder);
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        audio.play();
    } catch (e) {
        console.error("Failed to play audio", e);
        alert("Could not play audio right now.");
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className={`rounded-3xl border-2 ${styles.border} ${styles.bg} p-6 md:p-8 shadow-sm transition-colors`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-5">
          <div className="flex-shrink-0 bg-surface dark:bg-gray-800 p-4 rounded-full shadow-sm">
            {styles.icon}
          </div>
          <div className="flex-grow">
            <h2 className={`text-3xl font-bold ${styles.text}`}>
              {styles.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-white text-base font-bold tracking-wide ${styles.badgeBg}`}>
                {analysis.risk_label} RISK
              </span>
              {timestamp && (
                <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Checked: {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 dark:bg-black/20 p-5 rounded-xl border border-black/5 dark:border-white/5 relative">
            <p className="text-xl leading-relaxed text-txt dark:text-gray-100 font-medium pr-12">
                {analysis.summary_for_elder}
            </p>
            <button 
                onClick={handleReadAloud}
                disabled={isGeneratingAudio || isPlayingAudio}
                className="absolute top-4 right-4 p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                title="Read aloud"
            >
                {isGeneratingAudio ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-pulse text-blue-500' : ''}`} />
                )}
            </button>
        </div>
      </div>

      {searchResult && (
          <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 md:p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-txt dark:text-white">Web Check</h3>
             </div>
             <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                 <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">
                     {searchResult.text}
                 </p>
                 {searchResult.sources.length > 0 && (
                     <div className="space-y-2">
                         <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Sources Found:</p>
                         {searchResult.sources.map((source, i) => (
                             <a 
                                key={i} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline truncate"
                             >
                                 <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                 {source.title || source.uri}
                             </a>
                         ))}
                     </div>
                 )}
             </div>
          </div>
      )}

      {analysis.transcription && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <Mic className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-txt dark:text-white">Conversation Transcript</h3>
          </div>
          <div className="bg-canvas dark:bg-gray-900/50 p-5 rounded-xl border border-border dark:border-border-dark font-mono text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
             {analysis.transcription}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 italic px-2">
            * This text was written down automatically by our AI. It might not be perfect.
          </p>
        </div>
      )}

      {(analysis.risk_label === 'HIGH' || analysis.risk_label === 'MEDIUM') && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-txt dark:text-white">Red Flags Found</h3>
          </div>
          <div className="grid gap-4">
            {analysis.red_flags.map((flag, index) => (
              <div key={index} className="flex gap-4 p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 font-bold text-lg">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-txt dark:text-gray-100 text-xl mb-1">{flag.title}</h4>
                  <p className="text-gray-800 dark:text-gray-300 leading-relaxed">{flag.description_for_elder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
          <h3 className="text-2xl font-bold text-txt dark:text-white">What You Should Do Now</h3>
        </div>
        <ul className="space-y-4">
          {analysis.safe_actions_for_elder.map((action, index) => (
            <li key={index} className="flex gap-4 items-start p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
              <div className="bg-green-200 dark:bg-green-800 rounded-full p-1 mt-0.5">
                 <Check className="w-5 h-5 text-green-800 dark:text-green-200" />
              </div>
              <span className="text-xl text-gray-800 dark:text-gray-200 font-medium">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {analysis.call_script_if_scammer_calls_back && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-200 dark:border-blue-900/50 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">If They Call Again</h3>
          </div>
          <p className="text-blue-800 dark:text-blue-200 mb-3 text-lg">Read this exact sentence to them:</p>
          <div className="bg-surface dark:bg-gray-900 p-6 rounded-2xl border-l-8 border-blue-500 shadow-sm">
            <p className="text-2xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed">
              "{analysis.call_script_if_scammer_calls_back}"
            </p>
          </div>
        </div>
      )}

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-200 dark:border-purple-900/50 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Share2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">Share With Your Family</h3>
        </div>
        <p className="text-gray-800 dark:text-gray-200 mb-4 text-lg">Send this to your family group chat so they can help you:</p>
        <div className="bg-surface dark:bg-gray-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 relative">
          <p className="text-gray-800 dark:text-gray-300 text-lg pr-12 leading-relaxed">{analysis.family_alert_text}</p>
          <button 
            onClick={handleCopyFamilyText}
            className="absolute top-4 right-4 p-3 bg-canvas dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full transition-colors border border-border dark:border-gray-700"
            title="Copy to clipboard"
          >
            {copiedFamilyText ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
        {copiedFamilyText && (
          <p className="text-green-600 dark:text-green-400 font-bold mt-2 ml-2 flex items-center gap-2">
            <Check className="w-5 h-5" /> Copied to clipboard!
          </p>
        )}
      </div>

      <div className="bg-canvas dark:bg-gray-800 rounded-2xl p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          {analysis.disclaimer_for_elder}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
