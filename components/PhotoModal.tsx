import React, { useState, useEffect } from 'react';
import { Button } from '../src/components/ui/Button';
import { Language, PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { TRANSLATIONS } from '../constants';
import { editImageWithGemini } from '../services/geminiService';
import { PolaroidFrame } from './PolaroidFrame';
import { PokemonCard } from './pokemon-css/PokemonCard';
import pokemonData from './pokemon-css/data.json';
import { useUsageLimit } from '../src/hooks/useUsageLimit';
import { useAuth } from '../src/contexts/AuthContext';
import { useMyPhotos } from '../src/hooks/useMyPhotos';
import { useToast } from '../src/contexts/ToastContext';
import { EditorTabs, EditorTabKey, FrameStylePicker, CardEffectPicker, MagicEditPanel } from '../src/components/editor';

interface PhotoModalProps {
  photo: PhotoData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<PhotoData>) => void;
  onDelete: (id: string) => void;
  onLoginRequest: () => void;
  lang: Language;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onLoginRequest,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTabKey>('frames');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempCaption, setTempCaption] = useState(photo.caption || '');
  const [selectedPokemonId, setSelectedPokemonId] = useState<string>(photo.pokemonId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPinConfirm, setShowPinConfirm] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const t = TRANSLATIONS[lang];
  const { isAuthenticated } = useAuth();
  const { canUseService, remainingCalls, hasCustomKey, refresh } = useUsageLimit();
  const { savePhoto } = useMyPhotos();
  const { success, error: toastError, warning } = useToast();

  // Sync tempCaption when photo changes or modal opens
  useEffect(() => {
    setTempCaption(photo.caption || '');
  }, [photo.caption, isOpen]);

  // Sync selectedPokemonId when photo changes
  useEffect(() => {
    setSelectedPokemonId(photo.pokemonId || '');
  }, [photo.pokemonId]);

  if (!isOpen) return null;

  const handleAIEdit = async (prompt: string) => {
    if (!prompt) return;

    setIsProcessing(true);
    onUpdate(photo.id, { status: PhotoStatus.EDITING });

    try {
      const newImage = await editImageWithGemini(photo.dataUrl, prompt);
      onUpdate(photo.id, {
        dataUrl: newImage,
        status: PhotoStatus.DONE,
        promptUsed: prompt
      });
      refresh();
    } catch (error: any) {
      console.error(error);
      onUpdate(photo.id, { status: PhotoStatus.DONE });

      if (error.message === 'auth_required') {
        warning(t.loginToUse);
      } else if (error.message === 'quota_exceeded') {
        warning(t.quotaExceeded);
      } else {
        toastError(t.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    onDelete(photo.id);
    onClose();
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      onClose();
      onLoginRequest();
      return;
    }

    if (isSaving || isSaved) return;

    try {
      setIsSaving(true);
      await savePhoto(photo);
      setIsSaved(true);
      success(t.alreadySaved);
    } catch (error) {
      console.error('Failed to save photo:', error);
      toastError(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCaptionBlur = () => {
    if (tempCaption !== photo.caption) {
      onUpdate(photo.id, { caption: tempCaption });
    }
  };

  const handleClose = () => {
    if (tempCaption !== photo.caption) {
      onUpdate(photo.id, { caption: tempCaption });
    }
    onClose();
  };

  const handleFrameStyleChange = (style: PhotoFrameStyle) => {
    onUpdate(photo.id, { frameStyle: style });
  };

  const handlePokemonIdChange = (id: string | undefined) => {
    setSelectedPokemonId(id || '');
    onUpdate(photo.id, { pokemonId: id });
  };

  // Get pokemon config for preview
  const pokemonConfig = photo.pokemonId
    ? pokemonData.find(p => p.id === photo.pokemonId) || pokemonData[0]
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#FAFAFA] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 bg-gray-200/50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Pin to Gallery Button */}
          <button
            onClick={() => setShowPinConfirm(true)}
            disabled={isPinning}
            className="absolute top-4 left-4 z-40 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
            title={t.pinToGallery}
          >
            {isPinning ? (
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            )}
          </button>

          {/* Pin Confirmation Modal */}
          {showPinConfirm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl p-5 mx-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-pink-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{t.pinToGallery}</h4>
                    <p className="text-sm text-gray-500">{lang === 'zh' ? '分享到公共画廊，所有人可见' : 'Share to public gallery for everyone to see'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowPinConfirm(false)}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsPinning(true);
                        const { photoService } = await import('../src/services/photoService');
                        await photoService.pinPhotoToPublic(photo);
                        success(t.pinSuccess);
                        setShowPinConfirm(false);
                      } catch (error) {
                        console.error(error);
                        toastError(t.pinError);
                      } finally {
                        setIsPinning(false);
                      }
                    }}
                    disabled={isPinning}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPinning && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {t.pinToGallery}
                  </button>
                </div>
              </div>
            </div>
          )}

          {pokemonConfig ? (
            <div className="w-[340px] h-[470px] relative z-10">
              <PokemonCard
                {...pokemonConfig}
                img={photo.dataUrl}
                name={tempCaption || t.defaultCaption}
                className="w-full h-full"
              >
                <PolaroidFrame
                  dataUrl={photo.dataUrl}
                  caption={tempCaption}
                  timestamp={photo.timestamp}
                  frameStyle={photo.frameStyle}
                  scale={1}
                  editable={false}
                  onCaptionChange={setTempCaption}
                  onCaptionBlur={handleCaptionBlur}
                  isProcessing={isProcessing || photo.status === PhotoStatus.EDITING}
                  promptUsed={photo.promptUsed}
                  lang={lang}
                />
              </PokemonCard>
            </div>
          ) : (
            <PolaroidFrame
              dataUrl={photo.dataUrl}
              caption={tempCaption}
              timestamp={photo.timestamp}
              frameStyle={photo.frameStyle}
              scale={1}
              editable={true}
              onCaptionChange={setTempCaption}
              onCaptionBlur={handleCaptionBlur}
              isProcessing={isProcessing || photo.status === PhotoStatus.EDITING}
              promptUsed={photo.promptUsed}
              lang={lang}
            />
          )}
        </div>

        {/* RIGHT: Controls Area */}
        <div className="w-full md:w-[500px] bg-white flex flex-col border-l border-gray-100">
          {/* Header */}
          <div className="p-5 pb-0">
            <h2 className="text-xl font-bold text-gray-800 font-hand mb-4">{t.expand}</h2>
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
                    selectedStyle={photo.frameStyle}
                    onStyleChange={handleFrameStyleChange}
                    lang={lang}
                  />
                ),
                effects: (
                  <CardEffectPicker
                    selectedPokemonId={photo.pokemonId}
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
            <Button
              onClick={handleSave}
              disabled={isSaved || isSaving}
              title={!isAuthenticated ? (lang === 'zh' ? '点击登录以保存' : 'Click to login and save') : ''}
              className={`w-full py-3 rounded-xl font-medium text-sm shadow-sm transition-all ${isSaved
                ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white hover:shadow-lg hover:scale-[1.01]'
                }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : isSaved ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                </svg>
              )}
              {isSaved ? t.alreadySaved : t.savePhoto}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {t.delete}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
