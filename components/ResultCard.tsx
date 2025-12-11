import React, { useState, useRef, useEffect } from 'react';
import { ScamAnalysis, SearchVerificationResult, FileInput } from '../types';
import { generateSpeech } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
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
  Send,
  FileText,
  Image as ImageIcon,
  FileAudio,
  Maximize2,
  X,
  ArrowLeft
} from 'lucide-react';

interface ResultCardProps {
  analysis: ScamAnalysis;
  searchResult?: SearchVerificationResult;
  timestamp?: number;
  userInputs?: {
    text?: string;
    files?: FileInput[];
    recordedAudioUrl?: string;
  };
  audioUrl?: string;
  onBack?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ analysis, searchResult, timestamp, userInputs, audioUrl, onBack }) => {
  const [copiedFamilyText, setCopiedFamilyText] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: '-80px 0px 0px 0px' }
    );

    if (headerSentinelRef.current) {
      observer.observe(headerSentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const activeAudioUrl = userInputs?.recordedAudioUrl || audioUrl;

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
    addToast('Alert text copied to clipboard', 'success');
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
    addToast('Contact copied to clipboard', 'success');
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
      addToast("Could not generate audio. Please check your connection.", 'error');
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
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors max-w-full"
        >
          <LinkIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{new URL(contact).hostname.replace('www.', '')}</span>
          <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
        </a>
      );
    }

    return (
      <button
        key={uniqueKey}
        onClick={() => handleCopyContact(contact)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all max-w-full ${isCopied
          ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
          }`}
        title="Click to copy"
      >
        <div className="flex-shrink-0">
            {isCopied ? <Check className="w-3 h-3" /> : (isEmail ? <Megaphone className="w-3 h-3" /> : <Phone className="w-3 h-3" />)}
        </div>
        <span className="truncate">{contact}</span>
        <div className="flex-shrink-0">
            {isCopied ? <span className="ml-1">Copied</span> : <Copy className="w-3 h-3 opacity-50 ml-1" />}
        </div>
      </button>
    );
  };

  const hasUserInputs = userInputs && (userInputs.text || (userInputs.files && userInputs.files.length > 0) || userInputs.recordedAudioUrl);

  return (
    <div className="w-full pb-16 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start border-b border-stone-200 dark:border-stone-700">

      {/* Main Content Column (formerly Middle, now includes Left) */}
      <div className="lg:col-span-3 space-y-5">

        {/* Floating Sticky Header (Additional Information) */}
        {isHeaderSticky && (
          <div className="sticky top-4 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`w-full rounded-2xl shadow-xl border-2 ${styles.border} ${styles.bg} p-3 sm:px-5 flex items-center justify-between backdrop-blur-md bg-opacity-95`}>
              {/* Left: Back Button */}
              <div className="flex items-center gap-4">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-bold">Go back</span>
                  </button>
                )}

                <div className="h-8 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:block"></div>

                {/* Middle: Risk Info */}
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${styles.iconBg} shadow-sm`}>
                    {React.cloneElement(styles.icon as React.ReactElement, { className: 'w-5 h-5 text-white' })}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold leading-none ${styles.text}`}>{styles.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] text-white font-bold tracking-wider uppercase ${styles.badgeBg}`}>
                      {analysis.risk_label} RISK
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions (Optional, maybe just sound?) */}
              <div className="flex items-center gap-2">
                {/* Could duplicate 'Read Aloud' here if needed, but keeping it clean as per ref image */}
              </div>
            </div>
          </div>
        )}
        {/* 1. Analyzed Content Summary (User Inputs) */}
        {hasUserInputs && (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm animate-slide-up">
            <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">Content Analyzed</h3>
            </div>

            <div className="p-5 space-y-6">
              {/* Text Content */}
              {userInputs?.text && (
                <div className="group relative pl-4 border-l-4 border-stone-200 dark:border-stone-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors">
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                    "{userInputs.text}"
                  </p>
                </div>
              )}

              {/* Images Grid */}
              {userInputs?.files && userInputs.files.filter(f => f.type === 'image').length > 0 && (
                <div>
                  <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {userInputs.files.filter(f => f.type === 'image').map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(file.previewUrl)}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 cursor-zoom-in transition-all hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700"
                      >
                        <img src={file.previewUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="User upload" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Players (Uploaded + Recorded) */}
              {(userInputs?.files?.some(f => f.type === 'audio') || activeAudioUrl) && (
                <div className="space-y-2">
                  {/* Audio Files */}
                  {userInputs?.files?.filter(f => f.type === 'audio').map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                        <FileAudio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-stone-700 dark:text-stone-300 truncate">{file.file.name}</p>
                        <audio controls src={file.previewUrl} className="w-full h-8 mt-1" />
                      </div>
                    </div>
                  ))}

                  {/* Live Recorded Audio */}
                  {activeAudioUrl && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                        <Mic className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-red-700 dark:text-red-300">Live Call Recording</p>
                        <audio controls src={activeAudioUrl} className="w-full h-8 mt-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}



        {/* Main Result Card */}
        <div className={`rounded-3xl border ${styles.border} ${styles.bg} p-6 sm:p-8 relative overflow-hidden shadow-lg animate-scale-in`}>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Icon Section - Reference Style */}
            <div className={`flex-shrink-0 p-4 rounded-2xl ${styles.iconBg} shadow-lg shadow-orange-900/5`}>
              {styles.icon}
            </div>

            {/* Content Section */}
            <div className="flex-grow space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-display font-bold tracking-tight mb-1 ${styles.text}`}>
                    {styles.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wider uppercase ${styles.badgeBg} shadow-sm`}>
                      {analysis.risk_label} RISK
                    </span>
                    {timestamp && (
                      <span className="inline-flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700/50 bg-white/50 dark:bg-black/20">
                        <Clock className="w-3 h-3" />
                        {new Date(timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Read Aloud Action */}
                <button
                  onClick={handleReadAloud}
                  disabled={isGeneratingAudio || isPlayingAudio}
                  className="p-2 rounded-xl text-stone-400 hover:text-orange-600 hover:bg-white dark:hover:bg-white/10 transition-all active:scale-95 border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                  title="Read aloud"
                >
                  {isGeneratingAudio ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse text-orange-500' : ''}`} />
                  )}
                </button>
              </div>

              <div className="relative">
                <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300 font-serif">
                  {analysis.summary_for_elder}
                </p>
              </div>
            </div>
            {/* Scroll Sentinel - Triggers sticky header when this point is crossed */}
            <div ref={headerSentinelRef} className="absolute bottom-0 left-0 w-full h-1 pointer-events-none" />
          </div>
        </div>

        {/* Web Check Results (Simplified) */}
        {searchResult && (
          <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 overflow-hidden shadow-sm animate-slide-up stagger-1">
            <div className="px-5 py-4 border-b border-border dark:border-stone-800 flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-txt dark:text-txt-dark">Web Search Verification</h3>
              </div>
            </div>

            <div className="p-5">
              <p className="text-base font-medium text-stone-700 dark:text-stone-300 leading-relaxed mb-4">
                {searchResult.text}
              </p>

              {searchResult.sources.length > 0 && (
                <div className="pt-4 border-t border-dashed border-stone-200 dark:border-stone-800">
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
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all text-xs font-medium max-w-full"
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
          <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Transcript</h3>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700 font-mono text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
              {analysis.transcription}
            </div>
          </div>
        )}

        {/* Red Flags - Cleaner Look */}
        {(analysis.risk_label === 'HIGH' || analysis.risk_label === 'MEDIUM') && analysis.red_flags.length > 0 && (
          <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Red Flags Found</h3>
              </div>
            </div>
            <div className="space-y-3">
              {analysis.red_flags.map((flag, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl border border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  style={{ borderLeftWidth: '4px', borderLeftColor: 'rgb(245 158 11)' }} // tailwind amber-500
                >
                  <div>
                    <h4 className="font-bold text-txt dark:text-txt-dark text-base mb-1">{flag.title}</h4>
                    <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{flag.description_for_elder}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safe Actions - Cleaner Look */}
        <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">What You Should Do</h3>
            </div>
          </div>
          <ul className="space-y-3">
            {analysis.safe_actions_for_elder.map((action, index) => (
              <li key={index} className="flex gap-3 items-start p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/20">
                <div className="p-1 bg-emerald-500 rounded-full mt-0.5 flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-base text-stone-700 dark:text-stone-300 font-medium">{action}</span>
              </li>
            ))}
          </ul>
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

      {/* Right Column - Actions & Info */}
      <div className="lg:col-span-1 space-y-5 sticky top-16">
        {/* Regulatory Reporting (Whom to Contact) */}
        {analysis.regulatory_reporting_suggestions && analysis.regulatory_reporting_suggestions.length > 0 && (
          <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Official Reporting Channels</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs">Based on location: {analysis.regulatory_reporting_suggestions[0].region_hint}</p>
              </div>
            </div>

            <div className="space-y-4">
              {analysis.regulatory_reporting_suggestions.map((item, idx) => (
                <div key={idx} className="rounded-xl p-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
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

        {/* Call Script - Cleaner Look */}
        {analysis.call_script_if_scammer_calls_back && (
          <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">If They Call Again</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs">Read this exact sentence to them</p>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
              <p className="text-xl font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed text-center">
                "{analysis.call_script_if_scammer_calls_back}"
              </p>
            </div>
          </div>
        )}

        {/* Share with Family - Cleaner Look */}
        <div className="bg-surface dark:bg-stone-900 rounded-2xl border border-border dark:border-stone-800 p-5 shadow-sm animate-slide-up stagger-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-txt dark:text-txt-dark">Share With Family</h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs">Protect your loved ones</p>
            </div>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
            <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed font-medium mb-4">
              {analysis.family_alert_text}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleNativeShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 rounded-lg transition-all font-bold text-sm shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleCopyFamilyText}
                className="flex-none px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-600 rounded-lg transition-all border border-stone-200 dark:border-stone-600"
                title="Copy to clipboard"
              >
                {copiedFamilyText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {copiedFamilyText && (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-2 animate-scale-in text-xs justify-center">
              <Check className="w-3 h-3" /> Copied to clipboard
            </p>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Full size view"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ResultCard;