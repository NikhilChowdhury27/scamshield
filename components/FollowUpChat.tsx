import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ScamAnalysis, FileInput } from '../types';
import { askFollowUpQuestion, analyzeContent } from '../services/geminiService';
import { Send, User, Bot, Loader2, Mic, X, Upload, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import * as THREE from 'three';

// Helpers for Live API audio formatting
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface FollowUpChatProps {
  analysis: ScamAnalysis;
}

const FollowUpChat: React.FC<FollowUpChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<FileInput | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Recording state
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  
  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptBufferRef = useRef<string>('');
  const transcriptUpdateTimerRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Visualizer refs
  const visualizerContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshRef = useRef<THREE.Points | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Flush accumulated transcriptions to UI every 5 seconds
  const flushTranscriptBuffer = () => {
    if (transcriptBufferRef.current.trim()) {
      const accumulatedText = transcriptBufferRef.current.trim() + '\n';
      setLiveTranscript(prev => prev + accumulatedText);
      transcriptBufferRef.current = '';
      setTranscriptPreview('');
    }
  };

  const startTranscriptFlushTimer = () => {
    if (transcriptUpdateTimerRef.current) {
      clearInterval(transcriptUpdateTimerRef.current);
    }
    transcriptUpdateTimerRef.current = window.setInterval(() => {
      flushTranscriptBuffer();
    }, 5000);
  };

  const stopTranscriptFlushTimer = () => {
    if (transcriptUpdateTimerRef.current) {
      clearInterval(transcriptUpdateTimerRef.current);
      transcriptUpdateTimerRef.current = null;
    }
    flushTranscriptBuffer();
  };

  const cleanupAudioResources = () => {
    stopVisualizer();
    if (timerRef.current) clearInterval(timerRef.current);
    stopTranscriptFlushTimer();

    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (e) {
        console.error("Error closing live session", e);
      }
      liveSessionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
  };

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasContainerRef.current) return;

    visualizerContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = visualizerContextRef.current.createAnalyser();
    const source = visualizerContextRef.current.createMediaStreamSource(stream);
    
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvasContainerRef.current.clientWidth;
    const height = canvasContainerRef.current.clientHeight;

    const scene = new THREE.Scene();
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    threeCameraRef.current = camera;
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;

    const particleCount = 7000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    
    const colorTop = new THREE.Color(0xF97316);
    const colorBottom = new THREE.Color(0x0592F0);
    const radius = 0.75;

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const normalizedY = (y / radius + 1) / 2;
      const c = new THREE.Color().copy(colorBottom).lerp(colorTop, normalizedY);
      
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    originalPositionsRef.current = originalPositions;

    const material = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);
    sphereMeshRef.current = sphere;

    const animate = () => {
      if (!analyserRef.current || !sphereMeshRef.current || !originalPositionsRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      analyserRef.current.getByteFrequencyData(dataArray);

      const time = performance.now() * 0.001;

      sphereMeshRef.current.rotation.y = time * 0.15;
      sphereMeshRef.current.rotation.z = time * 0.05;

      let sum = 0;
      const lowerRange = Math.floor(bufferLength * 0.4);
      for (let i = 0; i < lowerRange; i++) sum += dataArray[i];
      const volume = lowerRange > 0 ? sum / lowerRange : 0;
      const normVol = volume / 255;

      const breathing = Math.sin(time * 2) * 0.05 + 1.0 + (normVol * 0.1);
      sphereMeshRef.current.scale.set(breathing, breathing, breathing);

      const positions = sphereMeshRef.current.geometry.attributes.position.array as Float32Array;
      const original = originalPositionsRef.current;

      if (volume > 10) {
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const x = original[ix];
          const y = original[ix + 1];
          const z = original[ix + 2];

          const wave = Math.sin(y * 5 + time * 3) * 0.1 * normVol;
          const noise = Math.sin(i * 0.1 + time * 5) * 0.05 * normVol;
          const scale = 1 + wave + noise;

          positions[ix] = x * scale;
          positions[ix + 1] = y * scale;
          positions[ix + 2] = z * scale;
        }
        sphereMeshRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          positions[ix] = positions[ix] * 0.95 + original[ix] * 0.05;
          positions[ix + 1] = positions[ix + 1] * 0.95 + original[ix + 1] * 0.05;
          positions[ix + 2] = positions[ix + 2] * 0.95 + original[ix + 2] * 0.05;
        }
        sphereMeshRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (threeRendererRef.current && canvasContainerRef.current) {
      if (canvasContainerRef.current.contains(threeRendererRef.current.domElement)) {
        canvasContainerRef.current.removeChild(threeRendererRef.current.domElement);
      }
      threeRendererRef.current.dispose();
    }

    if (sphereMeshRef.current) {
      sphereMeshRef.current.geometry.dispose();
      (sphereMeshRef.current.material as THREE.Material).dispose();
    }

    if (visualizerContextRef.current) {
      visualizerContextRef.current.close();
      visualizerContextRef.current = null;
    }
    
    threeSceneRef.current = null;
    threeCameraRef.current = null;
    threeRendererRef.current = null;
    sphereMeshRef.current = null;
    originalPositionsRef.current = null;
  };

  const startRecording = async () => {
    setLiveTranscript('');
    setTranscriptPreview('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();

      const apiKey = process.env.API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
      
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        inputAudioContextRef.current = inputCtx;
        
        const source = inputCtx.createMediaStreamSource(stream);
        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = scriptProcessor;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            inputAudioTranscription: {},
            systemInstruction: "You are a passive listener. Do not speak. Do not respond to questions. Just remain silent so that the system can transcribe the user input."
          },
          callbacks: {
            onopen: () => {
              console.log('[Gemini Live Session] Opened successfully');
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: (message: LiveServerMessage) => {
              const transcript =
                message.serverContent?.inputTranscription?.text ||
                (message.serverContent as any)?.outputText ||
                (message as any)?.text ||
                '';

              if (transcript) {
                transcriptBufferRef.current += transcript + '\n';
                setTranscriptPreview(transcriptBufferRef.current.trim());
              }
            },
            onclose: () => {
              console.log('[Gemini Live Session] Closed');
            },
            onerror: (err) => {
              console.error("[Gemini Live Session] Error:", err);
            }
          }
        });

        sessionPromise.then(session => {
          liveSessionRef.current = session;
          transcriptBufferRef.current = '';
          startTranscriptFlushTimer();
        });
      }
      
      setIsRecordingMode(true);
      setRecordingDuration(0);
      setTimeout(() => startVisualizer(stream), 100);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Recording error:", err);
      setIsRecordingMode(false);
    }
  };

  const stopAndAnalyze = async () => {
    stopTranscriptFlushTimer();
    
    if (mediaRecorderRef.current && isRecordingMode) {
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.split(';')[0].split('/')[1] || 'webm';
        const audioFile = new File([audioBlob], `followup_${new Date().toLocaleTimeString()}.${ext}`, { type: mimeType });
         
        const newFile: FileInput = {
          file: audioFile,
          previewUrl: URL.createObjectURL(audioBlob),
          type: 'audio'
        };
        
        cleanupAudioResources();
        setIsRecordingMode(false);
        
        // Add user message
        const userMsg: ChatMessage = { role: 'user', content: 'Recorded follow-up call audio' };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        
        try {
          const contextText = `Previous analysis context:\nRisk: ${analysis.risk_label}\nSummary: ${analysis.summary_for_elder}\n\nThis is a follow-up audio from the same caller. Analyze this new audio in the context of the previous analysis.${liveTranscript ? `\n\nPartial transcript: ${liveTranscript}` : ''}`;
          const result = await analyzeContent(contextText, [newFile]);
          const botMsg: ChatMessage = { 
            role: 'model', 
            content: result.analysis.summary_for_elder + (result.analysis.red_flags.length > 0 ? `\n\n⚠️ New Red Flags:\n${result.analysis.red_flags.map(f => `• ${f.title}: ${f.description_for_elder}`).join('\n')}` : '')
          };
          setMessages(prev => [...prev, botMsg]);
          setLiveTranscript('');
          setTranscriptPreview('');
        } catch (err: any) {
          const errorMsg: ChatMessage = { role: 'model', content: err.message || "I'm having trouble analyzing the audio. Please try again." };
          setMessages(prev => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudioResources();
      setIsRecordingMode(false);
    }
  };

  const cancelRecording = () => {
    stopTranscriptFlushTimer();
    transcriptBufferRef.current = '';
    cleanupAudioResources();
    setIsRecordingMode(false);
    setRecordingDuration(0);
    setLiveTranscript('');
    setTranscriptPreview('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !audioFile) || isLoading) return;

    // If audio file is present, analyze it with context
    if (audioFile) {
      setIsLoading(true);
      const userMsg: ChatMessage = { role: 'user', content: 'Uploaded audio from follow-up call' };
      setMessages(prev => [...prev, userMsg]);
      
      try {
        const contextText = `Previous analysis context:\nRisk: ${analysis.risk_label}\nSummary: ${analysis.summary_for_elder}\n\nThis is a follow-up audio from the same caller. Analyze this new audio in the context of the previous analysis.`;
        const result = await analyzeContent(contextText, [audioFile]);
        const botMsg: ChatMessage = { 
          role: 'model', 
          content: result.analysis.summary_for_elder + (result.analysis.red_flags.length > 0 ? `\n\n⚠️ New Red Flags:\n${result.analysis.red_flags.map(f => `• ${f.title}: ${f.description_for_elder}`).join('\n')}` : '')
        };
        setMessages(prev => [...prev, botMsg]);
        setAudioFile(null);
      } catch (err: any) {
        const errorMsg: ChatMessage = { role: 'model', content: err.message || "I'm having trouble analyzing the audio. Please try again." };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Text message handling
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await askFollowUpQuestion(analysis, input);
      const botMsg: ChatMessage = { role: 'model', content: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = { role: 'model', content: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const previewUrl = URL.createObjectURL(file);
      setAudioFile({ file, previewUrl, type: 'audio' });
    }
  };

  const removeAudio = () => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.previewUrl);
      setAudioFile(null);
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // Show recording interface - Overlay Mode (Sticky on top of everything)
  if (isRecordingMode) {
    return (
      <div className="fixed inset-0 md:left-72 z-50 bg-canvas dark:bg-black flex flex-col items-center p-4 animate-fade-in">
        <button
          onClick={cancelRecording}
          className="absolute top-10 right-6 p-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all backdrop-blur-sm border border-stone-200 dark:border-white/20 z-50"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center z-20 mt-8 mb-4 max-w-2xl flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-body font-normal text-txt dark:text-white tracking-wide">
            Recording follow-up call
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            {formatTime(recordingDuration)}
          </p>
          {transcriptPreview && (
            <div className="mt-4 p-3 bg-stone-100 dark:bg-stone-800 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-xs text-stone-600 dark:text-stone-300 text-left">{transcriptPreview}</p>
            </div>
          )}
        </div>

        <div className="relative flex-1 w-full max-w-6xl min-h-0 flex items-center justify-center">
          <div ref={canvasContainerRef} className="w-full h-full relative z-10" />
        </div>

        <div className="flex flex-col items-center gap-6 z-20 mb-8 mt-4 flex-shrink-0">
          <button
            onClick={stopAndAnalyze}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-lg hover:shadow-red-500/25 border border-red-500 text-sm flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-sm animate-pulse" />
            Stop & Analyze
          </button>
        </div>
      </div>
    );
  }

  // Normal Chat Flow
  return (
    <>
      {/* 1. Messages Section: Renders in the normal document flow (not fixed) */}
      <div className="w-full pb-32 animate-slide-up">
        {/* Chat Header inside the flow */}
        <div className="mb-6 flex items-center gap-3 opacity-80">
          <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
             <MessageSquare className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          </div>
          <h3 className="font-bold text-lg text-txt dark:text-txt-dark">Have questions? Ask ScamShield</h3>
        </div>

        {messages.length === 0 && (
           <p className="text-stone-500 dark:text-stone-400 italic mb-8 ml-2">
             Ask a follow-up question below...
           </p>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/40 dark:to-red-900/40 border-orange-100 dark:border-orange-800' 
                    : 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700'
                }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-orange-600 dark:text-orange-400" /> : <Sparkles className="w-5 h-5 text-orange-500" />}
              </div>
              
              <div className={`p-5 rounded-2xl max-w-[85%] text-base leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex gap-1 items-center p-5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-tl-sm h-14 w-24">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 2. Input Section: Sticky at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:left-72 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-border dark:border-border-dark p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {audioFile && (
            <div className="mb-3 flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 animate-slide-up w-fit">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Mic className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-300 truncate max-w-[200px]">{audioFile.file.name}</p>
              </div>
              <button
                type="button"
                onClick={removeAudio}
                className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-lg transition-colors text-orange-600 dark:text-orange-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="file"
              ref={audioInputRef}
              onChange={handleAudioSelect}
              accept="audio/*"
              className="hidden"
            />
            
            <div className="flex-grow flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-2xl p-2 border-2 border-transparent focus-within:border-orange-500/20 focus-within:bg-white dark:focus-within:bg-black transition-all shadow-sm">
                <div className="flex items-center gap-1 pr-2 border-r border-stone-200 dark:border-stone-700">
                    <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        startRecording();
                    }}
                    className="p-2.5 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    title="Record audio"
                    >
                    <Mic className="w-5 h-5" />
                    </button>
                    <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        audioInputRef.current?.click();
                    }}
                    className="p-2.5 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Upload audio"
                    >
                    <Upload className="w-5 h-5" />
                    </button>
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() || audioFile) {
                          handleSend(e as any);
                      }
                      }
                  }}
                  placeholder={audioFile ? "Add context about this audio..." : "Type a follow-up question..."}
                  className="flex-grow bg-transparent text-base text-txt dark:text-txt-dark placeholder-stone-400 dark:placeholder-stone-500 outline-none min-w-0 px-2"
                />
                
                <button
                type="submit"
                disabled={(!input.trim() && !audioFile) || isLoading}
                className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FollowUpChat;