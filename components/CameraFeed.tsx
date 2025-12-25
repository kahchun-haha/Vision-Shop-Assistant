import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { CameraOff, Eye } from 'lucide-react';

interface CameraFeedProps {
  isProcessing: boolean;
  isAutoScanning: boolean;
}

export interface CameraFeedHandle {
  captureFrame: () => string | null;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(({ isProcessing, isAutoScanning }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string>('');

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.7);
        }
      }
      return null;
    }
  }));

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        setError("Camera access denied. Check permissions.");
      }
    };

    startCamera();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-[50vh] bg-zinc-900 rounded-3xl overflow-hidden border-8 transition-colors duration-500 ${isAutoScanning ? (isProcessing ? 'border-blue-500' : 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]') : 'border-zinc-800'}`}>
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-red-400 p-8 text-center">
          <CameraOff size={64} className="mb-4" />
          <p className="text-2xl font-bold">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md ${isAutoScanning ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-white'}`}>
              <Eye size={20} className={isAutoScanning ? 'animate-pulse' : ''} />
              <span className="font-bold text-sm">{isAutoScanning ? (isProcessing ? 'IDENTIFYING...' : 'LIVE SCANNING') : 'PAUSED'}</span>
            </div>
          </div>

          {/* Large Center Prompt */}
          {!isProcessing && isAutoScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-dashed border-white/40 rounded-full animate-[ping_3s_linear_infinite]"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
});