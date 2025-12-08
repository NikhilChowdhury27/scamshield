import React, { useState, useRef, useEffect } from 'react';
import { ScamAnalysis, FileInput, SearchVerificationResult } from '../types';
import { analyzeContent, verifyScamWithSearch } from '../services/geminiService';
import ResultCard from '../components/ResultCard';
import FollowUpChat from '../components/FollowUpChat';
import { useScamHistory } from '../hooks/useScamHistory';
import { Mic, Image as ImageIcon, Loader2, Trash2, X, Activity, AlignLeft } from 'lucide-react';
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
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    camera.position.z = 2.2; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainerRef.current.appendChild(renderer.domElement);
    threeRendererRef.current = renderer;

    const particleCount = 280000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorBottom = new THREE.Color(0x240046); 
    const colorTop = new THREE.Color(0xff006e);    

    const radius = 1.5;

    for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const normalizedY = (y / radius + 1) / 2;
        const c = new THREE.Color().copy(colorBottom).lerp(colorTop, normalizedY);
        
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const originalPositions = new Float32Array(positions);
    originalPositionsRef.current = originalPositions;

    const material = new THREE.PointsMaterial({
        size: 0.012, 
        vertexColors: true,
        transparent: true,
        opacity: 1.0, 
        blending: THREE.NormalBlending,
        depthWrite: false,
    });

    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);
    sphereMeshRef.current = sphere;

    const sparkCount = 2500;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);

    for(let i=0; i<sparkCount; i++) {
       const r = radius * (1.0 + Math.random() * 0.3);
       const theta = Math.random() * Math.PI * 2;
       const phi = Math.acos(2 * Math.random() - 1);
       sparkPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
       sparkPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
       sparkPos[i*3+2] = r * Math.cos(phi);
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    const sparkMat = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.015,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const sparkMesh = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkMesh);
    sparkMeshRef.current = sparkMesh;

    const animate = () => {
        if (!analyserRef.current || !sphereMeshRef.current || !originalPositionsRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(animate);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        const range = Math.floor(bufferLength * 0.3);
        for(let i=0; i<range; i++) sum += dataArray[i];
        const volume = range > 0 ? sum / range : 0;
        const normVol = volume / 255;

        const time = performance.now() * 0.001;
        const currentPositions = sphereMeshRef.current.geometry.attributes.position.array;
        
        const spike = normVol * 0.4;
        const baseAmp = 0.08;
        const f1 = 4.0;
        const f2 = 5.0;
        const speed = 1.0;

        for(let i=0; i < particleCount; i++) {
            const idx = i * 3;
            const ox = originalPositionsRef.current[idx];
            const oy = originalPositionsRef.current[idx+1];
            const oz = originalPositionsRef.current[idx+2];

            const wave = Math.sin(ox * f1 + time * speed) * Math.cos(oy * f2 + time * speed);
            const displacement = wave * (baseAmp + spike);
            const scale = 1 + displacement;

            currentPositions[idx] = ox * scale;
            currentPositions[idx+1] = oy * scale;
            currentPositions[idx+2] = oz * scale;
        }
        
        sphereMeshRef.current.geometry.attributes.position.needsUpdate = true;
        sphereMeshRef.current.rotation.y = time * 0.15;

        if (sparkMeshRef.current) {
            sparkMeshRef.current.rotation.y -= 0.05;
            sparkMeshRef.current.rotation.x += 0.02;

            const timeSinceActivity = performance.now() - lastActivityTimeRef.current;
            const isProcessing = timeSinceActivity < 300;
            
            let targetOpacity = 0.1; 
            
            if (isProcessing) {
                targetOpacity = 0.8 + Math.random() * 0.2;
                const sparkScale = 1.0 + Math.sin(time * 20) * 0.05;
                sparkMeshRef.current.scale.set(sparkScale, sparkScale, sparkScale);
            } else {
                targetOpacity = 0.1 + Math.sin(time * 2) * 0.05;
                sparkMeshRef.current.scale.set(1, 1, 1);
            }

            const currentOpacity = (sparkMeshRef.current.material as THREE.PointsMaterial).opacity;
            (sparkMeshRef.current.material as THREE.PointsMaterial).opacity += (targetOpacity - currentOpacity) * 0.2;
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
  };

  if (analysis) {
    return (
      <div className="space-y-8 animate-fade-in">
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors font-medium text-lg"
        >
          ← Check Another Message
        </button>
        <ResultCard analysis={analysis} searchResult={searchResult} timestamp={Date.now()} />
        <FollowUpChat analysis={analysis} />
      </div>
    );
  }

  if (isRecordingMode) {
      return (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-lg space-y-6 text-center flex flex-col h-full max-h-[90vh]">
                  <div className="flex-shrink-0 space-y-2 mt-4">
                      <h2 className="text-2xl font-medium text-white/90">Go ahead, I'm listening</h2>
                  </div>
                  <div className="relative h-80 w-full flex items-center justify-center flex-shrink-0">
                      <div ref={canvasContainerRef} className="w-full h-full relative z-10" />
                      <div className="absolute z-20 font-mono text-xl text-white/50 bottom-0">
                          {formatTime(recordingDuration)}
                      </div>
                  </div>
                  <div className="flex-grow bg-slate-900/50 rounded-3xl border border-slate-800 p-6 text-left overflow-hidden flex flex-col w-full shadow-inner backdrop-blur-sm">
                      <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700" ref={transcriptBoxRef}>
                          {liveTranscript ? (
                              <p className="whitespace-pre-wrap text-lg text-slate-200 leading-relaxed font-light">{liveTranscript}</p>
                          ) : (
                              <div className="flex h-full items-center justify-center gap-3">
                                  <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                                  <p className="text-slate-500 italic">Listening for speech...</p>
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="flex items-center gap-4 w-full flex-shrink-0 pb-4">
                      <button onClick={cancelRecording} className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all flex-shrink-0">
                          <X className="w-6 h-6" />
                      </button>
                      <button onClick={stopAndAnalyze} className="flex-grow py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          Stop & Analyze
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-txt dark:text-txt-dark mb-4 tracking-tight">
          Not sure if it's safe?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Paste the message or monitor a call. We'll help you check if it looks like a scam.
        </p>
      </div>

      <div className="bg-surface dark:bg-surface-dark rounded-3xl shadow-lg border border-border dark:border-border-dark overflow-hidden transition-colors">
        <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                1. Share the details
            </h3>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded shadow-sm">
               <p className="font-bold">Notice</p>
               <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full relative overflow-hidden group rounded-2xl border-2 border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all p-8 flex flex-col md:flex-row items-center gap-6 text-left cursor-pointer shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700"
                  >
                     <div className="w-20 h-20 rounded-full bg-white dark:bg-blue-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                     </div>
                     <div className="flex-grow">
                         <h3 className="text-2xl font-bold text-txt dark:text-txt-dark mb-1">Monitor Live Call</h3>
                         <p className="text-gray-600 dark:text-gray-300 text-lg">
                             Put your phone on speaker. We'll show you the text live and analyze for scams.
                         </p>
                     </div>
                     <div className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-full font-bold">
                         Start Listening
                     </div>
                  </button>
              </div>

              <div className="space-y-3">
                 <label htmlFor="message-text" className="block text-lg font-bold text-txt dark:text-txt-dark">
                   Or paste text
                 </label>
                 <textarea
                    id="message-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. 'I'm your grandson, send money...'"
                    className="w-full h-40 p-4 text-lg bg-canvas dark:bg-canvas-dark text-txt dark:text-txt-dark border-2 border-border dark:border-border-dark rounded-2xl focus:border-blue-500 focus:bg-surface dark:focus:bg-surface-dark focus:ring-0 resize-none transition-colors placeholder-gray-400 dark:placeholder-gray-600"
                  />
              </div>

              <div className="space-y-3">
                 <label className="block text-lg font-bold text-txt dark:text-txt-dark">
                    Upload Screenshot
                 </label>
                 <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-border dark:border-border-dark rounded-2xl hover:bg-canvas dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer bg-surface dark:bg-surface-dark"
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" />
                    <span className="text-gray-500 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">Select Image File</span>
                 </button>
              </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*"
            multiple
            className="hidden"
          />

          {files.length > 0 && (
              <div className="flex flex-col gap-2 bg-canvas dark:bg-gray-700/30 p-4 rounded-xl border border-border dark:border-border-dark">
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Attached Files</p>
                  {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-surface dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark shadow-sm">
                          <span className="text-sm font-medium truncate max-w-[200px] text-txt dark:text-txt-dark">{file.file.name}</span>
                          <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          )}

          <div className="pt-4 border-t border-border dark:border-border-dark">
            <button
                onClick={handleAnalyzeForm}
                disabled={isLoading || (!text && files.length === 0)}
                className={`w-full py-4 rounded-xl text-xl font-bold shadow-sm transition-all ${
                isLoading || (!text && files.length === 0)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-primary dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white transform hover:scale-[1.01]'
                }`}
            >
                {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin h-6 w-6" />
                    Analyzing...
                </span>
                ) : (
                'Analyze Text / File'
                )}
            </button>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-gray-500 dark:text-gray-400 pt-8">
            <div className="p-4 bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
                <span className="block text-3xl mb-2">🔒</span>
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Private</h3>
                <p className="text-sm">We don't keep your data.</p>
            </div>
            <div className="p-4 bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
                <span className="block text-3xl mb-2">⚡</span>
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Fast</h3>
                <p className="text-sm">Answers in seconds.</p>
            </div>
            <div className="p-4 bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark">
                <span className="block text-3xl mb-2">👵</span>
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Simple</h3>
                <p className="text-sm">No confusing tech words.</p>
            </div>
        </div>
    </div>
  );
};

export default CheckMessageView;
