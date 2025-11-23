import React from 'react';
import { Language } from '@/types';
import { TRANSLATIONS } from '@/constants';
import { PokemonCard } from '@/components/pokemon-css/PokemonCard';
import pokemonData from '@/components/pokemon-css/data.json';

interface CardEffectPickerProps {
  selectedPokemonId: string | undefined;
  onPokemonIdChange: (id: string | undefined) => void;
  lang: Language;
}

export const CardEffectPicker: React.FC<CardEffectPickerProps> = ({
  selectedPokemonId,
  onPokemonIdChange,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="h-full overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="grid grid-cols-3 gap-3">
        {/* None option */}
        <button
          onClick={() => onPokemonIdChange(undefined)}
          className={`
            group relative aspect-[3/4] rounded-xl overflow-hidden
            border-2 transition-all duration-200
            ${!selectedPokemonId
              ? 'border-[#E76F51] ring-2 ring-[#E76F51]/20 scale-[1.02]'
              : 'border-gray-200 hover:border-gray-300 hover:scale-[1.02] hover:shadow-md'
            }
          `}
          style={{ animationDelay: '0ms' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500">{t.cardEffectNone}</span>
            </div>
          </div>

          {/* Selected indicator */}
          {!selectedPokemonId && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-[#E76F51] rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
        </button>

        {/* Pokemon effect options */}
        {pokemonData.map((card, index) => (
          <button
            key={card.id}
            onClick={() => onPokemonIdChange(card.id)}
            className={`
              group relative aspect-[3/4] rounded-xl overflow-hidden
              border-2 transition-all duration-200
              animate-in fade-in slide-in-from-bottom-2
              ${selectedPokemonId === card.id
                ? 'border-[#E76F51] ring-2 ring-[#E76F51]/20 scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300 hover:scale-[1.02] hover:shadow-md'
              }
            `}
            style={{ animationDelay: `${(index + 1) * 50}ms`, animationFillMode: 'both' }}
            title={card.name}
          >
            <div className="w-full h-full">
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

            {/* Card name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
              <span className="text-white text-xs font-medium truncate block text-center">
                {card.name}
              </span>
            </div>

            {/* Selected indicator */}
            {selectedPokemonId === card.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-[#E76F51] rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
