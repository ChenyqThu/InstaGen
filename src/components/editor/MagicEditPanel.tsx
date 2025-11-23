import React, { useState } from 'react';
import { Language, EditOption } from '@/types';
import { TRANSLATIONS, EDIT_OPTIONS } from '@/constants';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

interface MagicEditPanelProps {
  lang: Language;
  isAuthenticated: boolean;
  canUseService: boolean;
  hasCustomKey: boolean;
  remainingCalls: number;
  isProcessing: boolean;
  onEdit: (prompt: string) => Promise<void>;
}

export const MagicEditPanel: React.FC<MagicEditPanelProps> = ({
  lang,
  isAuthenticated,
  canUseService,
  hasCustomKey,
  remainingCalls,
  isProcessing,
  onEdit,
}) => {
  const t = TRANSLATIONS[lang];
  const [customPrompt, setCustomPrompt] = useState('');

  const handleEditClick = async (option: EditOption) => {
    await onEdit(option.prompt);
  };

  const handleCustomEdit = async () => {
    if (!customPrompt.trim()) return;
    await onEdit(customPrompt);
    setCustomPrompt('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Usage Info Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            AI {lang === 'zh' ? '编辑' : 'Edit'}
          </span>
          <span className="inline-block px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] rounded-full font-medium">
            GEMINI
          </span>
        </div>
        {isAuthenticated && (
          <div className="text-xs">
            {hasCustomKey ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t.unlimitedUse}
              </span>
            ) : (
              <span className="text-gray-600">
                {t.remainingToday}: <span className="font-medium">{remainingCalls}/3</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {!isAuthenticated && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          {t.loginToUse}
        </div>
      )}
      {isAuthenticated && !canUseService && (
        <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {t.addApiKeyTip}
        </div>
      )}

      {/* Edit Options Grid */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="grid grid-cols-3 gap-2">
          {EDIT_OPTIONS.map((opt, index) => (
            <button
              key={opt.key}
              disabled={!canUseService || isProcessing}
              onClick={() => handleEditClick(opt)}
              className={`
                group relative overflow-hidden rounded-xl border transition-all duration-200
                animate-in fade-in slide-in-from-bottom-2
                ${canUseService && !isProcessing
                  ? 'bg-gray-50 hover:bg-indigo-50 border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer'
                  : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                }
              `}
              style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
            >
              {/* Preview Image */}
              {opt.previewImage ? (
                <div className="w-full aspect-[3/4] overflow-hidden rounded-t-xl bg-gray-200">
                  <img
                    src={opt.previewImage}
                    alt={opt.label[lang]}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-xl" />
              )}

              {/* Label */}
              <div className="p-2 text-center text-xs font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">
                {opt.label[lang]}
              </div>

              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input */}
      <div className="relative flex-shrink-0">
        <Input
          value={customPrompt}
          disabled={!canUseService || isProcessing}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={t.customPromptPlaceholder}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomEdit()}
          className="pr-12"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            size="icon"
            onClick={handleCustomEdit}
            disabled={!canUseService || !customPrompt.trim() || isProcessing}
            className="w-8 h-8 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors p-0"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
