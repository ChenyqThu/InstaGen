import React, { useRef, useEffect } from 'react';
import { PhotoFrameStyle } from '../types';
import { FRAME_STYLES, TRANSLATIONS } from '../constants';

interface PolaroidFrameProps {
  dataUrl: string;
  caption?: string;
  timestamp: number;
  frameStyle: PhotoFrameStyle;
  scale?: number;
  editable?: boolean;
  onCaptionChange?: (text: string) => void;
  onCaptionBlur?: () => void;
  isProcessing?: boolean;
  promptUsed?: string;
  lang?: 'en' | 'zh';
  className?: string;
}

export const PolaroidFrame = React.forwardRef<HTMLDivElement, PolaroidFrameProps>(({
  dataUrl,
  caption,
  timestamp,
  frameStyle,
  scale = 1,
  editable = false,
  onCaptionChange,
  onCaptionBlur,
  isProcessing = false,
  promptUsed,
  lang = 'en',
  className = '',
}, ref) => {
  const t = TRANSLATIONS[lang];
  const frameClass = FRAME_STYLES[frameStyle] || FRAME_STYLES[PhotoFrameStyle.CLASSIC];
  const internalRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  // Sync forwarded ref with internal ref
  React.useImperativeHandle(ref, () => internalRef.current!, []);

  // Sync caption text manually to avoid cursor jumping
  useEffect(() => {
    if (captionRef.current) {
      const targetText = caption || (editable ? '' : t.defaultCaption);
      if (captionRef.current.textContent !== targetText) {
        captionRef.current.textContent = targetText;
      }
    }
  }, [caption, editable, t.defaultCaption]);

  // Base dimensions (at scale=1)
  const BASE_WIDTH = 340;
  const BASE_PADDING = 20;
  const BASE_BOTTOM_PADDING = 110;
  const IMAGE_HEIGHT = 340;

  const width = BASE_WIDTH * scale;
  const padding = BASE_PADDING * scale;
  const bottomPadding = BASE_BOTTOM_PADDING * scale;
  const imageHeight = IMAGE_HEIGHT * scale;

  // Font sizes
  const captionSize = 28 * scale;
  const dateSize = 20 * scale;
  const badgeSize = 24 * scale; // ~1.5rem at scale 1

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      ref={internalRef}
      className={`${frameClass} relative box-border ${className}`}
      style={{
        width: `${width}px`,
        padding: `${padding}px`,
        paddingBottom: `${bottomPadding}px`,
        boxShadow: scale === 1 ? '0 8px 20px rgba(0, 0, 0, 0.2)' : 'none', // Only show shadow on preview
      }}
    >
      {/* Image Area */}
      <div
        className="w-full overflow-hidden relative border-gray-200"
        style={{
          height: `${imageHeight}px`,
          borderWidth: `${2 * scale}px`
        }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${dataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <div
                className="animate-spin rounded-full border-white/30 border-t-white mb-3"
                style={{
                  width: `${40 * scale}px`,
                  height: `${40 * scale}px`,
                  borderWidth: `${4 * scale}px`
                }}
              ></div>
              <span
                className="font-medium tracking-wide animate-pulse"
                style={{ fontSize: `${14 * scale}px` }}
              >
                {t.processing}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div
        ref={captionRef}
        contentEditable={editable}
        suppressContentEditableWarning
        className="absolute text-center font-hand text-[#222] opacity-90 leading-[1.1] outline-none"
        style={{
          bottom: `${52 * scale}px`,
          left: `${20 * scale}px`,
          right: `${20 * scale}px`,
          fontSize: `${captionSize}px`,
          minHeight: `${36 * scale}px`,
          cursor: editable ? 'text' : 'default',
          userSelect: editable ? 'text' : 'none',
          WebkitUserSelect: editable ? 'text' : 'none',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onInput={(e) => {
          if (!editable || !onCaptionChange) return;

          const target = e.currentTarget;
          const text = target.textContent || '';

          if (text.length > 30) {
            const trimmed = text.slice(0, 30);
            if (target.textContent !== trimmed) {
              target.textContent = trimmed;
              // Move cursor to end
              const range = document.createRange();
              const sel = window.getSelection();
              if (target.firstChild) {
                range.setStart(target.firstChild, trimmed.length);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }
            }
            onCaptionChange(trimmed);
          } else {
            onCaptionChange(text);
          }
        }}
        onBlur={(e) => {
          if (onCaptionBlur) onCaptionBlur();
          const text = e.currentTarget.textContent?.trim();
          if (!text) {
            e.currentTarget.textContent = caption || t.defaultCaption;
          }
        }}
      />

      {/* Placeholder if empty and editable (handled by CSS usually, but here we just rely on content) */}
      {editable && !caption && (
        <div
          className="absolute text-center font-hand text-gray-400 pointer-events-none"
          style={{
            bottom: `${52 * scale}px`,
            left: `${20 * scale}px`,
            right: `${20 * scale}px`,
            fontSize: `${captionSize}px`,
            lineHeight: '1.1'
          }}
        >
          {t.defaultCaption}
        </div>
      )}

      {/* Date */}
      <div
        className="absolute text-center font-hand select-none text-[#555] leading-[1.1] pointer-events-none"
        style={{
          bottom: `${16 * scale}px`, // approx 4 (scale 0.25) -> 16 (scale 1)
          left: `${20 * scale}px`,
          right: `${20 * scale}px`,
          fontSize: `${dateSize}px`
        }}
      >
        {formatDate(timestamp)}
      </div>

      {/* AI Badge */}
      {promptUsed && (
        <div
          className="absolute opacity-60 pointer-events-none"
          style={{
            bottom: `${16 * scale}px`,
            left: `${16 * scale}px`,
            fontSize: `${badgeSize}px`
          }}
        >
          🪄
        </div>
      )}
    </div>
  );
});

PolaroidFrame.displayName = 'PolaroidFrame';
