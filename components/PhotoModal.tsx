import React, { useState, useEffect } from 'react';
import { EditOption, Language, PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { EDIT_OPTIONS, FRAME_STYLES, TRANSLATIONS } from '../constants';
import { editImageWithGemini } from '../services/geminiService';
import { PolaroidFrame } from './PolaroidFrame';
import { PokemonCard } from './pokemon-css/PokemonCard';
import pokemonData from './pokemon-css/data.json';
import { useUsageLimit } from '../src/hooks/useUsageLimit';
import { useAuth } from '../src/contexts/AuthContext';
import { useMyPhotos } from '../src/hooks/useMyPhotos';

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
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempCaption, setTempCaption] = useState(photo.caption || '');
  const [selectedPokemonId, setSelectedPokemonId] = useState<string>(photo.pokemonId || pokemonData[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const t = TRANSLATIONS[lang];
  const { isAuthenticated } = useAuth();
  const { canUseService, remainingCalls, hasCustomKey, refresh } = useUsageLimit();
  const { savePhoto } = useMyPhotos();

  // Sync tempCaption when photo changes or modal opens
  useEffect(() => {
    setTempCaption(photo.caption || '');
  }, [photo.caption, isOpen]);

  if (!isOpen) return null;

  const handleAIEdit = async (option?: EditOption) => {
    const prompt = option ? option.prompt : customPrompt;
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
      setCustomPrompt('');
      // Refresh usage info after successful API call
      refresh();
    } catch (error: any) {
      console.error(error);
      onUpdate(photo.id, { status: PhotoStatus.DONE });

      // Handle specific error types
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

  const handleDelete = () => {
    onDelete(photo.id);
    onClose();
  };

  const handleSave = async () => {
    // If not authenticated, close modal and open login
    if (!isAuthenticated) {
      onClose(); // Close the photo modal
      onLoginRequest(); // Open login modal
      return;
    }

    if (isSaving || isSaved) return;

    try {
      setIsSaving(true);
      await savePhoto(photo);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save photo:', error);
      alert(t.error);
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
    // Ensure caption is saved on close if it changed
    if (tempCaption !== photo.caption) {
      onUpdate(photo.id, { caption: tempCaption });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#FAFAFA] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 bg-gray-200/50 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          {photo.pokemonId ? (
            <div className="w-[340px] h-[470px] relative z-10">
              <PokemonCard
                {...pokemonData.find(p => p.id === selectedPokemonId)!}
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
        <div className="w-full md:w-[480px] bg-white flex flex-col border-l border-gray-100">
          <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
            <h2 className="text-2xl font-bold text-gray-800 font-hand mb-6">{t.expand}</h2>

            {/* Style Selector */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.styles}</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.values(PhotoFrameStyle).map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdate(photo.id, { frameStyle: style })}
                    className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${photo.frameStyle === style ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} ${FRAME_STYLES[style]}`}
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
                  onClick={() => {
                    setSelectedPokemonId('');
                    onUpdate(photo.id, { pokemonId: undefined });
                  }}
                  className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-105 overflow-hidden ${!photo.pokemonId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
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

                {/* Pokemon effect options */}
                {pokemonData.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      setSelectedPokemonId(card.id);
                      onUpdate(photo.id, { pokemonId: card.id });
                    }}
                    className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-all hover:scale-105 overflow-hidden ${selectedPokemonId === card.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
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
                  {t.magic} <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] rounded-full">GEMINI</span>
                </h3>
                {/* Usage Info Display */}
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

              {/* Login/Quota Messages */}
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

              {/* Scrollable Preview Grid */}
              <div className="max-h-[320px] overflow-y-auto mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="grid grid-cols-3 gap-2">
                  {EDIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      disabled={!canUseService || isProcessing}
                      onClick={() => handleAIEdit(opt)}
                      className="group relative overflow-hidden bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-100 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                      {/* Preview Image */}
                      {opt.previewImage ? (
                        <div className="w-full aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-200">
                          <img
                            src={opt.previewImage}
                            alt={opt.label[lang]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-xl" />
                      )}

                      {/* Label */}
                      <div className="p-2 text-center group-hover:text-indigo-600 transition-colors">
                        {opt.label[lang]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  disabled={!canUseService || isProcessing}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t.customPromptPlaceholder}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIEdit()}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleAIEdit()}
                  disabled={!canUseService || !customPrompt || isProcessing}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaved || isSaving}
              title={!isAuthenticated ? (lang === 'zh' ? '点击登录以保存' : 'Click to login and save') : ''}
              className={`flex items-center justify-center w-full py-3 rounded-xl font-medium text-sm shadow-sm transition-colors ${isSaved
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : !isAuthenticated
                    ? 'bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              ) : isSaved ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : null}
              {isSaved ? t.alreadySaved : t.savePhoto}
            </button>
            <button
              onClick={async () => {
                try {
                  setIsProcessing(true);
                  const { pinPhotoToPublic } = await import('../services/supabaseClient');
                  await pinPhotoToPublic(photo);
                  alert(t.pinSuccess);
                } catch (error) {
                  console.error(error);
                  alert(t.pinError);
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium text-sm hover:from-pink-600 hover:to-rose-600 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              {t.pinToGallery}
            </button>
            <button
              onClick={handleDelete}
              className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              {t.delete}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};