import React, { useState, useRef, useEffect } from 'react';
import { ScamAnalysis, FileInput, SearchVerificationResult } from '../types';
import { analyzeContent, verifyScamWithSearch } from '../services/geminiService';
import ResultCard from '../components/ResultCard';
import FollowUpChat from '../components/FollowUpChat';
import { useScamHistory } from '../hooks/useScamHistory';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { Mic, Image as ImageIcon, Loader2, Trash2, X, ArrowLeft, Lock, Zap, Heart, Sparkles, FileText, Upload, ChevronRight, Shield, Languages, Plus, ChevronDown, Play, Pause, FileAudio, StopCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import * as THREE from 'three';

const DANGER_KEYWORDS = [
  'wire transfer', 'gift card', 'social security',
  'grandson', 'jail', 'urgent', 'immediately',
  'irs', 'arrest warrant', "don't tell anyone",
  'send money', 'bitcoin', 'western union'
];

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

const CheckMessageView: React.FC = () => {
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [searchResult, setSearchResult] = useState<SearchVerificationResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const { addToast } = useToast();

  // Input state
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileInput[]>([]);
  const [language, setLanguage] = useState<string>('English');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Inline Recording State (for the unified input)
  const [isInlineRecording, setIsInlineRecording] = useState(false);
  const [inlineRecordingDuration, setInlineRecordingDuration] = useState(0);
  const inlineMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const inlineAudioChunksRef = useRef<Blob[]>([]);
  const inlineStreamRef = useRef<MediaStream | null>(null);
  const inlineTimerRef = useRef<any>(null);

  // Live Monitor State (Full screen mode)
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveTranscriptFinal, setLiveTranscriptFinal] = useState('');
  const [liveTranscriptInterim, setLiveTranscriptInterim] = useState('');
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [riskLevel, setRiskLevel] = useState<number>(0);
  const [riskMessage, setRiskMessage] = useState<string>('');
  const [speechSupported] = useState<boolean>(typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition));

  // Live Monitor Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastAnalyzedIndexRef = useRef<number>(0);
  const analyzeTimeoutRef = useRef<number | null>(null);
  const transcriptBufferRef = useRef<string>('');
  const transcriptUpdateTimerRef = useRef<number | null>(null);
  const liveSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const transcriptBoxRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Visualizer refs
  const visualizerContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshRef = useRef<THREE.Points | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);

  const lastActivityTimeRef = useRef<number>(0);

  const { addToHistory } = useScamHistory();
  const { getLocationString } = useLocation();

  useEffect(() => {
    return () => {
      cleanupAudioResources();
      stopSpeechRecognition();
      cleanupInlineRecording();
    };
  }, []);

  // --- Inline Recording Logic ---

  const startInlineRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inlineStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      inlineMediaRecorderRef.current = mediaRecorder;
      inlineAudioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          inlineAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsInlineRecording(true);
      setInlineRecordingDuration(0);

      inlineTimerRef.current = setInterval(() => {
        setInlineRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Inline recording error:", err);
      addToast("Could not access microphone. Please check permissions.", "error");
    }
  };

  const stopInlineRecording = () => {
    if (inlineMediaRecorderRef.current && isInlineRecording) {
      inlineMediaRecorderRef.current.onstop = () => {
        const mimeType = inlineMediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(inlineAudioChunksRef.current, { type: mimeType });
        const ext = mimeType.split(';')[0].split('/')[1] || 'webm';
        const audioFile = new File([audioBlob], `voice_note_${new Date().toLocaleTimeString()}.${ext}`, { type: mimeType });

        const newFile: FileInput = {
          file: audioFile,
          previewUrl: URL.createObjectURL(audioBlob),
          type: 'audio'
        };

        setFiles(prev => [...prev, newFile]);
        cleanupInlineRecording();
      };
      inlineMediaRecorderRef.current.stop();
    } else {
      cleanupInlineRecording();
    }
  };

  const cleanupInlineRecording = () => {
    if (inlineTimerRef.current) clearInterval(inlineTimerRef.current);
    if (inlineStreamRef.current) {
      inlineStreamRef.current.getTracks().forEach(track => track.stop());
      inlineStreamRef.current = null;
    }
    setIsInlineRecording(false);
    setInlineRecordingDuration(0);
    inlineMediaRecorderRef.current = null;
    inlineAudioChunksRef.current = [];
  };

  // --- Live Monitor Logic ---

  const flushTranscriptBuffer = () => {
    if (transcriptBufferRef.current.trim()) {
      const accumulatedText = transcriptBufferRef.current.trim() + '\n';
      setLiveTranscript(prev => prev + accumulatedText);
      setLiveTranscriptFinal(prev => prev + accumulatedText);
      evaluateRisk(accumulatedText);
      transcriptBufferRef.current = '';
      setTranscriptPreview('');
    }
  };

  const startTranscriptFlushTimer = () => {
    if (transcriptUpdateTimerRef.current) clearInterval(transcriptUpdateTimerRef.current);
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

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setLiveTranscriptInterim('');
  };

  const shouldAnalyze = (transcript: string) => {
    const newText = transcript.slice(lastAnalyzedIndexRef.current);
    return DANGER_KEYWORDS.some(keyword => newText.toLowerCase().includes(keyword));
  };

  const scheduleLiveAnalysis = (transcript: string) => {
    if (analyzeTimeoutRef.current) clearTimeout(analyzeTimeoutRef.current);
    analyzeTimeoutRef.current = window.setTimeout(async () => {
      try {
        lastAnalyzedIndexRef.current = transcript.length;
        await analyzeContent(transcript, [], getLocationString());
        setRiskLevel(prev => Math.min(1, prev + 0.1));
      } catch (err) {
        console.error('Live chunk analysis failed', err);
      }
    }, 1000);
  };

  const evaluateRisk = (textChunk: string) => {
    const combined = (liveTranscriptFinal + textChunk).toLowerCase();
    const hit = DANGER_KEYWORDS.find(k => combined.includes(k));
    if (hit) {
      setRiskLevel(prev => Math.min(1, prev + 0.2));
      setRiskMessage(`⚠️ Suspicious phrase detected: "${hit}"`);
    } else {
      setRiskLevel(prev => Math.max(0, prev - 0.03));
    }
    if (shouldAnalyze(combined)) scheduleLiveAnalysis(combined);
  };

  const startSpeechRecognition = () => {
    if (!speechSupported) return;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    const SpeechCtor: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechCtor) return;
    const recognition: SpeechRecognition = new SpeechCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interim = transcript;
        }
      }
      if (finalChunk) {
        setLiveTranscript(prev => prev + finalChunk + ' ');
        setLiveTranscriptFinal(prev => prev + finalChunk + ' ');
        evaluateRisk(finalChunk);
      }
      setLiveTranscriptInterim(interim);
    };

    recognition.onerror = () => {
      setRiskMessage('Speech recognition issue. You can continue using manual input.');
    };

    recognition.onend = () => {
      if (isRecordingMode) recognition.start();
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const cleanupAudioResources = () => {
    stopVisualizer();
    if (timerRef.current) clearInterval(timerRef.current);
    stopTranscriptFlushTimer();

    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch (e) { console.error(e); }
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

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // --- Unified Input Handlers ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileInput[] = Array.from(e.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        type: 'image',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileInput[] = Array.from(e.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        type: 'audio',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].previewUrl);
      return newFiles;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Visualizer & Live Monitor ---

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

      if (waveformCanvasRef.current && analyserRef.current) {
        const canvas = waveformCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          const barCount = 48;
          const barWidth = 2;
          const gap = 2;
          const startX = (w - (barCount * (barWidth + gap))) / 2;
          const frequencyData = new Uint8Array(barCount);
          const step = Math.floor(bufferLength / barCount / 2);

          for (let i = 0; i < barCount; i++) {
            let val = 0;
            for (let j = 0; j < step; j++) val += dataArray[i * step + j];
            frequencyData[i] = val / step;
          }

          ctx.fillStyle = '#60A5FA';
          for (let i = 0; i < barCount; i++) {
            const percent = frequencyData[i] / 255;
            const height = Math.max(4, percent * h * 0.8);
            const x = startX + i * (barWidth + gap);
            const y = (h - height) / 2;
            const fromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
            ctx.globalAlpha = Math.max(0, 1 - Math.pow(fromCenter, 3));
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, height, 4);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
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
    setError(null);
    setLiveTranscript('');
    setLiveTranscriptFinal('');
    setLiveTranscriptInterim('');
    setRiskLevel(0);
    setRiskMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

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
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            inputAudioTranscription: {},
            systemInstruction: "You are a passive listener. Do not speak. Do not respond to questions. Just remain silent so that the system can transcribe the user input."
          },
          callbacks: {
            onopen: () => {
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => { session.sendRealtimeInput({ media: pcmBlob }); });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: (message: LiveServerMessage) => {
              const transcript = message.serverContent?.inputTranscription?.text || (message.serverContent as any)?.outputText || (message as any)?.text || '';
              if (transcript) {
                transcriptBufferRef.current += transcript + '\n';
                setTranscriptPreview(transcriptBufferRef.current.trim());
              }
            },
            onclose: () => { console.log('[Gemini Live Session] Closed'); },
            onerror: (err) => {
              console.error("[Gemini Live Session] Error:", err);
              const msg = `Transcription error: ${err.message || 'Unknown error'}`;
              setError(msg);
              addToast(msg, 'error');
            }
          }
        });

        sessionPromise.then(session => {
          liveSessionRef.current = session;
          transcriptBufferRef.current = '';
          startTranscriptFlushTimer();
        });
      } else {
        const msg = 'Live analysis limited (no API key). Using local captions only.';
        setRiskMessage(msg);
        addToast(msg, 'warning');
      }

      setIsRecordingMode(true);
      setRecordingDuration(0);
      setTimeout(() => startVisualizer(stream), 100);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      let msg = "Could not start recording.";
      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        msg = "Microphone access denied. Please check your browser settings.";
      }
      setError(msg);
      addToast(msg, 'error');
      setIsRecordingMode(false);
    }
  };

  const stopAndAnalyze = () => {
    stopSpeechRecognition();
    stopTranscriptFlushTimer();
    if (mediaRecorderRef.current && isRecordingMode) {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.split(';')[0].split('/')[1] || 'webm';
        const audioFile = new File([audioBlob], `conversation_${new Date().toLocaleTimeString()}.${ext}`, { type: mimeType });

        const newFile: FileInput = {
          file: audioFile,
          previewUrl: URL.createObjectURL(audioBlob),
          type: 'audio'
        };
        setIsRecordingMode(false);
        cleanupAudioResources();
        analyzeDirectly(newFile);
      };
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudioResources();
      setIsRecordingMode(false);
    }
  };

  const cancelRecording = () => {
    stopSpeechRecognition();
    stopTranscriptFlushTimer();
    transcriptBufferRef.current = '';
    cleanupAudioResources();
    setIsRecordingMode(false);
    setRecordingDuration(0);
    setLiveTranscript('');
    setLiveTranscriptFinal('');
    setLiveTranscriptInterim('');
  };

  const analyzeDirectly = async (audioFile: FileInput, additionalText?: string, additionalFiles?: FileInput[]) => {
    setIsLoading(true);
    setRecordedAudioUrl(audioFile.previewUrl);

    try {
      const languageContext = language ? `[DETECTED LANGUAGE]: ${language}\n` : "";
      const contextText = liveTranscript ? `${languageContext}[PARTIAL TRANSCRIPT FROM LIVE SESSION]: ${liveTranscript}` : languageContext;
      const combinedText = additionalText ? `${contextText}\n\n[ADDITIONAL TEXT]: ${additionalText}` : contextText;
      const allFiles = [audioFile, ...(additionalFiles || [])];
      const [result, searchVerification] = await Promise.all([
        analyzeContent(combinedText, allFiles, getLocationString()),
        combinedText ? verifyScamWithSearch(combinedText) : Promise.resolve(undefined)
      ]);
      setAnalysis(result.analysis);
      setSearchResult(searchVerification);
      addToHistory({ ...result.analysis });
      setText('');
      setFiles([]);
    } catch (err: any) {
      const msg = err.message || "Something went wrong analyzing the audio.";
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setRecordedAudioUrl(null);
    try {
      const [result, searchVerification] = await Promise.all([
        analyzeContent(text, files, getLocationString()),
        text ? verifyScamWithSearch(text) : Promise.resolve(undefined)
      ]);
      setAnalysis(result.analysis);
      setSearchResult(searchVerification);
      addToHistory({ ...result.analysis });
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again.";
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setSearchResult(undefined);
    setText('');
    setFiles([]);
    setLanguage('English');
    setError(null);
    setLiveTranscript('');
    setLiveTranscriptFinal('');
    setLiveTranscriptInterim('');
    setTranscriptPreview('');
    setIsRecordingMode(false);
    setRecordedAudioUrl(null);
  };

  const hasContent = text.trim() || files.length > 0;

  // Loading Screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center space-y-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
          <Shield className="absolute inset-0 m-auto w-10 h-10 text-orange-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-txt dark:text-txt-dark mb-2">Analyzing...</h3>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Our AI is checking for scam patterns, known threats, and suspicious language.
          </p>
        </div>
      </div>
    )
  }

  if (analysis) {
    return (
      <div className="space-y-4 animate-slide-up pb-24 md:pb-4">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-stone-500 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Go back
        </button>
        <ResultCard
          analysis={analysis}
          searchResult={searchResult}
          timestamp={Date.now()}
          userInputs={{ text, files, recordedAudioUrl: recordedAudioUrl || undefined }}
          onBack={handleReset}
        />
        <FollowUpChat analysis={analysis} />
      </div>
    );
  }

  // Full Screen Live Monitor
  if (isRecordingMode) {
    return (
      <div className="fixed inset-0 md:left-72 z-[100] bg-canvas dark:bg-black flex flex-col items-center p-4 animate-fade-in">
        <div className="spline-container absolute top-0 left-0 w-full h-full -z-10">
          <iframe
            src="https://my.spline.design/aidatamodelinteraction-mdTL3FktFVHgDvFr5TKtnYDV"
            frameBorder="0"
            width="100%"
            height="100%"
            id="aura-spline"
            className="w-full h-full rotate-180 invert hue-rotate-180 dark:invert-0 dark:hue-rotate-0"
          />
        </div>
        <button
          onClick={cancelRecording}
          className="absolute top-10 right-6 p-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all backdrop-blur-sm border border-stone-200 dark:border-white/20 z-50"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center z-20 mt-8 mb-4 max-w-2xl flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-body font-normal text-txt dark:text-white tracking-wide">
            Go ahead. I'm listening
          </h2>
        </div>
        <div className="relative flex-1 w-full max-w-6xl min-h-0 flex items-center justify-center">
          <div ref={canvasContainerRef} className="w-full h-full relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-6 z-20 mb-8 mt-4 flex-shrink-0">
          <canvas ref={waveformCanvasRef} width={400} height={40} className="w-96 h-10 opacity-80" />
          <button
            onClick={stopAndAnalyze}
            className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-lg hover:shadow-red-500/25 border border-red-500 text-sm flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-sm animate-pulse" />
            Stop & Analyze
          </button>
        </div>
      </div>
    )
  }

  // --- Main Render: Unified Dashboard ---
  return (
    <div className="space-y-8 md:pb-12">
      {/* Hero Section */}
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-semibold mb-6 border border-orange-200/50 dark:border-orange-700/30">
          <Shield className="w-4 h-4" />
          Scam Detection
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-txt dark:text-txt-dark mb-4 tracking-tight leading-tight">
          Is this message <br className="md:hidden" />
          <span className="gradient-text">or call a scam?</span>
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl mx-auto">
          Share any suspicious email, SMS, or call and get instant AI-powered scam detection. Your digital safety matters.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl shadow-sm animate-scale-in flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
            <X className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main Actions Container */}
      <div className="space-y-6 animate-slide-up stagger-1 max-w-3xl mx-auto">

        {/* Live Call Monitor Card - Priority Action */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <button
            type="button"
            onClick={startRecording}
            className="relative w-full bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 rounded-3xl p-6 text-left cursor-pointer overflow-hidden border border-stone-700/50 hover:border-orange-500/50 transition-all btn-press"
          >
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:32px_32px]"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="absolute w-64 h-64 border-2 border-orange-500 rounded-full animate-ping" style={{ animationDuration: `${2 + i * 0.5}s`, animationDelay: `${i * 0.3}s`, opacity: 0.3 - i * 0.1 }}></div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Mic className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md uppercase tracking-wider">Live Analysis</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-1">Monitor a Phone Call</h3>
                <p className="text-stone-300 text-sm">Select Monitor Phone Call, and answer your incoming call. Turn on speaker mode and ScamShield will listen and detect scam patterns instantly.</p>
              </div>
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl group-hover:bg-orange-500 transition-colors flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent"></div>
          <span className="text-stone-400 dark:text-stone-500 font-medium text-xs uppercase tracking-widest">OR paste/upload content below</span>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent"></div>
        </div>

        {/* Unified Input Composer */}
        <div className="bg-surface dark:bg-surface-dark rounded-3xl border border-border dark:border-border-dark shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50">

          {/* Text Input Area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isInlineRecording ? "" : "Paste the message, email, or suspicious text here..."}
            disabled={isInlineRecording}
            className={`w-full p-6 bg-transparent resize-none outline-none text-lg text-txt dark:text-txt-dark placeholder-stone-400 dark:placeholder-stone-600 transition-all ${isInlineRecording ? 'h-0 opacity-0 p-0' : 'min-h-[140px]'}`}
          />

          {/* Inline Recorder UI */}
          {isInlineRecording && (
            <div className="p-8 bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center gap-4 animate-fade-in border-b border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                  {formatTime(inlineRecordingDuration)}
                </span>
              </div>
              <p className="text-sm text-red-500 dark:text-red-400 font-medium">Recording voice note...</p>
              <button
                onClick={stopInlineRecording}
                className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full text-sm font-bold shadow-sm border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                Stop & Add
              </button>
            </div>
          )}

          {/* Attachments Preview */}
          {files.length > 0 && (
            <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 aspect-video flex items-center justify-center">
                  {file.type === 'image' ? (
                    <img src={file.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-center">
                      <FileAudio className="w-6 h-6 text-orange-500" />
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate max-w-[100px]">{file.file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions Toolbar */}
          {!isInlineRecording && (
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-t border-border dark:border-border-dark flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Hidden Inputs */}
                <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                <input type="file" ref={audioInputRef} onChange={handleAudioChange} accept="audio/*" multiple className="hidden" />

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium shadow-sm"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Photo</span>
                </button>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm font-medium shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Audio</span>
                </button>
                <button
                  onClick={startInlineRecording}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm font-medium shadow-sm group"
                >
                  <Mic className="w-4 h-4 group-hover:animate-pulse" />
                  <span className="hidden sm:inline">Record Audio</span>
                </button>
              </div>
              <div className="text-xs text-stone-400 font-medium">
                {text.length} Characters
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAnalyzeForm}
          disabled={isLoading || (!hasContent && !isInlineRecording)}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all btn-press relative overflow-hidden ${isLoading || (!hasContent && !isInlineRecording)
            ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 transform hover:scale-[1.01]'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin h-5 w-5" />
              Analyzing content...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Shield className="w-5 h-5" />
              {hasContent ? 'Analyze Content' : 'Add content to analyze'}
            </span>
          )}
        </button>

      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-3 pt-4 animate-slide-up stagger-2 max-w-3xl mx-auto">
        {[
          { icon: Lock, label: 'Private', desc: 'Your data stays private', color: 'emerald' },
          { icon: Zap, label: 'Instant', desc: 'Results in seconds', color: 'amber' },
          { icon: Heart, label: 'Universal', desc: 'Built for everyone', color: 'rose' },
        ].map((item, i) => (
          <div key={i} className="text-center p-4 rounded-2xl bg-surface/50 dark:bg-surface-dark/50 border border-border/50 dark:border-border-dark/50">
            <item.icon className={`w-6 h-6 mx-auto mb-2 text-${item.color}-500`} />
            <p className="font-bold text-sm text-txt dark:text-txt-dark">{item.label}</p>
            <p className="text-xs text-stone-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckMessageView;