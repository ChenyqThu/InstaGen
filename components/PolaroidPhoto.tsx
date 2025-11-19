import React, { useEffect, useRef, useState } from 'react';
import { Language, PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { FRAME_STYLES, TRANSLATIONS } from '../constants';

interface PolaroidPhotoProps {
  photo: PhotoData;
  lang: Language;
  isLatest: boolean;
  onUpdate: (id: string, updates: Partial<PhotoData>) => void;
  onSelect: (id: string) => void;
  onEditStart: (id: string) => void;
}

export const PolaroidPhoto: React.FC<PolaroidPhotoProps> = ({
  photo,
  lang,
  isLatest,
  onUpdate,
  onSelect,
  onEditStart,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (photo.status === PhotoStatus.DEVELOPING) {
      const timer = setTimeout(() => {
        onUpdate(photo.id, { status: PhotoStatus.DONE });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [photo.status, photo.id, onUpdate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't drag if clicking the edit button
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.preventDefault();
    setIsDragging(true);
    onSelect(photo.id);
    dragStart.current = {
      x: e.clientX - photo.x,
      y: e.clientY - photo.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    onUpdate(photo.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnimationClass = () => {
    if (isLatest && photo.status === PhotoStatus.DEVELOPING) return 'animate-eject z-10';
    return '';
  };

  const frameClass = FRAME_STYLES[photo.frameStyle] || FRAME_STYLES[PhotoFrameStyle.CLASSIC];

  return (
    <div
      className={`absolute flex flex-col p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 cursor-move ${getAnimationClass()} ${isDragging ? 'scale-105 shadow-2xl z-50' : 'z-0'}`}
      style={{
        left: photo.x,
        top: photo.y,
        transform: `rotate(${photo.rotation}deg)`,
        width: '240px',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full pb-10 pt-3 px-3 shadow-sm ${frameClass} transition-colors duration-300 relative group`}>
        {/* Image Area */}
        <div className="aspect-square w-full bg-gray-900 overflow-hidden relative">
          <img
            src={photo.dataUrl}
            alt="Polaroid"
            className={`w-full h-full object-cover select-none pointer-events-none ${photo.status === PhotoStatus.DEVELOPING ? 'animate-develop' : ''}`}
          />
          {photo.status === PhotoStatus.EDITING && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        {/* Caption */}
        <div className="mt-3 flex justify-between items-end px-1 font-hand text-xs opacity-80 select-none text-gray-600">
          <span>{photo.status === PhotoStatus.EDITING ? t.processing : formatDate(photo.timestamp)}</span>
          {photo.promptUsed && <span className="text-xs opacity-50">✨</span>}
        </div>

        {/* Edit/Expand Button (Visible on hover or if it's the latest one) */}
        <div className={`absolute bottom-3 right-3 transition-opacity duration-200 ${isHovered || isLatest ? 'opacity-100' : 'opacity-0'}`}>
            <button
                onClick={() => onEditStart(photo.id)}
                className="w-8 h-8 bg-white/90 hover:bg-blue-500 hover:text-white text-gray-600 rounded-full shadow-md flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                title={t.expand}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};