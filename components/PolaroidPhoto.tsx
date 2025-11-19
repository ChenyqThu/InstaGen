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
  const [dragTilt, setDragTilt] = useState(0);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (photo.status === PhotoStatus.DEVELOPING) {
      const timer = setTimeout(() => {
        // When animation completes, adjust y position to account for translateY(-70%) removal
        // Photo height is ~490px (340px image + 110px bottom padding + 40px extra) but scaled to 0.5 = ~245px
        // The translateY(-70%) is applied to the scaled element, so offset is 170px (70% of 245px)
        const translateOffset = 170; // -70% of scaled photo height
        const finalY = photo.y - translateOffset;
        onUpdate(photo.id, { status: PhotoStatus.DONE, y: finalY });
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [photo.status, photo.id, photo.y, onUpdate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't drag if clicking the edit button
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragTilt(0);
    hasMoved.current = false;
    onSelect(photo.id);
    dragStart.current = {
      x: e.clientX - photo.x,
      y: e.clientY - photo.y,
    };
    dragStartMouse.current = {
      x: e.clientX,
      y: e.clientY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Mark that the photo has been moved
    hasMoved.current = true;

    // Calculate tilt based on horizontal offset from drag start position
    const horizontalOffset = e.clientX - dragStartMouse.current.x;
    const tilt = Math.max(-15, Math.min(15, horizontalOffset * 0.02));
    setDragTilt(tilt);

    onUpdate(photo.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      // Only apply random rotation if the photo was actually dragged (not just clicked)
      if (hasMoved.current) {
        const randomAdjustment = Math.random() * 10 - 5;
        const finalRotation = photo.rotation + randomAdjustment;
        onUpdate(photo.id, { rotation: finalRotation });
      }
      setDragTilt(0);
    }
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
      className={`absolute cursor-move ${getAnimationClass()} ${isDragging ? 'scale-105 z-50' : 'z-0'}`}
      style={{
        left: photo.x,
        top: photo.y,
        transform: `rotate(${photo.rotation + dragTilt}deg)`,
        width: '170px',
        touchAction: 'none',
        transition: isDragging ? 'box-shadow 0.2s' : 'transform 0.2s, box-shadow 0.2s',
        boxShadow: isDragging
          ? '0 20px 40px rgba(0, 0, 0, 0.4)'
          : '0 4px 10px rgba(0, 0, 0, 0.2)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full p-[10px] pb-[55px] ${frameClass} transition-colors duration-300 relative group`}>
        {/* Image Area */}
        <div className="w-full h-[170px] overflow-hidden relative border border-gray-200">
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
        
        {/* Caption - Editable text */}
        <div
          contentEditable
          suppressContentEditableWarning
          className="absolute bottom-[26px] left-[10px] right-[10px] text-center font-hand text-[14px] text-[#222] opacity-90 leading-[1.1] outline-none cursor-text min-h-[18px]"
          style={{
            WebkitUserSelect: 'text',
            userSelect: 'text'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          onInput={(e) => {
            const target = e.currentTarget;
            const text = target.textContent || '';
            if (text.length > 30) {
              const trimmed = text.slice(0, 30);
              target.textContent = trimmed;
              // Move cursor to end
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(target);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
            onUpdate(photo.id, { caption: target.textContent || undefined });
          }}
          onBlur={(e) => {
            if (!e.currentTarget.textContent?.trim()) {
              e.currentTarget.textContent = photo.caption || t.defaultCaption;
            }
          }}
        >
          {photo.caption || t.defaultCaption}
        </div>

        {/* Date - Bottom of frame */}
        <div className="absolute bottom-2 left-[10px] right-[10px] text-center font-hand text-[10px] select-none text-[#555] leading-[1.1] pointer-events-none">
          {formatDate(photo.timestamp)}
        </div>

        {/* AI Badge - Bottom left if edited */}
        {photo.promptUsed && (
          <div className="absolute bottom-2 left-2 text-xs opacity-60 pointer-events-none">🪄</div>
        )}
      </div>

      {/* Edit/Expand Button (Visible on hover only) - Outside frame */}
      <div className={`absolute -top-3 -right-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onEditStart(photo.id)}
          className="w-9 h-9 bg-gradient-to-br from-white to-[#F5F5F4] hover:from-[#F4A261] hover:to-[#E76F51] text-[#E76F51] hover:text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-[#E76F51]/30 hover:border-[#E76F51]"
          title={t.expand}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        </button>
      </div>
    </div>
  );
};