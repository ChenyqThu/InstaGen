import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Share2, Lock, Trash2, Globe } from 'lucide-react';
import { SavedPhoto } from '@/src/services/photoService';
import { PolaroidFrame } from '@/components/PolaroidFrame';
import { PokemonCard } from '@/components/pokemon-css/PokemonCard';
import pokemonData from '@/components/pokemon-css/data.json';
import { PhotoFrameStyle, Language } from '@/types';
import { EDIT_OPTIONS, FRAME_STYLES, TRANSLATIONS } from '@/constants';
import { editImageWithGemini } from '@/services/geminiService';
import { useUsageLimit } from '@/src/hooks/useUsageLimit';
import { useAuth } from '@/src/contexts/AuthContext';

interface GalleryPhotoModalProps {
  photo: SavedPhoto;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<SavedPhoto>) => Promise<void>;
  onDelete: () => Promise<void>;
  onShare: () => Promise<void>;
  onUnshare: () => Promise<void>;
  lang: Language;
}

export const GalleryPhotoModal: React.FC<GalleryPhotoModalProps> = ({
  photo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onShare,
  onUnshare,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const { isAuthenticated } = useAuth();
  const { canUseService, remainingCalls, hasCustomKey, refresh } = useUsageLimit();
  const cardRef = useRef<HTMLDivElement>(null);

  // Local state for editing
  const [localPhoto, setLocalPhoto] = useState<SavedPhoto>(photo);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local photo when prop changes
  useEffect(() => {
    setLocalPhoto(photo);
    setHasChanges(false);
  }, [photo]);

  if (!isOpen) return null;

  // Find pokemon config
  const pokemonConfig = localPhoto.pokemon_id
    ? pokemonData.find(p => p.id === localPhoto.pokemon_id) || pokemonData[0]
    : null;

  const frameStyle = (localPhoto.frame_style as PhotoFrameStyle) || PhotoFrameStyle.CLASSIC;

  const handleLocalUpdate = (updates: Partial<SavedPhoto>) => {
    setLocalPhoto(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleAIEdit = async (prompt: string) => {
    if (!prompt || isProcessing) return;

    setIsProcessing(true);
    try {
      const newImage = await editImageWithGemini(localPhoto.data_url, prompt);
      handleLocalUpdate({
        data_url: newImage,
        prompt_used: prompt,
      });
      setCustomPrompt('');
      refresh();
    } catch (error: any) {
      console.error(error);
      if (error.message === 'auth_required') {
        alert(t.loginToUse);
      } else if (error.message === 'quota_exceeded') {
        alert(t.quotaExceeded);
      } else {
        alert(t.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      await onUpdate({
        data_url: localPhoto.data_url,
        caption: localPhoto.caption,
        frame_style: localPhoto.frame_style,
        pokemon_id: localPhoto.pokemon_id,
        prompt_used: localPhoto.prompt_used,
      });
      setHasChanges(false);
      alert(t.updateSuccess);
    } catch (error) {
      console.error(error);
      alert(t.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const element = cardRef.current;

      // Find the main photo image
      const photoImg = element.querySelector('img[data-main-photo="true"]') as HTMLImageElement;
      if (!photoImg) {
        throw new Error('Photo image not found');
      }

      // Store original src and styles
      const originalSrc = photoImg.src;
      const originalObjectFit = photoImg.style.objectFit;

      // Helper function to crop image to Polaroid frame aspect ratio (300:340 = 15:17)
      const cropImageToFrameRatio = (imgSrc: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            // Target aspect ratio: 300:340 = 15:17
            const targetRatio = 300 / 340;
            const sourceRatio = img.width / img.height;

            let cropWidth, cropHeight, sx, sy;

            if (sourceRatio > targetRatio) {
              // Image is wider - crop width
              cropHeight = img.height;
              cropWidth = img.height * targetRatio;
              sx = (img.width - cropWidth) / 2;
              sy = 0;
            } else {
              // Image is taller - crop height
              cropWidth = img.width;
              cropHeight = img.width / targetRatio;
              sx = 0;
              sy = (img.height - cropHeight) / 2;
            }

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            // Draw cropped image
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imgSrc;
        });
      };

      // Crop the photo to frame aspect ratio
      const croppedSrc = await cropImageToFrameRatio(localPhoto.data_url);

      // Temporarily update the image
      photoImg.src = croppedSrc;
      photoImg.style.objectFit = 'fill';

      // Wait for DOM to update
      await new Promise(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      }));

      // Render with html2canvas
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 4,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
      });

      // Restore original image immediately
      photoImg.src = originalSrc;
      photoImg.style.objectFit = originalObjectFit;

      // Download
      const link = document.createElement('a');
      link.download = `instagen-${photo.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert(t.downloadError || 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !confirm(t.unsavedChanges)) {
      return;
    }
    onClose();
  };

  const handleDelete = async () => {
    if (showDeleteConfirm) {
      await onDelete();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#FAFAFA] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* LEFT: Card Preview */}
        <div className="flex-1 bg-gray-200/50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          <div ref={cardRef} id="gallery-card-preview">
            {pokemonConfig ? (
              <div className="w-[340px] h-[470px] relative z-10">
                <PokemonCard
                  {...pokemonConfig}
                  img={localPhoto.data_url}
                  name={localPhoto.caption || t.defaultCaption}
                  className="w-full h-full"
                >
                  <PolaroidFrame
                    dataUrl={localPhoto.data_url}
                    caption={localPhoto.caption}
                    timestamp={new Date(localPhoto.created_at).getTime()}
                    frameStyle={frameStyle}
                    scale={1}
                    editable={false}
                    isProcessing={isProcessing}
                    promptUsed={localPhoto.prompt_used}
                    lang={lang}
                  />
                </PokemonCard>
              </div>
            ) : (
              <PolaroidFrame
                dataUrl={localPhoto.data_url}
                caption={localPhoto.caption}
                timestamp={new Date(localPhoto.created_at).getTime()}
                frameStyle={frameStyle}
                scale={1}
                editable={false}
                isProcessing={isProcessing}
                promptUsed={localPhoto.prompt_used}
                lang={lang}
              />
            )}
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="w-full md:w-[480px] bg-white flex flex-col border-l border-gray-100">
          <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
            <h2 className="text-2xl font-bold text-gray-800 font-hand mb-6">{t.editPhoto}</h2>

            {/* Frame Style Selector */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.styles}</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.values(PhotoFrameStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() => handleLocalUpdate({ frame_style: style })}
                    className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${frameStyle === style ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      } ${FRAME_STYLES[style]}`}
                    title={style}
                  />
                ))}
              </div>
            </div>

            {/* Card Effect Selector */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.cardEffect}</h3>
              <div className="grid grid-cols-4 gap-2">
                {/* None option */}
                <button
                  onClick={() => handleLocalUpdate({ pokemon_id: undefined })}
                  className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-105 overflow-hidden ${!localPhoto.pokemon_id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                    }`}
                  title={t.cardEffectNone}
                >
                  <div className="w-full h-full relative">
                    <img
                      src="/assets/previews/original.png"
                      alt={t.cardEffectNone}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold py-0.5 px-1 text-center truncate">
                      {t.cardEffectNone}
                    </div>
                  </div>
                </button>

                {/* Pokemon effects */}
                {pokemonData.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleLocalUpdate({ pokemon_id: card.id })}
                    className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-105 overflow-hidden ${localPhoto.pokemon_id === card.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      }`}
                    title={card.name}
                  >
                    <div className="w-full h-full relative">
                      <PokemonCard
                        {...card}
                        img="/assets/previews/original.png"
                        name=""
                        className="w-full h-full"
                      >
                        <img
                          src="/assets/previews/original.png"
                          alt={card.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </PokemonCard>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] font-bold py-0.5 px-1 text-center truncate">
                      {card.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Magic Edit Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  {t.magic}
                  <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] rounded-full">
                    GEMINI
                  </span>
                </h3>
                {isAuthenticated && (
                  <div className="text-xs">
                    {hasCustomKey ? (
                      <span className="text-green-600 font-medium">✨ {t.unlimitedUse}</span>
                    ) : (
                      <span className="text-gray-600">
                        {t.remainingToday}: {remainingCalls}/3
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              {!isAuthenticated && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  🔑 {t.loginToUse}
                </div>
              )}
              {isAuthenticated && !canUseService && (
                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
                  💡 {t.addApiKeyTip}
                </div>
              )}

              {/* Edit Options Grid */}
              <div className="max-h-[240px] overflow-y-auto mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  {EDIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      disabled={!canUseService || isProcessing}
                      onClick={() => handleAIEdit(opt.prompt)}
                      className="group relative overflow-hidden bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-100 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                      {opt.previewImage ? (
                        <div className="w-full aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-200">
                          <img
                            src={opt.previewImage}
                            alt={opt.label[lang]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-xl" />
                      )}
                      <div className="p-2 text-center group-hover:text-indigo-600 transition-colors">
                        {opt.label[lang]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  disabled={!canUseService || isProcessing}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t.customPromptPlaceholder}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIEdit(customPrompt)}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleAIEdit(customPrompt)}
                  disabled={!canUseService || !customPrompt || isProcessing}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
            {/* Download & Save Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#E76F51] hover:text-[#E76F51] transition-all font-medium text-gray-700 text-sm disabled:opacity-50"
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? t.downloadingCard : t.downloadCard}
              </button>

              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${hasChanges
                    ? 'bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white hover:shadow-lg'
                    : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t.saveChanges}
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={photo.is_public ? onUnshare : onShare}
              className={`w-full flex items-center justify-center gap-2 py-3 border-2 rounded-xl transition-all font-medium text-sm ${photo.is_public
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500'
                }`}
            >
              {photo.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {photo.is_public ? t.unshare : t.share}
            </button>

            {/* Delete */}
            <div className="pt-2 border-t border-gray-100">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                  <span className="text-sm text-red-600 font-medium">{t.deleteConfirm}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.delete}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
