import React, { useState, useRef, useEffect } from 'react';
import { ScamAnalysis, FileInput, SearchVerificationResult } from '../types';
import { analyzeContent, verifyScamWithSearch } from '../services/geminiService';
import ResultCard from '../components/ResultCard';
import FollowUpChat from '../components/FollowUpChat';
import { useScamHistory } from '../hooks/useScamHistory';
import { Mic, Image as ImageIcon, Loader2, Trash2, X, ArrowLeft, Lock, Zap, Heart, Sparkles, FileText, Radio, Upload, ChevronRight, Shield } from 'lucide-react';
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

const CheckMessageView: React.FC = () => {
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [searchResult, setSearchResult] = useState<SearchVerificationResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input state
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active input mode
  const [activeMode, setActiveMode] = useState<'text' | 'image' | null>(null);

  // Audio Recording state
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  // High quality recorder for final analysis
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live API refs
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
  const sparkMeshRef = useRef<THREE.Points | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);



  const lastActivityTimeRef = useRef<number>(0);

  const { addToHistory } = useScamHistory();

  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const cleanupAudioResources = () => {
    stopVisualizer();
    if (timerRef.current) clearInterval(timerRef.current);

    // Close Live API Session
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: FileInput[] = Array.from(e.target.files).map((file: File) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith('audio') ? 'audio' : 'image',
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      setActiveMode('image');
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0 && !text) {
        setActiveMode(null);
      }
      return newFiles;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    const colorTop = new THREE.Color(0xF97316);    // Orange (Current Style)
    const colorBottom = new THREE.Color(0x0592F0);  // Sky Blue (Complementary)

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

      // Audio reactive "breathing" and waves
      let sum = 0;
      const lowerRange = Math.floor(bufferLength * 0.4);
      for (let i = 0; i < lowerRange; i++) sum += dataArray[i];
      const volume = lowerRange > 0 ? sum / lowerRange : 0;
      const normVol = volume / 255;

      const breathing = Math.sin(time * 2) * 0.05 + 1.0 + (normVol * 0.1);
      sphereMeshRef.current.scale.set(breathing, breathing, breathing);

      const positions = sphereMeshRef.current.geometry.attributes.position.array as Float32Array;
      const original = originalPositionsRef.current;

      // Dynamic noise/wave effect
      if (volume > 10) {
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const x = original[ix];
          const y = original[ix + 1];
          const z = original[ix + 2];

          // Simple wave based on y-position and time
          const wave = Math.sin(y * 5 + time * 3) * 0.1 * normVol;

          // Noise-like randomness based on index
          const noise = Math.sin(i * 0.1 + time * 5) * 0.05 * normVol;

          const scale = 1 + wave + noise;

          positions[ix] = x * scale;
          positions[ix + 1] = y * scale;
          positions[ix + 2] = z * scale;
        }
        sphereMeshRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        // Smooth return to sphere shape
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          // Linear interpolation back to original
          positions[ix] = positions[ix] * 0.95 + original[ix] * 0.05;
          positions[ix + 1] = positions[ix + 1] * 0.95 + original[ix + 1] * 0.05;
          positions[ix + 2] = positions[ix + 2] * 0.95 + original[ix + 2] * 0.05;
        }
        sphereMeshRef.current.geometry.attributes.position.needsUpdate = true;
      }


      // Draw Waveform Equalizer
      if (waveformCanvasRef.current && analyserRef.current) {
        const canvas = waveformCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const barCount = 48; // Increased by 50%
          const barWidth = 2; // Reduced by 50%
          const gap = 2; // Reduced gap to fit increased count
          const totalWidth = barCount * (barWidth + gap);
          const startX = (w - totalWidth) / 2;

          // Use frequency data for visualizer
          const frequencyData = new Uint8Array(barCount);
          // Get lower frequency range which usually has voice
          const step = Math.floor(bufferLength / barCount / 2);

          for (let i = 0; i < barCount; i++) {
            let val = 0;
            for (let j = 0; j < step; j++) {
              val += dataArray[i * step + j];
            }
            frequencyData[i] = val / step;
          }

          ctx.fillStyle = '#60A5FA'; // Blue-400

          for (let i = 0; i < barCount; i++) {
            // Normalized height 0.0 to 1.0
            const percent = frequencyData[i] / 255;
            // Make it symmetrical/centered vertically
            const height = Math.max(4, percent * h * 0.8); // Min height 4px

            const x = startX + i * (barWidth + gap);
            const y = (h - height) / 2;

            // Fade out effect at edges
            const fromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
            ctx.globalAlpha = Math.max(0, 1 - Math.pow(fromCenter, 3));

            // Draw rounded bar
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, height, 4);
            ctx.fill();
          }
          ctx.globalAlpha = 1; // Reset opacity
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
    sparkMeshRef.current = null;
    originalPositionsRef.current = null;
  };

  const startRecording = async () => {
    setError(null);
    setLiveTranscript('');

    if (!process.env.API_KEY) {
      setError("API Key is missing. Cannot start live session.");
      return;
    }

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

      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        inputAudioContextRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = scriptProcessor;

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: "You are a passive listener. Your goal is to transcribe the conversation. Do not speak unless addressed directly."
          },
          callbacks: {
            onopen: () => {
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
              lastActivityTimeRef.current = performance.now();
              const transcript = message.serverContent?.inputTranscription?.text;
              if (transcript) {
                setLiveTranscript(prev => prev + transcript);
              }
            },
            onclose: () => { },
            onerror: (err) => console.error("Live session error", err)
          }
        });

        // Store the session promise so we can close it later
        sessionPromise.then(session => {
          liveSessionRef.current = session;
        });
      }

      setIsRecordingMode(true);
      setRecordingDuration(0);
      setTimeout(() => startVisualizer(stream), 100);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError("Could not start recording. Please check your connection and microphone.");
      }
      setIsRecordingMode(false);
    }
  };

  const stopAndAnalyze = () => {
    if (mediaRecorderRef.current && isRecordingMode) {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Create a File object from the Blob
        const audioFile = new File([audioBlob], `conversation_${new Date().toLocaleTimeString()}.webm`, { type: 'audio/webm' });

        const newFile: FileInput = {
          file: audioFile,
          previewUrl: URL.createObjectURL(audioBlob),
          type: 'audio'
        };
        analyzeDirectly(newFile);
        cleanupAudioResources();
      };
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudioResources();
      setIsRecordingMode(false);
    }
  };

  const cancelRecording = () => {
    cleanupAudioResources();
    setIsRecordingMode(false);
    setRecordingDuration(0);
    setLiveTranscript('');
  };

  const analyzeDirectly = async (audioFile: FileInput) => {
    setIsRecordingMode(false);
    setIsLoading(true);
    try {
      const contextText = liveTranscript ? `[PARTIAL TRANSCRIPT FROM LIVE SESSION]: ${liveTranscript}` : "";
      const [result, searchVerification] = await Promise.all([
        analyzeContent(contextText, [audioFile]),
        contextText ? verifyScamWithSearch(contextText) : Promise.resolve(undefined)
      ]);
      setAnalysis(result.analysis);
      setSearchResult(searchVerification);
      addToHistory({ ...result.analysis });
    } catch (err: any) {
      setError(err.message || "Something went wrong analyzing the audio.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      const [result, searchVerification] = await Promise.all([
        analyzeContent(text, files),
        text ? verifyScamWithSearch(text) : Promise.resolve(undefined)
      ]);
      setAnalysis(result.analysis);
      setSearchResult(searchVerification);
      addToHistory({ ...result.analysis });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setSearchResult(undefined);
    setText('');
    setFiles([]);
    setError(null);
    setLiveTranscript('');
    setIsRecordingMode(false);
    setActiveMode(null);
  };

  const hasContent = text.trim() || files.length > 0;

  if (analysis) {
    return (
      <div className="space-y-8 animate-slide-up">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-stone-500 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 transition-colors font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Check Another Message
        </button>
        <ResultCard analysis={analysis} searchResult={searchResult} timestamp={Date.now()} />
        <FollowUpChat analysis={analysis} />
      </div>
    );
  }

  if (isRecordingMode) {
    return (
      <div className="fixed inset-0 md:left-72 z-50 bg-canvas dark:bg-black flex flex-col items-center p-4 animate-fade-in">
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
        {/* Simple, elegant header */}
        <div className="text-center z-20 mt-8 mb-4 max-w-2xl flex-shrink-0">
          <h2 className="text-2xl md:text-3xl font-body font-normal text-txt dark:text-white tracking-wide">
            Go ahead. I'm listening
          </h2>
        </div>

        {/* Large centered visualizer */}
        <div className="relative flex-1 w-full max-w-6xl min-h-0 flex items-center justify-center">
          <div ref={canvasContainerRef} className="w-full h-full relative z-10" />
        </div>

        {/* Minimal action buttons at bottom */}
        <div className="flex flex-col items-center gap-6 z-20 mb-8 mt-4 flex-shrink-0">
          {/* Waveform Equalizer */}
          <canvas
            ref={waveformCanvasRef}
            width={400}
            height={40}
            className="w-96 h-10 opacity-80"
          />

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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-semibold mb-6 border border-orange-200/50 dark:border-orange-700/30">
          <Shield className="w-4 h-4" />
          Scam Detection
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-txt dark:text-txt-dark mb-4 tracking-tight leading-tight">
          Is this message <br className="md:hidden" />
          <span className="gradient-text">a scam?</span>
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl mx-auto">
          Share what you received and I'll analyze it for warning signs. Your safety is my priority.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl shadow-sm animate-scale-in">
          <p className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Error
          </p>
          <p className="mt-1 text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Main Input Section */}
      <div className="space-y-6 animate-slide-up stagger-1">

        {/* Live Call Monitor - Featured Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <button
            type="button"
            onClick={startRecording}
            className="relative w-full bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 rounded-3xl p-6 text-left cursor-pointer overflow-hidden border border-stone-700/50 hover:border-orange-500/50 transition-all btn-press"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}></div>
            </div>

            {/* Animated waves */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-20">
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-64 h-64 border-2 border-orange-500 rounded-full animate-ping"
                    style={{ animationDuration: `${2 + i * 0.5}s`, animationDelay: `${i * 0.3}s`, opacity: 0.3 - i * 0.1 }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center gap-6">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Mic className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-md uppercase tracking-wider">
                    Live
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md uppercase tracking-wider">
                    Recommended
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-1">
                  Monitor a Phone Call
                </h3>
                <p className="text-stone-400 text-base">
                  Put your phone on speaker. I'll listen, transcribe, and analyze in real-time.
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl group-hover:bg-orange-500 transition-colors">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent"></div>
          <span className="text-stone-400 dark:text-stone-500 font-medium text-sm">or share content directly</span>
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent"></div>
        </div>

        {/* Input Mode Selector */}
        <div className="grid grid-cols-2 gap-4">
          {/* Text Input Card */}
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`relative p-6 rounded-2xl border-2 transition-all text-left group btn-press ${activeMode === 'text'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10'
              : 'border-stone-700 bg-surface dark:bg-surface-dark hover:border-orange-500/50'
              }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeMode === 'text'
              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
              }`}>
              <FileText className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h4 className={`text-lg font-bold mb-1 ${activeMode === 'text' ? 'text-orange-700 dark:text-orange-300' : 'text-txt dark:text-txt-dark'
              }`}>
              Paste Text
            </h4>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Copy and paste the suspicious message
            </p>
            {activeMode === 'text' && (
              <div className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full"></div>
            )}
          </button>

          {/* Image Upload Card */}
          <button
            type="button"
            onClick={() => {
              setActiveMode('image');
              fileInputRef.current?.click();
            }}
            className={`relative p-6 rounded-2xl border-2 transition-all text-left group btn-press ${activeMode === 'image'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10'
              : 'border-stone-700 bg-surface dark:bg-surface-dark hover:border-orange-500/50'
              }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${activeMode === 'image'
              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
              }`}>
              <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h4 className={`text-lg font-bold mb-1 ${activeMode === 'image' ? 'text-orange-700 dark:text-orange-300' : 'text-txt dark:text-txt-dark'
              }`}>
              Upload Screenshot
            </h4>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Share an image of the message
            </p>
            {activeMode === 'image' && files.length > 0 && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{files.length}</span>
              </div>
            )}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,audio/*"
          multiple
          className="hidden"
        />

        {/* Expanded Input Area */}
        {activeMode && (
          <div className="animate-scale-in">
            {activeMode === 'text' && (
              <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-1 shadow-lg">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the suspicious message here...

Example: 'Hi Grandma, I'm in trouble and need $500 urgently. Please don't tell mom and dad. Send it to this account...'"
                  className="w-full h-48 p-5 text-lg bg-transparent text-txt dark:text-txt-dark focus:outline-none resize-none placeholder-stone-400 dark:placeholder-stone-600"
                  autoFocus
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-sm text-stone-400">
                    {text.length > 0 ? `${text.length} characters` : 'Type or paste your message'}
                  </span>
                  {text && (
                    <button
                      onClick={() => setText('')}
                      className="text-sm text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeMode === 'image' && (
              <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark p-6 shadow-lg">
                {files.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                          {file.type === 'image' ? (
                            <img
                              src={file.previewUrl}
                              alt={file.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Mic className="w-12 h-12 text-stone-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => removeFile(index)}
                              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                            <p className="text-white text-xs truncate">{file.file.name}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add More Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-orange-400 dark:hover:border-orange-500 flex flex-col items-center justify-center gap-2 transition-colors group"
                      >
                        <Upload className="w-8 h-8 text-stone-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm text-stone-400 group-hover:text-orange-500 transition-colors">Add more</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 flex flex-col items-center justify-center gap-3 transition-all group"
                  >
                    <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-xl group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                      <Upload className="w-8 h-8 text-stone-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-stone-600 dark:text-stone-300 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-stone-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyzeForm}
          disabled={isLoading || !hasContent}
          className={`w-full py-5 rounded-2xl text-xl font-bold transition-all btn-press relative overflow-hidden ${isLoading || !hasContent
            ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25 transform hover:scale-[1.01]'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin h-6 w-6" />
              Analyzing for scams...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Shield className="w-6 h-6" />
              {hasContent ? 'Analyze Now' : 'Add content to analyze'}
            </span>
          )}
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-3 pt-4 animate-slide-up stagger-2">
        {[
          { icon: Lock, label: 'Private', desc: 'Data stays with you', color: 'emerald' },
          { icon: Zap, label: 'Instant', desc: 'Results in seconds', color: 'amber' },
          { icon: Heart, label: 'Caring', desc: 'Built for elders', color: 'rose' },
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
