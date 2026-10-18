"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Wand2,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface AudioRecorderProps {
  onAudioReady: (file: File, durationSec: number) => void;
  onAudioCleared?: () => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onAudioReady,
  onAudioCleared,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Animated Waveform Renderer
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#ef4444";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  // Start Real Microphone Recording
  const startRecording = async () => {
    try {
      setStatusMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Audio Context for real-time waveform visualization
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();

      // MediaRecorder setup
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: mimeType,
        });

        setAudioUrl(url);
        setAudioFile(file);
        setIsRecording(false);
        setStatusMessage("Audio captured successfully.");

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        onAudioReady(file, recordingDuration);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatusMessage("Microphone permission denied or device not found. You can use 'Generate Sample Distress Audio' below.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Programmatic 16kHz PCM WAV Generator (Distress Signal Simulator)
  const generateSampleDistressAudio = () => {
    setStatusMessage("Synthesizing 16kHz distress acoustic tone in-memory...");

    const durationSec = 2.0;
    const sampleRate = 16000;
    const toneFreq = 320.0; // High distress acoustic biomarker pitch
    const numChannels = 1;
    const numSamples = Math.floor(sampleRate * durationSec);
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF & fmt chunk
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // 16-bit
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    // Distress waveform: 320 Hz tone with amplitude modulation + 0.6s silence pause
    const pauseStart = Math.floor(0.5 * sampleRate);
    const pauseEnd = Math.floor(1.1 * sampleRate);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      let sample = 0;
      if (i < pauseStart || i >= pauseEnd) {
        const t = i / sampleRate;
        const am = 0.8 + 0.2 * Math.sin(2 * Math.PI * 5 * t);
        const val = 0.5 * Math.sin(2 * Math.PI * toneFreq * t) * am;
        sample = Math.max(-1, Math.min(1, val));
      }
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const wavBlob = new Blob([buffer], { type: "audio/wav" });
    const url = URL.createObjectURL(wavBlob);
    const file = new File([wavBlob], "distress-sample-16khz.wav", {
      type: "audio/wav",
    });

    setAudioUrl(url);
    setAudioFile(file);
    setRecordingDuration(2);
    setStatusMessage("Synthetic 2.0s 16kHz distress audio (.wav) generated.");
    onAudioReady(file, 2.0);
  };

  // Play / Pause Preview
  const togglePlayAudio = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  // Clear Audio
  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioFile(null);
    setRecordingDuration(0);
    setIsPlaying(false);
    setStatusMessage(null);
    if (onAudioCleared) onAudioCleared();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-red-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Live Acoustic Statement Intake
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-700/60 px-3 py-1 text-xs font-bold text-red-400 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              REC {formatTime(recordingDuration)}
            </span>
          )}
          {audioFile && !isRecording && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Audio Ready ({recordingDuration}s)
            </span>
          )}
        </div>
      </div>

      {/* Real-Time HTML5 Canvas Waveform Visualizer */}
      <div className="relative mb-4 h-24 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={96}
          className="h-full w-full object-cover"
        />
        {!isRecording && !audioUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs gap-1">
            <Mic className="h-6 w-6 text-slate-600 mb-1" />
            <span>Click &apos;Start Recording&apos; or use the simulator button below</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950 transition-all cursor-pointer disabled:opacity-50"
          >
            <Mic className="h-4 w-4" />
            Start Voice Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-950 transition-all cursor-pointer animate-pulse"
          >
            <Square className="h-4 w-4" />
            Stop &amp; Analyze
          </button>
        )}

        {/* 1-Click Synthetic Audio Generator */}
        <button
          type="button"
          onClick={generateSampleDistressAudio}
          disabled={disabled || isRecording}
          className="flex items-center gap-2 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/60 px-4 py-2.5 text-xs font-bold text-indigo-300 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          title="Generates a calibrated 2-second 16kHz WAV buffer containing a 320Hz distress tone with pause for instant testing without a mic"
        >
          <Wand2 className="h-4 w-4 text-indigo-400" />
          <span>Generate Sample Distress Audio (.wav)</span>
          <Sparkles className="h-3 w-3 text-indigo-400" />
        </button>

        {/* Audio Playback Preview & Reset */}
        {audioUrl && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
              {isPlaying ? "Pause" : "Listen Preview"}
            </button>

            <button
              type="button"
              onClick={clearAudio}
              className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Remove recorded audio"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <audio
              ref={audioElementRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Helper Status Message */}
      {statusMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
