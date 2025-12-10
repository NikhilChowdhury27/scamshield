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
  Sparkles,
  Building2,
  Megaphone,
  Link as LinkIcon,
  Send
} from 'lucide-react';

interface ResultCardProps {
  analysis: ScamAnalysis;
  searchResult?: SearchVerificationResult;
  timestamp?: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ analysis, searchResult, timestamp }) => {
  const [copiedFamilyText, setCopiedFamilyText] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
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
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scam Alert Check',
          text: analysis.family_alert_text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopyFamilyText();
    }
  };

  const handleCopyContact = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(text);
    setTimeout(() => setCopiedContact(null), 2000);
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

  const renderContactPill = (contact: string, idx: number) => {
    const isUrl = contact.toLowerCase().startsWith('http');
    const isEmail = contact.includes('@');
    const uniqueKey = `${idx}-${contact}`;
    const isCopied = copiedContact === contact;

    if (isUrl) {
      return (
        <a 
          key={uniqueKey}
          href={contact}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {new URL(contact).hostname.replace('www.', '')}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      );
    }

    return (
      <button
        key={uniqueKey}
        onClick={() => handleCopyContact(contact)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
          isCopied 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
            : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
        }`}
        title="Click to copy"
      >
        {isCopied ? <Check className="w-3 h-3" /> : (isEmail ? <Megaphone className="w-3 h-3" /> : <Phone className="w-3 h-3" />)}
        {contact}
        {isCopied ? <span className="ml-1">Copied</span> : <Copy className="w-3 h-3 opacity-50 ml-1" />}
      </button>
    );
  };

  return (
    <div className="w-full space-y-5 pb-32">
      {/* Main Result Card */}
      <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} overflow-hidden shadow-lg animate-scale-in`}>
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${styles.gradient} p-5`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
              {styles.icon}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-display font-bold tracking-tight">{styles.title}</h2>
              <p className="text-white/90 mt-1 text-base font-medium">{styles.description}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-bold tracking-wide ${styles.badgeBg} shadow-sm`}>
              {analysis.risk_label} RISK
            </span>
            {timestamp && (
              <span className="inline-flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-xs font-medium bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {new Date(timestamp).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-700 relative group shadow-sm">
            <p className="text-lg leading-relaxed text-txt dark:text-txt-dark pr-12">
              {analysis.summary_for_elder}
            </p>
            <button 
              onClick={handleReadAloud}
              disabled={isGeneratingAudio || isPlayingAudio}
              className="absolute top-4 right-4 p-2.5 bg-stone-50 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-all group-hover:scale-105 border border-stone-100 dark:border-stone-700"
              title="Read aloud"
            >
              {isGeneratingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse text-orange-500' : ''}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Web Check Results (Improved Readability) */}
      {searchResult && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm animate-slide-up stagger-1">
          <div className="bg-blue-50/50 dark:bg-blue-900/20 px-5 py-3 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Web Search Verification</h3>
            </div>
          </div>
          
          <div className="p-5">
            <p className="text-base text-stone-700 dark:text-stone-300 leading-7 mb-4">
              {searchResult.text}
            </p>
            
            {searchResult.sources.length > 0 && (
              <div className="pt-4 border-t border-dashed border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
                  Sources Found
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchResult.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-xs font-medium max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[240px]">{source.title || new URL(source.uri).hostname}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transcription */}
      {analysis.transcription && (
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-5 shadow-sm animate-slide-up stagger-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Transcript</h3>
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-700 font-mono text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
            {analysis.transcription}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {(analysis.risk_label === 'HIGH' || analysis.risk_label === 'MEDIUM') && analysis.red_flags.length > 0 && (
        <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-5 shadow-sm animate-slide-up stagger-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Red Flags Found</h3>
            </div>
          </div>
          <div className="space-y-3">
            {analysis.red_flags.map((flag, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 transition-all hover:bg-amber-100/50"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-bold text-xs mt-0.5">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-txt dark:text-txt-dark text-base mb-1">{flag.title}</h4>
                  <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">{flag.description_for_elder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Actions */}
      <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-5 shadow-sm animate-slide-up stagger-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">What You Should Do</h3>
          </div>
        </div>
        <ul className="space-y-3">
          {analysis.safe_actions_for_elder.map((action, index) => (
            <li key={index} className="flex gap-3 items-start p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="p-1 bg-emerald-500 rounded-full mt-0.5 flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-base text-stone-800 dark:text-stone-200">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Regulatory Reporting (Whom to Contact) - UPDATED SECTION */}
      {analysis.regulatory_reporting_suggestions && analysis.regulatory_reporting_suggestions.length > 0 && (
         <div className="bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm animate-slide-up stagger-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-stone-200 dark:bg-stone-700 rounded-xl">
                <Building2 className="w-5 h-5 text-stone-600 dark:text-stone-300" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Official Reporting Channels</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs">Based on location: {analysis.regulatory_reporting_suggestions[0].region_hint}</p>
              </div>
            </div>
            
            <div className="space-y-4">
               {analysis.regulatory_reporting_suggestions.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700">
                      <p className="text-sm text-stone-800 dark:text-stone-200 font-medium mb-3">
                          {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                          {item.example_contacts.map((contact, cIdx) => renderContactPill(contact, cIdx + (idx * 10)))}
                      </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Call Script */}
      {analysis.call_script_if_scammer_calls_back && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 p-5 shadow-sm animate-slide-up stagger-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-blue-900 dark:text-blue-100">If They Call Again</h3>
              <p className="text-blue-700 dark:text-blue-300 text-xs">Read this exact sentence to them</p>
            </div>
          </div>
          <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <p className="text-xl font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed text-center">
              "{analysis.call_script_if_scammer_calls_back}"
            </p>
          </div>
        </div>
      )}

      {/* Share with Family - UPDATED SECTION */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800/50 p-5 shadow-sm animate-slide-up stagger-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-purple-900 dark:text-purple-100">Share With Family</h3>
            <p className="text-purple-700 dark:text-purple-300 text-xs">Protect your loved ones</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
          <p className="text-stone-800 dark:text-stone-300 text-sm leading-relaxed font-medium mb-4">
            {analysis.family_alert_text}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium text-sm shadow-md shadow-purple-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Share
            </button>
            <button 
              onClick={handleCopyFamilyText}
              className="flex-none px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
              title="Copy to clipboard"
            >
              {copiedFamilyText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {copiedFamilyText && (
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-2 animate-scale-in text-xs justify-center">
            <Check className="w-3 h-3" /> Copied to clipboard
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-4 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 text-stone-500 dark:text-stone-400 mb-1.5">
          <Sparkles className="w-3 h-3" />
          <span className="text-xs font-medium">AI Analysis</span>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed max-w-lg mx-auto">
          {analysis.disclaimer_for_elder}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;