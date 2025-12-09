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
    if (liveSessionRef.current) {
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
      const newFiles: FileInput[] = Array.from(e.target.files).map((file) => ({
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
    analyserRef.current.fftSize = 1024; 
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvasContainerRef.current.clientWidth;
    const height = canvasContainerRef.current.clientHeight;

    const scene = new THREE.Scene();
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    threeCameraRef.current = camera;
    camera.position.z = 3.5; // Further back to show medium-sized sphere 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;

    // Create a clean, medium-sized sphere
    const particleCount = 30000; // Optimal for smooth, clean appearance
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Elegant gradient: magenta/pink (top) → purple (middle) → blue (bottom)
    const colorTop = new THREE.Color(0xFF1493);    // Deep pink/magenta
    const colorMiddle = new THREE.Color(0x8B00FF);  // Purple
    const colorBottom = new THREE.Color(0x00BFFF);  // Deep sky blue

    const radius = 1.0; // Medium-sized sphere radius

    // Create evenly distributed points on sphere surface (Fibonacci sphere for uniform distribution)
    for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Create gradient: top (magenta) → middle (purple) → bottom (blue)
        const normalizedY = (y / radius + 1) / 2; // 0 (bottom) to 1 (top)
        let c: THREE.Color;
        if (normalizedY > 0.5) {
          // Top half: magenta to purple
          const t = (normalizedY - 0.5) * 2; // 0 to 1
          c = new THREE.Color().copy(colorMiddle).lerp(colorTop, t);
        } else {
          // Bottom half: purple to blue
          const t = normalizedY * 2; // 0 to 1
          c = new THREE.Color().copy(colorBottom).lerp(colorMiddle, t);
        }
        
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // No need to store original positions since we're keeping it as a clean sphere
    originalPositionsRef.current = null;

    const material = new THREE.PointsMaterial({
        size: 0.015, // Refined size for clean, polished look
        vertexColors: true,
        transparent: true,
        opacity: 0.85, // Slightly transparent for depth
        blending: THREE.AdditiveBlending, // Glowing effect
        depthWrite: false,
        sizeAttenuation: true, // Natural perspective
    });

    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);
    sphereMeshRef.current = sphere;

    // Add subtle sparkles on the surface for visual interest
    const sparkCount = 800;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);

    for(let i=0; i<sparkCount; i++) {
       const r = radius * 1.02; // Just slightly outside the sphere surface
       const theta = Math.random() * Math.PI * 2;
       const phi = Math.acos(2 * Math.random() - 1);
       sparkPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
       sparkPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
       sparkPos[i*3+2] = r * Math.cos(phi);
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    const sparkMat = new THREE.PointsMaterial({
        color: 0xFFFFFF, // White sparks for clean look
        size: 0.02,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    });

    const sparkMesh = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkMesh);
    sparkMeshRef.current = sparkMesh;

    const animate = () => {
        if (!analyserRef.current || !sphereMeshRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(animate);
        analyserRef.current.getByteFrequencyData(dataArray);

        const time = performance.now() * 0.001;
        
        // Smooth, slow rotation for clean globe effect
        sphereMeshRef.current.rotation.y = time * 0.1;
        
        // Optional: very subtle pulse based on audio (minimal to keep it clean)
        let sum = 0;
        const range = Math.floor(bufferLength * 0.3);
        for(let i=0; i<range; i++) sum += dataArray[i];
        const volume = range > 0 ? sum / range : 0;
        const normVol = volume / 255;
        const pulse = 1.0 + (normVol * 0.03); // Very subtle pulse (3% max)
        
        sphereMeshRef.current.scale.set(pulse, pulse, pulse);

        // Rotate sparks with the sphere for cohesive look
        if (sparkMeshRef.current) {
            sparkMeshRef.current.rotation.y = time * 0.1;
            
            // Subtle sparkle animation
            const sparkle = Math.sin(time * 3) * 0.1 + 0.3;
            (sparkMeshRef.current.material as THREE.PointsMaterial).opacity = sparkle;
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
    if (sparkMeshRef.current) {
        sparkMeshRef.current.geometry.dispose();
        (sparkMeshRef.current.material as THREE.Material).dispose();
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

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
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
            onclose: () => {},
            onerror: (err) => console.error("Live session error", err)
        }
      });
      
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
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-fade-in">
              {/* Simple, elegant header */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-20">
                  <h2 className="text-2xl md:text-3xl font-body font-normal text-white tracking-wide">
                      Go ahead. I'm listening
                  </h2>
              </div>
              
              {/* Large centered visualizer */}
              <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
                  <div ref={canvasContainerRef} className="w-full h-full relative z-10" />
              </div>
              
              {/* Minimal action buttons at bottom */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                  <button 
                    onClick={cancelRecording} 
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/20"
                    aria-label="Cancel"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={stopAndAnalyze} 
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-sm border border-white/20 text-sm"
                  >
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
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <button
                    type="button"
                    onClick={startRecording}
            className="relative w-full bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 rounded-3xl p-8 text-left cursor-pointer overflow-hidden border border-stone-700/50 hover:border-orange-500/50 transition-all btn-press"
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
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50"></div>
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
            className={`relative p-6 rounded-2xl border-2 transition-all text-left group btn-press ${
              activeMode === 'text'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10'
                : 'border-stone-200 dark:border-stone-700 bg-surface dark:bg-surface-dark hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              activeMode === 'text'
                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
            }`}>
              <FileText className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h4 className={`text-lg font-bold mb-1 ${
              activeMode === 'text' ? 'text-orange-700 dark:text-orange-300' : 'text-txt dark:text-txt-dark'
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
            className={`relative p-6 rounded-2xl border-2 transition-all text-left group btn-press ${
              activeMode === 'image'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10'
                : 'border-stone-200 dark:border-stone-700 bg-surface dark:bg-surface-dark hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              activeMode === 'image'
                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 group-hover:bg-stone-200 dark:group-hover:bg-stone-700'
            }`}>
              <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h4 className={`text-lg font-bold mb-1 ${
              activeMode === 'image' ? 'text-orange-700 dark:text-orange-300' : 'text-txt dark:text-txt-dark'
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
          className={`w-full py-5 rounded-2xl text-xl font-bold transition-all btn-press relative overflow-hidden ${
            isLoading || !hasContent
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
