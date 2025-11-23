import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Lock, Trash2, Globe } from 'lucide-react';
import { SavedPhoto } from '@/src/services/photoService';
import { PolaroidFrame } from '@/components/PolaroidFrame';
import { PokemonCard } from '@/components/pokemon-css/PokemonCard';
import { getPokemonConfig } from '@/src/utils/pokemonUtils';
import { PhotoFrameStyle, Language } from '@/types';
import { TRANSLATIONS } from '@/constants';
import { editImageWithGemini } from '@/services/geminiService';
import { useUsageLimit } from '@/src/hooks/useUsageLimit';
import { useAuth } from '@/src/contexts/AuthContext';
import { EditorTabs, EditorTabKey, FrameStylePicker, CardEffectPicker, MagicEditPanel } from '@/src/components/editor';

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

  // Tab state
  const [activeTab, setActiveTab] = useState<EditorTabKey>('frames');

  // Local state for editing
  const [localPhoto, setLocalPhoto] = useState<SavedPhoto>(photo);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  // Sync local photo when prop changes
  useEffect(() => {
    setLocalPhoto(photo);
    setHasChanges(false);
  }, [photo]);

  if (!isOpen) return null;

  // Find pokemon config
  const pokemonConfig = getPokemonConfig(localPhoto.pokemon_id);

  const frameStyle = (localPhoto.frame_style as PhotoFrameStyle) || PhotoFrameStyle.CLASSIC;

  const handleLocalUpdate = (updates: Partial<SavedPhoto>) => {
    setLocalPhoto(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleFrameStyleChange = (style: PhotoFrameStyle) => {
    handleLocalUpdate({ frame_style: style });
  };

  const handlePokemonIdChange = (id: string | undefined) => {
    handleLocalUpdate({ pokemon_id: id });
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
      const photoImg = element.querySelector('img[data-main-photo="true"]') as HTMLImageElement;
      if (!photoImg) {
        throw new Error('Photo image not found');
      }

      const originalSrc = photoImg.src;
      const originalObjectFit = photoImg.style.objectFit;

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

            const targetRatio = 300 / 340;
            const sourceRatio = img.width / img.height;

            let cropWidth, cropHeight, sx, sy;

            if (sourceRatio > targetRatio) {
              cropHeight = img.height;
              cropWidth = img.height * targetRatio;
              sx = (img.width - cropWidth) / 2;
              sy = 0;
            } else {
              cropWidth = img.width;
              cropHeight = img.width / targetRatio;
              sx = 0;
              sy = (img.height - cropHeight) / 2;
            }

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = imgSrc;
        });
      };

      const croppedSrc = await cropImageToFrameRatio(localPhoto.data_url);

      photoImg.src = croppedSrc;
      photoImg.style.objectFit = 'fill';

      await new Promise(resolve => requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      }));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 4,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
      });

      photoImg.src = originalSrc;
      photoImg.style.objectFit = originalObjectFit;

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
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(false);
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleShareClick = () => {
    if (photo.is_public) {
      handleUnshare();
    } else {
      setShowShareConfirm(true);
    }
  };

  const handleConfirmShare = async () => {
    setIsSharing(true);
    try {
      await onShare();
      setShowShareConfirm(false);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async () => {
    setIsSharing(true);
    try {
      await onUnshare();
    } catch (error) {
      console.error('Unshare failed:', error);
    } finally {
      setIsSharing(false);
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
        <div className="w-full md:w-[500px] bg-white flex flex-col border-l border-gray-100">
          {/* Header */}
          <div className="p-5 pb-0">
            <h2 className="text-xl font-bold text-gray-800 font-hand mb-4">{t.editPhoto}</h2>
          </div>

          {/* Tab Content */}
          <div className="flex-1 px-5 pb-2 overflow-hidden">
            <EditorTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              lang={lang}
              magicBadge={
                <span className="ml-1 inline-block px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[9px] rounded-full font-medium">
                  AI
                </span>
              }
            >
              {{
                frames: (
                  <FrameStylePicker
                    selectedStyle={frameStyle}
                    onStyleChange={handleFrameStyleChange}
                    lang={lang}
                  />
                ),
                effects: (
                  <CardEffectPicker
                    selectedPokemonId={localPhoto.pokemon_id}
                    onPokemonIdChange={handlePokemonIdChange}
                    lang={lang}
                  />
                ),
                magic: (
                  <MagicEditPanel
                    lang={lang}
                    isAuthenticated={isAuthenticated}
                    canUseService={canUseService}
                    hasCustomKey={hasCustomKey}
                    remainingCalls={remainingCalls}
                    isProcessing={isProcessing}
                    onEdit={handleAIEdit}
                  />
                ),
              }}
            </EditorTabs>
          </div>

          {/* Bottom Actions */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-2.5">
            {/* Download & Save Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#E76F51] hover:text-[#E76F51] transition-all font-medium text-gray-700 text-sm disabled:opacity-50"
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
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${hasChanges
                    ? 'bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white hover:shadow-lg'
                    : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSaving ? t.saving : t.saveChanges}
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              disabled={isSharing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 border-2 rounded-xl transition-all font-medium text-sm disabled:opacity-50 ${photo.is_public
                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500'
                }`}
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : photo.is_public ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              {isSharing ? t.sharing : (photo.is_public ? t.unshare : t.share)}
            </button>

            {/* Share Confirmation Dialog */}
            {showShareConfirm && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 animate-in slide-in-from-bottom-2">
                <h4 className="font-medium text-gray-800 mb-1">{t.shareConfirmTitle}</h4>
                <p className="text-sm text-gray-600 mb-3">{t.shareConfirmMessage}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowShareConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleConfirmShare}
                    disabled={isSharing}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#E76F51] hover:bg-[#d65d41] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSharing && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {t.confirmShare}
                  </button>
                </div>
              </div>
            )}

            {/* Delete */}
            <div className="pt-2 border-t border-gray-100">
              {showDeleteConfirm ? (
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                  <span className="text-sm text-red-600 font-medium">{t.deleteConfirm}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isDeleting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {isDeleting ? t.deleting : t.delete}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
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
