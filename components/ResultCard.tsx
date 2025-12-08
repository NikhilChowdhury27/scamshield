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
  ExternalLink,
  Sparkles
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
          gradient: 'from-red-500 to-rose-600',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800/50',
          text: 'text-red-900 dark:text-red-100',
          badgeBg: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: <ShieldAlert className="w-10 h-10 text-white" />,
          iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
          title: 'High Scam Risk',
          description: 'This appears to be a scam. Do not respond or send money.'
        };
      case 'MEDIUM':
        return {
          gradient: 'from-amber-500 to-orange-600',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/50',
          text: 'text-amber-900 dark:text-amber-100',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          icon: <ShieldQuestion className="w-10 h-10 text-white" />,
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          title: 'Suspicious',
          description: 'This message has some warning signs. Proceed with caution.'
        };
      case 'LOW':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          text: 'text-emerald-900 dark:text-emerald-100',
          badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          icon: <ShieldCheck className="w-10 h-10 text-white" />,
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          title: 'Likely Safe',
          description: 'This message appears to be legitimate.'
        };
      default:
        return {
          gradient: 'from-stone-500 to-stone-600',
          bg: 'bg-stone-50 dark:bg-stone-800',
          border: 'border-stone-200 dark:border-stone-700',
          text: 'text-stone-900 dark:text-stone-100',
          badgeBg: 'bg-gradient-to-r from-stone-500 to-stone-600',
          icon: <ShieldQuestion className="w-10 h-10 text-white" />,
          iconBg: 'bg-gradient-to-br from-stone-500 to-stone-600',
          title: 'Unknown Risk',
          description: 'Unable to determine risk level.'
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
    <div className="w-full space-y-6">
      {/* Main Result Card */}
      <div className={`rounded-3xl border-2 ${styles.border} ${styles.bg} overflow-hidden shadow-lg animate-scale-in`}>
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${styles.gradient} p-6`}>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              {styles.icon}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-display font-bold">{styles.title}</h2>
              <p className="text-white/80 mt-1">{styles.description}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-bold tracking-wide ${styles.badgeBg} shadow-md`}>
              {analysis.risk_label} RISK
            </span>
            {timestamp && (
              <span className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm font-medium bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                {new Date(timestamp).toLocaleDateString()} {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </div>
          
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 relative group">
            <p className="text-xl leading-relaxed text-txt dark:text-txt-dark pr-14">
              {analysis.summary_for_elder}
            </p>
            <button 
              onClick={handleReadAloud}
              disabled={isGeneratingAudio || isPlayingAudio}
              className="absolute top-4 right-4 p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all group-hover:scale-105"
              title="Read aloud"
            >
              {isGeneratingAudio ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-pulse text-orange-500' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Web Check Results */}
      {searchResult && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 shadow-sm animate-slide-up stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
              <Globe className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Web Verification</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">Cross-referenced with online sources</p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-stone-800 dark:text-stone-200 text-lg leading-relaxed mb-4">
              {searchResult.text}
            </p>
            {searchResult.sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Sources:</p>
                {searchResult.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{source.title || source.uri}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transcription */}
      {analysis.transcription && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 shadow-sm animate-slide-up stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
              <Mic className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Conversation Transcript</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">AI-generated transcription</p>
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 font-mono text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {analysis.transcription}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 italic">
            * Transcription may not be 100% accurate
          </p>
        </div>
      )}

      {/* Red Flags */}
      {(analysis.risk_label === 'HIGH' || analysis.risk_label === 'MEDIUM') && analysis.red_flags.length > 0 && (
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 shadow-sm animate-slide-up stagger-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
              <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">Red Flags Found</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm">Warning signs we detected</p>
            </div>
          </div>
          <div className="space-y-4">
            {analysis.red_flags.map((flag, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-lg shadow-md">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-txt dark:text-txt-dark text-lg mb-1">{flag.title}</h4>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{flag.description_for_elder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Actions */}
      <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark p-6 shadow-sm animate-slide-up stagger-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-txt dark:text-txt-dark">What You Should Do</h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Recommended actions</p>
          </div>
        </div>
        <ul className="space-y-3">
          {analysis.safe_actions_for_elder.map((action, index) => (
            <li key={index} className="flex gap-4 items-start p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="p-1.5 bg-emerald-500 rounded-lg mt-0.5">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg text-stone-800 dark:text-stone-200">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Call Script */}
      {analysis.call_script_if_scammer_calls_back && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border-2 border-blue-200 dark:border-blue-800/50 p-6 shadow-sm animate-slide-up stagger-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl">
              <Phone className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-blue-900 dark:text-blue-100">If They Call Again</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Read this exact sentence to them</p>
            </div>
          </div>
          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm">
            <p className="text-xl font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed">
              "{analysis.call_script_if_scammer_calls_back}"
            </p>
          </div>
        </div>
      )}

      {/* Share with Family */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border-2 border-purple-200 dark:border-purple-800/50 p-6 shadow-sm animate-slide-up stagger-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-2xl">
            <Share2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-purple-900 dark:text-purple-100">Share With Family</h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">Send this to your family group chat</p>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 relative group">
          <p className="text-stone-800 dark:text-stone-300 text-lg pr-14 leading-relaxed">{analysis.family_alert_text}</p>
          <button 
            onClick={handleCopyFamilyText}
            className="absolute top-4 right-4 p-3 bg-stone-100 dark:bg-stone-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-xl transition-all group-hover:scale-105"
            title="Copy to clipboard"
          >
            {copiedFamilyText ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copiedFamilyText && (
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-3 flex items-center gap-2 animate-scale-in">
            <Check className="w-5 h-5" /> Copied to clipboard!
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-5 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI Analysis</span>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
          {analysis.disclaimer_for_elder}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
