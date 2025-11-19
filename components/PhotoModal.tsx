import React, { useState } from 'react';
import { EditOption, Language, PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { EDIT_OPTIONS, FRAME_STYLES, TRANSLATIONS } from '../constants';
import { editImageWithGemini } from '../services/geminiService';

interface PhotoModalProps {
  photo: PhotoData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<PhotoData>) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  lang,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const t = TRANSLATIONS[lang];

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
    } catch (error) {
      console.error(error);
      onUpdate(photo.id, { status: PhotoStatus.DONE });
      alert(t.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
      onDelete(photo.id);
      onClose();
  };

  const frameClass = FRAME_STYLES[photo.frameStyle] || FRAME_STYLES[PhotoFrameStyle.CLASSIC];

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#FAFAFA] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        {/* LEFT: Image Preview Area */}
        <div className="flex-1 bg-gray-200/50 flex items-center justify-center p-8 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
             <div className={`relative max-h-full shadow-2xl transform transition-all duration-500 ${frameClass} p-4 pb-12 rotate-0`}>
                <div className="relative">
                    <img 
                        src={photo.dataUrl} 
                        alt="Current View" 
                        className="max-h-[60vh] object-contain min-w-[300px] bg-gray-900"
                    />
                     {(isProcessing || photo.status === PhotoStatus.EDITING) && (
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex flex-col items-center text-white">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white mb-3"></div>
                                <span className="font-medium text-sm tracking-wide animate-pulse">{t.processing}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="font-hand text-gray-500/60 mt-4 text-center text-lg">
                    {formatDate(photo.timestamp)}
                </div>
             </div>
        </div>

        {/* RIGHT: Controls Area */}
        <div className="w-full md:w-[360px] bg-white flex flex-col border-l border-gray-100">
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
                                className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${photo.frameStyle === style ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'} ${FRAME_STYLES[style].split(' ')[0]}`}
                                title={style}
                            />
                        ))}
                    </div>
                </div>

                {/* Magic Edit Section */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {t.magic} <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] rounded-full">GEMINI</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {EDIT_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                disabled={isProcessing}
                                onClick={() => handleAIEdit(opt)}
                                className="p-3 text-left bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl border border-gray-100 transition-colors text-xs font-medium disabled:opacity-50"
                            >
                                {opt.label[lang]}
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={customPrompt}
                            disabled={isProcessing}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder={t.customPromptPlaceholder}
                            onKeyDown={(e) => e.key === 'Enter' && handleAIEdit()}
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <button
                            onClick={() => handleAIEdit()}
                            disabled={!customPrompt || isProcessing}
                            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
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
                <a 
                    href={photo.dataUrl} 
                    download={`instagen-${photo.timestamp}.png`}
                    className="flex items-center justify-center w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                    {t.download}
                </a>
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