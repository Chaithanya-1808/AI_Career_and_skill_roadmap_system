import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Camera, Eye, Lock, CheckCircle2, AlertTriangle,
  FileText, Clock, RefreshCw
} from 'lucide-react';

export const IntegrityPage: React.FC = () => {
  const [streamActive, setStreamActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<string>('Not tested');
  const [deviceLabel, setDeviceLabel] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startTest = async () => {
    try {
      setCameraStatus('Requesting browser permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        setDeviceLabel(videoTracks[0].label || 'Standard USB/Integrated Camera');
      }
      setStreamActive(true);
      setCameraStatus('Ready & Active');
    } catch (err: any) {
      console.warn('Camera test error', err);
      setCameraStatus('Permission denied or camera device in use by another application');
      setStreamActive(false);
    }
  };

  const stopTest = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
    setCameraStatus('Stream stopped');
  };

  useEffect(() => {
    return () => {
      stopTest();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Assessment Integrity & Privacy Protocol
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Transparent, consent-based examination monitoring adhering to student privacy and data minimization.
        </p>
      </div>

      {/* Hardware Diagnostics Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Webcam Hardware & Permission Test</h2>
          </div>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            streamActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {cameraStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="w-full h-48 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-300 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!streamActive && (
              <span className="text-xs text-slate-400 font-medium text-center px-4">
                Click "Run Camera Test" to preview local webcam feed.
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Detected Device:</span>
              <span className="text-slate-500">{deviceLabel || 'None detected yet'}</span>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block">Permissions Scope:</span>
              <span className="text-slate-500">Video only (Audio is never requested or recorded)</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {!streamActive ? (
                <button
                  onClick={startTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors"
                >
                  Run Camera Test
                </button>
              ) : (
                <button
                  onClick={stopTest}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Stop Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Architecture Guarantee Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Student Privacy Charter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What We Monitor</span>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li>Active student presence in the camera preview during exam</li>
              <li>Browser tab visibility changes (`visibilitychange` API)</li>
              <li>Window blur and focus losses during active timer</li>
              <li>Server-side timer validation and anti-duplicate protection</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>What We Guarantee</span>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li>NO video recordings saved to server storage by default</li>
              <li>NO audio or microphone access requested</li>
              <li>NO facial recognition, gaze tracking, or biometric inferences</li>
              <li>Signals treated as human review flags, not automated failure</li>
              <li>Alternative non-camera assessment format always available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
