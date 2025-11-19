import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface CameraProps {
  onTakePhoto: (dataUrl: string) => void;
  lang: Language;
}

export const Camera: React.FC<CameraProps> = ({ onTakePhoto, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamError, setStreamError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setStreamError(true);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleShutter = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Make it square
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;

      // Calculate crop to center
      const xOffset = (video.videoWidth - size) / 2;
      const yOffset = (video.videoHeight - size) / 2;

      // Horizontal flip for mirror effect (selfie mode)
      context.translate(size, 0);
      context.scale(-1, 1);

      context.drawImage(
        video,
        xOffset, yOffset, size, size,
        0, 0, size, size
      );

      const dataUrl = canvas.toDataURL('image/png');
      onTakePhoto(dataUrl);
    }
  };

  return (
    <div className="relative w-[380px] h-[380px] md:w-[420px] md:h-[420px] select-none z-20 group">
      
      {/* Main Camera Image */}
      {/* IMPORTANT: Move your 'Retro Camera 1024.webp' to 'assets/camera.webp' */}
      <img 
        src="/assets/camera.webp" 
        alt="InstaGen Camera" 
        className="w-full h-full object-contain drop-shadow-2xl pointer-events-none relative z-20"
        onError={(e) => {
            setImageError(true);
            (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Fallback if image missing */}
      {imageError && (
        <div className="absolute inset-0 bg-[#FDF6E3] border-4 border-dashed border-gray-400 rounded-3xl flex flex-col items-center justify-center p-4 text-center z-10">
            <span className="text-2xl mb-2">📸</span>
            <p className="text-gray-500 font-bold text-sm">Image Missing</p>
            <p className="text-xs text-gray-400 mt-1">Move file to:<br/><code>/assets/camera.webp</code></p>
        </div>
      )}

      {/* Lens / Video Feed
          Positioned to match the lens of the Instax Square style camera.
          Adjusted based on actual camera image layout.
      */}
      <div className="absolute top-[54.5%] left-[62.2%] transform -translate-x-1/2 -translate-y-1/2 w-[43%] h-[43%] rounded-full overflow-hidden bg-[#1a1a1a] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-30 ring-4 ring-black/80">
          {!streamError ? (
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 opacity-90 hover:opacity-100 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <span className="text-xs text-gray-500">No Signal</span>
            </div>
          )}
          
          {/* Lens Reflection / Gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-[15%] right-[15%] w-[10%] h-[5%] bg-white/20 rounded-full rotate-45 blur-[2px] pointer-events-none"></div>
      </div>

      {/* Shutter Button Hotspot
          Adjusted position to match the actual camera image layout.
      */}
      <button
        onClick={handleShutter}
        className="absolute bottom-[37.5%] left-[15.5%] w-[14%] h-[14%] rounded-full z-30 cursor-pointer transition-all active:scale-90 focus:outline-none group-hover:bg-white/5"
        title={lang === 'en' ? 'Take Photo' : '拍照'}
        aria-label="Shutter"
      >
        {/* Visual ripple hint on hover */}
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 animate-ping-slow"></span>
      </button>

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};